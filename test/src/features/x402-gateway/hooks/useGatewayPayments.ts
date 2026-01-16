/**
 * useGatewayPayments Hook
 *
 * Hook for fetching x402 Gateway payment history.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GatewayPayment, GatewayStats } from '../types';

export interface UseGatewayPaymentsParams {
  limit?: number;
  network?: string;
  payer?: string;
}

export interface UseGatewayPaymentsReturn {
  payments: GatewayPayment[];
  stats: GatewayStats | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGatewayPayments(params: UseGatewayPaymentsParams = {}): UseGatewayPaymentsReturn {
  const { limit = 20, network, payer } = params;

  const [payments, setPayments] = useState<GatewayPayment[]>([]);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch payments
  const fetchPayments = useCallback(async (append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPayments([]);
        return;
      }

      const { data: profile } = await supabase
        .from('org_profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.current_organization_id) {
        setPayments([]);
        return;
      }

      // Build query
      let query = supabase
        .from('gateway_payments')
        .select('*, endpoint:gateway_endpoint_pricing(*)')
        .eq('organization_id', profile.current_organization_id)
        .order('created_at', { ascending: false })
        .limit(limit + 1);

      if (network) {
        query = query.eq('network', network);
      }

      if (payer) {
        query = query.eq('payer', payer);
      }

      if (append && cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Check if there are more results
      const hasMoreResults = data && data.length > limit;
      setHasMore(hasMoreResults);

      // Remove the extra item we fetched for pagination check
      const paymentsData = hasMoreResults ? data.slice(0, limit) : (data || []);

      if (append) {
        setPayments(prev => [...prev, ...paymentsData]);
      } else {
        setPayments(paymentsData);
      }

      // Update cursor
      if (paymentsData.length > 0) {
        setCursor(paymentsData[paymentsData.length - 1].created_at);
      }
    } catch (err) {
      console.error('Failed to fetch gateway payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, limit, network, payer, cursor]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('org_profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.current_organization_id) return;

      // Get 30-day stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: statsError } = await supabase
        .from('gateway_payments')
        .select('amount, payer, created_at')
        .eq('organization_id', profile.current_organization_id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (statsError) throw statsError;

      // Calculate stats
      const totalPayments = data?.length || 0;
      const totalRevenue = data?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      const uniquePayers = new Set(data?.map(p => p.payer)).size;
      const avgPaymentAmount = totalPayments > 0 ? totalRevenue / totalPayments : 0;

      // Group by day
      const revenueByDay: Record<string, { revenue: number; payments: number }> = {};
      data?.forEach(payment => {
        const date = payment.created_at.split('T')[0];
        if (!revenueByDay[date]) {
          revenueByDay[date] = { revenue: 0, payments: 0 };
        }
        revenueByDay[date].revenue += parseFloat(payment.amount);
        revenueByDay[date].payments += 1;
      });

      setStats({
        totalPayments,
        totalRevenue,
        uniquePayers,
        avgPaymentAmount,
        revenueByDay: Object.entries(revenueByDay).map(([date, data]) => ({
          date,
          ...data,
        })).sort((a, b) => a.date.localeCompare(b.date)),
      });
    } catch (err) {
      console.error('Failed to fetch gateway stats:', err);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPayments(true);
  }, [fetchPayments, hasMore, isLoading]);

  // Refresh
  const refresh = useCallback(async () => {
    setCursor(null);
    await Promise.all([fetchPayments(), fetchStats()]);
  }, [fetchPayments, fetchStats]);

  return {
    payments,
    stats,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
