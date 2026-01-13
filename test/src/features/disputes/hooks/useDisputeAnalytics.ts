'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  amount: number;
  winRate: number;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  count: number;
  amount: number;
  resolved: number;
  winRate: number;
}

export interface DisputeAnalytics {
  summary: {
    totalDisputes: number;
    openDisputes: number;
    resolvedDisputes: number;
    disputes30d: number;
    disputes7d: number;
    disputeRateChange: number;
  };
  financial: {
    totalAmount: number;
    openAmount: number;
    atRiskAmount: number;
    recoveredAmount: number;
    lostAmount: number;
    avgDisputeAmount: number;
  };
  performance: {
    winRate: number;
    winRateChange: number;
    avgResolutionDays: number;
    overdueResponses: number;
  };
  ai: {
    accuracy: number;
    avgConfidence: number;
    overrideRate: number;
    recommendations: {
      approve: number;
      deny: number;
      escalate: number;
    };
    totalEvaluated: number;
  };
  categoryBreakdown: CategoryBreakdown[];
  statusBreakdown: Record<string, number>;
  monthlyTrend: MonthlyTrend[];
  topIssues: CategoryBreakdown[];
}

export function useDisputeAnalytics() {
  const [analytics, setAnalytics] = useState<DisputeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/disputes/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching dispute analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
