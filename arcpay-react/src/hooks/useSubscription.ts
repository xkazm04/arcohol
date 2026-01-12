import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  Plan,
  Subscription,
  SubscriptionStatus,
  UsageData,
  BillingRecord,
} from '../components/subscription/types';

/**
 * Subscription options
 */
export interface UseSubscriptionOptions {
  customerId: string;
  plans: Plan[];
  subscription?: Subscription;
  usage?: UsageData[];
  history?: BillingRecord[];
  onUpgrade?: (planId: string) => Promise<void>;
  onDowngrade?: (planId: string) => Promise<void>;
  onCancel?: () => Promise<void>;
  onReactivate?: () => Promise<void>;
}

/**
 * Subscription return type
 */
export interface UseSubscriptionReturn {
  // Current state
  subscription: Subscription | null;
  currentPlan: Plan | null;
  plans: Plan[];

  // Usage and history
  usage: UsageData[];
  history: BillingRecord[];

  // Derived state
  isActive: boolean;
  isCancelled: boolean;
  willCancel: boolean;
  daysUntilRenewal: number | null;

  // Loading states
  isLoading: boolean;
  isUpgrading: boolean;
  isDowngrading: boolean;
  isCancelling: boolean;

  // Error
  error: Error | null;

  // Actions
  upgrade: (planId: string) => Promise<void>;
  downgrade: (planId: string) => Promise<void>;
  cancel: () => Promise<void>;
  reactivate: () => Promise<void>;
  refresh: () => Promise<void>;

  // Helpers
  canUpgradeTo: (planId: string) => boolean;
  canDowngradeTo: (planId: string) => boolean;
  getPlanById: (planId: string) => Plan | undefined;
}

/**
 * Headless subscription hook
 */
export function useSubscription(options: UseSubscriptionOptions): UseSubscriptionReturn {
  const {
    customerId,
    plans,
    subscription: providedSubscription,
    usage: providedUsage = [],
    history: providedHistory = [],
    onUpgrade,
    onDowngrade,
    onCancel,
    onReactivate,
  } = options;

  // State
  const [subscription, setSubscription] = useState<Subscription | null>(
    providedSubscription || null
  );
  const [usage, setUsage] = useState<UsageData[]>(providedUsage);
  const [history, setHistory] = useState<BillingRecord[]>(providedHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update from props
  useEffect(() => {
    if (providedSubscription) {
      setSubscription(providedSubscription);
    }
  }, [providedSubscription]);

  useEffect(() => {
    setUsage(providedUsage);
  }, [providedUsage]);

  useEffect(() => {
    setHistory(providedHistory);
  }, [providedHistory]);

  // Current plan
  const currentPlan = useMemo(() => {
    if (!subscription) return null;
    return plans.find((p) => p.id === subscription.planId) || null;
  }, [subscription, plans]);

  // Derived state
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isCancelled = subscription?.status === 'cancelled';
  const willCancel = subscription?.cancelAtPeriodEnd ?? false;

  const daysUntilRenewal = useMemo(() => {
    if (!subscription || !isActive) return null;
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [subscription, isActive]);

  // Get plan by ID
  const getPlanById = useCallback(
    (planId: string) => plans.find((p) => p.id === planId),
    [plans]
  );

  // Check if can upgrade/downgrade
  const canUpgradeTo = useCallback(
    (planId: string): boolean => {
      if (!currentPlan) return true;
      const targetPlan = getPlanById(planId);
      if (!targetPlan) return false;
      return targetPlan.price > currentPlan.price;
    },
    [currentPlan, getPlanById]
  );

  const canDowngradeTo = useCallback(
    (planId: string): boolean => {
      if (!currentPlan) return false;
      const targetPlan = getPlanById(planId);
      if (!targetPlan) return false;
      return targetPlan.price < currentPlan.price;
    },
    [currentPlan, getPlanById]
  );

  // Upgrade
  const upgrade = useCallback(
    async (planId: string) => {
      if (!canUpgradeTo(planId)) {
        throw new Error('Cannot upgrade to this plan');
      }

      setIsUpgrading(true);
      setError(null);

      try {
        await onUpgrade?.(planId);

        // Update local state
        if (subscription) {
          setSubscription({
            ...subscription,
            planId,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Upgrade failed'));
        throw err;
      } finally {
        setIsUpgrading(false);
      }
    },
    [subscription, canUpgradeTo, onUpgrade]
  );

  // Downgrade
  const downgrade = useCallback(
    async (planId: string) => {
      if (!canDowngradeTo(planId)) {
        throw new Error('Cannot downgrade to this plan');
      }

      setIsDowngrading(true);
      setError(null);

      try {
        await onDowngrade?.(planId);

        // Update local state
        if (subscription) {
          setSubscription({
            ...subscription,
            planId,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Downgrade failed'));
        throw err;
      } finally {
        setIsDowngrading(false);
      }
    },
    [subscription, canDowngradeTo, onDowngrade]
  );

  // Cancel
  const cancel = useCallback(async () => {
    if (!subscription || isCancelled) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      await onCancel?.();

      // Update local state
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Cancellation failed'));
      throw err;
    } finally {
      setIsCancelling(false);
    }
  }, [subscription, isCancelled, onCancel]);

  // Reactivate
  const reactivate = useCallback(async () => {
    if (!subscription || !willCancel) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onReactivate?.();

      // Update local state
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Reactivation failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, willCancel, onReactivate]);

  // Refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In real implementation, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Would update subscription, usage, history here
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Refresh failed'));
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  return {
    // State
    subscription,
    currentPlan,
    plans,
    usage,
    history,

    // Derived
    isActive,
    isCancelled,
    willCancel,
    daysUntilRenewal,

    // Loading
    isLoading,
    isUpgrading,
    isDowngrading,
    isCancelling,

    // Error
    error,

    // Actions
    upgrade,
    downgrade,
    cancel,
    reactivate,
    refresh,

    // Helpers
    canUpgradeTo,
    canDowngradeTo,
    getPlanById,
  };
}
