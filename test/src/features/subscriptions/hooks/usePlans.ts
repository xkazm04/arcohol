import { useState, useEffect, useCallback } from 'react';
import type { SubscriptionPlan, CreatePlanParams, UpdatePlanParams, ListPlansParams } from '../types';

interface UsePlansResult {
  // Plans
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Create
  createPlan: (params: CreatePlanParams) => Promise<SubscriptionPlan | null>;
  isCreating: boolean;
  createError: Error | null;

  // Update
  updatePlan: (id: string, params: UpdatePlanParams) => Promise<SubscriptionPlan | null>;
  isUpdating: boolean;
  updateError: Error | null;

  // Delete/Archive
  deletePlan: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  deleteError: Error | null;

  // Toggle active
  togglePlan: (id: string, active: boolean) => Promise<SubscriptionPlan | null>;
}

export function usePlans(params?: ListPlansParams): UsePlansResult {
  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  // Update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.active !== undefined) {
        searchParams.set('active', String(params.active));
      }

      const response = await fetch(`/api/plans?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [params?.active]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (createParams: CreatePlanParams): Promise<SubscriptionPlan | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      const data = await response.json();
      setPlans((prev) => [data.plan, ...prev]);
      return data.plan;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCreateError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updatePlan = useCallback(async (id: string, updateParams: UpdatePlanParams): Promise<SubscriptionPlan | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      const data = await response.json();
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.plan } : p)));
      return data.plan;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setUpdateError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete plan');
      }

      const data = await response.json();

      if (data.archived) {
        // Plan was archived, update in list
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
      } else {
        // Plan was deleted, remove from list
        setPlans((prev) => prev.filter((p) => p.id !== id));
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setDeleteError(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const togglePlan = useCallback(async (id: string, active: boolean): Promise<SubscriptionPlan | null> => {
    return updatePlan(id, { active });
  }, [updatePlan]);

  return {
    plans,
    isLoading,
    error,
    refetch: fetchPlans,
    createPlan,
    isCreating,
    createError,
    updatePlan,
    isUpdating,
    updateError,
    deletePlan,
    isDeleting,
    deleteError,
    togglePlan,
  };
}
