-- =====================================================
-- ArcPay B2B Platform - API Credits System
-- 015_api_credits.sql - Credit-Based API Monetization
-- =====================================================

-- =====================================================
-- Enums
-- =====================================================

CREATE TYPE api_credit_transaction_type AS ENUM (
    'deposit',      -- USDC deposited to account
    'deduction',    -- API call charged
    'refund',       -- Refund for failed request
    'adjustment',   -- Manual adjustment
    'bonus'         -- Promotional credits
);

-- =====================================================
-- API Credit Endpoints (Pricing Configuration)
-- =====================================================

CREATE TABLE api_credit_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Endpoint identification
    path TEXT NOT NULL,                    -- /api/v1/analyze
    method TEXT DEFAULT 'POST',            -- GET, POST, PUT, DELETE, *

    -- Pricing
    price_per_call DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Display info
    name TEXT,
    description TEXT,

    -- Status
    active BOOLEAN DEFAULT TRUE,

    -- Rate limiting (optional, per customer)
    rate_limit_per_minute INTEGER,
    rate_limit_per_hour INTEGER,
    rate_limit_per_day INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, path, method)
);

CREATE INDEX idx_api_credit_endpoints_org ON api_credit_endpoints(organization_id);
CREATE INDEX idx_api_credit_endpoints_active ON api_credit_endpoints(organization_id, active) WHERE active = true;
CREATE INDEX idx_api_credit_endpoints_path ON api_credit_endpoints(organization_id, path);

-- =====================================================
-- API Credit Accounts (One per Customer per Org)
-- =====================================================

CREATE TABLE api_credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Customer identification
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,  -- Optional link to existing customer
    external_customer_id TEXT NOT NULL,                             -- Required: ID from developer's system

    -- Balance
    balance DECIMAL(20, 6) DEFAULT 0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'USDC',

    -- Alerts
    low_balance_threshold DECIMAL(20, 6) DEFAULT 10,
    low_balance_notified_at TIMESTAMPTZ,

    -- Auto top-up (optional)
    auto_topup_enabled BOOLEAN DEFAULT FALSE,
    auto_topup_amount DECIMAL(20, 6),
    auto_topup_trigger DECIMAL(20, 6),              -- Trigger when balance falls below this
    auto_topup_wallet TEXT,                          -- Customer's wallet for auto-charge

    -- Lifetime stats
    total_deposited DECIMAL(20, 6) DEFAULT 0,
    total_spent DECIMAL(20, 6) DEFAULT 0,
    total_requests BIGINT DEFAULT 0,

    -- Status
    active BOOLEAN DEFAULT TRUE,
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, external_customer_id)
);

CREATE INDEX idx_api_credit_accounts_org ON api_credit_accounts(organization_id);
CREATE INDEX idx_api_credit_accounts_customer ON api_credit_accounts(customer_id);
CREATE INDEX idx_api_credit_accounts_external ON api_credit_accounts(external_customer_id);
CREATE INDEX idx_api_credit_accounts_balance ON api_credit_accounts(organization_id, balance);

-- =====================================================
-- API Credit Transactions (Audit Trail)
-- =====================================================

CREATE TABLE api_credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES api_credit_accounts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Transaction type
    type api_credit_transaction_type NOT NULL,

    -- Amount (positive for deposits/refunds, negative for deductions)
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Balance tracking
    balance_before DECIMAL(20, 6) NOT NULL,
    balance_after DECIMAL(20, 6) NOT NULL,

    -- For deposits
    tx_hash TEXT,
    payer_address TEXT,
    chain TEXT,

    -- For deductions
    endpoint_id UUID REFERENCES api_credit_endpoints(id) ON DELETE SET NULL,
    request_id TEXT,                                -- Unique request identifier
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

    -- Details
    description TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_credit_transactions_account ON api_credit_transactions(account_id);
CREATE INDEX idx_api_credit_transactions_org ON api_credit_transactions(organization_id);
CREATE INDEX idx_api_credit_transactions_type ON api_credit_transactions(type);
CREATE INDEX idx_api_credit_transactions_created ON api_credit_transactions(created_at DESC);
CREATE INDEX idx_api_credit_transactions_tx_hash ON api_credit_transactions(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_api_credit_transactions_request ON api_credit_transactions(request_id) WHERE request_id IS NOT NULL;

-- =====================================================
-- API Usage Logs (Detailed Request Logging)
-- =====================================================

CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES api_credit_accounts(id) ON DELETE CASCADE,

    -- References
    endpoint_id UUID REFERENCES api_credit_endpoints(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES api_credit_transactions(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

    -- Customer identification
    external_customer_id TEXT NOT NULL,

    -- Request details
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    request_id TEXT,

    -- Pricing
    price_charged DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Response
    response_status INTEGER,
    response_time_ms INTEGER,

    -- Request metadata
    ip_address INET,
    user_agent TEXT,

    -- Additional info
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_logs_org ON api_usage_logs(organization_id);
CREATE INDEX idx_api_usage_logs_account ON api_usage_logs(account_id);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint_id);
CREATE INDEX idx_api_usage_logs_external ON api_usage_logs(external_customer_id);
CREATE INDEX idx_api_usage_logs_created ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_usage_logs_path ON api_usage_logs(organization_id, path);

-- Partitioning support for high volume (optional, can add later)
-- CREATE INDEX idx_api_usage_logs_created_partition ON api_usage_logs(created_at);

-- =====================================================
-- API Keys Extension (link to credit accounts)
-- =====================================================

-- Add credit-related columns to api_keys if not exists
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS credit_account_id UUID REFERENCES api_credit_accounts(id) ON DELETE SET NULL;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS external_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_api_keys_credit_account ON api_keys(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_external_customer ON api_keys(external_customer_id);

-- =====================================================
-- Functions
-- =====================================================

-- Function to deduct credits (atomic operation)
CREATE OR REPLACE FUNCTION deduct_api_credits(
    p_account_id UUID,
    p_amount DECIMAL(20, 6),
    p_endpoint_id UUID DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_api_key_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE (
    success BOOLEAN,
    transaction_id UUID,
    balance_before DECIMAL(20, 6),
    balance_after DECIMAL(20, 6),
    error_message TEXT
) AS $$
DECLARE
    v_account api_credit_accounts%ROWTYPE;
    v_new_balance DECIMAL(20, 6);
    v_transaction_id UUID;
BEGIN
    -- Lock the account row for update
    SELECT * INTO v_account
    FROM api_credit_accounts
    WHERE id = p_account_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 0::DECIMAL, 'Account not found'::TEXT;
        RETURN;
    END IF;

    IF NOT v_account.active THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_account.balance, v_account.balance, 'Account is suspended'::TEXT;
        RETURN;
    END IF;

    IF v_account.balance < p_amount THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_account.balance, v_account.balance, 'Insufficient balance'::TEXT;
        RETURN;
    END IF;

    v_new_balance := v_account.balance - p_amount;

    -- Update account balance
    UPDATE api_credit_accounts
    SET
        balance = v_new_balance,
        total_spent = total_spent + p_amount,
        total_requests = total_requests + 1,
        updated_at = NOW()
    WHERE id = p_account_id;

    -- Create transaction record
    INSERT INTO api_credit_transactions (
        account_id,
        organization_id,
        type,
        amount,
        currency,
        balance_before,
        balance_after,
        endpoint_id,
        request_id,
        api_key_id,
        description,
        metadata
    ) VALUES (
        p_account_id,
        v_account.organization_id,
        'deduction',
        -p_amount,
        v_account.currency,
        v_account.balance,
        v_new_balance,
        p_endpoint_id,
        p_request_id,
        p_api_key_id,
        p_description,
        p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN QUERY SELECT TRUE, v_transaction_id, v_account.balance, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (atomic operation)
CREATE OR REPLACE FUNCTION add_api_credits(
    p_account_id UUID,
    p_amount DECIMAL(20, 6),
    p_type api_credit_transaction_type DEFAULT 'deposit',
    p_tx_hash TEXT DEFAULT NULL,
    p_payer_address TEXT DEFAULT NULL,
    p_chain TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE (
    success BOOLEAN,
    transaction_id UUID,
    balance_before DECIMAL(20, 6),
    balance_after DECIMAL(20, 6),
    error_message TEXT
) AS $$
DECLARE
    v_account api_credit_accounts%ROWTYPE;
    v_new_balance DECIMAL(20, 6);
    v_transaction_id UUID;
BEGIN
    -- Lock the account row for update
    SELECT * INTO v_account
    FROM api_credit_accounts
    WHERE id = p_account_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 0::DECIMAL, 'Account not found'::TEXT;
        RETURN;
    END IF;

    v_new_balance := v_account.balance + p_amount;

    -- Update account balance
    UPDATE api_credit_accounts
    SET
        balance = v_new_balance,
        total_deposited = CASE WHEN p_type = 'deposit' THEN total_deposited + p_amount ELSE total_deposited END,
        low_balance_notified_at = CASE WHEN v_new_balance > low_balance_threshold THEN NULL ELSE low_balance_notified_at END,
        updated_at = NOW()
    WHERE id = p_account_id;

    -- Create transaction record
    INSERT INTO api_credit_transactions (
        account_id,
        organization_id,
        type,
        amount,
        currency,
        balance_before,
        balance_after,
        tx_hash,
        payer_address,
        chain,
        description,
        metadata
    ) VALUES (
        p_account_id,
        v_account.organization_id,
        p_type,
        p_amount,
        v_account.currency,
        v_account.balance,
        v_new_balance,
        p_tx_hash,
        p_payer_address,
        p_chain,
        p_description,
        p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN QUERY SELECT TRUE, v_transaction_id, v_account.balance, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create credit account
CREATE OR REPLACE FUNCTION get_or_create_credit_account(
    p_organization_id UUID,
    p_external_customer_id TEXT,
    p_customer_id UUID DEFAULT NULL,
    p_initial_balance DECIMAL(20, 6) DEFAULT 0
) RETURNS api_credit_accounts AS $$
DECLARE
    v_account api_credit_accounts%ROWTYPE;
BEGIN
    -- Try to find existing account
    SELECT * INTO v_account
    FROM api_credit_accounts
    WHERE organization_id = p_organization_id
      AND external_customer_id = p_external_customer_id;

    IF FOUND THEN
        -- Update customer_id link if provided and not set
        IF p_customer_id IS NOT NULL AND v_account.customer_id IS NULL THEN
            UPDATE api_credit_accounts
            SET customer_id = p_customer_id, updated_at = NOW()
            WHERE id = v_account.id
            RETURNING * INTO v_account;
        END IF;
        RETURN v_account;
    END IF;

    -- Create new account
    INSERT INTO api_credit_accounts (
        organization_id,
        customer_id,
        external_customer_id,
        balance
    ) VALUES (
        p_organization_id,
        p_customer_id,
        p_external_customer_id,
        p_initial_balance
    ) RETURNING * INTO v_account;

    RETURN v_account;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_api_credit_endpoints_updated_at
    BEFORE UPDATE ON api_credit_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_credit_accounts_updated_at
    BEFORE UPDATE ON api_credit_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Webhook Event Types for API Credits
-- =====================================================

INSERT INTO webhook_event_types (category, event_type, description, payload_schema) VALUES
-- Credit account events
('api_credits', 'api_credits.account.created', 'Credit account created', '{"accountId": "uuid", "externalCustomerId": "string", "initialBalance": "number"}'),
('api_credits', 'api_credits.deposit.completed', 'Credits deposited to account', '{"accountId": "uuid", "amount": "number", "txHash": "string", "newBalance": "number"}'),
('api_credits', 'api_credits.balance.low', 'Account balance below threshold', '{"accountId": "uuid", "balance": "number", "threshold": "number"}'),
('api_credits', 'api_credits.balance.depleted', 'Account balance depleted', '{"accountId": "uuid", "externalCustomerId": "string"}'),
-- Usage events
('api_credits', 'api_credits.usage.charged', 'API call charged', '{"accountId": "uuid", "endpoint": "string", "amount": "number", "balance": "number"}'),
('api_credits', 'api_credits.usage.rejected', 'API call rejected (insufficient balance)', '{"accountId": "uuid", "endpoint": "string", "required": "number", "balance": "number"}')
ON CONFLICT (event_type) DO NOTHING;

-- =====================================================
-- Views for Analytics
-- =====================================================

-- Daily usage summary per account
CREATE OR REPLACE VIEW api_credit_daily_usage AS
SELECT
    date_trunc('day', created_at) AS date,
    organization_id,
    account_id,
    external_customer_id,
    COUNT(*) AS request_count,
    SUM(price_charged) AS total_charged,
    AVG(response_time_ms) AS avg_response_time,
    COUNT(CASE WHEN response_status >= 200 AND response_status < 300 THEN 1 END) AS success_count,
    COUNT(CASE WHEN response_status >= 400 THEN 1 END) AS error_count
FROM api_usage_logs
GROUP BY date_trunc('day', created_at), organization_id, account_id, external_customer_id;

-- Endpoint usage summary
CREATE OR REPLACE VIEW api_credit_endpoint_stats AS
SELECT
    e.id AS endpoint_id,
    e.organization_id,
    e.path,
    e.method,
    e.price_per_call,
    e.active,
    COALESCE(u.total_calls, 0) AS total_calls,
    COALESCE(u.total_revenue, 0) AS total_revenue,
    COALESCE(u.calls_today, 0) AS calls_today,
    COALESCE(u.revenue_today, 0) AS revenue_today
FROM api_credit_endpoints e
LEFT JOIN (
    SELECT
        endpoint_id,
        COUNT(*) AS total_calls,
        SUM(price_charged) AS total_revenue,
        COUNT(CASE WHEN created_at >= date_trunc('day', NOW()) THEN 1 END) AS calls_today,
        SUM(CASE WHEN created_at >= date_trunc('day', NOW()) THEN price_charged ELSE 0 END) AS revenue_today
    FROM api_usage_logs
    GROUP BY endpoint_id
) u ON e.id = u.endpoint_id;
