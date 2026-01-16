import { useState, useEffect, useCallback } from 'react';
import type { TreasuryStats, ChainEnvironment } from '../types';

interface UseTreasuryStatsResult {
  stats: TreasuryStats | null;
  isLoading: boolean;
  error: Error | null;
  noApiKey: boolean;
  noOrganization: boolean;
  refetch: () => Promise<void>;
}

export function useTreasuryStats(chain: ChainEnvironment): UseTreasuryStatsResult {
  const [stats, setStats] = useState<TreasuryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);
  const [noOrganization, setNoOrganization] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNoApiKey(false);
      setNoOrganization(false);

      const response = await fetch(`/api/treasury/stats?chain=${chain}`);

      if (!response.ok) {
        const errorData = await response.json();
        // Handle "Organization not found" gracefully
        if (errorData.error === 'Organization not found' || response.status === 404) {
          setNoOrganization(true);
          setStats(null);
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch treasury stats');
      }

      const data = await response.json();

      // Check if no API key response
      if (data.noApiKey) {
        setNoApiKey(true);
        setStats(null);
        return;
      }

      // Check if no organization
      if (data.noOrganization) {
        setNoOrganization(true);
        setStats(null);
        return;
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [chain]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    noApiKey,
    noOrganization,
    refetch: fetchStats,
  };
}
