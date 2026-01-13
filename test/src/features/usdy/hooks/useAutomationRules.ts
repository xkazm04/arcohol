import { useState, useEffect, useCallback } from 'react';
import type {
  AutomationRule,
  AutomationLog,
  CreateAutomationRuleParams,
  UpdateAutomationRuleParams,
} from '../types';

interface UseAutomationRulesResult {
  // Rules
  rules: AutomationRule[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Create
  createRule: (params: CreateAutomationRuleParams) => Promise<AutomationRule | null>;
  isCreating: boolean;
  createError: Error | null;

  // Update
  updateRule: (id: string, params: UpdateAutomationRuleParams) => Promise<AutomationRule | null>;
  isUpdating: boolean;
  updateError: Error | null;

  // Delete
  deleteRule: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  deleteError: Error | null;

  // Toggle
  toggleRule: (id: string, enabled: boolean) => Promise<AutomationRule | null>;

  // Trigger
  triggerRule: (id: string, amount?: number) => Promise<AutomationLog | null>;
  isTriggering: boolean;
  triggerError: Error | null;
}

export function useAutomationRules(): UseAutomationRulesResult {
  // Rules state
  const [rules, setRules] = useState<AutomationRule[]>([]);
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

  // Trigger state
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<Error | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/usdy/automation-rules');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch rules');
      }

      const data = await response.json();
      setRules(data.rules);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(async (params: CreateAutomationRuleParams): Promise<AutomationRule | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch('/api/usdy/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create rule');
      }

      const data = await response.json();
      setRules((prev) => [data.rule, ...prev]);
      return data.rule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCreateError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateRule = useCallback(async (id: string, params: UpdateAutomationRuleParams): Promise<AutomationRule | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch(`/api/usdy/automation-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update rule');
      }

      const data = await response.json();
      setRules((prev) => prev.map((r) => (r.id === id ? data.rule : r)));
      return data.rule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setUpdateError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/usdy/automation-rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete rule');
      }

      setRules((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setDeleteError(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const toggleRule = useCallback(async (id: string, enabled: boolean): Promise<AutomationRule | null> => {
    return updateRule(id, { enabled });
  }, [updateRule]);

  const triggerRule = useCallback(async (id: string, amount?: number): Promise<AutomationLog | null> => {
    try {
      setIsTriggering(true);
      setTriggerError(null);

      const response = await fetch(`/api/usdy/automation-rules/${id}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger rule');
      }

      const data = await response.json();

      // Update rule stats locally
      setRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                totalDeposited: r.totalDeposited + data.log.amount,
                executionCount: r.executionCount + 1,
                lastTriggeredAt: data.log.timestamp,
              }
            : r
        )
      );

      return data.log;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setTriggerError(error);
      return null;
    } finally {
      setIsTriggering(false);
    }
  }, []);

  return {
    rules,
    isLoading,
    error,
    refetch: fetchRules,
    createRule,
    isCreating,
    createError,
    updateRule,
    isUpdating,
    updateError,
    deleteRule,
    isDeleting,
    deleteError,
    toggleRule,
    triggerRule,
    isTriggering,
    triggerError,
  };
}
