import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get a single subscription plan
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      plan: {
        id: plan.id,
        organizationId: plan.organization_id,
        name: plan.name,
        description: plan.description,
        amount: parseFloat(plan.amount),
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.interval_count,
        trialDays: plan.trial_days,
        features: plan.features || [],
        active: plan.active,
        usageLimits: plan.usage_limits,
        metadata: plan.metadata,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

// PATCH: Update a subscription plan
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      description,
      amount,
      interval,
      intervalCount,
      trialDays,
      features,
      active,
      usageLimits,
      metadata,
    } = body;

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (amount !== undefined) updates.amount = amount;
    if (interval !== undefined) {
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(interval)) {
        return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
      }
      updates.interval = interval;
    }
    if (intervalCount !== undefined) updates.interval_count = intervalCount;
    if (trialDays !== undefined) updates.trial_days = trialDays;
    if (features !== undefined) updates.features = features;
    if (active !== undefined) updates.active = active;
    if (usageLimits !== undefined) updates.usage_limits = usageLimits;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Update the plan
    const { data: plan, error: updateError } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      plan: {
        id: plan.id,
        organizationId: plan.organization_id,
        name: plan.name,
        description: plan.description,
        amount: parseFloat(plan.amount),
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.interval_count,
        trialDays: plan.trial_days,
        features: plan.features || [],
        active: plan.active,
        usageLimits: plan.usage_limits,
        metadata: plan.metadata,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

// DELETE: Archive a subscription plan (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if plan has active subscriptions
    const { count, error: countError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', id)
      .in('status', ['active', 'trialing', 'past_due']);

    if (countError) {
      throw countError;
    }

    if (count && count > 0) {
      // Soft delete - mark as inactive instead of deleting
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ active: false })
        .eq('id', id)
        .eq('organization_id', userData.organization_id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        archived: true,
        message: 'Plan archived (has active subscriptions)',
      });
    }

    // Hard delete if no active subscriptions
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id)
      .eq('organization_id', userData.organization_id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
