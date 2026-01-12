// =============================================================================
// AI Agent Payment Types
// =============================================================================

/**
 * Supported chains for agent wallets
 */
export type AgentChain =
  | 'ethereum'
  | 'base'
  | 'arbitrum'
  | 'polygon'
  | 'optimism'
  | 'solana';

/**
 * Supported currencies
 */
export type AgentCurrency = 'USDC' | 'USDT' | 'DAI';

/**
 * Agent wallet status
 */
export type AgentWalletStatus = 'active' | 'paused' | 'frozen' | 'depleted';

/**
 * Budget period
 */
export type BudgetPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

// =============================================================================
// Budget Types
// =============================================================================

/**
 * Budget configuration for an agent
 */
export interface AgentBudgetConfig {
  /** Maximum spending per day */
  daily?: number;
  /** Maximum spending per week */
  weekly?: number;
  /** Maximum spending per month */
  monthly?: number;
  /** Maximum per single transaction */
  perTransaction?: number;
  /** Maximum transactions per hour (velocity limit) */
  maxTransactionsPerHour?: number;
  /** Per-vendor spending limits */
  vendors?: Record<string, VendorBudget>;
  /** Auto-refill configuration */
  autoRefill?: AutoRefillConfig;
}

/**
 * Vendor-specific budget
 */
export interface VendorBudget {
  /** Daily limit for this vendor */
  daily?: number;
  /** Per-transaction limit for this vendor */
  perTransaction?: number;
  /** Whether this vendor is allowed */
  allowed?: boolean;
}

/**
 * Auto-refill configuration
 */
export interface AutoRefillConfig {
  /** Enable auto-refill */
  enabled: boolean;
  /** Refill when balance drops below this amount */
  threshold: number;
  /** Amount to refill */
  amount: number;
  /** Source treasury or wallet ID */
  source: string;
  /** Maximum refills per day */
  maxRefillsPerDay?: number;
}

/**
 * Budget usage snapshot
 */
export interface BudgetUsage {
  /** Current period */
  period: BudgetPeriod;
  /** Period start time */
  periodStart: Date;
  /** Amount spent in period */
  spent: number;
  /** Budget limit for period */
  limit: number;
  /** Percentage used */
  percentUsed: number;
  /** Transactions in period */
  transactionCount: number;
}

/**
 * Budget alert
 */
export interface BudgetAlert {
  type:
    | 'threshold_warning'    // Approaching limit (80%)
    | 'limit_reached'        // Hit the limit
    | 'velocity_warning'     // Too many transactions
    | 'anomaly_detected'     // Unusual spending pattern
    | 'vendor_blocked'       // Vendor not in allowlist
    | 'large_transaction';   // Transaction above threshold
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// =============================================================================
// Wallet Types
// =============================================================================

/**
 * Agent wallet configuration
 */
export interface AgentWalletConfig {
  /** Human-readable name */
  name: string;
  /** Organization this agent belongs to */
  organizationId: string;
  /** Budget configuration */
  budget: AgentBudgetConfig;
  /** Allowed operations */
  allowedOperations?: ('pay' | 'receive' | 'withdraw')[];
  /** Amount above which human approval is required */
  requiredApprovalAbove?: number;
  /** Notification webhooks */
  webhooks?: {
    onPayment?: string;
    onReceive?: string;
    onBudgetAlert?: string;
  };
  /** Preferred chain for payments */
  preferredChain?: AgentChain;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent wallet instance
 */
export interface AgentWallet {
  /** Unique wallet ID */
  id: string;
  /** Wallet name */
  name: string;
  /** On-chain address */
  address: string;
  /** Chain the wallet is on */
  chain: AgentChain;
  /** Organization ID */
  organizationId: string;
  /** Current status */
  status: AgentWalletStatus;
  /** Balance in USDC */
  balance: Money;
  /** Budget configuration */
  budget: AgentBudgetConfig;
  /** Created timestamp */
  createdAt: Date;
  /** Last activity */
  lastActivityAt?: Date;
}

/**
 * Money representation
 */
export interface Money {
  amount: string;
  currency: AgentCurrency;
}

// =============================================================================
// Transaction Types
// =============================================================================

/**
 * Payment request from agent
 */
export interface AgentPaymentRequest {
  /** Recipient address */
  recipient: string;
  /** Recipient chain (if cross-chain) */
  recipientChain?: AgentChain;
  /** Amount to pay */
  amount: number;
  /** Currency */
  currency?: AgentCurrency;
  /** Payment memo/reference */
  memo?: string;
  /** Metadata for tracking */
  metadata?: Record<string, unknown>;
  /** Require human approval even if under threshold */
  requireApproval?: boolean;
}

/**
 * Completed payment
 */
export interface AgentPayment {
  /** Payment ID */
  id: string;
  /** Wallet ID */
  walletId: string;
  /** Recipient address */
  recipient: string;
  /** Amount paid */
  amount: Money;
  /** Fee paid */
  fee: Money;
  /** Transaction hash */
  txHash: string;
  /** Chain used */
  chain: AgentChain;
  /** Payment memo */
  memo?: string;
  /** Status */
  status: 'pending' | 'confirmed' | 'failed';
  /** Timestamp */
  timestamp: Date;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Incoming payment to agent
 */
export interface AgentReceipt {
  /** Receipt ID */
  id: string;
  /** Wallet ID */
  walletId: string;
  /** Sender address */
  from: string;
  /** Amount received */
  amount: Money;
  /** Transaction hash */
  txHash: string;
  /** Chain */
  chain: AgentChain;
  /** Memo if provided */
  memo?: string;
  /** Timestamp */
  timestamp: Date;
}

// =============================================================================
// Earnings & Analytics Types
// =============================================================================

/**
 * Agent earnings summary
 */
export interface AgentEarnings {
  /** Time period */
  period: 'today' | 'this_week' | 'this_month' | 'all_time';
  /** Total earned */
  total: Money;
  /** Number of receipts */
  receiptCount: number;
  /** Receipts list */
  receipts: AgentReceipt[];
}

/**
 * Agent spending summary
 */
export interface AgentSpending {
  /** Time period */
  period: 'today' | 'this_week' | 'this_month' | 'all_time';
  /** Total spent */
  total: Money;
  /** Number of payments */
  paymentCount: number;
  /** Spending by vendor */
  byVendor: Record<string, Money>;
  /** Payments list */
  payments: AgentPayment[];
}

/**
 * Agent activity log entry
 */
export interface AgentActivityLog {
  id: string;
  walletId: string;
  type: 'payment' | 'receipt' | 'refill' | 'budget_alert' | 'status_change';
  description: string;
  amount?: Money;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// =============================================================================
// Security Types
// =============================================================================

/**
 * Approval request for large transactions
 */
export interface ApprovalRequest {
  /** Request ID */
  id: string;
  /** Wallet ID */
  walletId: string;
  /** Payment details */
  payment: AgentPaymentRequest;
  /** Reason approval is needed */
  reason: 'amount_threshold' | 'new_vendor' | 'velocity_limit' | 'manual_request';
  /** Status */
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  /** Requested at */
  requestedAt: Date;
  /** Expires at */
  expiresAt: Date;
  /** Approver (if approved/rejected) */
  approvedBy?: string;
  /** Approval/rejection timestamp */
  resolvedAt?: Date;
}

/**
 * Anomaly detection result
 */
export interface AnomalyDetection {
  /** Whether anomaly was detected */
  detected: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** Type of anomaly */
  type?: 'unusual_amount' | 'unusual_vendor' | 'unusual_frequency' | 'unusual_time';
  /** Description */
  description?: string;
  /** Recommended action */
  recommendation?: 'allow' | 'require_approval' | 'block';
}

// =============================================================================
// Callback Types
// =============================================================================

/**
 * Event callbacks for agent wallet
 */
export interface AgentWalletCallbacks {
  /** Called on each payment */
  onPayment?: (payment: AgentPayment) => void | Promise<void>;
  /** Called on each receipt */
  onReceipt?: (receipt: AgentReceipt) => void | Promise<void>;
  /** Called on budget alerts */
  onBudgetAlert?: (alert: BudgetAlert) => void | Promise<void>;
  /** Called when approval is required */
  onApprovalRequired?: (request: ApprovalRequest) => void | Promise<void>;
  /** Called on anomaly detection */
  onAnomaly?: (anomaly: AnomalyDetection) => void | Promise<void>;
  /** Called on auto-refill */
  onRefill?: (amount: number, source: string) => void | Promise<void>;
}
