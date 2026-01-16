// =====================================================
// Subscription Types
// =====================================================

export type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type SubscriptionStatus =
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unpaid'
  | 'expired';

export type SubscriptionInvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

// =====================================================
// Plan Types
// =====================================================

export interface SubscriptionPlan {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: SubscriptionInterval;
  intervalCount: number;
  trialDays: number;
  features: string[];
  active: boolean;
  usageLimits?: Record<string, number>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanParams {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  interval: SubscriptionInterval;
  intervalCount?: number;
  trialDays?: number;
  features?: string[];
  usageLimits?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface UpdatePlanParams {
  name?: string;
  description?: string;
  amount?: number;
  interval?: SubscriptionInterval;
  intervalCount?: number;
  trialDays?: number;
  features?: string[];
  active?: boolean;
  usageLimits?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

// =====================================================
// Subscription Types
// =====================================================

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  plan?: SubscriptionPlan;
  customerId: string;
  customer?: {
    id: string;
    companyName?: string;
    contactName?: string;
    email: string;
  };
  customerWallet: string;
  merchantWallet: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancelReason?: string;
  trialStart?: string;
  trialEnd?: string;
  pausedAt?: string;
  resumesAt?: string;
  pauseReason?: string;
  allowanceAmount?: number;
  allowanceCheckedAt?: string;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
  lastPaymentTxHash?: string;
  nextPaymentAt?: string;
  failedPaymentCount: number;
  lastFailedAt?: string;
  lastFailedReason?: string;
  totalPaid: number;
  invoiceCount: number;
  chain: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionParams {
  planId: string;
  customerId: string;
  customerWallet: string;
  merchantWallet: string;
  chain?: string;
  startTrial?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionParams {
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CancelSubscriptionParams {
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}

export interface PauseSubscriptionParams {
  resumesAt?: string;
  reason?: string;
}

// =====================================================
// Subscription Invoice Types
// =====================================================

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  invoiceId?: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  status: SubscriptionInvoiceStatus;
  dueDate?: string;
  finalizedAt?: string;
  paidAt?: string;
  voidedAt?: string;
  paymentTxHash?: string;
  paymentAttempts: number;
  lastPaymentError?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// =====================================================
// Subscription Event Types
// =====================================================

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  eventType: string;
  data: Record<string, unknown>;
  createdAt: string;
}

// =====================================================
// List/Query Params
// =====================================================

export interface ListPlansParams {
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListSubscriptionsParams {
  status?: SubscriptionStatus;
  customerId?: string;
  planId?: string;
  limit?: number;
  offset?: number;
}

export interface ListSubscriptionInvoicesParams {
  status?: SubscriptionInvoiceStatus;
  limit?: number;
  offset?: number;
}

// =====================================================
// Micropayment Subscription Types (x402)
// =====================================================

export type MicroBillingType = 'per_use' | 'daily' | 'hourly' | 'per_minute';

export interface MicroPlan {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  billingType: MicroBillingType;
  pricePerUnit: string; // e.g., '$0.001' per API call
  unitName: string; // e.g., 'API call', 'minute', 'request'
  minCharge?: string; // Minimum charge per transaction
  maxChargePerDay?: string; // Daily spending cap
  maxChargePerMonth?: string; // Monthly spending cap
  features: string[];
  active: boolean;
  network: string; // x402 network
  sellerAddress: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMicroPlanParams {
  name: string;
  description?: string;
  billingType: MicroBillingType;
  pricePerUnit: string;
  unitName?: string;
  minCharge?: string;
  maxChargePerDay?: string;
  maxChargePerMonth?: string;
  features?: string[];
  network?: string;
  sellerAddress: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMicroPlanParams {
  name?: string;
  description?: string;
  pricePerUnit?: string;
  minCharge?: string;
  maxChargePerDay?: string;
  maxChargePerMonth?: string;
  features?: string[];
  active?: boolean;
  metadata?: Record<string, unknown>;
}

export type MicroSubscriptionStatus = 'active' | 'paused' | 'canceled' | 'depleted';

export interface MicroSubscription {
  id: string;
  organizationId: string;
  microPlanId: string;
  microPlan?: MicroPlan;
  payerAddress: string;
  payerEmail?: string;
  status: MicroSubscriptionStatus;
  totalCharged: string;
  chargeCount: number;
  todayCharged: string;
  monthCharged: string;
  lastChargeAt?: string;
  lastChargeAmount?: string;
  depositBalance?: string; // Gateway deposit balance
  network: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMicroSubscriptionParams {
  microPlanId: string;
  payerAddress: string;
  payerEmail?: string;
  network?: string;
  metadata?: Record<string, unknown>;
}

export interface MicroCharge {
  id: string;
  microSubscriptionId: string;
  amount: string;
  units: number;
  unitPrice: string;
  description?: string;
  batchId?: string;
  status: 'pending' | 'batched' | 'settled' | 'failed';
  signature?: string;
  transaction?: string;
  settledAt?: string;
  createdAt: string;
}

export interface ChargeMicroSubscriptionParams {
  units: number;
  description?: string;
  signature: string;
}

export interface MicroSubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: string;
  totalCharges: number;
  avgChargeAmount: string;
  revenueByDay: Array<{
    date: string;
    revenue: string;
    charges: number;
  }>;
}
