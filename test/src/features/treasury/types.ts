/**
 * Treasury Module Types
 *
 * Types for the Treasury management feature including:
 * - Treasury stats and balances
 * - Treasury Agent configuration
 * - Agent actions (stake/unstake)
 * - Scheduled unstakes
 */

// Chain environments
export type ChainEnvironment = 'arc-testnet' | 'arc-mainnet';

// Chain configuration
export interface ChainConfig {
  id: ChainEnvironment;
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  contracts: {
    usdc: string;
    usdy: string;
    swapRouter: string;
  };
}

// Treasury stats returned from API
export interface TreasuryStats {
  // Balances
  totalAssets: number;
  operatingBalance: number;      // USDC - liquid capital
  yieldReserve: number;          // USDY - earning yield
  pendingStake: number;
  pendingUnstake: number;

  // Yield metrics
  currentApy: number;
  earnedToday: number;
  earnedYtd: number;
  projectedAnnual: number;

  // Account info
  accountId: string;
  chain: ChainEnvironment;
  status: 'active' | 'suspended' | 'low_balance';

  // Timestamps
  lastUpdated: string;
}

// Treasury Agent configuration
export interface TreasuryAgentConfig {
  id: string;
  organizationId: string;

  // State
  enabled: boolean;
  chain: ChainEnvironment;

  // Staking thresholds
  stakeThreshold: number;        // Stake when USDC exceeds this
  minimumReserve: number;        // Never stake below this USDC amount
  stakePercentage: number;       // % of excess to stake (0-100)

  // Cooldown settings
  cooldownEnabled: boolean;
  cooldownHours: number;
  lastTransactionAt: string | null;

  // Computed fields (from API)
  canExecute: boolean;           // Cooldown passed?
  cooldownEndsAt: string | null; // When cooldown expires

  // Stats
  totalStaked: number;
  totalUnstaked: number;
  executionCount: number;
  lastExecutionAt: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Agent action types
export type AgentActionType = 'stake' | 'unstake' | 'scheduled_unstake';
export type AgentTriggerType = 'auto' | 'manual' | 'scheduled';
export type AgentActionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Individual agent action record
export interface TreasuryAgentAction {
  id: string;
  organizationId: string;
  configId: string;

  // Action details
  actionType: AgentActionType;
  amount: number;

  // Trigger info
  triggerType: AgentTriggerType;
  triggerReason: string | null;  // e.g., "Threshold exceeded: $15,000 > $10,000"

  // For scheduled unstakes
  scheduledFor: string | null;
  scheduledReason: string | null;  // e.g., "Vendor payment due"

  // Status
  status: AgentActionStatus;
  errorMessage: string | null;

  // Balances after execution
  usdcBalanceAfter: number | null;
  usdyBalanceAfter: number | null;

  // Blockchain info
  txHash: string | null;
  chain: ChainEnvironment;

  // Timestamps
  createdAt: string;
  executedAt: string | null;
  completedAt: string | null;
}

// Scheduled unstake (simplified view)
export interface ScheduledUnstake {
  id: string;
  amount: number;
  scheduledFor: string;
  reason: string | null;
  status: AgentActionStatus;
  createdAt: string;
}

// API request/response types
export interface UpdateAgentConfigParams {
  enabled?: boolean;
  chain?: ChainEnvironment;
  stakeThreshold?: number;
  minimumReserve?: number;
  stakePercentage?: number;
  cooldownEnabled?: boolean;
  cooldownHours?: number;
}

export interface CreateScheduledUnstakeParams {
  amount: number;
  scheduledFor: string;      // ISO date string
  reason?: string;
}

export interface TriggerActionParams {
  actionType: 'stake' | 'unstake';
  amount?: number;           // Optional - use calculated amount if not provided
}

// Activity log display item
export interface ActivityLogItem {
  id: string;
  actionType: AgentActionType;
  amount: number;
  triggerType: AgentTriggerType;
  status: AgentActionStatus;
  txHash: string | null;
  chain: ChainEnvironment;
  createdAt: string;
  completedAt: string | null;
}

// Yield curve data point for charts
export interface YieldDataPoint {
  month: string;
  projected: number;
  actual?: number;
}

// Recent activity item for treasury tab
export interface TreasuryActivityItem {
  id: string;
  type: 'yield_credit' | 'deposit' | 'withdrawal' | 'stake' | 'unstake' | 'payment';
  description: string;
  amount: number;
  time: string;
  txHash?: string;
}
