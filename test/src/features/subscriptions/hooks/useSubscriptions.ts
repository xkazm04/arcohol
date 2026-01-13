import { useState, useEffect, useCallback } from 'react';
import type {
  Subscription,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CancelSubscriptionParams,
  PauseSubscriptionParams,
  ListSubscriptionsParams,
  SubscriptionEvent,
  SubscriptionInvoice,
} from '../types';

interface UseSubscriptionsResult {
  // Subscriptions
  subscriptions: Subscription[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Single subscription
  getSubscription: (id: string) => Promise<{
    subscription: Subscription;
    events: SubscriptionEvent[];
    invoices: SubscriptionInvoice[];
  } | null>;
  isFetchingSingle: boolean;

  // Create
  createSubscription: (params: CreateSubscriptionParams) => Promise<Subscription | null>;
  isCreating: boolean;
  createError: Error | null;

  // Update
  updateSubscription: (id: string, params: UpdateSubscriptionParams) => Promise<Subscription | null>;
  isUpdating: boolean;
  updateError: Error | null;

  // Cancel
  cancelSubscription: (id: string, params?: CancelSubscriptionParams) => Promise<Subscription | null>;
  isCanceling: boolean;
  cancelError: Error | null;

  // Pause
  pauseSubscription: (id: string, params?: PauseSubscriptionParams) => Promise<Subscription | null>;
  isPausing: boolean;
  pauseError: Error | null;

  // Resume
  resumeSubscription: (id: string) => Promise<Subscription | null>;
  isResuming: boolean;
  resumeError: Error | null;
}

export function useSubscriptions(params?: ListSubscriptionsParams): UseSubscriptionsResult {
  // List state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Single fetch state
  const [isFetchingSingle, setIsFetchingSingle] = useState(false);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  // Update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Cancel state
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  // Pause state
  const [isPausing, setIsPausing] = useState(false);
  const [pauseError, setPauseError] = useState<Error | null>(null);

  // Resume state
  const [isResuming, setIsResuming] = useState(false);
  const [resumeError, setResumeError] = useState<Error | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.planId) searchParams.set('planId', params.planId);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));

      const response = await fetch(`/api/subscriptions?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.customerId, params?.planId, params?.limit, params?.offset]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getSubscription = useCallback(async (id: string) => {
    try {
      setIsFetchingSingle(true);

      const response = await fetch(`/api/subscriptions/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subscription');
      }

      const data = await response.json();
      return {
        subscription: data.subscription,
        events: data.events,
        invoices: data.invoices,
      };
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    } finally {
      setIsFetchingSingle(false);
    }
  }, []);

  const createSubscription = useCallback(async (createParams: CreateSubscriptionParams): Promise<Subscription | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => [data.subscription, ...prev]);
      setTotal((prev) => prev + 1);
      return data.subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCreateError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateSubscription = useCallback(async (id: string, updateParams: UpdateSubscriptionParams): Promise<Subscription | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data.subscription } : s)));
      return data.subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setUpdateError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (id: string, cancelParams?: CancelSubscriptionParams): Promise<Subscription | null> => {
    try {
      setIsCanceling(true);
      setCancelError(null);

      const response = await fetch(`/api/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelParams || {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data.subscription } : s)));
      return data.subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCancelError(error);
      return null;
    } finally {
      setIsCanceling(false);
    }
  }, []);

  const pauseSubscription = useCallback(async (id: string, pauseParams?: PauseSubscriptionParams): Promise<Subscription | null> => {
    try {
      setIsPausing(true);
      setPauseError(null);

      const response = await fetch(`/api/subscriptions/${id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pauseParams || {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pause subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data.subscription } : s)));
      return data.subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setPauseError(error);
      return null;
    } finally {
      setIsPausing(false);
    }
  }, []);

  const resumeSubscription = useCallback(async (id: string): Promise<Subscription | null> => {
    try {
      setIsResuming(true);
      setResumeError(null);

      const response = await fetch(`/api/subscriptions/${id}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume subscription');
      }

      const data = await response.json();
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data.subscription } : s)));
      return data.subscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setResumeError(error);
      return null;
    } finally {
      setIsResuming(false);
    }
  }, []);

  return {
    subscriptions,
    total,
    isLoading,
    error,
    refetch: fetchSubscriptions,
    getSubscription,
    isFetchingSingle,
    createSubscription,
    isCreating,
    createError,
    updateSubscription,
    isUpdating,
    updateError,
    cancelSubscription,
    isCanceling,
    cancelError,
    pauseSubscription,
    isPausing,
    pauseError,
    resumeSubscription,
    isResuming,
    resumeError,
  };
}
