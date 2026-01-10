/**
 * Treasury Management Types
 * Direction 4: Corporate Treasury with Yield Optimization
 */

import type {
  BlockchainAddress,
  Currency,
  Identifiable,
  Metadata,
  Money,
  PaginationParams,
  Timestamped
} from './common';

// ============================================================================
// Treasury Account
// ============================================================================

export interface TreasuryAccount extends Identifiable, Timestamped {
  /** Organization ID */
  organizationId: string;
  /** Treasury name */
  name: string;
  /** Operating fund (liquid USDC) */
  operating: TreasuryFund;
  /** Reserve fund (USDY - 24hr unlock) */
  reserve: TreasuryFund;
  /** Yield vault (USDY - locked) */
  vault?: TreasuryVault;
  /** Total balance across all funds */
  totalBalance: Money;
  /** Projected annual yield */
  projectedAnnualYield: Money;
  /** Treasury strategy */
  strategy: TreasuryStrategy;
  /** Treasury status */
  status: TreasuryStatus;
}

export type TreasuryStatus = 'active' | 'rebalancing' | 'suspended';

export interface TreasuryFund {
  /** Current balance */
  balance: Money;
  /** Currency type */
  currency: Currency;
  /** Current APY (for yield-bearing funds) */
  apy?: number;
  /** Year-to-date earnings */
  earnedYTD: Money;
  /** Available for withdrawal */
  available: Money;
  /** Pending transactions */
  pending: Money;
}

export interface TreasuryVault {
  /** Current balance */
  balance: Money;
  /** Current APY */
  apy: number;
  /** Year-to-date earnings */
  earnedYTD: Money;
  /** Lock period in days */
  lockPeriod: number;
  /** Next unlock date */
  nextUnlockDate?: Date;
  /** Amount unlocking */
  unlockingAmount?: Money;
}

// ============================================================================
// Treasury Strategy
// ============================================================================

export interface TreasuryStrategy {
  /** Operating fund strategy */
  operating: OperatingStrategy;
  /** Reserve fund strategy */
  reserve: ReserveStrategy;
  /** Vault strategy (optional) */
  vault?: VaultStrategy;
  /** Auto-rebalancing enabled */
  autoRebalance: boolean;
  /** Rebalance frequency */
  rebalanceFrequency?: RebalanceFrequency;
}

export interface OperatingStrategy {
  /** Target operating balance */
  target: number;
  /** Minimum operating balance (triggers alert) */
  minimum: number;
  /** Currency */
  currency: Currency;
}

export interface ReserveStrategy {
  /** Enable reserve fund */
  enabled: boolean;
  /** Target percentage of total (0-100) */
  targetPercentage?: number;
  /** Fixed target amount */
  targetAmount?: number;
}

export interface VaultStrategy {
  /** Enable vault */
  enabled: boolean;
  /** Target percentage of total (0-100) */
  targetPercentage?: number;
  /** Lock period in days */
  lockPeriod: number;
}

export type RebalanceFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

// ============================================================================
// Treasury Operations
// ============================================================================

export interface CreateTreasuryParams {
  organizationId: string;
  name: string;
  strategy: TreasuryStrategy;
  metadata?: Metadata;
}

export interface UpdateTreasuryParams {
  name?: string;
  strategy?: Partial<TreasuryStrategy>;
  metadata?: Metadata;
}

export interface TreasuryOverview {
  /** Treasury ID */
  treasuryId: string;
  /** Operating fund overview */
  operating: FundOverview;
  /** Reserve fund overview */
  reserve: FundOverview;
  /** Vault overview */
  vault?: VaultOverview;
  /** Total balance */
  total: Money;
  /** Projected annual yield */
  projectedAnnualYield: Money;
  /** Year-to-date earnings */
  earnedYTD: Money;
  /** Overview timestamp */
  asOf: Date;
}

export interface FundOverview {
  balance: Money;
  currency: Currency;
  apy?: number;
  earnedYTD: Money;
}

export interface VaultOverview {
  balance: Money;
  apy: number;
  earnedYTD: Money;
  lockPeriod: number;
  nextUnlockDate?: Date;
}

// ============================================================================
// Treasury Transactions
// ============================================================================

export interface TreasuryTransaction extends Identifiable, Timestamped {
  /** Treasury ID */
  treasuryId: string;
  /** Transaction type */
  type: TreasuryTransactionType;
  /** Amount */
  amount: Money;
  /** Source fund */
  source?: TreasuryFundType;
  /** Destination fund */
  destination?: TreasuryFundType;
  /** External recipient (for payments) */
  recipient?: BlockchainAddress;
  /** Transaction status */
  status: TreasuryTransactionStatus;
  /** Transaction hash */
  txHash?: string;
  /** Memo */
  memo?: string;
  /** Metadata */
  metadata?: Metadata;
}

export type TreasuryTransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'rebalance'
  | 'yield_credit'
  | 'transfer_to_reserve'
  | 'transfer_from_reserve'
  | 'transfer_to_vault'
  | 'transfer_from_vault';

export type TreasuryFundType = 'operating' | 'reserve' | 'vault';

export type TreasuryTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

// ============================================================================
// Treasury Payment
// ============================================================================

export interface TreasuryPaymentParams {
  /** Recipient address */
  recipient: string;
  /** Chain */
  chain?: string;
  /** Amount to pay */
  amount: number;
  /** Currency */
  currency?: Currency;
  /** Memo */
  memo?: string;
  /** Metadata */
  metadata?: Metadata;
  /** Preferred source fund (default: operating, then reserve) */
  preferredSource?: TreasuryFundType;
}

export interface TreasuryPaymentResult {
  /** Transaction ID */
  transactionId: string;
  /** Amount paid */
  amount: Money;
  /** Source breakdown */
  sources: PaymentSourceBreakdown[];
  /** Recipient */
  recipient: BlockchainAddress;
  /** Transaction hash */
  txHash: string;
  /** Status */
  status: TreasuryTransactionStatus;
}

export interface PaymentSourceBreakdown {
  /** Fund type */
  fund: TreasuryFundType;
  /** Amount from this fund */
  amount: Money;
  /** Conversion details (if USDY → USDC) */
  conversion?: ConversionDetails;
}

export interface ConversionDetails {
  /** Original amount */
  from: Money;
  /** Converted amount */
  to: Money;
  /** Exchange rate */
  rate: number;
}

// ============================================================================
// Rebalancing
// ============================================================================

export interface RebalanceRequest {
  /** Target strategy (optional, uses current if not provided) */
  strategy?: TreasuryStrategy;
  /** Force rebalance even if within tolerance */
  force?: boolean;
}

export interface RebalanceResult {
  /** Rebalance ID */
  id: string;
  /** Transactions created */
  transactions: TreasuryTransaction[];
  /** Before state */
  before: TreasuryOverview;
  /** After state */
  after: TreasuryOverview;
  /** Rebalance timestamp */
  rebalancedAt: Date;
}

export interface RebalanceSchedule {
  /** Treasury ID */
  treasuryId: string;
  /** Frequency */
  frequency: RebalanceFrequency;
  /** Next scheduled rebalance */
  nextRebalance?: Date;
  /** Last rebalance */
  lastRebalance?: Date;
  /** Enabled */
  enabled: boolean;
}

// ============================================================================
// Treasury Alerts
// ============================================================================

export interface TreasuryAlert extends Identifiable, Timestamped {
  /** Treasury ID */
  treasuryId: string;
  /** Alert type */
  type: TreasuryAlertType;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert message */
  message: string;
  /** Alert data */
  data: Record<string, unknown>;
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
  /** Acknowledged at */
  acknowledgedAt?: Date;
}

export type TreasuryAlertType =
  | 'low_operating_balance'
  | 'rebalance_required'
  | 'rebalance_failed'
  | 'yield_rate_change'
  | 'large_withdrawal'
  | 'vault_unlock_pending';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ListTreasuryTransactionsParams extends PaginationParams {
  /** Filter by type */
  type?: TreasuryTransactionType;
  /** Filter by status */
  status?: TreasuryTransactionStatus;
  /** Filter by date range */
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// Treasury Events (for webhooks)
// ============================================================================

export type TreasuryEventType =
  | 'treasury.created'
  | 'treasury.updated'
  | 'treasury.rebalanced'
  | 'treasury.payment_sent'
  | 'treasury.deposit_received'
  | 'treasury.yield_credited'
  | 'treasury.alert_triggered'
  | 'treasury.vault_unlocked';

export interface TreasuryEvent {
  type: TreasuryEventType;
  treasuryId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
