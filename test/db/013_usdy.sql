-- =============================================
-- USDY Yield Management Tables
-- =============================================
-- Migration: 013_usdy.sql
-- Description: Tables for USDY automation rules, execution logs, and yield tracking
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USDY Automation Rules
-- =============================================
-- Stores automation rules for automatic USDY deposits
-- Rule types: percentage (split from revenue), threshold (sweep), scheduled

CREATE TABLE IF NOT EXISTS usdy_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    treasury_id UUID REFERENCES treasury_accounts(id) ON DELETE SET NULL,

    -- Rule identity
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'threshold', 'scheduled')),
    enabled BOOLEAN DEFAULT true,

    -- Rule configuration (varies by type)
    -- percentage: { percentage: number, sourceAccount: string, minAmount?: number }
    -- threshold: { threshold: number, targetBalance: number, sourceAccount: string }
    -- scheduled: { schedule: string (cron), percentage?: number, fixedAmount?: number }
    config JSONB NOT NULL DEFAULT '{}',

    -- Execution tracking
    total_deposited DECIMAL(20, 6) DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for automation rules
CREATE INDEX IF NOT EXISTS idx_usdy_automation_rules_org ON usdy_automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_usdy_automation_rules_type ON usdy_automation_rules(type);
CREATE INDEX IF NOT EXISTS idx_usdy_automation_rules_enabled ON usdy_automation_rules(organization_id) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_usdy_automation_rules_scheduled ON usdy_automation_rules(next_scheduled_at) WHERE type = 'scheduled' AND enabled = true;

-- =============================================
-- USDY Automation Logs
-- =============================================
-- Tracks execution history for automation rules

CREATE TABLE IF NOT EXISTS usdy_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES usdy_automation_rules(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    treasury_id UUID REFERENCES treasury_accounts(id) ON DELETE SET NULL,

    -- Execution details
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'threshold', 'webhook', 'percentage')),

    -- Error tracking
    error_message TEXT,
    error_code TEXT,

    -- Source tracking
    source_transaction_id UUID,
    source_amount DECIMAL(20, 6),

    -- Result
    resulting_balance DECIMAL(20, 6),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for automation logs
CREATE INDEX IF NOT EXISTS idx_usdy_automation_logs_org ON usdy_automation_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usdy_automation_logs_rule ON usdy_automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_usdy_automation_logs_status ON usdy_automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_usdy_automation_logs_created ON usdy_automation_logs(organization_id, created_at DESC);

-- =============================================
-- USDY Yield Accruals
-- =============================================
-- Daily yield tracking for reporting and analytics

CREATE TABLE IF NOT EXISTS usdy_yield_accruals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Date (one record per day per treasury)
    date DATE NOT NULL,

    -- Balance snapshots
    opening_balance DECIMAL(20, 6) NOT NULL,
    closing_balance DECIMAL(20, 6) NOT NULL,

    -- Yield calculation
    apy_rate DECIMAL(6, 4) NOT NULL, -- e.g., 0.0520 for 5.2%
    yield_amount DECIMAL(20, 6) NOT NULL,

    -- Cumulative tracking
    cumulative_yield DECIMAL(20, 6),

    -- Chain info (for multi-chain support)
    chain TEXT DEFAULT 'arc',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per org/treasury/date
    UNIQUE(organization_id, treasury_id, date)
);

-- Indexes for yield accruals
CREATE INDEX IF NOT EXISTS idx_usdy_yield_accruals_org ON usdy_yield_accruals(organization_id);
CREATE INDEX IF NOT EXISTS idx_usdy_yield_accruals_treasury ON usdy_yield_accruals(treasury_id);
CREATE INDEX IF NOT EXISTS idx_usdy_yield_accruals_date ON usdy_yield_accruals(date DESC);
CREATE INDEX IF NOT EXISTS idx_usdy_yield_accruals_org_date ON usdy_yield_accruals(organization_id, date DESC);

-- =============================================
-- USDY APY History
-- =============================================
-- Tracks historical APY rates from Ondo (for reference/analytics)

CREATE TABLE IF NOT EXISTS usdy_apy_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- APY data
    apy_rate DECIMAL(6, 4) NOT NULL,
    effective_date DATE NOT NULL,

    -- Source info
    source TEXT DEFAULT 'ondo', -- 'ondo', 'manual', 'oracle'
    chain TEXT DEFAULT 'ethereum',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- One rate per date per chain
    UNIQUE(effective_date, chain)
);

-- Index for APY history
CREATE INDEX IF NOT EXISTS idx_usdy_apy_history_date ON usdy_apy_history(effective_date DESC);

-- =============================================
-- Updated At Triggers
-- =============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_usdy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to automation rules
DROP TRIGGER IF EXISTS trigger_usdy_automation_rules_updated ON usdy_automation_rules;
CREATE TRIGGER trigger_usdy_automation_rules_updated
    BEFORE UPDATE ON usdy_automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_usdy_updated_at();

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS
ALTER TABLE usdy_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE usdy_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usdy_yield_accruals ENABLE ROW LEVEL SECURITY;
ALTER TABLE usdy_apy_history ENABLE ROW LEVEL SECURITY;

-- Automation Rules: Users can only see their organization's rules
CREATE POLICY usdy_automation_rules_org_isolation ON usdy_automation_rules
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Automation Logs: Users can only see their organization's logs
CREATE POLICY usdy_automation_logs_org_isolation ON usdy_automation_logs
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Yield Accruals: Users can only see their organization's accruals
CREATE POLICY usdy_yield_accruals_org_isolation ON usdy_yield_accruals
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- APY History: Everyone can read (public data)
CREATE POLICY usdy_apy_history_read ON usdy_apy_history
    FOR SELECT
    USING (true);

-- =============================================
-- Seed Initial APY Data
-- =============================================

INSERT INTO usdy_apy_history (apy_rate, effective_date, source, chain) VALUES
    (0.0520, CURRENT_DATE, 'manual', 'arc'),
    (0.0520, CURRENT_DATE, 'manual', 'ethereum'),
    (0.0520, CURRENT_DATE, 'manual', 'polygon')
ON CONFLICT (effective_date, chain) DO NOTHING;

-- =============================================
-- Add USDY Webhook Event Types
-- =============================================

INSERT INTO webhook_event_types (category, event_type, description, schema) VALUES
    ('usdy', 'usdy.deposit.initiated', 'USDY deposit initiated', '{"type": "object"}'),
    ('usdy', 'usdy.deposit.completed', 'USDY deposit completed', '{"type": "object"}'),
    ('usdy', 'usdy.deposit.failed', 'USDY deposit failed', '{"type": "object"}'),
    ('usdy', 'usdy.withdraw.initiated', 'USDY withdrawal initiated', '{"type": "object"}'),
    ('usdy', 'usdy.withdraw.completed', 'USDY withdrawal completed', '{"type": "object"}'),
    ('usdy', 'usdy.withdraw.failed', 'USDY withdrawal failed', '{"type": "object"}'),
    ('usdy', 'usdy.automation.triggered', 'Automation rule triggered', '{"type": "object"}'),
    ('usdy', 'usdy.automation.completed', 'Automation rule execution completed', '{"type": "object"}'),
    ('usdy', 'usdy.automation.failed', 'Automation rule execution failed', '{"type": "object"}'),
    ('usdy', 'usdy.yield.accrued', 'Daily yield accrued', '{"type": "object"}'),
    ('usdy', 'usdy.apy.changed', 'APY rate changed', '{"type": "object"}')
ON CONFLICT (event_type) DO NOTHING;
