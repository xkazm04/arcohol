# ArcPay B2B Platform - Database Schema

This directory contains the Supabase/PostgreSQL schema for the ArcPay B2B management platform.

## Files

| File | Description |
|------|-------------|
| `001_schema.sql` | Core schema - org_profiles, organizations, API keys |
| `002_credits.sql` | Credit system - accounts, deposits, usage metering, yield |
| `003_invoices.sql` | Invoicing - customers, invoices, payments, settlements |
| `004_disputes.sql` | Dispute resolution - disputes, evidence, AI evaluation |
| `005_treasury.sql` | Treasury management - multi-fund, rebalancing, cross-chain |
| `006_webhooks.sql` | Webhook system - endpoints, events, deliveries |
| `007_agents.sql` | AI agent wallets - budgets, transactions, anomaly detection |
| `008_functions.sql` | Stored procedures and utility functions |
| `009_policies.sql` | Row Level Security (RLS) policies |
| `000_full_schema.sql` | Reference file showing execution order |

## Setup Instructions

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Execute files in numerical order (001 → 009)
4. Wait for each file to complete before running the next

### Option 2: Using psql

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run each file in order
psql $DATABASE_URL -f 001_schema.sql
psql $DATABASE_URL -f 002_credits.sql
psql $DATABASE_URL -f 003_invoices.sql
psql $DATABASE_URL -f 004_disputes.sql
psql $DATABASE_URL -f 005_treasury.sql
psql $DATABASE_URL -f 006_webhooks.sql
psql $DATABASE_URL -f 007_agents.sql
psql $DATABASE_URL -f 008_functions.sql
psql $DATABASE_URL -f 009_policies.sql
```

### Option 3: Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Schema Overview

### Core Entities

- **org_profiles** - User profiles (auto-created on signup)
- **organizations** - B2B customer organizations (each has single owner)

### Credit System

- **credit_accounts** - Organization credit balances with yield
- **usage_meters** - Configurable usage meters (API calls, data, etc.)
- **usage_records** - Individual usage events
- **yield_transactions** - Track yield earnings from USDY

### Invoicing

- **customers** - Customer records per organization
- **invoices** - Crypto invoices with line items
- **invoice_payments** - Payment records (supports partial payments)
- **settlements** - Treasury settlement records
- **batch_payments** - Bulk payment batches

### Disputes

- **disputes** - Dispute claims with categorization
- **dispute_evidence** - Evidence submissions from both parties
- **ai_evaluations** - AI-powered dispute analysis
- **dispute_resolutions** - Final resolution records

### Treasury

- **treasury_accounts** - Multi-fund treasury (operating, reserve, vault)
- **chain_allocations** - Cross-chain balance distribution
- **bridge_transactions** - Circle CCTP bridge records

### Webhooks

- **webhook_endpoints** - Configured webhook URLs
- **webhook_events** - Event log
- **webhook_deliveries** - Delivery attempts with retry

### AI Agents

- **agent_wallets** - AI agent-controlled wallets
- **agent_budgets** - Spending limits (daily, weekly, per-tx)
- **agent_vendor_budgets** - Per-vendor spending limits
- **agent_anomaly_rules** - Anomaly detection configuration

## Key Features

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Only organization owners can access their data
- Proper isolation between organizations

### Stored Functions

| Function | Description |
|----------|-------------|
| `handle_new_user()` | Auto-create profile on signup |
| `create_credit_account()` | Initialize credit account with default meters |
| `credit_deposit()` | Deposit credits to account |
| `record_usage()` | Record usage and deduct credits |
| `transfer_to_yield()` | Move credits to yield-bearing USDY |
| `create_invoice()` | Create invoice with fee calculation |
| `generate_api_key()` | Generate secure API key |
| `verify_api_key()` | Verify and log API key usage |
| `create_webhook_event()` | Create event and queue deliveries |

### Triggers

- `update_updated_at_column()` - Auto-update `updated_at` timestamps
- `on_auth_user_created` - Auto-create profile on user signup

## Environment Variables

Required Supabase environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Data Types

### Custom ENUMs

- `organization_plan`: starter, growth, enterprise
- `invoice_status`: draft, sent, viewed, partially_paid, paid, overdue, canceled
- `dispute_status`: filed, under_review, merchant_response, ai_evaluation, human_review, resolved, escalated
- `dispute_category`: not_received, not_as_described, unauthorized, duplicate, other
- `dispute_resolution`: approved, denied, partial_refund
- `account_status`: active, low_balance, depleted, suspended
- `webhook_status`: active, paused, disabled
- `delivery_status`: pending, success, failed, retrying
- `treasury_fund_type`: operating, reserve, vault

## Notes

- All monetary amounts use `DECIMAL(20, 6)` for precision
- UUIDs are used for all primary keys
- Timestamps use `TIMESTAMPTZ` for timezone awareness
- JSONB fields store flexible configuration data
- Yield APY default is 5.2% (USDY rate)
