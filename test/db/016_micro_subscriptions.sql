-- 016_micro_subscriptions.sql
-- Micro subscription tables for x402 gasless per-use billing

-- Micro subscription plans (per-use/metered billing with x402 settlement)
CREATE TABLE micro_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Billing configuration
  billing_type TEXT NOT NULL CHECK (billing_type IN ('per_use', 'daily', 'hourly', 'per_minute')),
  price_per_unit TEXT NOT NULL, -- e.g., '$0.001' per API call
  unit_name TEXT DEFAULT 'unit', -- e.g., 'API call', 'minute', 'request'

  -- Limits (stored as strings like '$10.00')
  min_charge TEXT, -- Minimum charge per transaction
  max_charge_per_day TEXT, -- Daily spending cap
  max_charge_per_month TEXT, -- Monthly spending cap

  -- Features
  features JSONB DEFAULT '[]'::JSONB,

  -- x402 Settlement
  network TEXT NOT NULL DEFAULT 'eip155:5042002', -- Arc Testnet default
  seller_address TEXT NOT NULL, -- Wallet to receive payments

  -- Status
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Active micro subscriptions
CREATE TABLE micro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  micro_plan_id UUID REFERENCES micro_plans(id) NOT NULL,

  -- Payer info
  payer_address TEXT NOT NULL, -- Customer wallet address
  payer_email TEXT,

  -- Charge tracking
  total_charged TEXT DEFAULT '0', -- Total amount charged
  charge_count INT DEFAULT 0,
  today_charged TEXT DEFAULT '0', -- Reset daily
  month_charged TEXT DEFAULT '0', -- Reset monthly
  last_charge_at TIMESTAMPTZ,
  last_charge_amount TEXT,

  -- Gateway deposit tracking
  deposit_balance TEXT, -- Optional: track gateway deposit

  -- x402 Authorization (EIP-3009 pre-signed for recurring)
  authorization_signature TEXT,
  authorized_amount TEXT,

  -- Network
  network TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'depleted', 'canceled')),
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual micro charges (batched for settlement)
CREATE TABLE micro_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  micro_subscription_id UUID REFERENCES micro_subscriptions(id) NOT NULL,

  amount TEXT NOT NULL, -- Charge amount
  units DECIMAL(18,6) NOT NULL, -- Number of units charged
  unit_price TEXT NOT NULL, -- Price per unit at time of charge
  description TEXT,

  -- Settlement
  batch_id TEXT, -- Reference to settlement batch
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'batched', 'settled', 'failed')),
  signature TEXT, -- Truncated signature for reference
  transaction TEXT, -- Settlement tx hash

  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settlement batches (gasless batch settlements via x402)
CREATE TABLE micro_settlement_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  total_charges INT NOT NULL,
  total_amount TEXT NOT NULL,

  -- x402 settlement
  network TEXT NOT NULL,
  tx_hash TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed')),

  created_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_micro_plans_org ON micro_plans(organization_id);
CREATE INDEX idx_micro_plans_active ON micro_plans(active);
CREATE INDEX idx_micro_subscriptions_org ON micro_subscriptions(organization_id);
CREATE INDEX idx_micro_subscriptions_plan ON micro_subscriptions(micro_plan_id);
CREATE INDEX idx_micro_subscriptions_payer ON micro_subscriptions(payer_address);
CREATE INDEX idx_micro_subscriptions_status ON micro_subscriptions(status);
CREATE INDEX idx_micro_charges_subscription ON micro_charges(micro_subscription_id);
CREATE INDEX idx_micro_charges_status ON micro_charges(status);
CREATE INDEX idx_micro_charges_batch ON micro_charges(batch_id);
CREATE INDEX idx_micro_settlement_batches_org ON micro_settlement_batches(organization_id);
CREATE INDEX idx_micro_settlement_batches_status ON micro_settlement_batches(status);

-- Updated_at triggers
CREATE TRIGGER update_micro_plans_updated_at
  BEFORE UPDATE ON micro_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micro_subscriptions_updated_at
  BEFORE UPDATE ON micro_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE micro_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_settlement_batches ENABLE ROW LEVEL SECURITY;

-- Micro plans: org members can manage
CREATE POLICY "micro_plans_org_access" ON micro_plans
  FOR ALL USING (
    organization_id IN (
      SELECT current_organization_id FROM org_profiles WHERE id = auth.uid()
    )
  );

-- Micro subscriptions: org members can view subscriptions for their plans
CREATE POLICY "micro_subscriptions_org_access" ON micro_subscriptions
  FOR ALL USING (
    plan_id IN (
      SELECT id FROM micro_plans WHERE organization_id IN (
        SELECT current_organization_id FROM org_profiles WHERE id = auth.uid()
      )
    )
  );

-- Micro charges: org members can view charges for their subscriptions
CREATE POLICY "micro_charges_org_access" ON micro_charges
  FOR ALL USING (
    subscription_id IN (
      SELECT ms.id FROM micro_subscriptions ms
      JOIN micro_plans mp ON ms.plan_id = mp.id
      WHERE mp.organization_id IN (
        SELECT current_organization_id FROM org_profiles WHERE id = auth.uid()
      )
    )
  );

-- Settlement batches: org members can manage
CREATE POLICY "micro_settlement_batches_org_access" ON micro_settlement_batches
  FOR ALL USING (
    organization_id IN (
      SELECT current_organization_id FROM org_profiles WHERE id = auth.uid()
    )
  );
