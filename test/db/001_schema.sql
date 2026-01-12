-- =====================================================
-- ArcPay B2B Platform - Core Schema
-- 001_schema.sql - Org Profiles, Organizations, API Keys
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM Types
-- =====================================================

CREATE TYPE organization_plan AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'low_balance', 'depleted');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'canceled');
CREATE TYPE dispute_status AS ENUM ('filed', 'under_review', 'awaiting_merchant_response', 'merchant_responded', 'escalated', 'resolved');
CREATE TYPE dispute_category AS ENUM ('not_received', 'not_as_described', 'duplicate_charge', 'quality_issue', 'unauthorized');
CREATE TYPE dispute_resolution AS ENUM ('buyer_wins', 'merchant_wins', 'split');
CREATE TYPE treasury_fund_type AS ENUM ('operating', 'reserve', 'vault');
CREATE TYPE webhook_status AS ENUM ('active', 'failing', 'disabled');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'failed', 'retrying');

-- =====================================================
-- Org Profiles Table (extends Supabase auth.users)
-- =====================================================

CREATE TABLE org_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    current_organization_id UUID,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_profiles_email ON org_profiles(email);
CREATE INDEX idx_org_profiles_organization ON org_profiles(current_organization_id);

-- =====================================================
-- Organizations Table
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES org_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    industry TEXT,
    website TEXT,
    size TEXT,
    logo_url TEXT,
    contact_email TEXT,

    -- Settlement configuration
    settlement_address TEXT,
    settlement_chain TEXT DEFAULT 'arc',

    -- Plan and limits
    plan organization_plan DEFAULT 'starter',
    monthly_volume_limit DECIMAL(20, 2),

    -- Settings
    settings JSONB DEFAULT '{
        "instant_settlement": true,
        "auto_yield": true,
        "yield_threshold": 10000,
        "default_currency": "USDC",
        "fee_rate": 0.001,
        "notifications": {
            "email_invoices": true,
            "email_disputes": true,
            "email_low_balance": true
        }
    }',

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- Add FK constraint after organizations table exists
ALTER TABLE org_profiles
    ADD CONSTRAINT fk_org_profiles_organization
    FOREIGN KEY (current_organization_id)
    REFERENCES organizations(id) ON DELETE SET NULL;

-- =====================================================
-- API Keys Table
-- =====================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['read', 'write'],
    last_used_at TIMESTAMPTZ,
    request_count BIGINT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- =====================================================
-- Audit Log Table
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES org_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_profiles_updated_at
    BEFORE UPDATE ON org_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
