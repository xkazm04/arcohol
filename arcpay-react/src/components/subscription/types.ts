import type { SupportedCurrency, Money } from '../../theme/types';
import type { PaymentResult } from '../payment/Checkout/types';

/**
 * Subscription plan
 */
export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: SupportedCurrency;
  interval: 'monthly' | 'yearly' | 'weekly' | 'daily';
  features: string[];
  popular?: boolean;
  disabled?: boolean;
  badge?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Active subscription
 */
export interface Subscription {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string;
  createdAt: string;
}

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

/**
 * Usage data
 */
export interface UsageData {
  metric: string;
  used: number;
  limit: number;
  resetDate?: string;
}

/**
 * Billing history item
 */
export interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: Money;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

/**
 * Subscription manager props
 */
export interface SubscriptionManagerProps {
  /** Customer ID */
  customerId: string;

  /** Available plans */
  plans: Plan[];

  /** Current plan ID */
  currentPlan?: string;

  /** Current billing cycle */
  currentBillingCycle?: 'monthly' | 'yearly';

  /** Active subscription (fetched or provided) */
  subscription?: Subscription;

  /** Usage data to display */
  usage?: UsageData[];

  /** Billing history */
  history?: BillingRecord[];

  /** Show usage meters */
  showUsage?: boolean;

  /** Show billing history */
  showHistory?: boolean;

  /** Show billing info */
  showBillingInfo?: boolean;

  /** Allow plan cancellation */
  allowCancellation?: boolean;

  /** Show annual discount toggle */
  showAnnualDiscount?: boolean;

  /** Annual discount percentage */
  annualDiscountPercent?: number;

  /** Callback on plan upgrade */
  onUpgrade?: (planId: string) => Promise<void>;

  /** Callback on plan downgrade */
  onDowngrade?: (planId: string) => Promise<void>;

  /** Callback on cancellation */
  onCancel?: () => Promise<void>;

  /** Callback on reactivation */
  onReactivate?: () => Promise<void>;

  /** Callback on payment method update */
  onPaymentMethodUpdate?: () => Promise<void>;

  /** Additional CSS class */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Plan selector props
 */
export interface PlanSelectorProps {
  plans: Plan[];
  selected?: string;
  onChange: (planId: string) => void;
  showAnnualDiscount?: boolean;
  annualDiscountPercent?: number;
  billingCycle?: 'monthly' | 'yearly';
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;
  layout?: 'grid' | 'list';
  highlightPopular?: boolean;
  currentPlan?: string;
}

/**
 * Plan card props
 */
export interface PlanCardProps {
  plan: Plan;
  isSelected?: boolean;
  isCurrent?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  annualDiscountPercent?: number;
  onClick?: () => void;
}

/**
 * Current plan props
 */
export interface CurrentPlanProps {
  plan: Plan;
  subscription: Subscription;
  onCancel?: () => void;
  onReactivate?: () => void;
  showCancelButton?: boolean;
}

/**
 * Usage display props
 */
export interface UsageDisplayProps {
  usage: UsageData[];
}

/**
 * Billing history props
 */
export interface BillingHistoryProps {
  records: BillingRecord[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}
