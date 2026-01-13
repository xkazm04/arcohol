'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, ApiKey } from '@/lib/supabase/types';

interface UseTransactionsOptions {
  organizationId?: string;
  initialFilters?: TransactionFilters;
}

export interface TransactionFilters {
  apiKeyId?: string;
  type?: Transaction['type'] | 'all';
  status?: Transaction['status'] | 'all';
  chain?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface TransactionStats {
  total: number;
  totalVolume: number;
  completed: number;
  pending: number;
  failed: number;
}

export function useTransactions({ organizationId, initialFilters = {} }: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<'created_at' | 'amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const supabase = createClient();

  // Fetch API keys for filter dropdown
  const fetchApiKeys = useCallback(async () => {
    if (!organizationId) return;

    const { data } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix')
      .eq('organization_id', organizationId)
      .is('revoked_at', null)
      .order('name');

    setApiKeys(data || []);
  }, [organizationId, supabase]);

  const fetchTransactions = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.apiKeyId && filters.apiKeyId !== 'all') {
        query = query.eq('api_key_id', filters.apiKeyId);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.chain) {
        query = query.eq('chain', filters.chain);
      }

      if (filters.search) {
        query = query.or(`reference.ilike.%${filters.search}%,tx_hash.ilike.%${filters.search}%,from_address.ilike.%${filters.search}%,to_address.ilike.%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, supabase, filters, sortBy, sortOrder, page]);

  // Fetch stats (unfiltered for overall view)
  const fetchStats = useCallback(async (): Promise<TransactionStats> => {
    if (!organizationId) {
      return { total: 0, totalVolume: 0, completed: 0, pending: 0, failed: 0 };
    }

    let query = supabase
      .from('transactions')
      .select('status, amount')
      .eq('organization_id', organizationId);

    // Apply API key filter to stats if selected
    if (filters.apiKeyId && filters.apiKeyId !== 'all') {
      query = query.eq('api_key_id', filters.apiKeyId);
    }

    const { data } = await query;

    if (!data) {
      return { total: 0, totalVolume: 0, completed: 0, pending: 0, failed: 0 };
    }

    return {
      total: data.length,
      totalVolume: data.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
      completed: data.filter(t => t.status === 'completed').length,
      pending: data.filter(t => t.status === 'pending' || t.status === 'processing').length,
      failed: data.filter(t => t.status === 'failed').length,
    };
  }, [organizationId, supabase, filters.apiKeyId]);

  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    totalVolume: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchStats().then(setStats);
  }, [fetchStats]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleSort = useCallback((column: 'created_at' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    apiKeys,
    isLoading,
    error,
    stats,
    filters,
    sortBy,
    sortOrder,
    page,
    totalPages,
    totalCount,
    updateFilters,
    clearFilters,
    handleSort,
    setPage,
    refetch: fetchTransactions,
  };
}
