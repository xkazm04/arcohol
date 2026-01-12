-- =====================================================
-- ArcPay B2B Platform - Credits & Usage
-- 002_credits.sql - Credit Accounts, Usage Metering
-- =====================================================

-- =====================================================
-- Credit Accounts Table
-- =====================================================

CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Balances (stored in cents/smallest unit for precision)
    available_balance DECIMAL(20, 6) DEFAULT 0,
    yield_balance DECIMAL(20, 6) DEFAULT 0,
    pending_balance DECIMAL(20, 6) DEFAULT 0,

    -- Yield tracking
    yield_earned_total DECIMAL(20, 6) DEFAULT 0,
    yield_earned_ytd DECIMAL(20, 6) DEFAULT 0,
    current_apy DECIMAL(6, 4) DEFAULT 0.052, -- 5.2%

    -- Status
    status account_status DEFAULT 'active',

    -- Settings
    settings JSONB DEFAULT '{
        "low_balance_alert": 100,
        "auto_top_up": false,
        "auto_top_up_amount": 1000,
        "auto_top_up_threshold": 100,
        "yield_enabled": true,
        "yield_threshold": 1000
    }',

    -- Currency (for multi-currency support)
    currency TEXT DEFAULT 'USDC',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One account per organization (for now)
    UNIQUE(organization_id)
);

-- Indexes
CREATE INDEX idx_credit_accounts_org ON credit_accounts(organization_id);
CREATE INDEX idx_credit_accounts_status ON credit_accounts(status);

-- =====================================================
-- Credit Deposits Table
-- =====================================================

CREATE TABLE credit_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,

    -- Amount
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Transaction details
    tx_hash TEXT,
    chain TEXT DEFAULT 'arc',
    from_address TEXT,

    -- Status
    status TEXT DEFAULT 'completed', -- pending, completed, failed

    -- Metadata
    reference TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credit_deposits_account ON credit_deposits(account_id);
CREATE INDEX idx_credit_deposits_status ON credit_deposits(status);
CREATE INDEX idx_credit_deposits_created ON credit_deposits(created_at DESC);

-- =====================================================
-- Usage Meters Table (defines available meters)
-- =====================================================

CREATE TABLE usage_meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Meter definition
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,

    -- Pricing
    rate DECIMAL(20, 6) NOT NULL, -- cost per unit
    currency TEXT DEFAULT 'USDC',
    unit TEXT DEFAULT 'unit', -- call, GB, request, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);

-- Default meters (can be customized per org)
CREATE INDEX idx_usage_meters_org ON usage_meters(organization_id);
CREATE INDEX idx_usage_meters_slug ON usage_meters(slug);

-- =====================================================
-- Usage Records Table
-- =====================================================

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,

    -- Usage details
    meter TEXT NOT NULL, -- meter slug
    count DECIMAL(20, 6) NOT NULL DEFAULT 1,

    -- Cost calculation
    rate DECIMAL(20, 6) NOT NULL,
    cost DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Idempotency (prevent duplicate charges)
    idempotency_key TEXT,

    -- Context
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate usage records
    UNIQUE(account_id, idempotency_key)
);

-- Indexes for usage queries
CREATE INDEX idx_usage_records_account ON usage_records(account_id);
CREATE INDEX idx_usage_records_meter ON usage_records(meter);
CREATE INDEX idx_usage_records_created ON usage_records(created_at DESC);
CREATE INDEX idx_usage_records_idempotency ON usage_records(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- =====================================================
-- Usage Summary Table (aggregated for performance)
-- =====================================================

CREATE TABLE usage_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'daily', -- daily, weekly, monthly

    -- Aggregated data
    meters JSONB DEFAULT '{}', -- { "api_call": { "count": 1000, "cost": 10.00 }, ... }
    total_count DECIMAL(20, 6) DEFAULT 0,
    total_cost DECIMAL(20, 6) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(account_id, period_start, period_type)
);

CREATE INDEX idx_usage_summaries_account ON usage_summaries(account_id);
CREATE INDEX idx_usage_summaries_period ON usage_summaries(period_start, period_end);

-- =====================================================
-- Yield Transactions Table
-- =====================================================

CREATE TABLE yield_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,

    -- Transaction type
    type TEXT NOT NULL, -- transfer_to_yield, transfer_from_yield, yield_credit

    -- Amounts
    amount DECIMAL(20, 6) NOT NULL,

    -- For yield credits
    apy_at_time DECIMAL(6, 4),
    days_accrued INTEGER,

    -- Status
    status TEXT DEFAULT 'completed',

    -- Blockchain reference
    tx_hash TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_yield_transactions_account ON yield_transactions(account_id);
CREATE INDEX idx_yield_transactions_type ON yield_transactions(type);
CREATE INDEX idx_yield_transactions_created ON yield_transactions(created_at DESC);

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_credit_accounts_updated_at
    BEFORE UPDATE ON credit_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_meters_updated_at
    BEFORE UPDATE ON usage_meters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_summaries_updated_at
    BEFORE UPDATE ON usage_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
