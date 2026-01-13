'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  CreditAccount,
  CreditEndpoint,
  CreditTransaction,
  UsageStats,
  CreateAccountParams,
  UpdateAccountParams,
  CreateEndpointParams,
  UpdateEndpointParams,
  DepositParams,
} from '../types';

// =====================================================
// Credit Accounts Hook
// =====================================================

export function useCreditAccounts() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (params?: { search?: string; active?: boolean }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.active !== undefined) searchParams.set('active', String(params.active));

      const response = await fetch(`/api/credits/accounts?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }

      setAccounts(data.accounts);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (params: CreateAccountParams) => {
    const response = await fetch('/api/credits/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    await fetchAccounts();
    return data as CreditAccount;
  }, [fetchAccounts]);

  const updateAccount = useCallback(async (accountId: string, params: UpdateAccountParams) => {
    const response = await fetch(`/api/credits/accounts/${accountId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update account');
    }

    await fetchAccounts();
    return data as CreditAccount;
  }, [fetchAccounts]);

  const suspendAccount = useCallback(async (accountId: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.set('reason', reason);

    const response = await fetch(`/api/credits/accounts/${accountId}?${searchParams}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to suspend account');
    }

    await fetchAccounts();
  }, [fetchAccounts]);

  const depositCredits = useCallback(async (accountId: string, params: DepositParams) => {
    const response = await fetch(`/api/credits/accounts/${accountId}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to deposit credits');
    }

    await fetchAccounts();
    return data;
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    total,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    suspendAccount,
    depositCredits,
  };
}

// =====================================================
// Credit Endpoints Hook
// =====================================================

export function useCreditEndpoints() {
  const [endpoints, setEndpoints] = useState<CreditEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async (params?: { active?: boolean }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (params?.active !== undefined) searchParams.set('active', String(params.active));

      const response = await fetch(`/api/credits/endpoints?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch endpoints');
      }

      setEndpoints(data.endpoints);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEndpoint = useCallback(async (params: CreateEndpointParams) => {
    const response = await fetch('/api/credits/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create endpoint');
    }

    await fetchEndpoints();
    return data as CreditEndpoint;
  }, [fetchEndpoints]);

  const updateEndpoint = useCallback(async (endpointId: string, params: UpdateEndpointParams) => {
    const response = await fetch(`/api/credits/endpoints/${endpointId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update endpoint');
    }

    await fetchEndpoints();
    return data as CreditEndpoint;
  }, [fetchEndpoints]);

  const deleteEndpoint = useCallback(async (endpointId: string) => {
    const response = await fetch(`/api/credits/endpoints/${endpointId}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete endpoint');
    }

    await fetchEndpoints();
  }, [fetchEndpoints]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  return {
    endpoints,
    isLoading,
    error,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
  };
}

// =====================================================
// Credit Transactions Hook
// =====================================================

export function useCreditTransactions(accountId?: string) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (params?: { type?: string; limit?: number; offset?: number }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (accountId) searchParams.set('accountId', accountId);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));

      const response = await fetch(`/api/credits/transactions?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    total,
    isLoading,
    error,
    fetchTransactions,
  };
}

// =====================================================
// Usage Stats Hook
// =====================================================

export function useUsageStats(params?: { accountId?: string; endpointId?: string; period?: string }) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (overrideParams?: typeof params) => {
    setIsLoading(true);
    try {
      const finalParams = { ...params, ...overrideParams };
      const searchParams = new URLSearchParams();
      if (finalParams?.accountId) searchParams.set('accountId', finalParams.accountId);
      if (finalParams?.endpointId) searchParams.set('endpointId', finalParams.endpointId);
      if (finalParams?.period) searchParams.set('period', finalParams.period);

      const response = await fetch(`/api/credits/usage?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage stats');
      }

      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}
