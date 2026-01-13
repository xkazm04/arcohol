// =====================================================
// API Credits Client
// Supabase-based implementation of CreditsDatabaseAdapter
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreditsDatabaseAdapter,
  CreditAccount,
  CreditEndpoint,
  CreditTransaction,
  UsageLog,
  ApiKeyWithCredits,
  CreateAccountParams,
  UpdateAccountParams,
  CreateEndpointParams,
  UpdateEndpointParams,
  DeductCreditsParams,
  DeductCreditsResult,
  AddCreditsParams,
  AddCreditsResult,
  RefundCreditsParams,
  ListTransactionsParams,
  LogUsageParams,
  UsageStatsParams,
  UsageStats,
  CreditTransactionType,
} from '../types';

// =====================================================
// Database Row Types (snake_case)
// =====================================================

interface AccountRow {
  id: string;
  organization_id: string;
  customer_id: string | null;
  external_customer_id: string;
  balance: number;
  currency: string;
  low_balance_threshold: number;
  low_balance_notified_at: string | null;
  auto_topup_enabled: boolean;
  auto_topup_amount: number | null;
  auto_topup_trigger: number | null;
  auto_topup_wallet: string | null;
  total_deposited: number;
  total_spent: number;
  total_requests: number;
  active: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface EndpointRow {
  id: string;
  organization_id: string;
  path: string;
  method: string;
  price_per_call: number;
  currency: string;
  name: string | null;
  description: string | null;
  active: boolean;
  rate_limit_per_minute: number | null;
  rate_limit_per_hour: number | null;
  rate_limit_per_day: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  account_id: string;
  organization_id: string;
  type: CreditTransactionType;
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  tx_hash: string | null;
  payer_address: string | null;
  chain: string | null;
  endpoint_id: string | null;
  request_id: string | null;
  api_key_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UsageLogRow {
  id: string;
  organization_id: string;
  account_id: string;
  endpoint_id: string | null;
  transaction_id: string | null;
  api_key_id: string | null;
  external_customer_id: string;
  path: string;
  method: string;
  request_id: string | null;
  price_charged: number;
  currency: string;
  response_status: number | null;
  response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface ApiKeyRow {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: string[];
  credit_account_id: string | null;
  external_customer_id: string | null;
  revoked_at: string | null;
}

// =====================================================
// Type Converters
// =====================================================

function toAccount(row: AccountRow): CreditAccount {
  return {
    id: row.id,
    organizationId: row.organization_id,
    customerId: row.customer_id ?? undefined,
    externalCustomerId: row.external_customer_id,
    balance: Number(row.balance),
    currency: row.currency,
    lowBalanceThreshold: Number(row.low_balance_threshold),
    lowBalanceNotifiedAt: row.low_balance_notified_at ?? undefined,
    autoTopupEnabled: row.auto_topup_enabled,
    autoTopupAmount: row.auto_topup_amount ? Number(row.auto_topup_amount) : undefined,
    autoTopupTrigger: row.auto_topup_trigger ? Number(row.auto_topup_trigger) : undefined,
    autoTopupWallet: row.auto_topup_wallet ?? undefined,
    totalDeposited: Number(row.total_deposited),
    totalSpent: Number(row.total_spent),
    totalRequests: Number(row.total_requests),
    active: row.active,
    suspendedAt: row.suspended_at ?? undefined,
    suspendedReason: row.suspended_reason ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toEndpoint(row: EndpointRow): CreditEndpoint {
  return {
    id: row.id,
    organizationId: row.organization_id,
    path: row.path,
    method: row.method,
    pricePerCall: Number(row.price_per_call),
    currency: row.currency,
    name: row.name ?? undefined,
    description: row.description ?? undefined,
    active: row.active,
    rateLimitPerMinute: row.rate_limit_per_minute ?? undefined,
    rateLimitPerHour: row.rate_limit_per_hour ?? undefined,
    rateLimitPerDay: row.rate_limit_per_day ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTransaction(row: TransactionRow): CreditTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    organizationId: row.organization_id,
    type: row.type,
    amount: Number(row.amount),
    currency: row.currency,
    balanceBefore: Number(row.balance_before),
    balanceAfter: Number(row.balance_after),
    txHash: row.tx_hash ?? undefined,
    payerAddress: row.payer_address ?? undefined,
    chain: row.chain ?? undefined,
    endpointId: row.endpoint_id ?? undefined,
    requestId: row.request_id ?? undefined,
    apiKeyId: row.api_key_id ?? undefined,
    description: row.description ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

function toUsageLog(row: UsageLogRow): UsageLog {
  return {
    id: row.id,
    organizationId: row.organization_id,
    accountId: row.account_id,
    endpointId: row.endpoint_id ?? undefined,
    transactionId: row.transaction_id ?? undefined,
    apiKeyId: row.api_key_id ?? undefined,
    externalCustomerId: row.external_customer_id,
    path: row.path,
    method: row.method,
    requestId: row.request_id ?? undefined,
    priceCharged: Number(row.price_charged),
    currency: row.currency,
    responseStatus: row.response_status ?? undefined,
    responseTimeMs: row.response_time_ms ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

// =====================================================
// Supabase Credits Client
// =====================================================

export interface SupabaseCreditsClientConfig {
  supabase: SupabaseClient;
}

export class SupabaseCreditsClient implements CreditsDatabaseAdapter {
  private supabase: SupabaseClient;

  constructor(config: SupabaseCreditsClientConfig) {
    this.supabase = config.supabase;
  }

  // =====================================================
  // Account Operations
  // =====================================================

  async getAccount(organizationId: string, externalCustomerId: string): Promise<CreditAccount | null> {
    const { data, error } = await this.supabase
      .from('api_credit_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('external_customer_id', externalCustomerId)
      .maybeSingle();

    if (error) throw new Error(`Failed to get account: ${error.message}`);
    return data ? toAccount(data as AccountRow) : null;
  }

  async getAccountById(accountId: string): Promise<CreditAccount | null> {
    const { data, error } = await this.supabase
      .from('api_credit_accounts')
      .select('*')
      .eq('id', accountId)
      .maybeSingle();

    if (error) throw new Error(`Failed to get account: ${error.message}`);
    return data ? toAccount(data as AccountRow) : null;
  }

  async createAccount(params: CreateAccountParams): Promise<CreditAccount> {
    const { data, error } = await this.supabase
      .from('api_credit_accounts')
      .insert({
        organization_id: params.organizationId,
        external_customer_id: params.externalCustomerId,
        customer_id: params.customerId,
        balance: params.initialBalance ?? 0,
        currency: params.currency ?? 'USDC',
        low_balance_threshold: params.lowBalanceThreshold ?? 10,
        metadata: params.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return toAccount(data as AccountRow);
  }

  async getOrCreateAccount(
    organizationId: string,
    externalCustomerId: string,
    customerId?: string
  ): Promise<CreditAccount> {
    // Try to get existing account first
    const existing = await this.getAccount(organizationId, externalCustomerId);
    if (existing) {
      // Update customer_id link if provided and not set
      if (customerId && !existing.customerId) {
        return this.updateAccount(existing.id, { customerId });
      }
      return existing;
    }

    // Create new account
    return this.createAccount({
      organizationId,
      externalCustomerId,
      customerId,
    });
  }

  async updateAccount(accountId: string, params: UpdateAccountParams): Promise<CreditAccount> {
    const updates: Record<string, unknown> = {};

    if (params.customerId !== undefined) updates.customer_id = params.customerId;
    if (params.lowBalanceThreshold !== undefined) updates.low_balance_threshold = params.lowBalanceThreshold;
    if (params.autoTopupEnabled !== undefined) updates.auto_topup_enabled = params.autoTopupEnabled;
    if (params.autoTopupAmount !== undefined) updates.auto_topup_amount = params.autoTopupAmount;
    if (params.autoTopupTrigger !== undefined) updates.auto_topup_trigger = params.autoTopupTrigger;
    if (params.autoTopupWallet !== undefined) updates.auto_topup_wallet = params.autoTopupWallet;
    if (params.metadata !== undefined) updates.metadata = params.metadata;

    const { data, error } = await this.supabase
      .from('api_credit_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update account: ${error.message}`);
    return toAccount(data as AccountRow);
  }

  async suspendAccount(accountId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_credit_accounts')
      .update({
        active: false,
        suspended_at: new Date().toISOString(),
        suspended_reason: reason,
      })
      .eq('id', accountId);

    if (error) throw new Error(`Failed to suspend account: ${error.message}`);
  }

  async reactivateAccount(accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_credit_accounts')
      .update({
        active: true,
        suspended_at: null,
        suspended_reason: null,
      })
      .eq('id', accountId);

    if (error) throw new Error(`Failed to reactivate account: ${error.message}`);
  }

  // =====================================================
  // Endpoint Operations
  // =====================================================

  async getEndpoint(organizationId: string, path: string, method: string): Promise<CreditEndpoint | null> {
    // First try exact match
    let { data, error } = await this.supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('path', path)
      .eq('method', method.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (error) throw new Error(`Failed to get endpoint: ${error.message}`);
    if (data) return toEndpoint(data as EndpointRow);

    // Try wildcard method match
    ({ data, error } = await this.supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('path', path)
      .eq('method', '*')
      .eq('active', true)
      .maybeSingle());

    if (error) throw new Error(`Failed to get endpoint: ${error.message}`);
    if (data) return toEndpoint(data as EndpointRow);

    // Try prefix matching for path patterns
    const { data: prefixMatches, error: prefixError } = await this.supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('active', true)
      .or(`method.eq.${method.toUpperCase()},method.eq.*`)
      .order('path', { ascending: false });

    if (prefixError) throw new Error(`Failed to get endpoint: ${prefixError.message}`);

    // Find matching pattern (supports /api/v1/* style patterns)
    for (const row of prefixMatches || []) {
      const pattern = (row as EndpointRow).path;
      if (this.matchPath(path, pattern)) {
        return toEndpoint(row as EndpointRow);
      }
    }

    return null;
  }

  private matchPath(actualPath: string, pattern: string): boolean {
    // Exact match
    if (actualPath === pattern) return true;

    // Wildcard match (e.g., /api/v1/*)
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return actualPath.startsWith(prefix);
    }

    // Parameter match (e.g., /api/v1/:id)
    const patternParts = pattern.split('/');
    const pathParts = actualPath.split('/');

    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true; // Parameter matches anything
      return part === pathParts[i];
    });
  }

  async getEndpointById(endpointId: string): Promise<CreditEndpoint | null> {
    const { data, error } = await this.supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('id', endpointId)
      .maybeSingle();

    if (error) throw new Error(`Failed to get endpoint: ${error.message}`);
    return data ? toEndpoint(data as EndpointRow) : null;
  }

  async listEndpoints(organizationId: string, active?: boolean): Promise<CreditEndpoint[]> {
    let query = this.supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .order('path');

    if (active !== undefined) {
      query = query.eq('active', active);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list endpoints: ${error.message}`);
    return (data || []).map((row) => toEndpoint(row as EndpointRow));
  }

  async createEndpoint(params: CreateEndpointParams): Promise<CreditEndpoint> {
    const { data, error } = await this.supabase
      .from('api_credit_endpoints')
      .insert({
        organization_id: params.organizationId,
        path: params.path,
        method: (params.method ?? 'POST').toUpperCase(),
        price_per_call: params.pricePerCall,
        currency: params.currency ?? 'USDC',
        name: params.name,
        description: params.description,
        rate_limit_per_minute: params.rateLimitPerMinute,
        rate_limit_per_hour: params.rateLimitPerHour,
        rate_limit_per_day: params.rateLimitPerDay,
        metadata: params.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create endpoint: ${error.message}`);
    return toEndpoint(data as EndpointRow);
  }

  async updateEndpoint(endpointId: string, params: UpdateEndpointParams): Promise<CreditEndpoint> {
    const updates: Record<string, unknown> = {};

    if (params.pricePerCall !== undefined) updates.price_per_call = params.pricePerCall;
    if (params.name !== undefined) updates.name = params.name;
    if (params.description !== undefined) updates.description = params.description;
    if (params.active !== undefined) updates.active = params.active;
    if (params.rateLimitPerMinute !== undefined) updates.rate_limit_per_minute = params.rateLimitPerMinute;
    if (params.rateLimitPerHour !== undefined) updates.rate_limit_per_hour = params.rateLimitPerHour;
    if (params.rateLimitPerDay !== undefined) updates.rate_limit_per_day = params.rateLimitPerDay;
    if (params.metadata !== undefined) updates.metadata = params.metadata;

    const { data, error } = await this.supabase
      .from('api_credit_endpoints')
      .update(updates)
      .eq('id', endpointId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update endpoint: ${error.message}`);
    return toEndpoint(data as EndpointRow);
  }

  async deleteEndpoint(endpointId: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_credit_endpoints')
      .delete()
      .eq('id', endpointId);

    if (error) throw new Error(`Failed to delete endpoint: ${error.message}`);
  }

  // =====================================================
  // Transaction Operations
  // =====================================================

  async deductCredits(params: DeductCreditsParams): Promise<DeductCreditsResult> {
    const { data, error } = await this.supabase.rpc('deduct_api_credits', {
      p_account_id: params.accountId,
      p_amount: params.amount,
      p_endpoint_id: params.endpointId ?? null,
      p_request_id: params.requestId ?? null,
      p_api_key_id: params.apiKeyId ?? null,
      p_description: params.description ?? null,
      p_metadata: params.metadata ?? {},
    });

    if (error) throw new Error(`Failed to deduct credits: ${error.message}`);

    const result = data?.[0] || data;
    return {
      success: result?.success ?? false,
      transactionId: result?.transaction_id ?? undefined,
      balanceBefore: Number(result?.balance_before ?? 0),
      balanceAfter: Number(result?.balance_after ?? 0),
      errorMessage: result?.error_message ?? undefined,
    };
  }

  async addCredits(params: AddCreditsParams): Promise<AddCreditsResult> {
    const { data, error } = await this.supabase.rpc('add_api_credits', {
      p_account_id: params.accountId,
      p_amount: params.amount,
      p_type: params.type ?? 'deposit',
      p_tx_hash: params.txHash ?? null,
      p_payer_address: params.payerAddress ?? null,
      p_chain: params.chain ?? null,
      p_description: params.description ?? null,
      p_metadata: params.metadata ?? {},
    });

    if (error) throw new Error(`Failed to add credits: ${error.message}`);

    const result = data?.[0] || data;
    return {
      success: result?.success ?? false,
      transactionId: result?.transaction_id ?? undefined,
      balanceBefore: Number(result?.balance_before ?? 0),
      balanceAfter: Number(result?.balance_after ?? 0),
      errorMessage: result?.error_message ?? undefined,
    };
  }

  async refundCredits(params: RefundCreditsParams): Promise<AddCreditsResult> {
    return this.addCredits({
      accountId: params.accountId,
      amount: params.amount,
      type: 'refund',
      description: params.reason ?? `Refund${params.originalTransactionId ? ` for ${params.originalTransactionId}` : ''}`,
      metadata: {
        ...params.metadata,
        originalTransactionId: params.originalTransactionId,
      },
    });
  }

  async listTransactions(accountId: string, params?: ListTransactionsParams): Promise<CreditTransaction[]> {
    let query = this.supabase
      .from('api_credit_transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (params?.type) {
      query = query.eq('type', params.type);
    }
    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list transactions: ${error.message}`);
    return (data || []).map((row) => toTransaction(row as TransactionRow));
  }

  // =====================================================
  // Usage Logging
  // =====================================================

  async logUsage(params: LogUsageParams): Promise<UsageLog> {
    const { data, error } = await this.supabase
      .from('api_usage_logs')
      .insert({
        organization_id: params.organizationId,
        account_id: params.accountId,
        endpoint_id: params.endpointId,
        transaction_id: params.transactionId,
        api_key_id: params.apiKeyId,
        external_customer_id: params.externalCustomerId,
        path: params.path,
        method: params.method,
        request_id: params.requestId,
        price_charged: params.priceCharged,
        currency: params.currency ?? 'USDC',
        response_status: params.responseStatus,
        response_time_ms: params.responseTimeMs,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        metadata: params.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to log usage: ${error.message}`);
    return toUsageLog(data as UsageLogRow);
  }

  async getUsageStats(organizationId: string, params?: UsageStatsParams): Promise<UsageStats> {
    let query = this.supabase
      .from('api_usage_logs')
      .select('price_charged, response_status, response_time_ms, endpoint_id, created_at')
      .eq('organization_id', organizationId);

    if (params?.accountId) {
      query = query.eq('account_id', params.accountId);
    }
    if (params?.endpointId) {
      query = query.eq('endpoint_id', params.endpointId);
    }
    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get usage stats: ${error.message}`);

    const logs = data || [];
    const totalRequests = logs.length;
    const totalCharged = logs.reduce((sum, log) => sum + Number(log.price_charged), 0);
    const responseTimes = logs.filter((l) => l.response_time_ms).map((l) => l.response_time_ms!);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : undefined;
    const successCount = logs.filter((l) => l.response_status && l.response_status >= 200 && l.response_status < 300).length;
    const errorCount = logs.filter((l) => l.response_status && l.response_status >= 400).length;

    // Group by endpoint
    const byEndpoint: Record<string, { requests: number; charged: number }> = {};
    for (const log of logs) {
      const key = log.endpoint_id || 'unknown';
      if (!byEndpoint[key]) {
        byEndpoint[key] = { requests: 0, charged: 0 };
      }
      byEndpoint[key].requests++;
      byEndpoint[key].charged += Number(log.price_charged);
    }

    return {
      totalRequests,
      totalCharged,
      averageResponseTime,
      successCount,
      errorCount,
      byEndpoint,
    };
  }

  // =====================================================
  // API Key Operations
  // =====================================================

  async getApiKeyWithCredits(keyHash: string): Promise<ApiKeyWithCredits | null> {
    const { data: keyData, error: keyError } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .maybeSingle();

    if (keyError) throw new Error(`Failed to get API key: ${keyError.message}`);
    if (!keyData) return null;

    const key = keyData as ApiKeyRow;
    let account: CreditAccount | undefined;

    if (key.credit_account_id) {
      const accountData = await this.getAccountById(key.credit_account_id);
      if (accountData) account = accountData;
    }

    return {
      id: key.id,
      organizationId: key.organization_id,
      name: key.name,
      keyPrefix: key.key_prefix,
      permissions: key.permissions,
      creditAccountId: key.credit_account_id ?? undefined,
      externalCustomerId: key.external_customer_id ?? undefined,
      revokedAt: key.revoked_at ?? undefined,
      account,
    };
  }

  async linkApiKeyToAccount(apiKeyId: string, accountId: string, externalCustomerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_keys')
      .update({
        credit_account_id: accountId,
        external_customer_id: externalCustomerId,
      })
      .eq('id', apiKeyId);

    if (error) throw new Error(`Failed to link API key to account: ${error.message}`);
  }
}

// =====================================================
// Factory Function
// =====================================================

export function createCreditsClient(supabase: SupabaseClient): CreditsDatabaseAdapter {
  return new SupabaseCreditsClient({ supabase });
}
