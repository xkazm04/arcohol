import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch agent configuration
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'arc-testnet';

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = profile.current_organization_id;

    // Check for API key
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .is('revoked_at', null);

    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        noApiKey: true,
        chain,
        message: `No API key configured for ${chain}.`,
      });
    }

    // Get agent configuration
    const { data: config, error: configError } = await supabase
      .from('treasury_agent_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .single();

    // If no config exists, return default configuration
    if (configError || !config) {
      // Calculate cooldown info for default
      const defaultConfig = {
        id: null,
        organizationId,
        enabled: false,
        chain,
        stakeThreshold: 10000,
        minimumReserve: 5000,
        stakePercentage: 50,
        cooldownEnabled: true,
        cooldownHours: 24,
        lastTransactionAt: null,
        canExecute: true,
        cooldownEndsAt: null,
        totalStaked: 0,
        totalUnstaked: 0,
        executionCount: 0,
        lastExecutionAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(defaultConfig);
    }

    // Calculate cooldown status
    let canExecute = true;
    let cooldownEndsAt = null;

    if (config.cooldown_enabled && config.last_transaction_at) {
      const lastTx = new Date(config.last_transaction_at);
      const cooldownEnd = new Date(lastTx.getTime() + config.cooldown_hours * 60 * 60 * 1000);
      cooldownEndsAt = cooldownEnd.toISOString();
      canExecute = new Date() >= cooldownEnd;
    }

    return NextResponse.json({
      id: config.id,
      organizationId: config.organization_id,
      enabled: config.enabled,
      chain: config.chain,
      stakeThreshold: config.stake_threshold,
      minimumReserve: config.minimum_reserve,
      stakePercentage: config.stake_percentage,
      cooldownEnabled: config.cooldown_enabled,
      cooldownHours: config.cooldown_hours,
      lastTransactionAt: config.last_transaction_at,
      canExecute,
      cooldownEndsAt,
      totalStaked: config.total_staked,
      totalUnstaked: config.total_unstaked,
      executionCount: config.execution_count,
      lastExecutionAt: config.last_execution_at,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    });
  } catch (error) {
    console.error('Error fetching agent config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent configuration' },
      { status: 500 }
    );
  }
}

// PATCH - Update agent configuration
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { chain = 'arc-testnet', ...updates } = body;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = profile.current_organization_id;

    // Map camelCase to snake_case for database
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
    if (updates.stakeThreshold !== undefined) dbUpdates.stake_threshold = updates.stakeThreshold;
    if (updates.minimumReserve !== undefined) dbUpdates.minimum_reserve = updates.minimumReserve;
    if (updates.stakePercentage !== undefined) dbUpdates.stake_percentage = updates.stakePercentage;
    if (updates.cooldownEnabled !== undefined) dbUpdates.cooldown_enabled = updates.cooldownEnabled;
    if (updates.cooldownHours !== undefined) dbUpdates.cooldown_hours = updates.cooldownHours;

    // Check if config exists
    const { data: existingConfig } = await supabase
      .from('treasury_agent_configs')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .single();

    let config;

    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from('treasury_agent_configs')
        .update(dbUpdates)
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      config = data;
    } else {
      // Create new config
      const { data, error } = await supabase
        .from('treasury_agent_configs')
        .insert({
          organization_id: organizationId,
          chain,
          enabled: updates.enabled ?? false,
          stake_threshold: updates.stakeThreshold ?? 10000,
          minimum_reserve: updates.minimumReserve ?? 5000,
          stake_percentage: updates.stakePercentage ?? 50,
          cooldown_enabled: updates.cooldownEnabled ?? true,
          cooldown_hours: updates.cooldownHours ?? 24,
          total_staked: 0,
          total_unstaked: 0,
          execution_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      config = data;
    }

    // Calculate cooldown status
    let canExecute = true;
    let cooldownEndsAt = null;

    if (config.cooldown_enabled && config.last_transaction_at) {
      const lastTx = new Date(config.last_transaction_at);
      const cooldownEnd = new Date(lastTx.getTime() + config.cooldown_hours * 60 * 60 * 1000);
      cooldownEndsAt = cooldownEnd.toISOString();
      canExecute = new Date() >= cooldownEnd;
    }

    return NextResponse.json({
      id: config.id,
      organizationId: config.organization_id,
      enabled: config.enabled,
      chain: config.chain,
      stakeThreshold: config.stake_threshold,
      minimumReserve: config.minimum_reserve,
      stakePercentage: config.stake_percentage,
      cooldownEnabled: config.cooldown_enabled,
      cooldownHours: config.cooldown_hours,
      lastTransactionAt: config.last_transaction_at,
      canExecute,
      cooldownEndsAt,
      totalStaked: config.total_staked,
      totalUnstaked: config.total_unstaked,
      executionCount: config.execution_count,
      lastExecutionAt: config.last_execution_at,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    });
  } catch (error) {
    console.error('Error updating agent config:', error);
    return NextResponse.json(
      { error: 'Failed to update agent configuration' },
      { status: 500 }
    );
  }
}
