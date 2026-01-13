-- =====================================================
-- ArcPay B2B Platform - Subscriptions
-- 014_subscriptions.sql - Recurring Billing & Subscriptions
-- =====================================================

-- =====================================================
-- Enums
-- =====================================================

CREATE TYPE subscription_interval AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM (
    'incomplete',      -- Awaiting wallet approval
    'trialing',        -- In trial period
    'active',          -- Actively billing
    'past_due',        -- Payment failed, retry pending
    'paused',          -- Temporarily paused
    'canceled',        -- Canceled by user
    'unpaid',          -- Multiple failed payments
    'expired'          -- Trial expired without payment
);
CREATE TYPE subscription_invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');

-- =====================================================
-- Subscription Plans Table
-- =====================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Plan details
    name TEXT NOT NULL,
    description TEXT,

    -- Pricing
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Billing interval
    interval subscription_interval NOT NULL,
    interval_count INTEGER DEFAULT 1, -- e.g., 2 for "every 2 months"

    -- Trial settings
    trial_days INTEGER DEFAULT 0,

    -- Features (for display)
    features JSONB DEFAULT '[]', -- ["Feature 1", "Feature 2"]

    -- Plan status
    active BOOLEAN DEFAULT true,

    -- Usage limits (optional)
    usage_limits JSONB DEFAULT '{}', -- { "api_calls": 10000, "storage_gb": 50 }

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_org ON subscription_plans(organization_id);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(active) WHERE active = true;

-- =====================================================
-- Subscriptions Table
-- =====================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,

    -- Wallet addresses for payments
    customer_wallet TEXT NOT NULL,
    merchant_wallet TEXT NOT NULL, -- Organization's receiving wallet

    -- Status
    status subscription_status DEFAULT 'incomplete',

    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    cancel_reason TEXT,

    -- Trial period
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Pause/Resume
    paused_at TIMESTAMPTZ,
    resumes_at TIMESTAMPTZ,
    pause_reason TEXT,

    -- USDC Allowance tracking (ERC-20 approve to org wallet)
    allowance_amount DECIMAL(20, 6),
    allowance_checked_at TIMESTAMPTZ,

    -- Payment tracking
    last_payment_at TIMESTAMPTZ,
    last_payment_amount DECIMAL(20, 6),
    last_payment_tx_hash TEXT,
    next_payment_at TIMESTAMPTZ,

    -- Failure tracking
    failed_payment_count INTEGER DEFAULT 0,
    last_failed_at TIMESTAMPTZ,
    last_failed_reason TEXT,

    -- Totals
    total_paid DECIMAL(20, 6) DEFAULT 0,
    invoice_count INTEGER DEFAULT 0,

    -- Blockchain
    chain TEXT DEFAULT 'base', -- Which chain for payments

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_at) WHERE status = 'active';
CREATE INDEX idx_subscriptions_customer_wallet ON subscriptions(customer_wallet);

-- =====================================================
-- Subscription Invoices Table
-- Auto-generated per billing cycle
-- =====================================================

CREATE TABLE subscription_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL, -- Links to main invoices table

    -- Billing period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Amount
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Status
    status subscription_invoice_status DEFAULT 'draft',

    -- Dates
    due_date DATE,
    finalized_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,

    -- Payment details
    payment_tx_hash TEXT,
    payment_attempts INTEGER DEFAULT 0,
    last_payment_error TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_invoices_invoice ON subscription_invoices(invoice_id);
CREATE INDEX idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX idx_subscription_invoices_due_date ON subscription_invoices(due_date);

-- =====================================================
-- Subscription Events Table
-- Audit trail for subscription lifecycle
-- =====================================================

CREATE TABLE subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    -- Event type
    event_type TEXT NOT NULL, -- created, activated, payment_succeeded, payment_failed, paused, resumed, canceled, etc.

    -- Event data
    data JSONB DEFAULT '{}',

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_subscription ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX idx_subscription_events_created ON subscription_events(created_at DESC);

-- =====================================================
-- Webhook Event Types for Subscriptions
-- =====================================================

INSERT INTO webhook_event_types (category, event_type, description, payload_schema) VALUES
-- Subscription lifecycle events
('subscription', 'subscription.created', 'New subscription created', '{"subscriptionId": "uuid", "customerId": "uuid", "planId": "uuid"}'),
('subscription', 'subscription.activated', 'Subscription became active', '{"subscriptionId": "uuid", "activatedAt": "timestamp"}'),
('subscription', 'subscription.trial_started', 'Trial period started', '{"subscriptionId": "uuid", "trialEnd": "timestamp"}'),
('subscription', 'subscription.trial_ended', 'Trial period ended', '{"subscriptionId": "uuid", "convertedToActive": "boolean"}'),
('subscription', 'subscription.renewed', 'Subscription renewed for new period', '{"subscriptionId": "uuid", "periodStart": "timestamp", "periodEnd": "timestamp"}'),
('subscription', 'subscription.payment_succeeded', 'Subscription payment collected', '{"subscriptionId": "uuid", "amount": "number", "txHash": "string"}'),
('subscription', 'subscription.payment_failed', 'Subscription payment failed', '{"subscriptionId": "uuid", "amount": "number", "reason": "string", "attemptCount": "number"}'),
('subscription', 'subscription.past_due', 'Subscription entered past_due status', '{"subscriptionId": "uuid", "daysOverdue": "number"}'),
('subscription', 'subscription.paused', 'Subscription paused', '{"subscriptionId": "uuid", "pausedAt": "timestamp", "resumesAt": "timestamp"}'),
('subscription', 'subscription.resumed', 'Subscription resumed from pause', '{"subscriptionId": "uuid", "resumedAt": "timestamp"}'),
('subscription', 'subscription.canceled', 'Subscription canceled', '{"subscriptionId": "uuid", "canceledAt": "timestamp", "cancelAtPeriodEnd": "boolean"}'),
('subscription', 'subscription.expired', 'Subscription expired', '{"subscriptionId": "uuid", "expiredAt": "timestamp"}'),
-- Plan events
('plan', 'plan.created', 'Subscription plan created', '{"planId": "uuid", "name": "string", "amount": "number"}'),
('plan', 'plan.updated', 'Subscription plan updated', '{"planId": "uuid", "changes": "object"}'),
('plan', 'plan.archived', 'Subscription plan archived', '{"planId": "uuid"}'),
-- Invoice events for subscriptions
('invoice', 'invoice.subscription.created', 'Subscription invoice generated', '{"invoiceId": "uuid", "subscriptionId": "uuid", "amount": "number"}'),
('invoice', 'invoice.subscription.finalized', 'Subscription invoice finalized', '{"invoiceId": "uuid", "dueDate": "date"}'),
('invoice', 'invoice.subscription.paid', 'Subscription invoice paid', '{"invoiceId": "uuid", "txHash": "string"}'),
('invoice', 'invoice.subscription.voided', 'Subscription invoice voided', '{"invoiceId": "uuid", "reason": "string"}')
ON CONFLICT (event_type) DO NOTHING;

-- =====================================================
-- Functions
-- =====================================================

-- Calculate next billing date based on interval
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
    from_date TIMESTAMPTZ,
    billing_interval subscription_interval,
    interval_count INTEGER DEFAULT 1
) RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN CASE billing_interval
        WHEN 'daily' THEN from_date + (interval_count || ' days')::INTERVAL
        WHEN 'weekly' THEN from_date + (interval_count || ' weeks')::INTERVAL
        WHEN 'monthly' THEN from_date + (interval_count || ' months')::INTERVAL
        WHEN 'yearly' THEN from_date + (interval_count || ' years')::INTERVAL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log subscription status changes
CREATE OR REPLACE FUNCTION log_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO subscription_events (subscription_id, event_type, data)
        VALUES (
            NEW.id,
            'status_changed',
            jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status,
                'changed_at', NOW()
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_status_change_trigger
    AFTER UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION log_subscription_status_change();
