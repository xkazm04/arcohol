export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  size?: string;
  contact_email?: string;
  settlement_address?: string;
  settlement_chain?: string;
  logo_url?: string;
  settings: OrganizationSettings;
  plan: 'starter' | 'growth' | 'enterprise';
  monthly_volume_limit?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  instant_settlement: boolean;
  auto_yield: boolean;
  yield_threshold: number;
  default_currency: string;
  fee_rate: number;
  notifications: {
    email_invoices: boolean;
    email_disputes: boolean;
    email_low_balance: boolean;
  };
}

export interface OrgProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  current_organization_id?: string;
  onboarding_completed: boolean;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  request_count: number;
  expires_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditAccount {
  id: string;
  organization_id: string;
  available_balance: number;
  yield_balance: number;
  lifetime_deposited: number;
  lifetime_spent: number;
  lifetime_yield: number;
  currency: string;
  status: 'active' | 'suspended' | 'low_balance' | 'depleted';
  settings: {
    auto_refill_enabled: boolean;
    auto_refill_threshold: number;
    auto_refill_amount: number;
    low_balance_alert: number;
    auto_yield_enabled: boolean;
    yield_threshold: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  customer_id: string;
  reference: string;
  amount: number;
  subtotal: number;
  fee_rate: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'canceled';
  paid_amount: number;
  line_items: unknown[];
  due_date: string;
  paid_at?: string;
  notes?: string;
  payment_address?: string;
  payment_chain?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  wallet_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  organization_id: string;
  transaction_id: string;
  invoice_id?: string;
  buyer_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  category: 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue' | 'unauthorized';
  description: string;
  desired_resolution: string;
  status: 'filed' | 'under_review' | 'awaiting_merchant_response' | 'merchant_responded' | 'escalated' | 'resolved';
  merchant_response_deadline?: string;
  resolution_deadline?: string;
  filed_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TreasuryAccount {
  id: string;
  organization_id: string;
  operating_balance: number;
  operating_pending: number;
  reserve_balance: number;
  reserve_pending: number;
  reserve_apy: number;
  vault_balance: number;
  vault_lock_period_days: number;
  vault_unlock_at?: string;
  total_balance: number;
  yield_earned_total: number;
  yield_earned_ytd: number;
  projected_annual_yield: number;
  strategy: {
    operating: { target: number; minimum: number; currency: string };
    reserve: { enabled: boolean; target_percentage: number };
    vault: { enabled: boolean; target_percentage: number; lock_period: number };
    auto_rebalance: boolean;
    rebalance_frequency: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AgentWallet {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  wallet_address: string;
  wallet_type: string;
  chain: string;
  balance: number;
  currency: string;
  status: 'active' | 'paused' | 'depleted';
  spent_24h: number;
  spent_7d: number;
  spent_30d: number;
  spent_total: number;
  transaction_count: number;
  last_activity_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookEndpoint {
  id: string;
  organization_id: string;
  url: string;
  description?: string;
  events: string[];
  secret: string;
  status: 'active' | 'failing' | 'disabled';
  success_rate: number;
  last_success_at?: string;
  last_failure_at?: string;
  consecutive_failures: number;
  config: {
    timeout_ms: number;
    retry_count: number;
    retry_delay_ms: number;
  };
  created_at: string;
  updated_at: string;
}
