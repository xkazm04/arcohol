-- =====================================================
-- ArcPay B2B Platform - AI Agents
-- 007_agents.sql - Agent Wallets, Budgets, Transactions
-- =====================================================

-- =====================================================
-- Agent Wallets Table
-- =====================================================

CREATE TABLE agent_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Agent identity
    name TEXT NOT NULL,
    description TEXT,

    -- Wallet details
    wallet_address TEXT NOT NULL,
    wallet_type TEXT DEFAULT 'developer_controlled', -- developer_controlled, smart_account
    chain TEXT DEFAULT 'arc',

    -- Balance
    balance DECIMAL(20, 6) DEFAULT 0,
    currency TEXT DEFAULT 'USDC',

    -- Status
    status TEXT DEFAULT 'active', -- active, paused, depleted

    -- Spending tracking
    spent_24h DECIMAL(20, 6) DEFAULT 0,
    spent_7d DECIMAL(20, 6) DEFAULT 0,
    spent_30d DECIMAL(20, 6) DEFAULT 0,
    spent_total DECIMAL(20, 6) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,

    -- Activity tracking
    last_activity_at TIMESTAMPTZ,
    last_transaction_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_wallets_org ON agent_wallets(organization_id);
CREATE INDEX idx_agent_wallets_status ON agent_wallets(status);
CREATE INDEX idx_agent_wallets_address ON agent_wallets(wallet_address);

-- =====================================================
-- Agent Budget Rules Table
-- =====================================================

CREATE TABLE agent_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,

    -- Budget type
    budget_type TEXT NOT NULL, -- daily, weekly, monthly, per_transaction, total

    -- Limits
    limit_amount DECIMAL(20, 6) NOT NULL,
    used_amount DECIMAL(20, 6) DEFAULT 0,
    currency TEXT DEFAULT 'USDC',

    -- Period tracking
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,

    -- Actions
    action_on_exceed TEXT DEFAULT 'block', -- block, warn, require_approval

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Reset tracking
    last_reset_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_budgets_agent ON agent_budgets(agent_id);
CREATE INDEX idx_agent_budgets_type ON agent_budgets(budget_type);

-- =====================================================
-- Vendor-Specific Budgets Table
-- =====================================================

CREATE TABLE agent_vendor_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,

    -- Vendor identification
    vendor_domain TEXT NOT NULL, -- e.g., 'openai.com', 'anthropic.com'
    vendor_name TEXT,

    -- Limits
    daily_limit DECIMAL(20, 6),
    monthly_limit DECIMAL(20, 6),
    per_transaction_limit DECIMAL(20, 6),

    -- Usage tracking
    spent_today DECIMAL(20, 6) DEFAULT 0,
    spent_month DECIMAL(20, 6) DEFAULT 0,
    spent_total DECIMAL(20, 6) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,

    -- Status
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agent_id, vendor_domain)
);

CREATE INDEX idx_agent_vendor_budgets_agent ON agent_vendor_budgets(agent_id);
CREATE INDEX idx_agent_vendor_budgets_vendor ON agent_vendor_budgets(vendor_domain);

-- =====================================================
-- Agent Transactions Table
-- =====================================================

CREATE TABLE agent_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,

    -- Transaction details
    type TEXT NOT NULL, -- payment, deposit, withdrawal, refund
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Recipient/Vendor
    recipient_address TEXT,
    vendor_domain TEXT,
    vendor_name TEXT,

    -- Description
    description TEXT,
    memo TEXT,

    -- Blockchain details
    tx_hash TEXT,
    chain TEXT DEFAULT 'arc',

    -- Status
    status TEXT DEFAULT 'completed', -- pending, completed, failed, requires_approval

    -- Approval (if required)
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES org_profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Anomaly detection
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(4, 3),
    anomaly_reasons TEXT[],

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_transactions_agent ON agent_transactions(agent_id);
CREATE INDEX idx_agent_transactions_status ON agent_transactions(status);
CREATE INDEX idx_agent_transactions_vendor ON agent_transactions(vendor_domain);
CREATE INDEX idx_agent_transactions_created ON agent_transactions(created_at DESC);
CREATE INDEX idx_agent_transactions_anomaly ON agent_transactions(is_anomaly) WHERE is_anomaly = TRUE;

-- =====================================================
-- Agent Approval Queue Table
-- =====================================================

CREATE TABLE agent_approval_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES agent_transactions(id) ON DELETE CASCADE,

    -- Request details
    request_type TEXT NOT NULL, -- transaction, budget_increase, vendor_access
    amount DECIMAL(20, 6),
    reason TEXT NOT NULL,

    -- Context
    context JSONB DEFAULT '{}',

    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, expired

    -- Resolution
    resolved_by UUID REFERENCES org_profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,

    -- Expiration
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_approval_queue_agent ON agent_approval_queue(agent_id);
CREATE INDEX idx_agent_approval_queue_status ON agent_approval_queue(status);
CREATE INDEX idx_agent_approval_queue_expires ON agent_approval_queue(expires_at) WHERE status = 'pending';

-- =====================================================
-- Agent Anomaly Rules Table
-- =====================================================

CREATE TABLE agent_anomaly_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Rule definition
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL, -- amount_threshold, frequency, new_vendor, time_based, pattern

    -- Rule configuration
    config JSONB NOT NULL, -- {
    --   amount_threshold: { max_amount, currency }
    --   frequency: { max_transactions, period_minutes }
    --   new_vendor: { require_approval: true }
    --   time_based: { blocked_hours: [0-6], timezone }
    --   pattern: { regex, field }
    -- }

    -- Action
    action TEXT DEFAULT 'flag', -- flag, block, require_approval

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_anomaly_rules_org ON agent_anomaly_rules(organization_id);
CREATE INDEX idx_agent_anomaly_rules_type ON agent_anomaly_rules(rule_type);

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_agent_wallets_updated_at
    BEFORE UPDATE ON agent_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_budgets_updated_at
    BEFORE UPDATE ON agent_budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_vendor_budgets_updated_at
    BEFORE UPDATE ON agent_vendor_budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_anomaly_rules_updated_at
    BEFORE UPDATE ON agent_anomaly_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
