import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Pause a subscription
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    const { resumesAt, reason } = body;

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

    // Check if subscription can be paused
    if (!['active', 'trialing', 'past_due'].includes(sub.status)) {
      return NextResponse.json(
        { error: `Cannot pause subscription with status: ${sub.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Validate resumesAt if provided
    let resumeDate: string | null = null;
    if (resumesAt) {
      const resumeDateObj = new Date(resumesAt);
      if (resumeDateObj <= new Date()) {
        return NextResponse.json(
          { error: 'Resume date must be in the future' },
          { status: 400 }
        );
      }
      resumeDate = resumeDateObj.toISOString();
    }

    // Update the subscription
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'paused',
        paused_at: now,
        resumes_at: resumeDate,
        pause_reason: reason || null,
        next_payment_at: null, // Clear next payment while paused
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the pause event
    await supabase.from('subscription_events').insert({
      subscription_id: id,
      event_type: 'paused',
      data: {
        pausedAt: now,
        resumesAt: resumeDate,
        reason,
        previousStatus: sub.status,
      },
    });

    return NextResponse.json({
      subscription: {
        id: updatedSub.id,
        status: updatedSub.status,
        pausedAt: updatedSub.paused_at,
        resumesAt: updatedSub.resumes_at,
        pauseReason: updatedSub.pause_reason,
      },
      message: resumeDate
        ? `Subscription paused. Will resume automatically on ${resumeDate}`
        : 'Subscription paused indefinitely. Use resume endpoint to reactivate.',
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return NextResponse.json({ error: 'Failed to pause subscription' }, { status: 500 });
  }
}
