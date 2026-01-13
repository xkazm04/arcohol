import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Resume a paused subscription
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get current subscription with plan
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Check if subscription can be resumed
    if (sub.status !== 'paused') {
      return NextResponse.json(
        { error: `Cannot resume subscription with status: ${sub.status}` },
        { status: 400 }
      );
    }

    const now = new Date();

    // Calculate new billing period from now
    const currentPeriodStart = now;
    const currentPeriodEnd = calculatePeriodEnd(
      now,
      sub.plan.interval,
      sub.plan.interval_count
    );

    // Update the subscription
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        paused_at: null,
        resumes_at: null,
        pause_reason: null,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        next_payment_at: currentPeriodStart.toISOString(), // Payment due now
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the resume event
    await supabase.from('subscription_events').insert({
      subscription_id: id,
      event_type: 'resumed',
      data: {
        resumedAt: now.toISOString(),
        newPeriodStart: currentPeriodStart.toISOString(),
        newPeriodEnd: currentPeriodEnd.toISOString(),
      },
    });

    return NextResponse.json({
      subscription: {
        id: updatedSub.id,
        status: updatedSub.status,
        currentPeriodStart: updatedSub.current_period_start,
        currentPeriodEnd: updatedSub.current_period_end,
        nextPaymentAt: updatedSub.next_payment_at,
      },
      message: 'Subscription resumed. A new billing period has started.',
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return NextResponse.json({ error: 'Failed to resume subscription' }, { status: 500 });
  }
}

// Helper function to calculate period end
function calculatePeriodEnd(
  startDate: Date,
  interval: string,
  intervalCount: number
): Date {
  const result = new Date(startDate);
  switch (interval) {
    case 'daily':
      result.setDate(result.getDate() + intervalCount);
      break;
    case 'weekly':
      result.setDate(result.getDate() + 7 * intervalCount);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + intervalCount);
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + intervalCount);
      break;
  }
  return result;
}
