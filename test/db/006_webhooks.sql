-- =====================================================
-- ArcPay B2B Platform - Webhooks
-- 006_webhooks.sql - Webhook Endpoints, Deliveries, Events
-- =====================================================

-- =====================================================
-- Webhook Endpoints Table
-- =====================================================

CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Endpoint configuration
    url TEXT NOT NULL,
    description TEXT,

    -- Events to subscribe to
    events TEXT[] NOT NULL DEFAULT '{}', -- ['invoice.paid', 'dispute.created', ...]

    -- Secret for signature verification
    secret TEXT NOT NULL,

    -- Status
    status webhook_status DEFAULT 'active',

    -- Health tracking
    success_rate DECIMAL(5, 2) DEFAULT 100,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INTEGER DEFAULT 0,

    -- Configuration
    config JSONB DEFAULT '{
        "timeout_ms": 30000,
        "retry_count": 3,
        "retry_delay_ms": 1000
    }',

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_endpoints_org ON webhook_endpoints(organization_id);
CREATE INDEX idx_webhook_endpoints_status ON webhook_endpoints(status);

-- =====================================================
-- Webhook Events Table (Event Log)
-- =====================================================

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT NOT NULL, -- invoice.paid, dispute.created, etc.

    -- Payload
    payload JSONB NOT NULL,

    -- Resource reference
    resource_type TEXT,
    resource_id UUID,

    -- Idempotency
    idempotency_key TEXT UNIQUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_org ON webhook_events(organization_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_resource ON webhook_events(resource_type, resource_id);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- =====================================================
-- Webhook Deliveries Table
-- =====================================================

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES webhook_events(id) ON DELETE CASCADE,

    -- Delivery attempt
    attempt_number INTEGER DEFAULT 1,

    -- Request details
    request_url TEXT NOT NULL,
    request_headers JSONB DEFAULT '{}',
    request_body JSONB NOT NULL,

    -- Response details
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,

    -- Status
    status delivery_status DEFAULT 'pending',

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Error tracking
    error_message TEXT,

    -- Next retry (if applicable)
    next_retry_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';

-- =====================================================
-- Webhook Event Types Reference Table
-- =====================================================

CREATE TABLE webhook_event_types (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- credits, invoices, disputes, treasury, agents
    description TEXT NOT NULL,
    payload_schema JSONB, -- JSON Schema for validation
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed event types
INSERT INTO webhook_event_types (id, category, description) VALUES
-- Credits events
('credits.deposited', 'credits', 'Fired when credits are deposited to an account'),
('credits.spent', 'credits', 'Fired when credits are consumed by usage'),
('credits.low_balance', 'credits', 'Fired when account balance falls below threshold'),
('credits.depleted', 'credits', 'Fired when account balance reaches zero'),
('credits.topped_up', 'credits', 'Fired when auto-refill adds credits'),
('credits.yield_earned', 'credits', 'Fired when yield is credited to account'),
('credits.transferred_to_yield', 'credits', 'Fired when credits are moved to yield'),
('credits.transferred_from_yield', 'credits', 'Fired when credits are moved from yield'),

-- Invoice events
('invoice.created', 'invoices', 'Fired when a new invoice is created'),
('invoice.sent', 'invoices', 'Fired when an invoice is sent to customer'),
('invoice.viewed', 'invoices', 'Fired when customer views the invoice'),
('invoice.paid', 'invoices', 'Fired when invoice is fully paid'),
('invoice.partially_paid', 'invoices', 'Fired when invoice receives partial payment'),
('invoice.overdue', 'invoices', 'Fired when invoice becomes overdue'),
('invoice.canceled', 'invoices', 'Fired when invoice is canceled'),

-- Settlement events
('settlement.pending', 'invoices', 'Fired when settlement is initiated'),
('settlement.completed', 'invoices', 'Fired when settlement is confirmed'),
('settlement.failed', 'invoices', 'Fired when settlement fails'),

-- Dispute events
('dispute.created', 'disputes', 'Fired when a new dispute is filed'),
('dispute.updated', 'disputes', 'Fired when dispute status changes'),
('dispute.merchant_response_required', 'disputes', 'Fired when merchant needs to respond'),
('dispute.merchant_responded', 'disputes', 'Fired when merchant submits response'),
('dispute.escalated', 'disputes', 'Fired when dispute is escalated'),
('dispute.resolved', 'disputes', 'Fired when dispute is resolved'),
('dispute.refund_issued', 'disputes', 'Fired when refund is issued'),

-- Treasury events
('treasury.created', 'treasury', 'Fired when treasury account is created'),
('treasury.updated', 'treasury', 'Fired when treasury settings change'),
('treasury.rebalanced', 'treasury', 'Fired when treasury is rebalanced'),
('treasury.payment_sent', 'treasury', 'Fired when payment is sent from treasury'),
('treasury.deposit_received', 'treasury', 'Fired when deposit is received'),
('treasury.yield_credited', 'treasury', 'Fired when yield is credited'),
('treasury.alert_triggered', 'treasury', 'Fired when treasury alert is triggered'),

-- Batch payment events
('batch.created', 'invoices', 'Fired when batch payment is created'),
('batch.processing', 'invoices', 'Fired when batch processing starts'),
('batch.completed', 'invoices', 'Fired when batch is fully processed'),
('batch.failed', 'invoices', 'Fired when batch processing fails'),

-- Agent events
('agent.created', 'agents', 'Fired when new agent wallet is created'),
('agent.transaction', 'agents', 'Fired when agent makes a payment'),
('agent.budget_warning', 'agents', 'Fired when agent approaches budget limit'),
('agent.budget_exceeded', 'agents', 'Fired when agent exceeds budget'),
('agent.approval_required', 'agents', 'Fired when transaction needs approval');

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_webhook_endpoints_updated_at
    BEFORE UPDATE ON webhook_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
