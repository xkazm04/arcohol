-- =====================================================
-- ArcPay B2B Platform - Disputes
-- 004_disputes.sql - Disputes, AI Evaluation, Resolution
-- =====================================================

-- =====================================================
-- Disputes Table
-- =====================================================

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Transaction reference
    transaction_id TEXT NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Parties
    buyer_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,

    -- Claim details
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',
    category dispute_category NOT NULL,
    description TEXT NOT NULL,
    desired_resolution TEXT DEFAULT 'full_refund', -- full_refund, partial_refund, replacement, other

    -- Status
    status dispute_status DEFAULT 'filed',

    -- Deadlines
    merchant_response_deadline TIMESTAMPTZ,
    resolution_deadline TIMESTAMPTZ,

    -- Timestamps
    filed_at TIMESTAMPTZ DEFAULT NOW(),
    merchant_responded_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_org ON disputes(organization_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_category ON disputes(category);
CREATE INDEX idx_disputes_transaction ON disputes(transaction_id);
CREATE INDEX idx_disputes_created ON disputes(created_at DESC);

-- =====================================================
-- Dispute Evidence Table
-- =====================================================

CREATE TABLE dispute_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,

    -- Submitter
    submitted_by TEXT NOT NULL, -- 'buyer' or 'merchant'
    submitter_id TEXT NOT NULL,

    -- Evidence details
    type TEXT NOT NULL, -- receipt, correspondence, photo, shipping_proof, other
    title TEXT NOT NULL,
    description TEXT,

    -- File storage
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_evidence_submitter ON dispute_evidence(submitted_by);

-- =====================================================
-- Merchant Response Table
-- =====================================================

CREATE TABLE merchant_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,

    -- Response
    accept_claim BOOLEAN NOT NULL,
    response_text TEXT NOT NULL,
    proposed_resolution TEXT, -- full_refund, partial_refund, replacement, reject

    -- Partial refund details
    proposed_refund_amount DECIMAL(20, 6),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchant_responses_dispute ON merchant_responses(dispute_id);

-- =====================================================
-- AI Evaluation Table
-- =====================================================

CREATE TABLE ai_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,

    -- AI recommendation
    recommendation TEXT NOT NULL, -- approve, deny, escalate
    confidence DECIMAL(4, 3) NOT NULL, -- 0.000 to 1.000

    -- Reasoning
    reasoning TEXT NOT NULL,

    -- Detailed factors
    factors JSONB DEFAULT '{}', -- {
    --   buyer_history: { total_transactions, previous_disputes, dispute_rate, account_age_days, score },
    --   merchant_history: { ... },
    --   evidence_quality: { buyer_score, merchant_score, documentation_complete },
    --   transaction_analysis: { amount_typical, timing_suspicious, pattern_match, risk_score }
    -- }

    -- AI model info
    model_version TEXT,
    processing_time_ms INTEGER,

    -- Human override
    overridden BOOLEAN DEFAULT FALSE,
    overridden_by UUID REFERENCES org_profiles(id),
    override_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_evaluations_dispute ON ai_evaluations(dispute_id);
CREATE INDEX idx_ai_evaluations_recommendation ON ai_evaluations(recommendation);

-- =====================================================
-- Dispute Resolution Table
-- =====================================================

CREATE TABLE dispute_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,

    -- Outcome
    outcome dispute_resolution NOT NULL,

    -- Amounts
    refund_amount DECIMAL(20, 6),
    currency TEXT DEFAULT 'USDC',

    -- Decision details
    reason TEXT NOT NULL,
    resolved_by TEXT NOT NULL, -- 'ai' or 'human'
    arbiter_id UUID REFERENCES org_profiles(id),

    -- Refund transaction
    refund_tx_hash TEXT,
    refund_status TEXT DEFAULT 'pending', -- pending, completed, failed

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispute_resolutions_dispute ON dispute_resolutions(dispute_id);
CREATE INDEX idx_dispute_resolutions_outcome ON dispute_resolutions(outcome);

-- =====================================================
-- Delivery Proofs Table (Dispute Prevention)
-- =====================================================

CREATE TABLE delivery_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Transaction reference
    transaction_id TEXT NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Delivery type
    type TEXT NOT NULL, -- digital_delivery, physical_shipment, service_rendered, subscription_access

    -- Proof details (varies by type)
    proof JSONB NOT NULL, -- {
    --   digital: { timestamp, confirmed, ip_address, download_links, access_granted_at }
    --   physical: { carrier, tracking_number, shipped_at, delivered_at, signature_url }
    --   service: { service_date, service_description, completion_confirmed, customer_signature }
    --   subscription: { period_start, period_end, features_accessed, usage_logs }
    -- }

    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_proofs_org ON delivery_proofs(organization_id);
CREATE INDEX idx_delivery_proofs_transaction ON delivery_proofs(transaction_id);

-- =====================================================
-- Dispute Protection Settings Table
-- =====================================================

CREATE TABLE dispute_protection_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Protection settings
    enabled BOOLEAN DEFAULT TRUE,
    auto_accept_threshold DECIMAL(20, 6) DEFAULT 50, -- Auto-accept disputes under this amount
    require_delivery_proof BOOLEAN DEFAULT TRUE,
    require_delivery_proof_threshold DECIMAL(20, 6) DEFAULT 100,

    -- Reserve settings
    reserve_percentage DECIMAL(5, 2) DEFAULT 5.00, -- 5% reserve for disputes
    reserve_balance DECIMAL(20, 6) DEFAULT 0,

    -- AI settings
    ai_enabled BOOLEAN DEFAULT TRUE,
    ai_auto_resolve BOOLEAN DEFAULT FALSE,
    ai_confidence_threshold DECIMAL(4, 3) DEFAULT 0.85,

    -- Notification settings
    notify_on_dispute BOOLEAN DEFAULT TRUE,
    notify_email TEXT,
    notify_slack_webhook TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id)
);

CREATE INDEX idx_dispute_protection_org ON dispute_protection_settings(organization_id);

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_disputes_updated_at
    BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispute_protection_updated_at
    BEFORE UPDATE ON dispute_protection_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
