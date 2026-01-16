# Invoice Module - Development Roadmap

> **Status**: Active Development
> **Last Updated**: 2026-01-16
> **Phases Completed**: 1-4 (Core, Billing, PDF/Email, Buyer Portal)
> **Directions Completed**: 1 (Lifecycle Automation), 3 (Accounting & Tax)

This document outlines development directions to make the Invoice module production-ready for B2B SaaS operations. Sections are removed as features are implemented.

---

## Direction 2: Flexible Payment Options

### Problem Statement
B2B deals often require partial payments, payment plans, and credit application. Current system only supports full payment in single transaction.

### Solution Overview

#### 2.1 Partial Payments
Accept multiple payments against a single invoice, tracking remaining balance.

**Database Schema:**
```sql
-- Already have invoice_payments, extend it
ALTER TABLE invoice_payments
  ADD COLUMN payment_number INT DEFAULT 1,
  ADD COLUMN notes TEXT;

-- Add computed fields to invoices
ALTER TABLE invoices
  ADD COLUMN amount_paid DECIMAL(18,6) DEFAULT 0,
  ADD COLUMN amount_due DECIMAL(18,6) GENERATED ALWAYS AS (amount - amount_paid) STORED;
```

**Status Flow:**
- `sent` → partial payment → `partially_paid`
- `partially_paid` → full payment → `paid`
- Dashboard shows payment progress bar

#### 2.2 Payment Plans
Split invoice into installments with separate due dates.

**Database Schema:**
```sql
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,

  total_installments INT NOT NULL,
  installment_amount DECIMAL(18,6) NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'biweekly', 'monthly'
  start_date DATE NOT NULL,

  status TEXT DEFAULT 'active', -- 'active', 'completed', 'defaulted', 'canceled'

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES payment_plans(id) NOT NULL,
  installment_number INT NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  due_date DATE NOT NULL,

  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'waived'
  paid_at TIMESTAMPTZ,
  payment_id UUID REFERENCES invoice_payments(id),

  UNIQUE(plan_id, installment_number)
);
```

#### 2.3 Customer Credits
Apply credits/refunds against new invoices.

**Database Schema:**
```sql
CREATE TABLE customer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,

  amount DECIMAL(18,6) NOT NULL,
  remaining_amount DECIMAL(18,6) NOT NULL,
  currency TEXT DEFAULT 'USDC',

  reason TEXT NOT NULL, -- 'refund', 'adjustment', 'promotional', 'overpayment'
  source_invoice_id UUID REFERENCES invoices(id),
  notes TEXT,

  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'depleted', 'expired', 'voided'

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE credit_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id UUID REFERENCES customer_credits(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2.4 Implementation Files

```
src/
├── features/payments/
│   ├── types.ts
│   ├── services/
│   │   ├── partial-payment.ts
│   │   ├── payment-plan.ts
│   │   └── credit-service.ts
│   └── hooks/
│       ├── usePaymentPlan.ts
│       └── useCustomerCredits.ts
├── app/api/
│   ├── invoices/[id]/
│   │   ├── payments/route.ts
│   │   └── payment-plan/route.ts
│   └── customers/[id]/
│       └── credits/route.ts
└── components/dashboard/invoices/
    ├── PaymentTimeline.tsx
    ├── PaymentPlanModal.tsx
    └── ApplyCreditModal.tsx
```

---

## Direction 4: Enterprise Portal & Workflows

### Problem Statement
Enterprise buyers need self-service capabilities, approval workflows, and spending controls. Current portal is basic view-only.

### Solution Overview

#### 4.1 Multi-User Buyer Accounts
Multiple contacts per customer with role-based access.

**Database Schema:**
```sql
CREATE TABLE customer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,

  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL, -- 'admin', 'payer', 'viewer', 'approver'

  -- Permissions
  can_view_invoices BOOLEAN DEFAULT true,
  can_pay_invoices BOOLEAN DEFAULT false,
  can_dispute BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  spending_limit DECIMAL(18,6), -- Max single payment

  status TEXT DEFAULT 'active',
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(customer_id, email)
);
```

#### 4.2 Approval Workflows
Internal approval required before payment.

**Database Schema:**
```sql
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,

  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,

  -- Trigger conditions
  min_amount DECIMAL(18,6), -- Require approval above this
  max_amount DECIMAL(18,6), -- Auto-approve below this

  -- Approvers (ordered)
  approvers JSONB NOT NULL, -- [{ userId: ..., required: true }, ...]
  require_all BOOLEAN DEFAULT false, -- All must approve vs any one

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES approval_workflows(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id) NOT NULL,

  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'

  requested_by UUID REFERENCES customer_users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),

  approvals JSONB DEFAULT '[]', -- [{ userId, decision, at, notes }]

  expires_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);
```

#### 4.3 Portal Enhancements

**New Pages:**
- `/portal/[org]/statements` - Account statements with date range
- `/portal/[org]/disputes` - File and track disputes
- `/portal/[org]/team` - Manage team members (admin only)
- `/portal/[org]/settings` - Notification preferences, approval rules

#### 4.4 Implementation Files

```
src/
├── features/portal/
│   ├── services/
│   │   ├── customer-users.ts
│   │   └── approval-workflow.ts
│   └── hooks/
│       ├── usePortalTeam.ts
│       └── useApprovals.ts
├── app/
│   ├── portal/[orgSlug]/
│   │   ├── statements/page.tsx
│   │   ├── disputes/page.tsx
│   │   ├── team/page.tsx
│   │   └── settings/page.tsx
│   └── api/portal/
│       ├── [orgSlug]/team/route.ts
│       ├── [orgSlug]/statements/route.ts
│       └── approvals/route.ts
└── components/portal/
    ├── StatementView.tsx
    ├── DisputeForm.tsx
    ├── TeamManagement.tsx
    └── ApprovalQueue.tsx
```

---

## Direction 5: Analytics & Cash Flow Intelligence

### Problem Statement
Finance teams lack visibility into payment patterns and cash flow forecasting. No way to predict incoming payments or measure dunning effectiveness.

### Solution Overview

#### 5.1 Payment Behavior Analytics

**Metrics to Track:**
- Days Sales Outstanding (DSO) - Average days to collect
- Payment timing distribution - Early, on-time, late percentages
- Customer payment score - Reliability rating per customer
- Dunning effectiveness - Which reminder strategies work

**Database Schema:**
```sql
CREATE TABLE customer_payment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,

  -- Lifetime metrics
  total_invoices INT DEFAULT 0,
  total_amount DECIMAL(18,6) DEFAULT 0,
  total_paid DECIMAL(18,6) DEFAULT 0,

  -- Timing metrics
  avg_days_to_pay DECIMAL(8,2),
  median_days_to_pay DECIMAL(8,2),
  on_time_rate DECIMAL(5,2), -- Percentage paid by due date

  -- Calculated score (0-100)
  payment_score INT,

  last_calculated_at TIMESTAMPTZ,

  UNIQUE(organization_id, customer_id)
);

CREATE TABLE invoice_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  date DATE NOT NULL,

  -- Invoice counts
  invoices_created INT DEFAULT 0,
  invoices_sent INT DEFAULT 0,
  invoices_paid INT DEFAULT 0,
  invoices_overdue INT DEFAULT 0,

  -- Amounts
  amount_invoiced DECIMAL(18,6) DEFAULT 0,
  amount_collected DECIMAL(18,6) DEFAULT 0,
  amount_outstanding DECIMAL(18,6) DEFAULT 0,

  -- AR Aging buckets
  ar_current DECIMAL(18,6) DEFAULT 0,
  ar_30_days DECIMAL(18,6) DEFAULT 0,
  ar_60_days DECIMAL(18,6) DEFAULT 0,
  ar_90_plus DECIMAL(18,6) DEFAULT 0,

  UNIQUE(organization_id, date)
);
```

#### 5.2 Cash Flow Forecasting

**Database Schema:**
```sql
CREATE TABLE payment_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,

  predicted_payment_date DATE,
  confidence DECIMAL(5,2), -- 0-100%

  -- Factors used
  customer_avg_days INT,
  invoice_amount_factor DECIMAL(5,2),
  seasonal_factor DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cash_flow_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,

  forecast_date DATE NOT NULL,

  -- Predicted amounts
  expected_collections DECIMAL(18,6),
  confidence_low DECIMAL(18,6),
  confidence_high DECIMAL(18,6),

  -- Actual (filled in later)
  actual_collections DECIMAL(18,6),

  UNIQUE(organization_id, forecast_date)
);
```

#### 5.3 Dashboard Components

**Analytics Page Sections:**
- AR Aging Chart (stacked bar: current, 30, 60, 90+)
- DSO Trend Line (monthly DSO over time)
- Collection Forecast (next 30/60/90 days)
- Customer Leaderboard (best/worst payers)
- Dunning Funnel (reminders sent → paid conversion)

#### 5.4 Implementation Files

```
src/
├── features/analytics/
│   ├── types.ts
│   ├── services/
│   │   ├── payment-metrics.ts
│   │   ├── cash-flow-forecast.ts
│   │   └── analytics-aggregator.ts
│   └── hooks/
│       ├── useARMetrics.ts
│       └── useCashFlowForecast.ts
├── app/
│   ├── dashboard/
│   │   └── analytics/page.tsx
│   └── api/
│       └── analytics/
│           ├── ar-aging/route.ts
│           ├── dso/route.ts
│           └── forecast/route.ts
└── components/dashboard/analytics/
    ├── ARAgingChart.tsx
    ├── DSOTrendChart.tsx
    ├── ForecastChart.tsx
    └── CustomerScorecard.tsx
```

---

## Implementation Priority

| Direction | Impact | Effort | Status |
|-----------|--------|--------|--------|
| 1. Lifecycle Automation | High | Medium | ✅ Completed |
| 2. Flexible Payments | High | Medium | 📋 Planned |
| 3. Accounting & Tax | High | High | ✅ Completed |
| 4. Enterprise Portal | Medium | High | 📋 Planned |
| 5. Analytics | Medium | Medium | 📋 Planned |

---

## Notes

- Remove sections from this document as features are implemented
- All database migrations should be reversible
- Maintain backwards compatibility with existing API contracts
- Add feature flags for gradual rollout
