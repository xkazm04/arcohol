import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Cancel a subscription
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    const { cancelAtPeriodEnd = true, reason } = body;

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

    // Get current subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Check if subscription can be canceled
    if (sub.status === 'canceled') {
      return NextResponse.json({ error: 'Subscription is already canceled' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      cancel_reason: reason || null,
    };

    if (cancelAtPeriodEnd) {
      // Schedule cancellation at end of billing period
      updates.cancel_at_period_end = true;
    } else {
      // Cancel immediately
      updates.status = 'canceled';
      updates.canceled_at = now;
      updates.cancel_at_period_end = false;
    }

    // Update the subscription
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the cancellation event
    await supabase.from('subscription_events').insert({
      subscription_id: id,
      event_type: cancelAtPeriodEnd ? 'cancel_scheduled' : 'canceled',
      data: {
        cancelAtPeriodEnd,
        reason,
        canceledAt: cancelAtPeriodEnd ? null : now,
        effectiveAt: cancelAtPeriodEnd ? sub.current_period_end : now,
      },
    });

    return NextResponse.json({
      subscription: {
        id: updatedSub.id,
        status: updatedSub.status,
        cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
        canceledAt: updatedSub.canceled_at,
        cancelReason: updatedSub.cancel_reason,
        currentPeriodEnd: updatedSub.current_period_end,
      },
      message: cancelAtPeriodEnd
        ? `Subscription will be canceled at the end of the billing period (${sub.current_period_end})`
        : 'Subscription canceled immediately',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
