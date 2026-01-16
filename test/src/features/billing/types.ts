// =====================================================
// Billing Job Types
// =====================================================

export type BillingJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

export type DunningStage = 0 | 1 | 2 | 3; // 0=initial, 1=3-day, 2=7-day, 3=14-day

export interface BillingJob {
  id: string;
  organizationId: string;
  subscriptionId: string;
  subscriptionInvoiceId?: string;

  status: BillingJobStatus;
  attemptNumber: number;
  maxAttempts: number;
  nextAttemptAt?: string;

  amount: number;
  customerWallet: string;
  merchantWallet: string;
  chain: string;

  allowanceSufficient?: boolean;
  txHash?: string;
  txConfirmedAt?: string;

  dunningStage: DunningStage;
  errorMessage?: string;

  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Dunning Configuration
// =====================================================

export interface DunningConfig {
  enabled: boolean;
  maxAttempts: number;
  intervals: number[]; // Days between retries: [3, 7, 14]
  sendNotifications: boolean;
  pauseOnMaxFailures: boolean;
  cancelAfterDays?: number; // Auto-cancel subscription after N days
}

export const DEFAULT_DUNNING_CONFIG: DunningConfig = {
  enabled: true,
  maxAttempts: 4,
  intervals: [3, 7, 14], // Retry at 3, 7, and 14 days
  sendNotifications: true,
  pauseOnMaxFailures: true,
  cancelAfterDays: 30,
};

// =====================================================
// Billing Cycle Results
// =====================================================

export interface BillingCycleResult {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  jobs: BillingJobSummary[];
}

export interface BillingJobSummary {
  jobId: string;
  subscriptionId: string;
  status: BillingJobStatus;
  amount: number;
  txHash?: string;
  errorMessage?: string;
}

// =====================================================
// Payment Results
// =====================================================

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  confirmedAt?: string;
  error?: PaymentError;
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type PaymentErrorCode =
  | 'INSUFFICIENT_ALLOWANCE'
  | 'INSUFFICIENT_BALANCE'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_REVERTED'
  | 'WALLET_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

// =====================================================
// Allowance Check Results
// =====================================================

export interface AllowanceCheckResult {
  wallet: string;
  spender: string;
  allowance: string; // BigInt as string
  requiredAmount: string;
  sufficient: boolean;
  balance?: string;
  balanceSufficient?: boolean;
}

// =====================================================
// Query Parameters
// =====================================================

export interface ListBillingJobsParams {
  status?: BillingJobStatus;
  subscriptionId?: string;
  dunningStage?: DunningStage;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface RunBillingParams {
  subscriptionIds?: string[]; // Specific subscriptions to bill, or all if empty
  dryRun?: boolean; // Preview mode without executing payments
}

// =====================================================
// Webhook Events
// =====================================================

export type BillingWebhookEvent =
  | 'billing.cycle.started'
  | 'billing.cycle.completed'
  | 'billing.payment.succeeded'
  | 'billing.payment.failed'
  | 'billing.dunning.started'
  | 'billing.dunning.escalated'
  | 'billing.subscription.paused'
  | 'billing.subscription.canceled';

export interface BillingWebhookPayload {
  event: BillingWebhookEvent;
  timestamp: string;
  data: {
    jobId?: string;
    subscriptionId: string;
    organizationId: string;
    amount?: number;
    txHash?: string;
    dunningStage?: DunningStage;
    errorMessage?: string;
  };
}
