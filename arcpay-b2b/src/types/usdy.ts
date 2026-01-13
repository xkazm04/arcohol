/**
 * USDY Yield Management Types
 */

import type { Identifiable, Timestamped, Money, PaginationParams } from './common';

// ==========================================================================
// USDY Stats
// ==========================================================================

export interface UsdyStats {
  /** Current USDY balance */
  totalBalance: number;
  /** Current APY rate (as percentage, e.g., 5.2) */
  currentApy: number;
  /** Yield earned in current month */
  earnedThisMonth: number;
  /** Total yield earned all time */
  earnedAllTime: number;
  /** Estimated daily yield */
  dailyYield: number;
  /** Projected monthly yield */
  projectedMonthlyYield: number;
  /** Total deposited via automation rules */
  automatedDeposits: number;
  /** Number of active automation rules */
  activeRulesCount: number;
  /** Pending deposits awaiting confirmation */
  pendingDeposits: number;
  /** Chain where USDY is held */
  chain: string;
  /** Currency symbol */
  currency: 'USDY';
}

// ==========================================================================
// USDY Transactions
// ==========================================================================

export type UsdyTransactionType = 'deposit' | 'withdraw' | 'yield';
export type UsdyTransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UsdyTransaction extends Identifiable, Timestamped {
  /** Transaction type */
  type: UsdyTransactionType;
  /** Amount */
  amount: number;
  /** Currency (USDC for deposit/withdraw, USDY for yield) */
  currency: string;
  /** Transaction status */
  status: UsdyTransactionStatus;
  /** Description */
  description?: string;
  /** Completion timestamp */
  completedAt?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface DepositParams {
  /** Amount to deposit (in USDC) */
  amount: number;
  /** Source of funds */
  source?: string;
  /** Idempotency key */
  idempotencyKey?: string;
}

export interface WithdrawParams {
  /** Amount to withdraw (in USDY) */
  amount: number;
  /** Destination for funds */
  destination?: string;
  /** Idempotency key */
  idempotencyKey?: string;
}

export interface ListUsdyTransactionsParams extends PaginationParams {
  /** Filter by transaction type */
  type?: UsdyTransactionType;
}

// ==========================================================================
// Automation Rules
// ==========================================================================

export type AutomationRuleType = 'percentage' | 'threshold' | 'scheduled';

export interface AutomationRuleConfig {
  /** Percentage of revenue to deposit (for percentage type) */
  percentage?: number;
  /** Balance threshold to trigger sweep (for threshold type) */
  threshold?: number;
  /** Target balance after sweep (for threshold type) */
  targetBalance?: number;
  /** Cron schedule (for scheduled type) */
  schedule?: string;
  /** Fixed amount to deposit (for scheduled type) */
  fixedAmount?: number;
  /** Source account identifier */
  sourceAccount?: string;
  /** Minimum amount to trigger (for percentage type) */
  minAmount?: number;
}

export interface AutomationRule extends Identifiable, Timestamped {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Rule type */
  type: AutomationRuleType;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Rule configuration */
  config: AutomationRuleConfig;
  /** Total amount deposited via this rule */
  totalDeposited: number;
  /** Number of times rule has been executed */
  executionCount: number;
  /** Last execution timestamp */
  lastTriggeredAt?: string;
  /** Next scheduled execution (for scheduled type) */
  nextScheduledAt?: string;
}

export interface CreateAutomationRuleParams {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Rule type */
  type: AutomationRuleType;
  /** Rule configuration */
  config: AutomationRuleConfig;
}

export interface UpdateAutomationRuleParams {
  /** Rule name */
  name?: string;
  /** Rule description */
  description?: string;
  /** Rule type */
  type?: AutomationRuleType;
  /** Rule configuration */
  config?: AutomationRuleConfig;
  /** Whether rule is enabled */
  enabled?: boolean;
}

// ==========================================================================
// Automation Logs
// ==========================================================================

export type AutomationTriggerType = 'manual' | 'scheduled' | 'threshold' | 'webhook' | 'percentage';

export interface AutomationLog extends Identifiable {
  /** Rule ID */
  ruleId: string;
  /** Rule name */
  ruleName: string;
  /** Amount deposited */
  amount: number;
  /** Execution status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** How the rule was triggered */
  triggerType: AutomationTriggerType;
  /** New reserve balance after execution */
  newReserveBalance?: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Execution timestamp */
  timestamp: string;
}

export interface TriggerRuleParams {
  /** Custom amount to deposit (overrides rule calculation) */
  amount?: number;
}

// ==========================================================================
// Yield History
// ==========================================================================

export interface YieldAccrual extends Identifiable {
  /** Date of accrual */
  date: string;
  /** Opening balance */
  openingBalance: number;
  /** Closing balance */
  closingBalance: number;
  /** APY rate at time of accrual */
  apyRate: number;
  /** Yield amount earned */
  yieldAmount: number;
  /** Cumulative yield */
  cumulativeYield?: number;
  /** Chain */
  chain: string;
}

export interface ApyHistoryEntry {
  /** Effective date */
  effectiveDate: string;
  /** APY rate (as decimal, e.g., 0.052) */
  apyRate: number;
  /** Data source */
  source: 'ondo' | 'manual' | 'oracle';
  /** Chain */
  chain: string;
}

export interface ListYieldHistoryParams extends PaginationParams {
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
}

// ==========================================================================
// Webhook Events
// ==========================================================================

export type UsdyEventType =
  | 'usdy.deposit.initiated'
  | 'usdy.deposit.completed'
  | 'usdy.deposit.failed'
  | 'usdy.withdraw.initiated'
  | 'usdy.withdraw.completed'
  | 'usdy.withdraw.failed'
  | 'usdy.automation.triggered'
  | 'usdy.automation.completed'
  | 'usdy.automation.failed'
  | 'usdy.yield.accrued'
  | 'usdy.apy.changed';

export interface UsdyEvent {
  type: UsdyEventType;
  data: UsdyTransaction | AutomationLog | YieldAccrual | ApyHistoryEntry;
}
