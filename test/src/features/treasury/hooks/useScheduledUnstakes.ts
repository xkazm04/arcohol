import { useState, useEffect, useCallback } from 'react';
import type {
  ScheduledUnstake,
  CreateScheduledUnstakeParams,
  ChainEnvironment,
} from '../types';

interface UseScheduledUnstakesResult {
  // Data
  unstakes: ScheduledUnstake[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Create
  createUnstake: (params: CreateScheduledUnstakeParams) => Promise<ScheduledUnstake | null>;
  isCreating: boolean;
  createError: Error | null;

  // Cancel
  cancelUnstake: (id: string) => Promise<boolean>;
  isCancelling: boolean;
  cancelError: Error | null;
}

export function useScheduledUnstakes(chain: ChainEnvironment): UseScheduledUnstakesResult {
  // Data state
  const [unstakes, setUnstakes] = useState<ScheduledUnstake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  // Cancel state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  // Fetch scheduled unstakes
  const fetchUnstakes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/treasury/agent/scheduled-unstakes?chain=${chain}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch scheduled unstakes');
      }

      const data = await response.json();
      setUnstakes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [chain]);

  // Create scheduled unstake
  const createUnstake = useCallback(async (params: CreateScheduledUnstakeParams): Promise<ScheduledUnstake | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch('/api/treasury/agent/scheduled-unstakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, chain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create scheduled unstake');
      }

      const data = await response.json();
      setUnstakes(prev => [...prev, data].sort((a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      ));
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCreateError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [chain]);

  // Cancel scheduled unstake
  const cancelUnstake = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsCancelling(true);
      setCancelError(null);

      const response = await fetch(`/api/treasury/agent/scheduled-unstakes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel scheduled unstake');
      }

      setUnstakes(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCancelError(error);
      return false;
    } finally {
      setIsCancelling(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUnstakes();
  }, [fetchUnstakes]);

  return {
    unstakes,
    isLoading,
    error,
    refetch: fetchUnstakes,
    createUnstake,
    isCreating,
    createError,
    cancelUnstake,
    isCancelling,
    cancelError,
  };
}
