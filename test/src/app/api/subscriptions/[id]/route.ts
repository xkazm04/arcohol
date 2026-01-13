import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get a single subscription
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

    // Get the subscription with related data
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(id, company_name, contact_name, email, wallet_address)
      `
      )
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get recent events
    const { data: events } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('subscription_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('subscription_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      subscription: {
        id: sub.id,
        organizationId: sub.organization_id,
        planId: sub.plan_id,
        plan: sub.plan
          ? {
              id: sub.plan.id,
              name: sub.plan.name,
              description: sub.plan.description,
              amount: parseFloat(sub.plan.amount),
              currency: sub.plan.currency,
              interval: sub.plan.interval,
              intervalCount: sub.plan.interval_count,
              trialDays: sub.plan.trial_days,
              features: sub.plan.features || [],
            }
          : undefined,
        customerId: sub.customer_id,
        customer: sub.customer
          ? {
              id: sub.customer.id,
              companyName: sub.customer.company_name,
              contactName: sub.customer.contact_name,
              email: sub.customer.email,
              walletAddress: sub.customer.wallet_address,
            }
          : undefined,
        customerWallet: sub.customer_wallet,
        merchantWallet: sub.merchant_wallet,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at,
        cancelReason: sub.cancel_reason,
        trialStart: sub.trial_start,
        trialEnd: sub.trial_end,
        pausedAt: sub.paused_at,
        resumesAt: sub.resumes_at,
        pauseReason: sub.pause_reason,
        allowanceAmount: sub.allowance_amount ? parseFloat(sub.allowance_amount) : undefined,
        allowanceCheckedAt: sub.allowance_checked_at,
        lastPaymentAt: sub.last_payment_at,
        lastPaymentAmount: sub.last_payment_amount ? parseFloat(sub.last_payment_amount) : undefined,
        lastPaymentTxHash: sub.last_payment_tx_hash,
        nextPaymentAt: sub.next_payment_at,
        failedPaymentCount: sub.failed_payment_count,
        lastFailedAt: sub.last_failed_at,
        lastFailedReason: sub.last_failed_reason,
        totalPaid: parseFloat(sub.total_paid || '0'),
        invoiceCount: sub.invoice_count,
        chain: sub.chain,
        metadata: sub.metadata,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      },
      events: (events || []).map((e) => ({
        id: e.id,
        eventType: e.event_type,
        data: e.data,
        createdAt: e.created_at,
      })),
      invoices: (invoices || []).map((inv) => ({
        id: inv.id,
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
        amount: parseFloat(inv.amount),
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.due_date,
        paidAt: inv.paid_at,
        paymentTxHash: inv.payment_tx_hash,
        createdAt: inv.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// PATCH: Update a subscription
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { metadata, cancelAtPeriodEnd } = body;

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

    // Build update object (limited fields can be updated directly)
    const updates: Record<string, unknown> = {};
    if (metadata !== undefined) updates.metadata = metadata;
    if (cancelAtPeriodEnd !== undefined) updates.cancel_at_period_end = cancelAtPeriodEnd;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Update the subscription
    const { data: sub, error: updateError } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Log the update event
    await supabase.from('subscription_events').insert({
      subscription_id: id,
      event_type: 'updated',
      data: updates,
    });

    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        metadata: sub.metadata,
        updatedAt: sub.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
