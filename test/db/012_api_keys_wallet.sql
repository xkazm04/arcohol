-- =====================================================
-- ArcPay B2B Platform - API Keys Wallet Pairing
-- 012_api_keys_wallet.sql - Add wallet address to API keys
-- =====================================================

-- Add wallet pairing columns to api_keys
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'arc';
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';

-- Create index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_wallet ON api_keys(wallet_address);
CREATE INDEX IF NOT EXISTS idx_api_keys_chain ON api_keys(chain);

-- Update generate_api_key function to support wallet pairing
CREATE OR REPLACE FUNCTION generate_api_key(
    p_organization_id UUID,
    p_name TEXT,
    p_permissions TEXT[] DEFAULT ARRAY['read', 'write'],
    p_wallet_address TEXT DEFAULT NULL,
    p_chain TEXT DEFAULT 'arc',
    p_environment TEXT DEFAULT 'production'
)
RETURNS TABLE(key_id UUID, secret_key TEXT) AS $$
DECLARE
    v_key_id UUID;
    v_secret TEXT;
    v_prefix TEXT;
    v_hash TEXT;
BEGIN
    v_key_id := uuid_generate_v4();

    -- Generate prefix based on environment
    v_prefix := CASE p_environment
        WHEN 'production' THEN 'arc_live_'
        WHEN 'sandbox' THEN 'arc_test_'
        ELSE 'arc_dev_'
    END;

    v_secret := v_prefix || encode(gen_random_bytes(24), 'base64');
    -- Remove special characters that might cause issues
    v_secret := replace(replace(replace(v_secret, '+', ''), '/', ''), '=', '');

    v_hash := crypt(v_secret, gen_salt('bf'));

    INSERT INTO api_keys (
        id, organization_id, name, key_prefix, key_hash,
        permissions, wallet_address, chain, environment
    )
    VALUES (
        v_key_id, p_organization_id, p_name,
        v_prefix || '...' || RIGHT(v_secret, 4),
        v_hash, p_permissions, p_wallet_address, p_chain, p_environment
    );

    RETURN QUERY SELECT v_key_id, v_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API keys with wallet addresses for an organization
CREATE OR REPLACE FUNCTION get_api_keys_with_wallets(
    p_organization_id UUID
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    key_prefix TEXT,
    wallet_address TEXT,
    chain TEXT,
    environment TEXT,
    permissions TEXT[],
    request_count BIGINT,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ak.id,
        ak.name,
        ak.key_prefix,
        ak.wallet_address,
        ak.chain,
        ak.environment,
        ak.permissions,
        ak.request_count,
        ak.last_used_at,
        ak.created_at
    FROM api_keys ak
    WHERE ak.organization_id = p_organization_id
      AND ak.revoked_at IS NULL
    ORDER BY ak.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
