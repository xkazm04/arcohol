-- =====================================================
-- ArcPay B2B Platform - Invoicing
-- 003_invoices.sql - Invoices, Settlements, Customers
-- =====================================================

-- =====================================================
-- Customers Table
-- =====================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Customer details
    company_name TEXT,
    contact_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,

    -- Billing address
    billing_address JSONB DEFAULT '{}',

    -- Payment details
    wallet_address TEXT,
    preferred_chain TEXT DEFAULT 'arc',

    -- Stats
    total_invoiced DECIMAL(20, 6) DEFAULT 0,
    total_paid DECIMAL(20, 6) DEFAULT 0,
    outstanding_balance DECIMAL(20, 6) DEFAULT 0,
    invoice_count INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);

-- =====================================================
-- Invoices Table
-- =====================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

    -- Invoice reference
    reference TEXT NOT NULL, -- INV-2024-0001

    -- Buyer information (denormalized for invoice snapshot)
    buyer JSONB DEFAULT '{}', -- { company, name, email, wallet_address }

    -- Amounts
    subtotal DECIMAL(20, 6) NOT NULL,
    tax_amount DECIMAL(20, 6) DEFAULT 0,
    discount_amount DECIMAL(20, 6) DEFAULT 0,
    amount DECIMAL(20, 6) NOT NULL,

    -- Fees
    fee_rate DECIMAL(6, 4) DEFAULT 0.001, -- 0.1%
    fee_amount DECIMAL(20, 6) DEFAULT 0,
    net_amount DECIMAL(20, 6) NOT NULL, -- amount - fee

    currency TEXT DEFAULT 'USDC',

    -- Status
    status invoice_status DEFAULT 'draft',

    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    -- Payment info
    payment_url TEXT,
    qr_code TEXT,

    -- Line items (stored as JSONB for flexibility)
    line_items JSONB DEFAULT '[]', -- [{ description, quantity, unit_price, total }]

    -- Notes
    notes TEXT,
    terms TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique reference per organization
    UNIQUE(organization_id, reference)
);

-- Indexes
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_reference ON invoices(reference);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);

-- =====================================================
-- Invoice Payments Table
-- =====================================================

CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Payment details
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Blockchain details
    tx_hash TEXT,
    chain TEXT DEFAULT 'arc',
    payer_address TEXT,

    -- Status
    status TEXT DEFAULT 'completed', -- pending, completed, failed

    -- Timing
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_tx ON invoice_payments(tx_hash);

-- =====================================================
-- Settlements Table
-- =====================================================

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Settlement details
    amount DECIMAL(20, 6) NOT NULL,
    fee_amount DECIMAL(20, 6) DEFAULT 0,
    net_amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',

    -- Destination
    destination_address TEXT NOT NULL,
    chain TEXT DEFAULT 'arc',

    -- Blockchain details
    tx_hash TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, completed, failed

    -- Timing
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    latency_seconds INTEGER, -- for tracking <5s settlement

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settlements_org ON settlements(organization_id);
CREATE INDEX idx_settlements_invoice ON settlements(invoice_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_created ON settlements(created_at DESC);

-- =====================================================
-- Batch Payments Table
-- =====================================================

CREATE TABLE batch_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Batch reference
    reference TEXT NOT NULL,

    -- Totals
    total_amount DECIMAL(20, 6) NOT NULL,
    total_fee DECIMAL(20, 6) DEFAULT 0,
    currency TEXT DEFAULT 'USDC',

    -- Payments (stored as JSONB)
    payments JSONB DEFAULT '[]', -- [{ recipient, amount, memo, status }]
    payment_count INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, processing, completed, partially_completed, failed
    completed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    -- Timing
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_batch_payments_org ON batch_payments(organization_id);
CREATE INDEX idx_batch_payments_status ON batch_payments(status);

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_payments_updated_at
    BEFORE UPDATE ON batch_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
