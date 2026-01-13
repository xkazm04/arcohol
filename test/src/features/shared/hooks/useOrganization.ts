'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Organization, OrgProfile } from '@/lib/supabase/types';

interface UseOrganizationReturn {
  organization: Organization | null;
  profile: OrgProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrganization(): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get profile - use maybeSingle() to handle case where profile doesn't exist
      let { data: profileData, error: profileError } = await supabase
        .from('org_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profileData && !profileError) {
        const { data: newProfile, error: insertError } = await supabase
          .from('org_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            onboarding_completed: false,
          })
          .select()
          .single();

        if (insertError) {
          // Profile might already exist (race condition), try fetching again
          const { data: retryProfile } = await supabase
            .from('org_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          profileData = retryProfile;
        } else {
          profileData = newProfile;
        }
      }

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get organization if profile has one
      if (profileData?.current_organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.current_organization_id)
          .maybeSingle();

        if (orgError) throw orgError;
        setOrganization(orgData);
      } else if (profileData) {
        // Try to find an organization owned by this user
        const { data: ownedOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (ownedOrg) {
          // Update profile with this organization
          await supabase
            .from('org_profiles')
            .update({ current_organization_id: ownedOrg.id })
            .eq('id', user.id);

          setOrganization(ownedOrg);
          setProfile({ ...profileData, current_organization_id: ownedOrg.id });
        }
      }
    } catch (err) {
      console.error('Organization fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return {
    organization,
    profile,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}
