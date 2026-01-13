-- =====================================================
-- ArcPay B2B Platform - Full Schema
-- 000_full_schema.sql - Combined Schema Setup Script
-- =====================================================
--
-- This file references all schema files in execution order.
--
-- To run the complete schema setup in Supabase:
-- 1. Go to SQL Editor in your Supabase dashboard
-- 2. Execute files in numerical order (001 through 009)
--
-- Or use psql:
-- psql $DATABASE_URL -f 001_schema.sql
-- psql $DATABASE_URL -f 002_credits.sql
-- ... etc
--
-- File Order:
-- 001_schema.sql     - Core schema (org_profiles, organizations, api_keys)
-- 002_credits.sql    - Credit system (accounts, deposits, usage metering)
-- 003_invoices.sql   - Invoicing (customers, invoices, payments, settlements)
-- 004_disputes.sql   - Dispute resolution (disputes, evidence, AI evaluation)
-- 005_treasury.sql   - Treasury management (multi-fund, rebalancing, alerts)
-- 006_webhooks.sql   - Webhook system (endpoints, events, deliveries)
-- 007_agents.sql     - AI agent wallets (budgets, transactions, anomaly detection)
-- 008_functions.sql  - Stored procedures and utility functions
-- 009_policies.sql   - Row Level Security policies
-- 010_transactions.sql - API transactions tracking
-- 011_transactions_policies.sql - Transaction RLS policies
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Execute in order by running each file separately
-- or concatenate all files for single execution
-- =====================================================

-- Note: In Supabase SQL Editor, you can run each file individually
-- The following is a placeholder showing the execution order

\echo 'Running 001_schema.sql - Core Schema'
\i 001_schema.sql

\echo 'Running 002_credits.sql - Credit System'
\i 002_credits.sql

\echo 'Running 003_invoices.sql - Invoice System'
\i 003_invoices.sql

\echo 'Running 004_disputes.sql - Dispute System'
\i 004_disputes.sql

\echo 'Running 005_treasury.sql - Treasury System'
\i 005_treasury.sql

\echo 'Running 006_webhooks.sql - Webhook System'
\i 006_webhooks.sql

\echo 'Running 007_agents.sql - Agent Wallets'
\i 007_agents.sql

\echo 'Running 008_functions.sql - Stored Procedures'
\i 008_functions.sql

\echo 'Running 009_policies.sql - RLS Policies'
\i 009_policies.sql

\echo 'Running 010_transactions.sql - API Transactions'
\i 010_transactions.sql

\echo 'Running 011_transactions_policies.sql - Transaction Policies'
\i 011_transactions_policies.sql

\echo 'Schema setup complete!'
