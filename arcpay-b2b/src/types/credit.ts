/**
 * Credit Account & Usage Metering Types
 * Direction 1: B2B Credit & Billing System
 */

import type {
  Currency,
  Identifiable,
  Metadata,
  Money,
  PaginationParams,
  Timestamped
} from './common';

// ============================================================================
// Credit Account
// ============================================================================

export interface CreditAccount extends Identifiable, Timestamped {
  /** Organization ID that owns this account */
  organizationId: string;
  /** Account name/label */
  name: string;
  /** Available balance (liquid USDC) */
  availableBalance: Money;
  /** Balance in yield vault (USDY) */
  yieldBalance: Money;
  /** Total yield earned to date */
  yieldEarned: Money;
  /** Pending deposits */
  pendingBalance: Money;
  /** Account status */
  status: CreditAccountStatus;
  /** Account settings */
  settings: CreditAccountSettings;
  /** Account metadata */
  metadata?: Metadata;
}

export type CreditAccountStatus =
  | 'active'
  | 'suspended'
  | 'low_balance'
  | 'depleted';

export interface CreditAccountSettings {
  /** Alert when balance drops below this amount */
  lowBalanceAlert: number;
  /** Auto top-up configuration */
  autoTopUp?: AutoTopUpConfig;
  /** Enable yield on idle funds */
  yieldEnabled: boolean;
  /** Minimum balance for yield conversion */
  yieldThreshold: number;
  /** Webhook URL for account events */
  webhookUrl?: string;
  /** Email for alerts */
  alertEmail?: string;
}

export interface AutoTopUpConfig {
  /** Enable auto top-up */
  enabled: boolean;
  /** Trigger when balance drops below */
  threshold: number;
  /** Amount to top up */
  amount: number;
  /** Payment source ID */
  sourceId: string;
}

// ============================================================================
// Credit Account Operations
// ============================================================================

export interface CreateCreditAccountParams {
  organizationId: string;
  name: string;
  settings?: Partial<CreditAccountSettings>;
  metadata?: Metadata;
}

export interface UpdateCreditAccountParams {
  name?: string;
  settings?: Partial<CreditAccountSettings>;
  metadata?: Metadata;
}

export interface DepositParams {
  /** Amount to deposit */
  amount: number;
  /** Deposit method */
  method: DepositMethod;
  /** External reference */
  reference?: string;
  /** Metadata */
  metadata?: Metadata;
}

export type DepositMethod = 'wire' | 'ach' | 'usdc_transfer' | 'card';

export interface Deposit extends Identifiable, Timestamped {
  accountId: string;
  amount: Money;
  method: DepositMethod;
  status: DepositStatus;
  reference?: string;
  externalId?: string;
  metadata?: Metadata;
}

export type DepositStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

export interface ListCreditAccountsParams extends PaginationParams {
  organizationId?: string;
  status?: CreditAccountStatus;
}

// ============================================================================
// Usage Metering
// ============================================================================

export interface RateCard {
  /** Rate card ID */
  id: string;
  /** Rate card name */
  name: string;
  /** Rate definitions by meter type */
  rates: Record<string, Rate>;
  /** Effective date */
  effectiveAt: Date;
  /** Expiration date (if any) */
  expiresAt?: Date;
}

export interface Rate {
  /** Price per unit */
  pricePerUnit: number;
  /** Currency */
  currency: Currency;
  /** Unit name (for display) */
  unitName: string;
  /** Minimum charge per event */
  minimumCharge?: number;
  /** Tiered pricing (if applicable) */
  tiers?: RateTier[];
}

export interface RateTier {
  /** Start of tier (inclusive) */
  from: number;
  /** End of tier (exclusive, undefined = unlimited) */
  to?: number;
  /** Price per unit in this tier */
  pricePerUnit: number;
}

export interface UsageRecord extends Identifiable, Timestamped {
  /** Account being charged */
  accountId: string;
  /** Meter type (e.g., 'api_call', 'data_export') */
  meter: string;
  /** Number of units */
  count: number;
  /** Calculated cost */
  cost: Money;
  /** Event metadata */
  metadata?: Metadata;
  /** Idempotency key */
  idempotencyKey?: string;
}

export interface RecordUsageParams {
  /** Meter type */
  meter: string;
  /** Number of units (default: 1) */
  count?: number;
  /** Event metadata */
  metadata?: Metadata;
  /** Idempotency key to prevent duplicates */
  idempotencyKey?: string;
}

export interface UsageSummary {
  /** Account ID */
  accountId: string;
  /** Billing period (e.g., '2024-01') */
  period: string;
  /** Start of period */
  periodStart: Date;
  /** End of period */
  periodEnd: Date;
  /** Usage items by meter */
  items: UsageSummaryItem[];
  /** Total cost */
  total: Money;
  /** Amount deducted from credits */
  deductedFromCredits: Money;
}

export interface UsageSummaryItem {
  /** Meter type */
  meter: string;
  /** Total count for period */
  count: number;
  /** Total cost for this meter */
  cost: Money;
  /** Rate applied */
  rate: Rate;
}

export interface ListUsageParams extends PaginationParams {
  accountId: string;
  /** Filter by meter type */
  meter?: string;
  /** Start date filter */
  startDate?: Date;
  /** End date filter */
  endDate?: Date;
}

// ============================================================================
// Balance Operations
// ============================================================================

export interface BalanceSnapshot {
  /** Current available balance */
  available: Money;
  /** Balance in yield vault */
  inYield: Money;
  /** Total yield earned */
  yieldEarned: Money;
  /** Pending deposits */
  pending: Money;
  /** Total balance (available + inYield + yieldEarned) */
  total: Money;
  /** Snapshot timestamp */
  asOf: Date;
}

export interface TransferToYieldParams {
  /** Amount to transfer to yield vault */
  amount: number;
}

export interface TransferFromYieldParams {
  /** Amount to transfer from yield vault */
  amount: number;
}

// ============================================================================
// Credit Events (for webhooks)
// ============================================================================

export type CreditEventType =
  | 'credits.deposited'
  | 'credits.spent'
  | 'credits.low_balance'
  | 'credits.depleted'
  | 'credits.topped_up'
  | 'credits.yield_earned'
  | 'credits.transferred_to_yield'
  | 'credits.transferred_from_yield';

export interface CreditEvent {
  type: CreditEventType;
  accountId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
