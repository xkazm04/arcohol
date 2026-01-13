import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List all subscriptions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const planId = searchParams.get('planId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

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

    const organizationId = userData.organization_id;

    // Build query with joins
    let query = supabase
      .from('subscriptions')
      .select(
        `
        *,
        plan:subscription_plans(*),
        customer:customers(id, company_name, contact_name, email)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data: subscriptions, error: subscriptionsError } = await query;

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    // Get total count
    let countQuery = supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (status) countQuery = countQuery.eq('status', status);
    if (customerId) countQuery = countQuery.eq('customer_id', customerId);
    if (planId) countQuery = countQuery.eq('plan_id', planId);

    const { count } = await countQuery;

    // Transform to frontend format
    const formattedSubscriptions = (subscriptions || []).map((sub) => ({
      id: sub.id,
      organizationId: sub.organization_id,
      planId: sub.plan_id,
      plan: sub.plan
        ? {
            id: sub.plan.id,
            name: sub.plan.name,
            amount: parseFloat(sub.plan.amount),
            currency: sub.plan.currency,
            interval: sub.plan.interval,
            intervalCount: sub.plan.interval_count,
          }
        : undefined,
      customerId: sub.customer_id,
      customer: sub.customer
        ? {
            id: sub.customer.id,
            companyName: sub.customer.company_name,
            contactName: sub.customer.contact_name,
            email: sub.customer.email,
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
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST: Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { planId, customerId, customerWallet, merchantWallet, chain = 'base', metadata = {} } = body;

    // Validate required fields
    if (!planId || !customerId || !customerWallet || !merchantWallet) {
      return NextResponse.json(
        { error: 'planId, customerId, customerWallet, and merchantWallet are required' },
        { status: 400 }
      );
    }

    // Validate wallet addresses (basic check)
    if (!customerWallet.startsWith('0x') || !merchantWallet.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

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

    const organizationId = userData.organization_id;

    // Verify plan exists and belongs to org
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('organization_id', organizationId)
      .eq('active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    // Verify customer exists and belongs to org
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate initial billing period
    const now = new Date();
    const trialDays = plan.trial_days || 0;
    const hasTrialPeriod = trialDays > 0;

    let status: string;
    let trialStart: Date | null = null;
    let trialEnd: Date | null = null;
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    let nextPaymentAt: Date | null = null;

    if (hasTrialPeriod) {
      status = 'trialing';
      trialStart = now;
      trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
      currentPeriodStart = now;
      currentPeriodEnd = trialEnd;
      nextPaymentAt = trialEnd;
    } else {
      // Start as incomplete until wallet approval is confirmed
      status = 'incomplete';
      currentPeriodStart = now;
      currentPeriodEnd = calculatePeriodEnd(now, plan.interval, plan.interval_count);
      nextPaymentAt = now; // Payment needed immediately
    }

    // Create the subscription
    const { data: subscription, error: createError } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: organizationId,
        plan_id: planId,
        customer_id: customerId,
        customer_wallet: customerWallet,
        merchant_wallet: merchantWallet,
        status,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        trial_start: trialStart?.toISOString() || null,
        trial_end: trialEnd?.toISOString() || null,
        next_payment_at: nextPaymentAt?.toISOString() || null,
        chain,
        metadata,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Log the creation event
    await supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      event_type: 'created',
      data: {
        planId,
        customerId,
        customerWallet,
        merchantWallet,
        hasTrialPeriod,
        trialDays,
      },
    });

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        organizationId: subscription.organization_id,
        planId: subscription.plan_id,
        customerId: subscription.customer_id,
        customerWallet: subscription.customer_wallet,
        merchantWallet: subscription.merchant_wallet,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        trialStart: subscription.trial_start,
        trialEnd: subscription.trial_end,
        nextPaymentAt: subscription.next_payment_at,
        chain: subscription.chain,
        metadata: subscription.metadata,
        createdAt: subscription.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
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
