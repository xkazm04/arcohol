/**
 * useMicroSubscriptions Hook
 *
 * Hook for managing x402 micropayment subscriptions.
 * Enables sub-dollar recurring payments via Circle Gateway.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  MicroPlan,
  MicroSubscription,
  MicroCharge,
  MicroSubscriptionStats,
  CreateMicroPlanParams,
  UpdateMicroPlanParams,
  CreateMicroSubscriptionParams,
  ChargeMicroSubscriptionParams,
} from '../types';

export interface UseMicroSubscriptionsParams {
  planId?: string;
  status?: string;
  limit?: number;
}

export interface UseMicroSubscriptionsReturn {
  // Plans
  plans: MicroPlan[];
  plansLoading: boolean;
  plansError: string | null;
  createPlan: (params: CreateMicroPlanParams) => Promise<MicroPlan | null>;
  updatePlan: (id: string, params: UpdateMicroPlanParams) => Promise<MicroPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;

  // Subscriptions
  subscriptions: MicroSubscription[];
  subscriptionsLoading: boolean;
  subscriptionsError: string | null;
  createSubscription: (params: CreateMicroSubscriptionParams) => Promise<MicroSubscription | null>;
  pauseSubscription: (id: string) => Promise<boolean>;
  resumeSubscription: (id: string) => Promise<boolean>;
  cancelSubscription: (id: string) => Promise<boolean>;

  // Charges
  chargeSubscription: (id: string, params: ChargeMicroSubscriptionParams) => Promise<MicroCharge | null>;
  getCharges: (subscriptionId: string) => Promise<MicroCharge[]>;

  // Stats
  stats: MicroSubscriptionStats | null;
  statsLoading: boolean;

  // Actions
  refresh: () => Promise<void>;
}

export function useMicroSubscriptions(
  params: UseMicroSubscriptionsParams = {}
): UseMicroSubscriptionsReturn {
  const { planId, status, limit = 50 } = params;

  // Plans state
  const [plans, setPlans] = useState<MicroPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<MicroSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<MicroSubscriptionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await fetch('/api/subscriptions/micro/plans');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setPlansError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setSubscriptionsLoading(true);
      setSubscriptionsError(null);

      const searchParams = new URLSearchParams();
      if (planId) searchParams.set('planId', planId);
      if (status) searchParams.set('status', status);
      searchParams.set('limit', limit.toString());

      const response = await fetch(`/api/subscriptions/micro?${searchParams.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setSubscriptionsError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setSubscriptionsLoading(false);
    }
  }, [planId, status, limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      const response = await fetch('/api/subscriptions/micro/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch micro subscription stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
    fetchStats();
  }, [fetchPlans, fetchSubscriptions, fetchStats]);

  // Create plan
  const createPlan = useCallback(async (createParams: CreateMicroPlanParams): Promise<MicroPlan | null> => {
    try {
      const response = await fetch('/api/subscriptions/micro/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createParams),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create plan');
      }

      const data = await response.json();
      setPlans((prev) => [data.plan, ...prev]);
      return data.plan;
    } catch (err) {
      console.error('Failed to create micro plan:', err);
      return null;
    }
  }, []);

  // Update plan
  const updatePlan = useCallback(async (id: string, updateParams: UpdateMicroPlanParams): Promise<MicroPlan | null> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateParams),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update plan');
      }

      const data = await response.json();
      setPlans((prev) => prev.map((p) => (p.id === id ? data.plan : p)));
      return data.plan;
    } catch (err) {
      console.error('Failed to update micro plan:', err);
      return null;
    }
  }, []);

  // Delete plan
  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/plans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete plan');
      }

      setPlans((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete micro plan:', err);
      return false;
    }
  }, []);

  // Create subscription
  const createSubscription = useCallback(async (createParams: CreateMicroSubscriptionParams): Promise<MicroSubscription | null> => {
    try {
      const response = await fetch('/api/subscriptions/micro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createParams),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => [data.subscription, ...prev]);
      return data.subscription;
    } catch (err) {
      console.error('Failed to create micro subscription:', err);
      return null;
    }
  }, []);

  // Pause subscription
  const pauseSubscription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/${id}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to pause subscription');
      }

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'paused' as const } : s))
      );
      return true;
    } catch (err) {
      console.error('Failed to pause micro subscription:', err);
      return false;
    }
  }, []);

  // Resume subscription
  const resumeSubscription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/${id}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resume subscription');
      }

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'active' as const } : s))
      );
      return true;
    } catch (err) {
      console.error('Failed to resume micro subscription:', err);
      return false;
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/${id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'canceled' as const } : s))
      );
      return true;
    } catch (err) {
      console.error('Failed to cancel micro subscription:', err);
      return false;
    }
  }, []);

  // Charge subscription
  const chargeSubscription = useCallback(async (
    id: string,
    chargeParams: ChargeMicroSubscriptionParams
  ): Promise<MicroCharge | null> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/${id}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeParams),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to charge subscription');
      }

      const data = await response.json();

      // Update subscription totals
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                chargeCount: s.chargeCount + 1,
                lastChargeAt: new Date().toISOString(),
                lastChargeAmount: data.charge.amount,
              }
            : s
        )
      );

      return data.charge;
    } catch (err) {
      console.error('Failed to charge micro subscription:', err);
      return null;
    }
  }, []);

  // Get charges for a subscription
  const getCharges = useCallback(async (subscriptionId: string): Promise<MicroCharge[]> => {
    try {
      const response = await fetch(`/api/subscriptions/micro/${subscriptionId}/charges`);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.charges || [];
    } catch (err) {
      console.error('Failed to fetch charges:', err);
      return [];
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([fetchPlans(), fetchSubscriptions(), fetchStats()]);
  }, [fetchPlans, fetchSubscriptions, fetchStats]);

  return {
    // Plans
    plans,
    plansLoading,
    plansError,
    createPlan,
    updatePlan,
    deletePlan,

    // Subscriptions
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,

    // Charges
    chargeSubscription,
    getCharges,

    // Stats
    stats,
    statsLoading,

    // Actions
    refresh,
  };
}
