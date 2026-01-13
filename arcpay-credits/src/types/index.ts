// =====================================================
// API Credits Types
// =====================================================

/**
 * Transaction types for credit operations
 */
export type CreditTransactionType =
  | 'deposit'      // USDC deposited to account
  | 'deduction'    // API call charged
  | 'refund'       // Refund for failed request
  | 'adjustment'   // Manual adjustment
  | 'bonus';       // Promotional credits

/**
 * Credit account representing a customer's balance
 */
export interface CreditAccount {
  id: string;
  organizationId: string;
  customerId?: string;
  externalCustomerId: string;
  balance: number;
  currency: string;
  lowBalanceThreshold: number;
  lowBalanceNotifiedAt?: string;
  autoTopupEnabled: boolean;
  autoTopupAmount?: number;
  autoTopupTrigger?: number;
  autoTopupWallet?: string;
  totalDeposited: number;
  totalSpent: number;
  totalRequests: number;
  active: boolean;
  suspendedAt?: string;
  suspendedReason?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Endpoint pricing configuration
 */
export interface CreditEndpoint {
  id: string;
  organizationId: string;
  path: string;
  method: string;
  pricePerCall: number;
  currency: string;
  name?: string;
  description?: string;
  active: boolean;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  rateLimitPerDay?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction record for deposits/deductions
 */
export interface CreditTransaction {
  id: string;
  accountId: string;
  organizationId: string;
  type: CreditTransactionType;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  txHash?: string;
  payerAddress?: string;
  chain?: string;
  endpointId?: string;
  requestId?: string;
  apiKeyId?: string;
  description?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Usage log entry for API calls
 */
export interface UsageLog {
  id: string;
  organizationId: string;
  accountId: string;
  endpointId?: string;
  transactionId?: string;
  apiKeyId?: string;
  externalCustomerId: string;
  path: string;
  method: string;
  requestId?: string;
  priceCharged: number;
  currency: string;
  responseStatus?: number;
  responseTimeMs?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// =====================================================
// Configuration Types
// =====================================================

/**
 * Database adapter interface for credit operations
 */
export interface CreditsDatabaseAdapter {
  // Account operations
  getAccount(organizationId: string, externalCustomerId: string): Promise<CreditAccount | null>;
  getAccountById(accountId: string): Promise<CreditAccount | null>;
  createAccount(params: CreateAccountParams): Promise<CreditAccount>;
  getOrCreateAccount(organizationId: string, externalCustomerId: string, customerId?: string): Promise<CreditAccount>;
  updateAccount(accountId: string, params: UpdateAccountParams): Promise<CreditAccount>;
  suspendAccount(accountId: string, reason: string): Promise<void>;
  reactivateAccount(accountId: string): Promise<void>;

  // Endpoint operations
  getEndpoint(organizationId: string, path: string, method: string): Promise<CreditEndpoint | null>;
  getEndpointById(endpointId: string): Promise<CreditEndpoint | null>;
  listEndpoints(organizationId: string, active?: boolean): Promise<CreditEndpoint[]>;
  createEndpoint(params: CreateEndpointParams): Promise<CreditEndpoint>;
  updateEndpoint(endpointId: string, params: UpdateEndpointParams): Promise<CreditEndpoint>;
  deleteEndpoint(endpointId: string): Promise<void>;

  // Transaction operations
  deductCredits(params: DeductCreditsParams): Promise<DeductCreditsResult>;
  addCredits(params: AddCreditsParams): Promise<AddCreditsResult>;
  refundCredits(params: RefundCreditsParams): Promise<AddCreditsResult>;
  listTransactions(accountId: string, params?: ListTransactionsParams): Promise<CreditTransaction[]>;

  // Usage logging
  logUsage(params: LogUsageParams): Promise<UsageLog>;
  getUsageStats(organizationId: string, params?: UsageStatsParams): Promise<UsageStats>;

  // API Key operations
  getApiKeyWithCredits(keyHash: string): Promise<ApiKeyWithCredits | null>;
  linkApiKeyToAccount(apiKeyId: string, accountId: string, externalCustomerId: string): Promise<void>;
}

/**
 * API Key with credit account info
 */
export interface ApiKeyWithCredits {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  creditAccountId?: string;
  externalCustomerId?: string;
  revokedAt?: string;
  account?: CreditAccount;
}

// =====================================================
// Parameter Types
// =====================================================

export interface CreateAccountParams {
  organizationId: string;
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
  organizationId: string;
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

export interface DeductCreditsParams {
  accountId: string;
  amount: number;
  endpointId?: string;
  requestId?: string;
  apiKeyId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface DeductCreditsResult {
  success: boolean;
  transactionId?: string;
  balanceBefore: number;
  balanceAfter: number;
  errorMessage?: string;
}

export interface AddCreditsParams {
  accountId: string;
  amount: number;
  type?: CreditTransactionType;
  txHash?: string;
  payerAddress?: string;
  chain?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundCreditsParams {
  accountId: string;
  amount: number;
  originalTransactionId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface AddCreditsResult {
  success: boolean;
  transactionId?: string;
  balanceBefore: number;
  balanceAfter: number;
  errorMessage?: string;
}

export interface ListTransactionsParams {
  type?: CreditTransactionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface LogUsageParams {
  organizationId: string;
  accountId: string;
  externalCustomerId: string;
  endpointId?: string;
  transactionId?: string;
  apiKeyId?: string;
  path: string;
  method: string;
  requestId?: string;
  priceCharged: number;
  currency?: string;
  responseStatus?: number;
  responseTimeMs?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface UsageStatsParams {
  accountId?: string;
  endpointId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalCharged: number;
  averageResponseTime?: number;
  successCount: number;
  errorCount: number;
  byEndpoint?: Record<string, {
    requests: number;
    charged: number;
  }>;
  byDay?: Array<{
    date: string;
    requests: number;
    charged: number;
  }>;
}

// =====================================================
// Middleware Configuration Types
// =====================================================

/**
 * Configuration for the credits middleware
 */
export interface CreditsMiddlewareConfig {
  /**
   * Database adapter for credit operations
   */
  db: CreditsDatabaseAdapter;

  /**
   * Organization ID for this API
   */
  organizationId: string;

  /**
   * Function to extract customer ID from request
   * Return customer ID or null to use API key's linked customer
   */
  getCustomerId?: (request: CreditsRequest) => string | null | Promise<string | null>;

  /**
   * Function to extract API key from request
   * Defaults to Authorization Bearer token or x-api-key header
   */
  getApiKey?: (request: CreditsRequest) => string | null | Promise<string | null>;

  /**
   * Default price if endpoint not configured
   * Set to 0 for free access to unconfigured endpoints
   */
  defaultPrice?: number;

  /**
   * Skip credit check for certain requests
   */
  skipIf?: (request: CreditsRequest) => boolean | Promise<boolean>;

  /**
   * Callback when credits are deducted
   */
  onDeduction?: (info: DeductionInfo) => void | Promise<void>;

  /**
   * Callback when request is rejected due to insufficient credits
   */
  onInsufficientCredits?: (info: InsufficientCreditsInfo) => void | Promise<void>;

  /**
   * Callback on errors
   */
  onError?: (error: Error, request: CreditsRequest) => void | Promise<void>;

  /**
   * Enable auto-creation of accounts for new customers
   * Default: true
   */
  autoCreateAccounts?: boolean;

  /**
   * Enable logging usage to api_usage_logs
   * Default: true
   */
  logUsage?: boolean;

  /**
   * Generate unique request ID
   * Default: UUID v4
   */
  generateRequestId?: () => string;
}

/**
 * Generic request interface for middleware
 */
export interface CreditsRequest {
  method: string;
  path: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  ip?: string;
}

/**
 * Information about a credit deduction
 */
export interface DeductionInfo {
  accountId: string;
  externalCustomerId: string;
  transactionId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  endpoint: string;
  method: string;
  requestId: string;
}

/**
 * Information when request rejected for insufficient credits
 */
export interface InsufficientCreditsInfo {
  accountId: string;
  externalCustomerId: string;
  balance: number;
  required: number;
  endpoint: string;
  method: string;
}

/**
 * Attached to request after successful credit check
 */
export interface CreditPaymentInfo {
  accountId: string;
  externalCustomerId: string;
  transactionId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  requestId: string;
}

// =====================================================
// Error Types
// =====================================================

export class CreditsError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'CreditsError';
  }
}

export class InsufficientCreditsError extends CreditsError {
  constructor(
    public balance: number,
    public required: number,
    public accountId: string,
    public topUpUrl?: string
  ) {
    super(
      `Insufficient credits: balance ${balance}, required ${required}`,
      'INSUFFICIENT_CREDITS',
      { balance, required, accountId, topUpUrl }
    );
    this.name = 'InsufficientCreditsError';
  }
}

export class AccountNotFoundError extends CreditsError {
  constructor(public externalCustomerId: string) {
    super(
      `Credit account not found for customer: ${externalCustomerId}`,
      'ACCOUNT_NOT_FOUND',
      { externalCustomerId }
    );
    this.name = 'AccountNotFoundError';
  }
}

export class AccountSuspendedError extends CreditsError {
  constructor(public accountId: string, public reason?: string) {
    super(
      `Credit account is suspended${reason ? `: ${reason}` : ''}`,
      'ACCOUNT_SUSPENDED',
      { accountId, reason }
    );
    this.name = 'AccountSuspendedError';
  }
}

export class InvalidApiKeyError extends CreditsError {
  constructor() {
    super('Invalid or missing API key', 'INVALID_API_KEY');
    this.name = 'InvalidApiKeyError';
  }
}

export class EndpointNotConfiguredError extends CreditsError {
  constructor(public path: string, public method: string) {
    super(
      `Endpoint not configured for credits: ${method} ${path}`,
      'ENDPOINT_NOT_CONFIGURED',
      { path, method }
    );
    this.name = 'EndpointNotConfiguredError';
  }
}
