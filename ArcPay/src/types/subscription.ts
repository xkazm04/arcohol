/**
 * Subscription types for @arcpay/react
 */

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

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: string;
  currency: string;
  interval: SubscriptionInterval;
  intervalCount: number;
  trialDays: number;
  active: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface Subscription {
  id: string;
  planId: string;
  plan?: SubscriptionPlan;
  customerId?: string;
  customerWallet: string;
  merchantWallet: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  pausedAt?: Date;
  resumesAt?: Date;
  approvalTxHash?: string;
  lastPaymentAt?: Date;
  nextPaymentAt?: Date;
  failedPaymentCount: number;
  metadata?: Record<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionIntent {
  id: string;
  planId: string;
  plan: SubscriptionPlan;
  customerWallet: string;
  merchantWallet: string;
  approvalAmount: string;  // Total approval needed
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: Date;
  clientSecret: string;
  createdAt: Date;
}

export interface CreateSubscriptionIntentParams {
  planId: string;
  customerWallet?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ApproveSubscriptionParams {
  subscriptionIntentId: string;
  walletAddress: string;
}

export interface SubscriptionApprovalResult {
  success: boolean;
  subscription?: Subscription;
  txHash?: string;
  error?: string;
}

// Subscription management actions
export type SubscriptionAction = 'cancel' | 'pause' | 'resume' | 'reactivate';

export interface ManageSubscriptionParams {
  subscriptionId: string;
  action: SubscriptionAction;
  cancelAtPeriodEnd?: boolean;
  resumesAt?: Date;
  reason?: string;
}

export interface ManageSubscriptionResult {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

// Plan selection
export interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  selectedPlanId?: string;
  onSelect: (plan: SubscriptionPlan) => void;
  showTrialBadge?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

// Subscription card props
export interface SubscriptionCardProps {
  subscription: Subscription;
  onManage?: (action: SubscriptionAction) => void;
  showActions?: boolean;
  className?: string;
}

// Checkout props
export interface SubscriptionCheckoutProps {
  plan: SubscriptionPlan;
  onSuccess?: (subscription: Subscription) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}
