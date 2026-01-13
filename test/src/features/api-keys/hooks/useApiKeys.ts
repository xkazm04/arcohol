'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ApiKey } from '@/lib/supabase/types';

interface UseApiKeysOptions {
  organizationId?: string;
}

interface ApiKeyCreateInput {
  name: string;
  permissions: string[];
  wallet_address?: string;
  chain?: string;
}

export interface ApiKeyWithWallet extends ApiKey {
  wallet_address?: string;
  chain?: string;
}

export function useApiKeys({ organizationId }: UseApiKeysOptions = {}) {
  const [apiKeys, setApiKeys] = useState<ApiKeyWithWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchApiKeys = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch API keys
      const { data: keys, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });

      if (keysError) throw keysError;

      setApiKeys(keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, supabase]);

  const createApiKey = useCallback(async (input: ApiKeyCreateInput): Promise<{ key: ApiKey; secretKey: string } | null> => {
    if (!organizationId) return null;

    try {
      // Call the generate_api_key function with wallet pairing parameters
      const { data, error } = await supabase
        .rpc('generate_api_key', {
          p_organization_id: organizationId,
          p_name: input.name,
          p_permissions: input.permissions,
          p_wallet_address: input.wallet_address || null,
          p_chain: input.chain || 'arc',
          p_environment: 'production',
        });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No data returned from generate_api_key');
      }

      // Fetch the newly created key
      const { data: newKey, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', data[0].key_id)
        .single();

      if (fetchError) throw fetchError;

      // Refresh the list
      await fetchApiKeys();

      return {
        key: newKey,
        secretKey: data[0].secret_key,
      };
    } catch (err) {
      console.error('API key creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      return null;
    }
  }, [organizationId, supabase, fetchApiKeys]);

  const revokeApiKey = useCallback(async (keyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId);

      if (error) throw error;

      await fetchApiKeys();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
      return false;
    }
  }, [supabase, fetchApiKeys]);

  const updateApiKey = useCallback(async (keyId: string, updates: Partial<Pick<ApiKey, 'name' | 'permissions'>>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', keyId);

      if (error) throw error;

      await fetchApiKeys();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
      return false;
    }
  }, [supabase, fetchApiKeys]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter(k => !k.revoked_at).length,
    withWallet: apiKeys.filter(k => k.wallet_address).length,
  };

  return {
    apiKeys,
    isLoading,
    error,
    stats,
    createApiKey,
    revokeApiKey,
    updateApiKey,
    refetch: fetchApiKeys,
  };
}
