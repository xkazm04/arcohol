/**
 * useGatewayConfig Hook
 *
 * Hook for managing x402 Gateway seller configuration.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  GatewayConfig,
  CreateGatewayConfigParams,
  UpdateGatewayConfigParams,
} from '../types';

export interface UseGatewayConfigReturn {
  config: GatewayConfig | null;
  isLoading: boolean;
  error: string | null;
  createConfig: (params: CreateGatewayConfigParams) => Promise<GatewayConfig>;
  updateConfig: (params: UpdateGatewayConfigParams) => Promise<GatewayConfig>;
  enableGateway: () => Promise<void>;
  disableGateway: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGatewayConfig(): UseGatewayConfigReturn {
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch configuration
  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConfig(null);
        return;
      }

      const { data: profile } = await supabase
        .from('org_profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.current_organization_id) {
        setConfig(null);
        return;
      }

      // Fetch gateway config
      const { data, error: fetchError } = await supabase
        .from('gateway_configs')
        .select('*')
        .eq('organization_id', profile.current_organization_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        throw fetchError;
      }

      setConfig(data || null);
    } catch (err) {
      console.error('Failed to fetch gateway config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Create configuration
  const createConfig = useCallback(async (params: CreateGatewayConfigParams): Promise<GatewayConfig> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      throw new Error('No organization selected');
    }

    const { data, error: createError } = await supabase
      .from('gateway_configs')
      .insert({
        organization_id: profile.current_organization_id,
        seller_address: params.sellerAddress,
        networks: params.networks || ['eip155:5042002'],
        description: params.description,
        enabled: true,
      })
      .select()
      .single();

    if (createError) throw createError;
    setConfig(data);
    return data;
  }, [supabase]);

  // Update configuration
  const updateConfig = useCallback(async (params: UpdateGatewayConfigParams): Promise<GatewayConfig> => {
    if (!config) throw new Error('No config to update');

    const updates: Partial<GatewayConfig> = {};
    if (params.sellerAddress !== undefined) updates.seller_address = params.sellerAddress;
    if (params.networks !== undefined) updates.networks = params.networks;
    if (params.description !== undefined) updates.description = params.description;
    if (params.enabled !== undefined) updates.enabled = params.enabled;

    const { data, error: updateError } = await supabase
      .from('gateway_configs')
      .update(updates)
      .eq('id', config.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setConfig(data);
    return data;
  }, [config, supabase]);

  // Enable gateway
  const enableGateway = useCallback(async () => {
    await updateConfig({ enabled: true });
  }, [updateConfig]);

  // Disable gateway
  const disableGateway = useCallback(async () => {
    await updateConfig({ enabled: false });
  }, [updateConfig]);

  return {
    config,
    isLoading,
    error,
    createConfig,
    updateConfig,
    enableGateway,
    disableGateway,
    refresh: fetchConfig,
  };
}
