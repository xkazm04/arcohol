-- =====================================================
-- ArcPay B2B Platform - Treasury
-- 005_treasury.sql - Treasury Accounts, Yield, Rebalancing
-- =====================================================

-- =====================================================
-- Treasury Accounts Table
-- =====================================================

CREATE TABLE treasury_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Operating Fund (USDC - liquid)
    operating_balance DECIMAL(20, 6) DEFAULT 0,
    operating_pending DECIMAL(20, 6) DEFAULT 0,

    -- Reserve Fund (USDY - 24hr unlock)
    reserve_balance DECIMAL(20, 6) DEFAULT 0,
    reserve_pending DECIMAL(20, 6) DEFAULT 0,
    reserve_apy DECIMAL(6, 4) DEFAULT 0.052, -- 5.2%

    -- Vault Fund (USDY - locked for term)
    vault_balance DECIMAL(20, 6) DEFAULT 0,
    vault_lock_period_days INTEGER DEFAULT 30,
    vault_unlock_at TIMESTAMPTZ,

    -- Totals
    total_balance DECIMAL(20, 6) GENERATED ALWAYS AS (operating_balance + reserve_balance + vault_balance) STORED,

    -- Yield tracking
    yield_earned_total DECIMAL(20, 6) DEFAULT 0,
    yield_earned_ytd DECIMAL(20, 6) DEFAULT 0,
    projected_annual_yield DECIMAL(20, 6) DEFAULT 0,

    -- Strategy settings
    strategy JSONB DEFAULT '{
        "operating": {
            "target": 10000,
            "minimum": 5000,
            "currency": "USDC"
        },
        "reserve": {
            "enabled": true,
            "target_percentage": 80,
            "target_amount": null
        },
        "vault": {
            "enabled": false,
            "target_percentage": 0,
            "lock_period": 30
        },
        "auto_rebalance": true,
        "rebalance_frequency": "weekly"
    }',

    -- Status
    status TEXT DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id)
);

CREATE INDEX idx_treasury_accounts_org ON treasury_accounts(organization_id);

-- =====================================================
-- Treasury Transactions Table
-- =====================================================

CREATE TABLE treasury_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Transaction type
    type TEXT NOT NULL, -- deposit, withdrawal, payment, rebalance, yield_credit,
                        -- transfer_to_reserve, transfer_from_reserve, transfer_to_vault, transfer_from_vault

    -- Amounts
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Source and destination funds
    from_fund treasury_fund_type,
    to_fund treasury_fund_type,

    -- For payments
    recipient_address TEXT,
    recipient_chain TEXT,

    -- Blockchain details
    tx_hash TEXT,
    chain TEXT DEFAULT 'arc',

    -- Status
    status TEXT DEFAULT 'completed', -- pending, completed, failed

    -- Memo/description
    memo TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treasury_transactions_treasury ON treasury_transactions(treasury_id);
CREATE INDEX idx_treasury_transactions_type ON treasury_transactions(type);
CREATE INDEX idx_treasury_transactions_status ON treasury_transactions(status);
CREATE INDEX idx_treasury_transactions_created ON treasury_transactions(created_at DESC);

-- =====================================================
-- Treasury Rebalance Log Table
-- =====================================================

CREATE TABLE treasury_rebalances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Trigger
    trigger_type TEXT NOT NULL, -- manual, scheduled, threshold

    -- Before state
    before_state JSONB NOT NULL, -- { operating, reserve, vault }

    -- After state
    after_state JSONB NOT NULL,

    -- Actions taken
    actions JSONB DEFAULT '[]', -- [{ type, amount, from, to }]

    -- Status
    status TEXT DEFAULT 'completed',

    -- Metadata
    metadata JSONB DEFAULT '{}',

    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treasury_rebalances_treasury ON treasury_rebalances(treasury_id);
CREATE INDEX idx_treasury_rebalances_executed ON treasury_rebalances(executed_at DESC);

-- =====================================================
-- Treasury Alerts Table
-- =====================================================

CREATE TABLE treasury_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Alert type
    type TEXT NOT NULL, -- low_operating_balance, rebalance_needed, yield_credited,
                        -- large_withdrawal, unusual_activity

    -- Severity
    severity TEXT DEFAULT 'info', -- info, warning, critical

    -- Alert details
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',

    -- Status
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES org_profiles(id),

    -- Notification tracking
    notified_at TIMESTAMPTZ,
    notification_channels TEXT[], -- ['email', 'slack', 'webhook']

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treasury_alerts_treasury ON treasury_alerts(treasury_id);
CREATE INDEX idx_treasury_alerts_type ON treasury_alerts(type);
CREATE INDEX idx_treasury_alerts_acknowledged ON treasury_alerts(acknowledged);
CREATE INDEX idx_treasury_alerts_created ON treasury_alerts(created_at DESC);

-- =====================================================
-- Multi-Chain Allocations Table
-- =====================================================

CREATE TABLE chain_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Chain details
    chain TEXT NOT NULL, -- arc, base, ethereum, polygon, arbitrum, optimism
    chain_id INTEGER NOT NULL,

    -- Balance
    balance DECIMAL(20, 6) DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,

    -- Target allocation
    target_percentage DECIMAL(5, 2) DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'connected', -- connected, pending, disconnected

    -- Wallet address on this chain
    wallet_address TEXT,

    -- Last sync
    last_synced_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(treasury_id, chain)
);

CREATE INDEX idx_chain_allocations_treasury ON chain_allocations(treasury_id);
CREATE INDEX idx_chain_allocations_chain ON chain_allocations(chain);

-- =====================================================
-- Bridge Transactions Table
-- =====================================================

CREATE TABLE bridge_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treasury_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE CASCADE,

    -- Bridge details
    from_chain TEXT NOT NULL,
    to_chain TEXT NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Protocol
    bridge_protocol TEXT DEFAULT 'cctp_v2', -- cctp_v2, stargate, etc.

    -- Transaction hashes
    source_tx_hash TEXT,
    destination_tx_hash TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, bridging, completed, failed

    -- Timing
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ,

    -- Fees
    bridge_fee DECIMAL(20, 6) DEFAULT 0,
    gas_fee DECIMAL(20, 6) DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bridge_transactions_treasury ON bridge_transactions(treasury_id);
CREATE INDEX idx_bridge_transactions_status ON bridge_transactions(status);
CREATE INDEX idx_bridge_transactions_created ON bridge_transactions(created_at DESC);

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_treasury_accounts_updated_at
    BEFORE UPDATE ON treasury_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chain_allocations_updated_at
    BEFORE UPDATE ON chain_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
