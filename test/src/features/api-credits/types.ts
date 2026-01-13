// =====================================================
// API Credits Types
// =====================================================

export type CreditTransactionType = 'deposit' | 'deduction' | 'refund' | 'adjustment' | 'bonus';

export interface CreditAccount {
  id: string;
  organization_id: string;
  customer_id?: string;
  external_customer_id: string;
  balance: number;
  currency: string;
  low_balance_threshold: number;
  low_balance_notified_at?: string;
  auto_topup_enabled: boolean;
  auto_topup_amount?: number;
  auto_topup_trigger?: number;
  auto_topup_wallet?: string;
  total_deposited: number;
  total_spent: number;
  total_requests: number;
  active: boolean;
  suspended_at?: string;
  suspended_reason?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    company_name?: string;
    contact_name?: string;
    email: string;
    wallet_address?: string;
  };
}

export interface CreditEndpoint {
  id: string;
  organization_id: string;
  path: string;
  method: string;
  price_per_call: number;
  currency: string;
  name?: string;
  description?: string;
  active: boolean;
  rate_limit_per_minute?: number;
  rate_limit_per_hour?: number;
  rate_limit_per_day?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  stats30d?: {
    calls: number;
    revenue: number;
  };
}

export interface CreditTransaction {
  id: string;
  account_id: string;
  organization_id: string;
  type: CreditTransactionType;
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  tx_hash?: string;
  payer_address?: string;
  chain?: string;
  endpoint_id?: string;
  request_id?: string;
  api_key_id?: string;
  description?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  account?: {
    id: string;
    external_customer_id: string;
  };
  endpoint?: {
    id: string;
    path: string;
    method: string;
  };
}

export interface UsageStats {
  period: string;
  summary: {
    totalRequests: number;
    totalRevenue: number;
    avgResponseTime: number;
    successRate: number;
    successCount: number;
    errorCount: number;
  };
  daily: Array<{
    date: string;
    requests: number;
    revenue: number;
  }>;
  byEndpoint: Array<{
    endpointId: string;
    path: string;
    method: string;
    requests: number;
    revenue: number;
  }>;
}

// =====================================================
// API Params
// =====================================================

export interface CreateAccountParams {
  externalCustomerId: string;
  customerId?: string;
  initialBalance?: number;
  currency?: string;
  lowBalanceThreshold?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateAccountParams {
  customerId?: string;
  lowBalanceThreshold?: number;
  autoTopupEnabled?: boolean;
  autoTopupAmount?: number;
  autoTopupTrigger?: number;
  autoTopupWallet?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEndpointParams {
  path: string;
  method?: string;
  pricePerCall: number;
  currency?: string;
  name?: string;
  description?: string;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  rateLimitPerDay?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateEndpointParams {
  pricePerCall?: number;
  name?: string;
  description?: string;
  active?: boolean;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  rateLimitPerDay?: number;
  metadata?: Record<string, unknown>;
}

export interface DepositParams {
  amount: number;
  type?: CreditTransactionType;
  txHash?: string;
  payerAddress?: string;
  chain?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
