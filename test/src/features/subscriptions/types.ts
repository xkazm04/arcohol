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
