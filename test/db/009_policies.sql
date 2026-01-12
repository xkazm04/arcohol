-- =====================================================
-- ArcPay B2B Platform - Row Level Security Policies
-- 009_policies.sql - RLS Policies (Simplified - Owner Only)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE org_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE yield_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_protection_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_rebalances ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_vendor_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_anomaly_rules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Org Profile Policies
-- =====================================================

CREATE POLICY "Users can view own profile"
    ON org_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON org_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON org_profiles FOR UPDATE
    USING (auth.uid() = id);

-- =====================================================
-- Organization Policies
-- =====================================================

CREATE POLICY "Owners can view organization"
    ON organizations FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Owners can update organization"
    ON organizations FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete organization"
    ON organizations FOR DELETE
    USING (owner_id = auth.uid());

-- =====================================================
-- API Keys Policies
-- =====================================================

CREATE POLICY "Owners can view API keys"
    ON api_keys FOR SELECT
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can create API keys"
    ON api_keys FOR INSERT
    WITH CHECK (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can update API keys"
    ON api_keys FOR UPDATE
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can delete API keys"
    ON api_keys FOR DELETE
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Audit Log Policies
-- =====================================================

CREATE POLICY "Owners can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Credit Account Policies
-- =====================================================

CREATE POLICY "Owners can view credit accounts"
    ON credit_accounts FOR SELECT
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can manage credit accounts"
    ON credit_accounts FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Credit Deposits Policies
-- =====================================================

CREATE POLICY "Owners can view deposits"
    ON credit_deposits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_accounts ca
            WHERE ca.id = credit_deposits.account_id
              AND is_org_owner(auth.uid(), ca.organization_id)
        )
    );

CREATE POLICY "Owners can create deposits"
    ON credit_deposits FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM credit_accounts ca
            WHERE ca.id = credit_deposits.account_id
              AND is_org_owner(auth.uid(), ca.organization_id)
        )
    );

-- =====================================================
-- Usage Meters Policies
-- =====================================================

CREATE POLICY "Owners can manage meters"
    ON usage_meters FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Usage Records Policies
-- =====================================================

CREATE POLICY "Owners can view usage records"
    ON usage_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_accounts ca
            WHERE ca.id = usage_records.account_id
              AND is_org_owner(auth.uid(), ca.organization_id)
        )
    );

-- =====================================================
-- Usage Summaries Policies
-- =====================================================

CREATE POLICY "Owners can view usage summaries"
    ON usage_summaries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_accounts ca
            WHERE ca.id = usage_summaries.account_id
              AND is_org_owner(auth.uid(), ca.organization_id)
        )
    );

-- =====================================================
-- Yield Transactions Policies
-- =====================================================

CREATE POLICY "Owners can view yield transactions"
    ON yield_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM credit_accounts ca
            WHERE ca.id = yield_transactions.account_id
              AND is_org_owner(auth.uid(), ca.organization_id)
        )
    );

-- =====================================================
-- Customer Policies
-- =====================================================

CREATE POLICY "Owners can manage customers"
    ON customers FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Invoice Policies
-- =====================================================

CREATE POLICY "Owners can manage invoices"
    ON invoices FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Invoice Payments Policies
-- =====================================================

CREATE POLICY "Owners can view invoice payments"
    ON invoice_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_payments.invoice_id
              AND is_org_owner(auth.uid(), i.organization_id)
        )
    );

-- =====================================================
-- Settlement Policies
-- =====================================================

CREATE POLICY "Owners can manage settlements"
    ON settlements FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Batch Payment Policies
-- =====================================================

CREATE POLICY "Owners can manage batch payments"
    ON batch_payments FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Dispute Policies
-- =====================================================

CREATE POLICY "Owners can manage disputes"
    ON disputes FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Dispute Evidence Policies
-- =====================================================

CREATE POLICY "Owners can manage dispute evidence"
    ON dispute_evidence FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM disputes d
            WHERE d.id = dispute_evidence.dispute_id
              AND is_org_owner(auth.uid(), d.organization_id)
        )
    );

-- =====================================================
-- Merchant Response Policies
-- =====================================================

CREATE POLICY "Owners can manage merchant responses"
    ON merchant_responses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM disputes d
            WHERE d.id = merchant_responses.dispute_id
              AND is_org_owner(auth.uid(), d.organization_id)
        )
    );

-- =====================================================
-- AI Evaluation Policies
-- =====================================================

CREATE POLICY "Owners can view AI evaluations"
    ON ai_evaluations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM disputes d
            WHERE d.id = ai_evaluations.dispute_id
              AND is_org_owner(auth.uid(), d.organization_id)
        )
    );

-- =====================================================
-- Dispute Resolution Policies
-- =====================================================

CREATE POLICY "Owners can view resolutions"
    ON dispute_resolutions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM disputes d
            WHERE d.id = dispute_resolutions.dispute_id
              AND is_org_owner(auth.uid(), d.organization_id)
        )
    );

-- =====================================================
-- Delivery Proofs Policies
-- =====================================================

CREATE POLICY "Owners can manage delivery proofs"
    ON delivery_proofs FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Dispute Protection Settings Policies
-- =====================================================

CREATE POLICY "Owners can manage protection settings"
    ON dispute_protection_settings FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Treasury Policies
-- =====================================================

CREATE POLICY "Owners can manage treasury"
    ON treasury_accounts FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can view treasury transactions"
    ON treasury_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM treasury_accounts ta
            WHERE ta.id = treasury_transactions.treasury_id
              AND is_org_owner(auth.uid(), ta.organization_id)
        )
    );

CREATE POLICY "Owners can view rebalances"
    ON treasury_rebalances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM treasury_accounts ta
            WHERE ta.id = treasury_rebalances.treasury_id
              AND is_org_owner(auth.uid(), ta.organization_id)
        )
    );

CREATE POLICY "Owners can manage treasury alerts"
    ON treasury_alerts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM treasury_accounts ta
            WHERE ta.id = treasury_alerts.treasury_id
              AND is_org_owner(auth.uid(), ta.organization_id)
        )
    );

-- =====================================================
-- Chain Allocation Policies
-- =====================================================

CREATE POLICY "Owners can manage chain allocations"
    ON chain_allocations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM treasury_accounts ta
            WHERE ta.id = chain_allocations.treasury_id
              AND is_org_owner(auth.uid(), ta.organization_id)
        )
    );

-- =====================================================
-- Bridge Transaction Policies
-- =====================================================

CREATE POLICY "Owners can view bridge transactions"
    ON bridge_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM treasury_accounts ta
            WHERE ta.id = bridge_transactions.treasury_id
              AND is_org_owner(auth.uid(), ta.organization_id)
        )
    );

-- =====================================================
-- Webhook Policies
-- =====================================================

CREATE POLICY "Owners can manage webhooks"
    ON webhook_endpoints FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can view webhook events"
    ON webhook_events FOR SELECT
    USING (is_org_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can view webhook deliveries"
    ON webhook_deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM webhook_endpoints we
            WHERE we.id = webhook_deliveries.endpoint_id
              AND is_org_owner(auth.uid(), we.organization_id)
        )
    );

-- =====================================================
-- Agent Wallet Policies
-- =====================================================

CREATE POLICY "Owners can manage agent wallets"
    ON agent_wallets FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Agent Budget Policies
-- =====================================================

CREATE POLICY "Owners can manage agent budgets"
    ON agent_budgets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agent_wallets aw
            WHERE aw.id = agent_budgets.agent_id
              AND is_org_owner(auth.uid(), aw.organization_id)
        )
    );

-- =====================================================
-- Agent Vendor Budget Policies
-- =====================================================

CREATE POLICY "Owners can manage vendor budgets"
    ON agent_vendor_budgets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agent_wallets aw
            WHERE aw.id = agent_vendor_budgets.agent_id
              AND is_org_owner(auth.uid(), aw.organization_id)
        )
    );

-- =====================================================
-- Agent Transaction Policies
-- =====================================================

CREATE POLICY "Owners can view agent transactions"
    ON agent_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agent_wallets aw
            WHERE aw.id = agent_transactions.agent_id
              AND is_org_owner(auth.uid(), aw.organization_id)
        )
    );

-- =====================================================
-- Agent Approval Queue Policies
-- =====================================================

CREATE POLICY "Owners can manage approval queue"
    ON agent_approval_queue FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agent_wallets aw
            WHERE aw.id = agent_approval_queue.agent_id
              AND is_org_owner(auth.uid(), aw.organization_id)
        )
    );

-- =====================================================
-- Agent Anomaly Rules Policies
-- =====================================================

CREATE POLICY "Owners can manage anomaly rules"
    ON agent_anomaly_rules FOR ALL
    USING (is_org_owner(auth.uid(), organization_id));

-- =====================================================
-- Public Access for Reference Tables
-- =====================================================

ALTER TABLE webhook_event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event types"
    ON webhook_event_types FOR SELECT
    USING (true);
