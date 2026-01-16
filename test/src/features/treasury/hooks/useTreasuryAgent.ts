import { useState, useEffect, useCallback } from 'react';
import type {
  TreasuryAgentConfig,
  TreasuryAgentAction,
  UpdateAgentConfigParams,
  TriggerActionParams,
  ChainEnvironment,
} from '../types';

interface UseTreasuryAgentResult {
  // Config
  config: TreasuryAgentConfig | null;
  isLoading: boolean;
  error: Error | null;
  noApiKey: boolean;
  noOrganization: boolean;
  refetch: () => Promise<void>;

  // Update config
  updateConfig: (params: UpdateAgentConfigParams) => Promise<TreasuryAgentConfig | null>;
  isUpdating: boolean;
  updateError: Error | null;

  // Toggle agent
  toggleAgent: (enabled: boolean) => Promise<TreasuryAgentConfig | null>;

  // Actions
  actions: TreasuryAgentAction[];
  actionsLoading: boolean;
  fetchActions: (limit?: number) => Promise<void>;

  // Manual trigger
  triggerAction: (params: TriggerActionParams) => Promise<TreasuryAgentAction | null>;
  isTriggering: boolean;
  triggerError: Error | null;
}

export function useTreasuryAgent(chain: ChainEnvironment): UseTreasuryAgentResult {
  // Config state
  const [config, setConfig] = useState<TreasuryAgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);
  const [noOrganization, setNoOrganization] = useState(false);

  // Update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Actions state
  const [actions, setActions] = useState<TreasuryAgentAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);

  // Trigger state
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<Error | null>(null);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNoApiKey(false);
      setNoOrganization(false);

      const response = await fetch(`/api/treasury/agent?chain=${chain}`);

      if (!response.ok) {
        const errorData = await response.json();
        // Handle "Organization not found" gracefully instead of throwing
        if (errorData.error === 'Organization not found' || response.status === 404) {
          setNoOrganization(true);
          setConfig(null);
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch agent config');
      }

      const data = await response.json();

      if (data.noApiKey) {
        setNoApiKey(true);
        setConfig(null);
        return;
      }

      if (data.noOrganization) {
        setNoOrganization(true);
        setConfig(null);
        return;
      }

      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [chain]);

  // Update config
  const updateConfig = useCallback(async (params: UpdateAgentConfigParams): Promise<TreasuryAgentConfig | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch('/api/treasury/agent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, chain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent config');
      }

      const data = await response.json();
      setConfig(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setUpdateError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [chain]);

  // Toggle agent
  const toggleAgent = useCallback(async (enabled: boolean): Promise<TreasuryAgentConfig | null> => {
    return updateConfig({ enabled });
  }, [updateConfig]);

  // Fetch actions
  const fetchActions = useCallback(async (limit = 20) => {
    try {
      setActionsLoading(true);

      const response = await fetch(`/api/treasury/agent/actions?chain=${chain}&limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json();
        // Silently handle organization not found - config fetch will show the modal
        if (errorData.error === 'Organization not found' || response.status === 404) {
          setActions([]);
          return;
        }
        console.error('Failed to fetch actions:', errorData.error);
        return;
      }

      const data = await response.json();
      setActions(data);
    } catch (err) {
      console.error('Failed to fetch actions:', err);
    } finally {
      setActionsLoading(false);
    }
  }, [chain]);

  // Trigger manual action
  const triggerAction = useCallback(async (params: TriggerActionParams): Promise<TreasuryAgentAction | null> => {
    try {
      setIsTriggering(true);
      setTriggerError(null);

      const response = await fetch('/api/treasury/agent/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, chain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger action');
      }

      const data = await response.json();
      setActions(prev => [data, ...prev]);

      // Refetch config to update stats
      await fetchConfig();

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setTriggerError(error);
      return null;
    } finally {
      setIsTriggering(false);
    }
  }, [chain, fetchConfig]);

  // Initial load
  useEffect(() => {
    fetchConfig();
    fetchActions();
  }, [fetchConfig, fetchActions]);

  return {
    config,
    isLoading,
    error,
    noApiKey,
    noOrganization,
    refetch: fetchConfig,
    updateConfig,
    isUpdating,
    updateError,
    toggleAgent,
    actions,
    actionsLoading,
    fetchActions,
    triggerAction,
    isTriggering,
    triggerError,
  };
}
