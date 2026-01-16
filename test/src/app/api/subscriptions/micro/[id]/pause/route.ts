import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST: Pause a micropayment subscription
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the subscription
    const { data: subscription, error: subError } = await supabase
      .from('micro_subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot pause subscription with status: ${subscription.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update subscription status
    const { data: updated, error: updateError } = await supabase
      .from('micro_subscriptions')
      .update({
        status: 'paused',
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('Error pausing micro subscription:', error);
    return NextResponse.json({ error: 'Failed to pause subscription' }, { status: 500 });
  }
}
