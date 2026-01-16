'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  DisputeProtectionConfig,
  UpdateDisputeProtectionParams,
  DeliveryProofRule,
} from '../types';

interface UseDisputeConfigResult {
  // Protection config
  config: DisputeProtectionConfig | null;
  isLoading: boolean;
  error: string | null;
  noApiKey: boolean;
  refetch: () => Promise<void>;

  // Update config
  updateConfig: (params: UpdateDisputeProtectionParams) => Promise<DisputeProtectionConfig | null>;
  isUpdating: boolean;
  updateError: string | null;

  // Toggle protection
  toggleProtection: (enabled: boolean) => Promise<DisputeProtectionConfig | null>;

  // Delivery proof rules (future expansion)
  deliveryRules: DeliveryProofRule[];
  rulesLoading: boolean;
}

export function useDisputeConfig(): UseDisputeConfigResult {
  // Config state
  const [config, setConfig] = useState<DisputeProtectionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  // Update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delivery rules state
  const [deliveryRules, setDeliveryRules] = useState<DeliveryProofRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Fetch config
  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNoApiKey(false);

      const response = await fetch('/api/disputes/config');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dispute config');
      }

      const data = await response.json();

      if (data.noApiKey) {
        setNoApiKey(true);
        setConfig(null);
        return;
      }

      setConfig(data);
    } catch (err) {
      console.error('Error fetching dispute config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update config
  const updateConfig = useCallback(async (params: UpdateDisputeProtectionParams): Promise<DisputeProtectionConfig | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch('/api/disputes/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dispute config');
      }

      const data = await response.json();
      setConfig(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update configuration';
      setUpdateError(errorMsg);
      console.error('Error updating dispute config:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Toggle protection (convenience method)
  const toggleProtection = useCallback(async (enabled: boolean): Promise<DisputeProtectionConfig | null> => {
    return updateConfig({ enabled });
  }, [updateConfig]);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    noApiKey,
    refetch: fetchConfig,
    updateConfig,
    isUpdating,
    updateError,
    toggleProtection,
    deliveryRules,
    rulesLoading,
  };
}
