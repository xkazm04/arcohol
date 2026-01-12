// =============================================================================
// Cross-Chain Treasury Types
// =============================================================================

/**
 * Supported chains for cross-chain operations
 */
export type SupportedChain =
  | 'ethereum'
  | 'base'
  | 'arbitrum'
  | 'polygon'
  | 'optimism'
  | 'avalanche'
  | 'solana';

/**
 * Supported currencies
 */
export type SupportedCurrency = 'USDC' | 'USDY';

/**
 * Routing strategy for cross-chain payments
 */
export type RoutingStrategy =
  | 'optimize_cost'    // Minimize fees
  | 'optimize_speed'   // Fastest settlement
  | 'prefer_chain'     // Prefer specific chain
  | 'balanced';        // Balance cost and speed

// =============================================================================
// Chain Configuration
// =============================================================================

/**
 * Configuration for a single chain
 */
export interface ChainConfig {
  /** Wallet address on this chain */
  wallet: string;
  /** RPC URL for this chain */
  rpc: string;
  /** Whether this chain is enabled */
  enabled?: boolean;
  /** Custom gas settings */
  gas?: {
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  };
}

/**
 * Chain-specific balance information
 */
export interface ChainBalance {
  /** Chain identifier */
  chain: SupportedChain;
  /** USDC balance */
  balance: Money;
  /** USDY balance (if applicable) */
  yieldBalance?: Money;
  /** Current APY for yield-bearing assets */
  yieldRate?: number;
  /** Current gas price (in native currency) */
  gasPrice: string;
  /** Estimated gas cost for a transfer */
  estimatedTransferCost: Money;
}

/**
 * Money representation
 */
export interface Money {
  amount: string;
  currency: SupportedCurrency | 'ETH' | 'MATIC' | 'AVAX' | 'SOL';
}

// =============================================================================
// Treasury Configuration
// =============================================================================

/**
 * Multi-chain treasury configuration
 */
export interface MultiChainTreasuryConfig {
  /** Organization ID */
  organizationId: string;
  /** Chain configurations */
  chains: Partial<Record<SupportedChain, ChainConfig>>;
  /** Routing configuration */
  routing?: RoutingConfig;
  /** Rebalancing configuration */
  rebalancing?: RebalancingConfig;
  /** Alert configuration */
  alerts?: AlertConfig;
}

/**
 * Routing configuration
 */
export interface RoutingConfig {
  /** Routing strategy */
  strategy: RoutingStrategy;
  /** Preferred chain (if strategy is 'prefer_chain') */
  preferredChain?: SupportedChain;
  /** Minimum balance to maintain on each chain */
  minimumBalances?: Partial<Record<SupportedChain, number>>;
}

/**
 * Rebalancing configuration
 */
export interface RebalancingConfig {
  /** Enable auto-rebalancing */
  enabled: boolean;
  /** Target allocation percentages (must sum to 1) */
  targets: Partial<Record<SupportedChain, number>>;
  /** Threshold for triggering rebalance (e.g., 0.1 = 10% deviation) */
  threshold: number;
  /** Minimum amount to move in a rebalance */
  minimumMove?: number;
  /** Maximum daily bridge operations */
  maxDailyBridges?: number;
  /** Preferred time for rebalancing (UTC hour) */
  preferredTime?: number;
  /** Enable yield optimization (move idle funds to USDY) */
  yieldOptimization?: boolean;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  /** Alert when balance falls below threshold */
  lowBalanceThreshold?: number;
  /** Alert on yield rate changes */
  yieldRateChangeThreshold?: number;
  /** Alert on failed transactions */
  onFailedTransaction?: boolean;
  /** Webhook URL for alerts */
  webhookUrl?: string;
}

// =============================================================================
// Treasury Overview
// =============================================================================

/**
 * Unified treasury overview
 */
export interface TreasuryOverview {
  /** Total balance across all chains */
  total: Money;
  /** Breakdown by chain */
  byChain: Record<SupportedChain, ChainBalance>;
  /** Amount earning yield */
  yieldEarning: Money;
  /** Projected annual yield */
  projectedAnnualYield: Money;
  /** Year-to-date yield earned */
  yieldEarnedYTD: Money;
  /** Current allocation vs target */
  allocationVsTarget: AllocationComparison[];
  /** Last updated */
  updatedAt: Date;
}

/**
 * Allocation comparison
 */
export interface AllocationComparison {
  chain: SupportedChain;
  currentPercent: number;
  targetPercent: number;
  deviation: number;
  needsRebalance: boolean;
}

// =============================================================================
// Payment & Routing
// =============================================================================

/**
 * Cross-chain payment request
 */
export interface CrossChainPaymentRequest {
  /** Recipient address */
  recipient: string;
  /** Recipient chain */
  recipientChain: SupportedChain;
  /** Amount to pay */
  amount: number;
  /** Currency */
  currency?: SupportedCurrency;
  /** Payment memo */
  memo?: string;
  /** Preferred source chain (optional, will auto-route if not specified) */
  preferredSource?: SupportedChain;
  /** Maximum acceptable fee */
  maxFee?: number;
  /** Deadline for settlement */
  deadline?: Date;
}

/**
 * Route option for a payment
 */
export interface RouteOption {
  /** Source chain */
  sourceChain: SupportedChain;
  /** Destination chain */
  destinationChain: SupportedChain;
  /** Whether bridge is needed */
  requiresBridge: boolean;
  /** Bridge protocol (if applicable) */
  bridgeProtocol?: 'cctp_v2' | 'cctp_v1' | 'wormhole';
  /** Estimated fee */
  estimatedFee: Money;
  /** Estimated time in seconds */
  estimatedTime: number;
  /** Available balance on source chain */
  availableBalance: Money;
  /** Route score (higher is better) */
  score: number;
}

/**
 * Selected route with execution details
 */
export interface SelectedRoute extends RouteOption {
  /** Steps to execute */
  steps: RouteStep[];
  /** Total estimated fee */
  totalFee: Money;
  /** Total estimated time */
  totalTime: number;
}

/**
 * Individual step in a route
 */
export interface RouteStep {
  type: 'transfer' | 'bridge' | 'swap' | 'yield_convert';
  chain: SupportedChain;
  action: string;
  amount: Money;
  estimatedFee: Money;
  estimatedTime: number;
}

/**
 * Completed payment
 */
export interface CrossChainPayment {
  /** Payment ID */
  id: string;
  /** Original request */
  request: CrossChainPaymentRequest;
  /** Route used */
  route: SelectedRoute;
  /** Status */
  status: 'pending' | 'bridging' | 'confirming' | 'completed' | 'failed';
  /** Source transaction hash */
  sourceTxHash?: string;
  /** Bridge transaction hash (if applicable) */
  bridgeTxHash?: string;
  /** Destination transaction hash */
  destinationTxHash?: string;
  /** Actual fee paid */
  actualFee?: Money;
  /** Completion time */
  completedAt?: Date;
  /** Error message (if failed) */
  error?: string;
}

// =============================================================================
// Rebalancing
// =============================================================================

/**
 * Rebalance plan
 */
export interface RebalancePlan {
  /** Plan ID */
  id: string;
  /** Moves to execute */
  moves: RebalanceMove[];
  /** Total cost of rebalancing */
  totalCost: Money;
  /** Estimated time to complete */
  estimatedTime: number;
  /** Created at */
  createdAt: Date;
}

/**
 * Single rebalance move
 */
export interface RebalanceMove {
  fromChain: SupportedChain;
  toChain: SupportedChain;
  amount: Money;
  estimatedFee: Money;
  estimatedTime: number;
  reason: 'below_target' | 'above_target' | 'yield_optimization';
}

/**
 * Rebalance execution result
 */
export interface RebalanceResult {
  plan: RebalancePlan;
  status: 'completed' | 'partial' | 'failed';
  executedMoves: number;
  totalMoves: number;
  actualCost: Money;
  errors?: string[];
}

// =============================================================================
// Bridge Types
// =============================================================================

/**
 * Bridge provider interface
 */
export interface BridgeProvider {
  /** Provider name */
  name: string;
  /** Supported chains */
  supportedChains: SupportedChain[];
  /** Get quote for a bridge operation */
  getQuote(params: BridgeQuoteParams): Promise<BridgeQuote>;
  /** Execute bridge operation */
  execute(quote: BridgeQuote): Promise<BridgeExecution>;
  /** Get status of a bridge operation */
  getStatus(executionId: string): Promise<BridgeStatus>;
}

/**
 * Bridge quote parameters
 */
export interface BridgeQuoteParams {
  sourceChain: SupportedChain;
  destinationChain: SupportedChain;
  amount: string;
  currency: SupportedCurrency;
  recipient: string;
}

/**
 * Bridge quote
 */
export interface BridgeQuote {
  /** Quote ID */
  id: string;
  /** Provider */
  provider: string;
  /** Source chain */
  sourceChain: SupportedChain;
  /** Destination chain */
  destinationChain: SupportedChain;
  /** Amount to send */
  amount: Money;
  /** Fee */
  fee: Money;
  /** Amount to receive */
  amountReceived: Money;
  /** Estimated time in seconds */
  estimatedTime: number;
  /** Quote expiration */
  expiresAt: Date;
}

/**
 * Bridge execution result
 */
export interface BridgeExecution {
  /** Execution ID */
  id: string;
  /** Quote used */
  quote: BridgeQuote;
  /** Source transaction hash */
  sourceTxHash: string;
  /** Status */
  status: BridgeStatus;
}

/**
 * Bridge status
 */
export interface BridgeStatus {
  status: 'pending' | 'attesting' | 'ready_to_claim' | 'completed' | 'failed';
  sourceTxHash?: string;
  destinationTxHash?: string;
  attestation?: string;
  error?: string;
}

// =============================================================================
// Callbacks
// =============================================================================

/**
 * Treasury event callbacks
 */
export interface TreasuryCallbacks {
  /** Called when a payment completes */
  onPaymentComplete?: (payment: CrossChainPayment) => void;
  /** Called when a rebalance completes */
  onRebalanceComplete?: (result: RebalanceResult) => void;
  /** Called on treasury alerts */
  onAlert?: (alert: TreasuryAlert) => void;
  /** Called on balance changes */
  onBalanceChange?: (chain: SupportedChain, balance: ChainBalance) => void;
}

/**
 * Treasury alert
 */
export interface TreasuryAlert {
  type: 'low_balance' | 'yield_change' | 'failed_transaction' | 'rebalance_needed';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  chain?: SupportedChain;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
