// Main component
export { SubscriptionManager, default } from './SubscriptionManager';

// Sub-components
export { PlanSelector } from './PlanSelector';
export { PlanCard } from './PlanCard';
export { CurrentPlan } from './CurrentPlan';
export { UsageDisplay } from './UsageDisplay';
export { BillingHistory } from './BillingHistory';

// Types
export type {
  Plan,
  Subscription,
  SubscriptionStatus,
  UsageData,
  BillingRecord,
  SubscriptionManagerProps,
  PlanSelectorProps,
  PlanCardProps,
  CurrentPlanProps,
  UsageDisplayProps,
  BillingHistoryProps,
} from './types';
