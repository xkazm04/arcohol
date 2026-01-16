import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List agent actions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'arc-testnet';
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Get actions for this organization and chain
    const { data: actions, error: actionsError } = await supabase
      .from('treasury_agent_actions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionsError) {
      // If table doesn't exist, return empty array
      if (actionsError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw actionsError;
    }

    // Map to camelCase
    const mappedActions = (actions || []).map(action => ({
      id: action.id,
      organizationId: action.organization_id,
      configId: action.config_id,
      actionType: action.action_type,
      amount: action.amount,
      triggerType: action.trigger_type,
      triggerReason: action.trigger_reason,
      scheduledFor: action.scheduled_for,
      scheduledReason: action.scheduled_reason,
      status: action.status,
      errorMessage: action.error_message,
      usdcBalanceAfter: action.usdc_balance_after,
      usdyBalanceAfter: action.usdy_balance_after,
      txHash: action.tx_hash,
      chain: action.chain,
      createdAt: action.created_at,
      executedAt: action.executed_at,
      completedAt: action.completed_at,
    }));

    return NextResponse.json(mappedActions);
  } catch (error) {
    console.error('Error fetching agent actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent actions' },
      { status: 500 }
    );
  }
}

// POST - Trigger a manual action (stake or unstake)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { actionType, amount, chain = 'arc-testnet' } = body;

    if (!actionType || !['stake', 'unstake'].includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid action type. Must be "stake" or "unstake".' },
        { status: 400 }
      );
    }

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

    // Get agent config
    const { data: config } = await supabase
      .from('treasury_agent_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .single();

    if (!config) {
      return NextResponse.json(
        { error: 'Agent not configured. Please configure the agent first.' },
        { status: 400 }
      );
    }

    // Check cooldown for stake actions
    if (actionType === 'stake' && config.cooldown_enabled && config.last_transaction_at) {
      const lastTx = new Date(config.last_transaction_at);
      const cooldownEnd = new Date(lastTx.getTime() + config.cooldown_hours * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        return NextResponse.json(
          { error: `Cooldown active. Please wait until ${cooldownEnd.toISOString()}` },
          { status: 400 }
        );
      }
    }

    // Get treasury balances
    const { data: treasury } = await supabase
      .from('treasury_accounts')
      .select('operating_balance, reserve_balance')
      .eq('organization_id', organizationId)
      .single();

    const operatingBalance = treasury?.operating_balance || 0;
    const reserveBalance = treasury?.reserve_balance || 0;

    // Calculate amount if not provided
    let actionAmount = amount;
    if (!actionAmount) {
      if (actionType === 'stake') {
        // Calculate stakeable amount based on config
        const excess = operatingBalance - config.minimum_reserve;
        actionAmount = excess > 0 ? excess * (config.stake_percentage / 100) : 0;
      } else {
        // Default unstake amount
        actionAmount = Math.min(5000, reserveBalance);
      }
    }

    if (actionAmount <= 0) {
      return NextResponse.json(
        { error: `Insufficient balance for ${actionType}` },
        { status: 400 }
      );
    }

    // Create the action record
    const { data: action, error: actionError } = await supabase
      .from('treasury_agent_actions')
      .insert({
        organization_id: organizationId,
        config_id: config.id,
        action_type: actionType,
        amount: actionAmount,
        trigger_type: 'manual',
        trigger_reason: `Manual ${actionType} from dashboard`,
        status: 'pending',
        chain,
      })
      .select()
      .single();

    if (actionError) throw actionError;

    // TODO: In production, this would trigger an actual blockchain transaction
    // For now, we'll simulate the completion

    // Update the action to processing then completed
    const { data: completedAction, error: updateError } = await supabase
      .from('treasury_agent_actions')
      .update({
        status: 'completed',
        executed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        usdc_balance_after: actionType === 'stake'
          ? operatingBalance - actionAmount
          : operatingBalance + actionAmount,
        usdy_balance_after: actionType === 'stake'
          ? reserveBalance + actionAmount
          : reserveBalance - actionAmount,
        tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      })
      .eq('id', action.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update agent config stats
    await supabase
      .from('treasury_agent_configs')
      .update({
        last_transaction_at: new Date().toISOString(),
        last_execution_at: new Date().toISOString(),
        execution_count: config.execution_count + 1,
        total_staked: actionType === 'stake'
          ? config.total_staked + actionAmount
          : config.total_staked,
        total_unstaked: actionType === 'unstake'
          ? config.total_unstaked + actionAmount
          : config.total_unstaked,
      })
      .eq('id', config.id);

    return NextResponse.json({
      id: completedAction.id,
      organizationId: completedAction.organization_id,
      configId: completedAction.config_id,
      actionType: completedAction.action_type,
      amount: completedAction.amount,
      triggerType: completedAction.trigger_type,
      triggerReason: completedAction.trigger_reason,
      scheduledFor: completedAction.scheduled_for,
      scheduledReason: completedAction.scheduled_reason,
      status: completedAction.status,
      errorMessage: completedAction.error_message,
      usdcBalanceAfter: completedAction.usdc_balance_after,
      usdyBalanceAfter: completedAction.usdy_balance_after,
      txHash: completedAction.tx_hash,
      chain: completedAction.chain,
      createdAt: completedAction.created_at,
      executedAt: completedAction.executed_at,
      completedAt: completedAction.completed_at,
    });
  } catch (error) {
    console.error('Error triggering action:', error);
    return NextResponse.json(
      { error: 'Failed to trigger action' },
      { status: 500 }
    );
  }
}
