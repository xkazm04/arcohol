import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List scheduled unstakes
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

    // Get scheduled unstakes (action_type = scheduled_unstake, status = pending)
    const { data: unstakes, error: unstakesError } = await supabase
      .from('treasury_agent_actions')
      .select('id, amount, scheduled_for, scheduled_reason, status, created_at')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .eq('action_type', 'scheduled_unstake')
      .in('status', ['pending', 'processing'])
      .order('scheduled_for', { ascending: true });

    if (unstakesError) {
      // If table doesn't exist, return empty array
      if (unstakesError.code === '42P01') {
        return NextResponse.json([]);
      }
      throw unstakesError;
    }

    // Map to camelCase
    const mappedUnstakes = (unstakes || []).map(u => ({
      id: u.id,
      amount: u.amount,
      scheduledFor: u.scheduled_for,
      reason: u.scheduled_reason,
      status: u.status,
      createdAt: u.created_at,
    }));

    return NextResponse.json(mappedUnstakes);
  } catch (error) {
    console.error('Error fetching scheduled unstakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled unstakes' },
      { status: 500 }
    );
  }
}

// POST - Create a scheduled unstake
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { amount, scheduledFor, reason, chain = 'arc-testnet' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!scheduledFor) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
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
      .select('id')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .single();

    // Create the scheduled unstake action
    const { data: unstake, error: unstakeError } = await supabase
      .from('treasury_agent_actions')
      .insert({
        organization_id: organizationId,
        config_id: config?.id || null,
        action_type: 'scheduled_unstake',
        amount,
        trigger_type: 'scheduled',
        scheduled_for: scheduledDate.toISOString(),
        scheduled_reason: reason || null,
        status: 'pending',
        chain,
      })
      .select()
      .single();

    if (unstakeError) throw unstakeError;

    return NextResponse.json({
      id: unstake.id,
      amount: unstake.amount,
      scheduledFor: unstake.scheduled_for,
      reason: unstake.scheduled_reason,
      status: unstake.status,
      createdAt: unstake.created_at,
    });
  } catch (error) {
    console.error('Error creating scheduled unstake:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled unstake' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled unstake
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Unstake ID is required' },
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

    // Verify the unstake belongs to this organization and is cancellable
    const { data: unstake, error: fetchError } = await supabase
      .from('treasury_agent_actions')
      .select('id, status')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .eq('action_type', 'scheduled_unstake')
      .single();

    if (fetchError || !unstake) {
      return NextResponse.json(
        { error: 'Scheduled unstake not found' },
        { status: 404 }
      );
    }

    if (unstake.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending unstakes can be cancelled' },
        { status: 400 }
      );
    }

    // Cancel the unstake
    const { error: updateError } = await supabase
      .from('treasury_agent_actions')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling scheduled unstake:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled unstake' },
      { status: 500 }
    );
  }
}
