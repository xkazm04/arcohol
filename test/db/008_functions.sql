-- =====================================================
-- ArcPay B2B Platform - Functions & Procedures
-- 008_functions.sql - Stored Procedures, Triggers, Utilities
-- =====================================================

-- =====================================================
-- Profile Management Functions
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO org_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Organization Ownership Check
-- =====================================================

CREATE OR REPLACE FUNCTION is_org_owner(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organizations
        WHERE id = p_organization_id
          AND owner_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's current organization
CREATE OR REPLACE FUNCTION get_current_organization(
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT current_organization_id INTO v_org_id
    FROM org_profiles WHERE id = p_user_id;
    RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Credit Account Functions
-- =====================================================

-- Create credit account for organization
CREATE OR REPLACE FUNCTION create_credit_account(
    p_organization_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_account_id UUID;
BEGIN
    INSERT INTO credit_accounts (organization_id)
    VALUES (p_organization_id)
    RETURNING id INTO v_account_id;

    -- Create default meters
    INSERT INTO usage_meters (organization_id, name, slug, rate, unit) VALUES
        (p_organization_id, 'API Call', 'api_call', 0.01, 'call'),
        (p_organization_id, 'Data Export', 'data_export', 0.50, 'GB'),
        (p_organization_id, 'Premium Feature', 'premium_feature', 5.00, 'usage'),
        (p_organization_id, 'Storage', 'storage_gb', 0.10, 'GB/mo');

    RETURN v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deposit credits
CREATE OR REPLACE FUNCTION credit_deposit(
    p_account_id UUID,
    p_amount DECIMAL,
    p_tx_hash TEXT DEFAULT NULL,
    p_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE credit_accounts
    SET available_balance = available_balance + p_amount,
        status = CASE
            WHEN status = 'depleted' THEN 'active'::account_status
            WHEN status = 'low_balance' AND (available_balance + p_amount) > (settings->>'low_balance_alert')::DECIMAL THEN 'active'::account_status
            ELSE status
        END
    WHERE id = p_account_id;

    INSERT INTO credit_deposits (account_id, amount, tx_hash, reference)
    VALUES (p_account_id, p_amount, p_tx_hash, p_reference);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record usage and deduct from credits
CREATE OR REPLACE FUNCTION record_usage(
    p_account_id UUID,
    p_meter TEXT,
    p_count DECIMAL DEFAULT 1,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, cost DECIMAL) AS $$
DECLARE
    v_rate DECIMAL;
    v_cost DECIMAL;
    v_record_id UUID;
    v_org_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id
    FROM credit_accounts WHERE id = p_account_id;

    SELECT rate INTO v_rate
    FROM usage_meters
    WHERE organization_id = v_org_id AND slug = p_meter AND is_active = TRUE;

    IF v_rate IS NULL THEN
        RAISE EXCEPTION 'Unknown meter: %', p_meter;
    END IF;

    v_cost := p_count * v_rate;

    INSERT INTO usage_records (account_id, meter, count, rate, cost, idempotency_key)
    VALUES (p_account_id, p_meter, p_count, v_rate, v_cost, p_idempotency_key)
    RETURNING usage_records.id INTO v_record_id;

    UPDATE credit_accounts
    SET available_balance = available_balance - v_cost,
        status = CASE
            WHEN available_balance - v_cost <= 0 THEN 'depleted'::account_status
            WHEN available_balance - v_cost < (settings->>'low_balance_alert')::DECIMAL THEN 'low_balance'::account_status
            ELSE status
        END
    WHERE id = p_account_id;

    RETURN QUERY SELECT v_record_id, v_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transfer to yield
CREATE OR REPLACE FUNCTION transfer_to_yield(
    p_account_id UUID,
    p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_available DECIMAL;
BEGIN
    SELECT available_balance INTO v_available
    FROM credit_accounts WHERE id = p_account_id;

    IF v_available < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    UPDATE credit_accounts
    SET available_balance = available_balance - p_amount,
        yield_balance = yield_balance + p_amount
    WHERE id = p_account_id;

    INSERT INTO yield_transactions (account_id, type, amount)
    VALUES (p_account_id, 'transfer_to_yield', p_amount);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transfer from yield
CREATE OR REPLACE FUNCTION transfer_from_yield(
    p_account_id UUID,
    p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_yield_balance DECIMAL;
BEGIN
    SELECT yield_balance INTO v_yield_balance
    FROM credit_accounts WHERE id = p_account_id;

    IF v_yield_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient yield balance';
    END IF;

    UPDATE credit_accounts
    SET yield_balance = yield_balance - p_amount,
        available_balance = available_balance + p_amount
    WHERE id = p_account_id;

    INSERT INTO yield_transactions (account_id, type, amount)
    VALUES (p_account_id, 'transfer_from_yield', p_amount);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Invoice Functions
-- =====================================================

-- Generate invoice reference
CREATE OR REPLACE FUNCTION generate_invoice_reference(
    p_organization_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_count INTEGER;
    v_year TEXT;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM invoices
    WHERE organization_id = p_organization_id
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

    RETURN 'INV-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create invoice
CREATE OR REPLACE FUNCTION create_invoice(
    p_organization_id UUID,
    p_customer_id UUID,
    p_amount DECIMAL,
    p_line_items JSONB DEFAULT '[]',
    p_due_date DATE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_reference TEXT;
    v_fee_rate DECIMAL;
    v_fee_amount DECIMAL;
    v_net_amount DECIMAL;
BEGIN
    SELECT COALESCE((settings->>'fee_rate')::DECIMAL, 0.001) INTO v_fee_rate
    FROM organizations WHERE id = p_organization_id;

    v_reference := generate_invoice_reference(p_organization_id);
    v_fee_amount := p_amount * v_fee_rate;
    v_net_amount := p_amount - v_fee_amount;

    INSERT INTO invoices (
        organization_id, customer_id, reference, amount, subtotal,
        fee_rate, fee_amount, net_amount, line_items, due_date, notes
    )
    VALUES (
        p_organization_id, p_customer_id, v_reference, p_amount, p_amount,
        v_fee_rate, v_fee_amount, v_net_amount, p_line_items,
        COALESCE(p_due_date, CURRENT_DATE + INTERVAL '30 days'), p_notes
    )
    RETURNING id INTO v_invoice_id;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Treasury Functions
-- =====================================================

-- Create treasury account for organization
CREATE OR REPLACE FUNCTION create_treasury_account(
    p_organization_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_treasury_id UUID;
BEGIN
    INSERT INTO treasury_accounts (organization_id)
    VALUES (p_organization_id)
    RETURNING id INTO v_treasury_id;

    -- Create default chain allocations
    INSERT INTO chain_allocations (treasury_id, chain, chain_id, target_percentage) VALUES
        (v_treasury_id, 'arc', 1, 50),
        (v_treasury_id, 'base', 8453, 25),
        (v_treasury_id, 'ethereum', 1, 15),
        (v_treasury_id, 'polygon', 137, 10);

    RETURN v_treasury_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Treasury transfer to reserve
CREATE OR REPLACE FUNCTION treasury_transfer_to_reserve(
    p_treasury_id UUID,
    p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE treasury_accounts
    SET operating_balance = operating_balance - p_amount,
        reserve_balance = reserve_balance + p_amount
    WHERE id = p_treasury_id AND operating_balance >= p_amount;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient operating balance';
    END IF;

    INSERT INTO treasury_transactions (treasury_id, type, amount, from_fund, to_fund)
    VALUES (p_treasury_id, 'transfer_to_reserve', p_amount, 'operating', 'reserve');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- API Key Functions
-- =====================================================

-- Generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
    p_organization_id UUID,
    p_name TEXT,
    p_permissions TEXT[] DEFAULT ARRAY['read', 'write']
)
RETURNS TABLE(key_id UUID, secret_key TEXT) AS $$
DECLARE
    v_key_id UUID;
    v_secret TEXT;
    v_prefix TEXT;
    v_hash TEXT;
BEGIN
    v_key_id := uuid_generate_v4();
    v_secret := 'sk_live_' || encode(gen_random_bytes(32), 'base64');
    v_prefix := 'sk_live_...' || RIGHT(v_secret, 4);
    v_hash := crypt(v_secret, gen_salt('bf'));

    INSERT INTO api_keys (id, organization_id, name, key_prefix, key_hash, permissions)
    VALUES (v_key_id, p_organization_id, p_name, v_prefix, v_hash, p_permissions);

    RETURN QUERY SELECT v_key_id, v_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify API key
CREATE OR REPLACE FUNCTION verify_api_key(
    p_secret_key TEXT
)
RETURNS TABLE(organization_id UUID, permissions TEXT[]) AS $$
DECLARE
    v_key api_keys%ROWTYPE;
BEGIN
    SELECT * INTO v_key
    FROM api_keys
    WHERE key_hash = crypt(p_secret_key, key_hash)
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE api_keys
    SET last_used_at = NOW(),
        request_count = request_count + 1
    WHERE id = v_key.id;

    RETURN QUERY SELECT v_key.organization_id, v_key.permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Webhook Functions
-- =====================================================

-- Create webhook event
CREATE OR REPLACE FUNCTION create_webhook_event(
    p_organization_id UUID,
    p_event_type TEXT,
    p_payload JSONB,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_endpoint RECORD;
BEGIN
    INSERT INTO webhook_events (
        organization_id, event_type, payload, resource_type, resource_id,
        idempotency_key
    )
    VALUES (
        p_organization_id, p_event_type, p_payload, p_resource_type, p_resource_id,
        uuid_generate_v4()::TEXT
    )
    RETURNING id INTO v_event_id;

    FOR v_endpoint IN
        SELECT id, url
        FROM webhook_endpoints
        WHERE organization_id = p_organization_id
          AND status = 'active'
          AND p_event_type = ANY(events)
    LOOP
        INSERT INTO webhook_deliveries (endpoint_id, event_id, request_url, request_body)
        VALUES (v_endpoint.id, v_event_id, v_endpoint.url, p_payload);
    END LOOP;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
