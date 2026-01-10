/**
 * Subscription hooks for @arcpay/react
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionIntent,
  SubscriptionAction,
  SubscriptionApprovalResult,
  ManageSubscriptionResult,
} from '../types/subscription';
import { useWallet } from './useWallet';

interface UseSubscriptionConfig {
  apiUrl?: string;
  apiKey?: string;
  onError?: (error: Error) => void;
  /**
   * Function to send a transaction (for approving subscriptions)
   * This should be provided by the wallet integration
   */
  sendTransaction?: (params: { to: string; data: string }) => Promise<string | null>;
}

interface UseSubscriptionReturn {
  // State
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchSubscriptions: () => Promise<void>;
  getSubscription: (id: string) => Promise<Subscription | null>;
  createSubscriptionIntent: (planId: string, metadata?: Record<string, unknown>) => Promise<SubscriptionIntent | null>;
  approveSubscription: (intentId: string) => Promise<SubscriptionApprovalResult>;
  cancelSubscription: (id: string, cancelAtPeriodEnd?: boolean) => Promise<ManageSubscriptionResult>;
  pauseSubscription: (id: string, resumesAt?: Date) => Promise<ManageSubscriptionResult>;
  resumeSubscription: (id: string) => Promise<ManageSubscriptionResult>;
  reactivateSubscription: (id: string) => Promise<ManageSubscriptionResult>;
}

const DEFAULT_API_URL = 'https://api.arcpay.io/v1';

export function useSubscription(config?: UseSubscriptionConfig): UseSubscriptionReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { address, isConnected } = useWallet();
  const sendTransaction = config?.sendTransaction;

  const apiUrl = config?.apiUrl || DEFAULT_API_URL;

  const handleError = useCallback((err: Error) => {
    setError(err);
    config?.onError?.(err);
  }, [config]);

  const apiRequest = useCallback(async <T>(
    path: string,
    options?: RequestInit
  ): Promise<T | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config?.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [apiUrl, config?.apiKey, handleError]);

  // Fetch all subscriptions for the connected wallet
  const fetchSubscriptions = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<{ data: Subscription[] }>(
        `/subscriptions?customer_wallet=${address}`
      );

      if (data) {
        setSubscriptions(Array.isArray(data) ? data : data.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, apiRequest]);

  // Get a single subscription
  const getSubscription = useCallback(async (id: string): Promise<Subscription | null> => {
    return apiRequest<Subscription>(`/subscriptions/${id}`);
  }, [apiRequest]);

  // Create a subscription intent (server-side, returned to client)
  const createSubscriptionIntent = useCallback(async (
    planId: string,
    metadata?: Record<string, unknown>
  ): Promise<SubscriptionIntent | null> => {
    if (!address) {
      handleError(new Error('Wallet not connected'));
      return null;
    }

    return apiRequest<SubscriptionIntent>('/subscription_intents', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        customer_wallet: address,
        metadata,
      }),
    });
  }, [address, apiRequest, handleError]);

  // Approve a subscription (sign the token approval)
  const approveSubscription = useCallback(async (
    intentId: string
  ): Promise<SubscriptionApprovalResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!sendTransaction) {
      return { success: false, error: 'sendTransaction function not provided in config' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the subscription intent details
      const intent = await apiRequest<SubscriptionIntent>(`/subscription_intents/${intentId}`);

      if (!intent) {
        return { success: false, error: 'Subscription intent not found' };
      }

      // Request token approval from the user's wallet
      // This would be an ERC20 approve transaction for the subscription amount
      const approvalTx = await sendTransaction({
        to: intent.merchantWallet,
        data: encodeApprovalData(intent.merchantWallet, intent.approvalAmount),
      });

      if (!approvalTx) {
        return { success: false, error: 'User rejected approval' };
      }

      // Confirm the subscription with the signed approval
      const subscription = await apiRequest<Subscription>(`/subscription_intents/${intentId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          approval_tx_hash: approvalTx,
        }),
      });

      if (subscription) {
        // Refresh subscriptions list
        await fetchSubscriptions();
        return { success: true, subscription, txHash: approvalTx };
      }

      return { success: false, error: 'Failed to confirm subscription' };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [address, sendTransaction, apiRequest, fetchSubscriptions]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (
    id: string,
    cancelAtPeriodEnd = true
  ): Promise<ManageSubscriptionResult> => {
    setIsLoading(true);

    try {
      const subscription = await apiRequest<Subscription>(`/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
      });

      if (subscription) {
        await fetchSubscriptions();
        return { success: true, subscription };
      }

      return { success: false, error: 'Failed to cancel subscription' };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchSubscriptions]);

  // Pause subscription
  const pauseSubscription = useCallback(async (
    id: string,
    resumesAt?: Date
  ): Promise<ManageSubscriptionResult> => {
    setIsLoading(true);

    try {
      const subscription = await apiRequest<Subscription>(`/subscriptions/${id}/pause`, {
        method: 'POST',
        body: JSON.stringify({ resumes_at: resumesAt?.toISOString() }),
      });

      if (subscription) {
        await fetchSubscriptions();
        return { success: true, subscription };
      }

      return { success: false, error: 'Failed to pause subscription' };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchSubscriptions]);

  // Resume subscription
  const resumeSubscription = useCallback(async (id: string): Promise<ManageSubscriptionResult> => {
    setIsLoading(true);

    try {
      const subscription = await apiRequest<Subscription>(`/subscriptions/${id}/resume`, {
        method: 'POST',
      });

      if (subscription) {
        await fetchSubscriptions();
        return { success: true, subscription };
      }

      return { success: false, error: 'Failed to resume subscription' };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchSubscriptions]);

  // Reactivate canceled subscription
  const reactivateSubscription = useCallback(async (id: string): Promise<ManageSubscriptionResult> => {
    setIsLoading(true);

    try {
      const subscription = await apiRequest<Subscription>(`/subscriptions/${id}/reactivate`, {
        method: 'POST',
      });

      if (subscription) {
        await fetchSubscriptions();
        return { success: true, subscription };
      }

      return { success: false, error: 'Failed to reactivate subscription' };
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchSubscriptions]);

  // Auto-fetch subscriptions when wallet connects
  useEffect(() => {
    if (address) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
    }
  }, [address, fetchSubscriptions]);

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    getSubscription,
    createSubscriptionIntent,
    approveSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    reactivateSubscription,
  };
}

// Helper: Encode ERC20 approve function data
function encodeApprovalData(spender: string, amount: string): string {
  // ERC20 approve(address spender, uint256 amount)
  // Function selector: 0x095ea7b3
  const selector = '0x095ea7b3';
  const paddedSpender = spender.slice(2).padStart(64, '0');
  const paddedAmount = BigInt(amount).toString(16).padStart(64, '0');
  return `${selector}${paddedSpender}${paddedAmount}`;
}

/**
 * Hook to fetch subscription plans
 */
export function useSubscriptionPlans(config?: UseSubscriptionConfig) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const apiUrl = config?.apiUrl || DEFAULT_API_URL;

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config?.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(`${apiUrl}/plans?active=true`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, config?.apiKey]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, isLoading, error, refetch: fetchPlans };
}

export default useSubscription;
