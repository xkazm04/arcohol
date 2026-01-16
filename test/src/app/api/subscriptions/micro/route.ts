import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: List micropayment subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const planId = searchParams.get('planId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ subscriptions: [] });
    }

    // Build query
    let query = supabase
      .from('micro_subscriptions')
      .select('*, micro_plan:micro_plans(*)')
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (planId) {
      query = query.eq('micro_plan_id', planId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error && error.code !== '42P01') {
      throw error;
    }

    // Transform to camelCase
    const subscriptions = (data || []).map((sub: any) => ({
      id: sub.id,
      organizationId: sub.organization_id,
      microPlanId: sub.micro_plan_id,
      microPlan: sub.micro_plan ? {
        id: sub.micro_plan.id,
        organizationId: sub.micro_plan.organization_id,
        name: sub.micro_plan.name,
        description: sub.micro_plan.description,
        billingType: sub.micro_plan.billing_type,
        pricePerUnit: sub.micro_plan.price_per_unit,
        unitName: sub.micro_plan.unit_name,
        minCharge: sub.micro_plan.min_charge,
        maxChargePerDay: sub.micro_plan.max_charge_per_day,
        maxChargePerMonth: sub.micro_plan.max_charge_per_month,
        features: sub.micro_plan.features,
        active: sub.micro_plan.active,
        network: sub.micro_plan.network,
        sellerAddress: sub.micro_plan.seller_address,
        createdAt: sub.micro_plan.created_at,
        updatedAt: sub.micro_plan.updated_at,
      } : undefined,
      payerAddress: sub.payer_address,
      payerEmail: sub.payer_email,
      status: sub.status,
      totalCharged: sub.total_charged,
      chargeCount: sub.charge_count,
      todayCharged: sub.today_charged,
      monthCharged: sub.month_charged,
      lastChargeAt: sub.last_charge_at,
      lastChargeAmount: sub.last_charge_amount,
      depositBalance: sub.deposit_balance,
      network: sub.network,
      metadata: sub.metadata,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching micro subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

/**
 * POST: Create a micropayment subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { microPlanId, payerAddress, payerEmail, network, metadata } = body;

    if (!microPlanId || !payerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: microPlanId, payerAddress' },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
    }

    // Get the micro plan
    const { data: plan, error: planError } = await supabase
      .from('micro_plans')
      .select('*')
      .eq('id', microPlanId)
      .eq('organization_id', profile.current_organization_id)
      .eq('active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Create subscription
    const { data: subscription, error: createError } = await supabase
      .from('micro_subscriptions')
      .insert({
        organization_id: profile.current_organization_id,
        micro_plan_id: microPlanId,
        payer_address: payerAddress,
        payer_email: payerEmail,
        status: 'active',
        total_charged: '0',
        charge_count: 0,
        today_charged: '0',
        month_charged: '0',
        network: network || plan.network,
        metadata: metadata || {},
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        organizationId: subscription.organization_id,
        microPlanId: subscription.micro_plan_id,
        payerAddress: subscription.payer_address,
        payerEmail: subscription.payer_email,
        status: subscription.status,
        totalCharged: subscription.total_charged,
        chargeCount: subscription.charge_count,
        network: subscription.network,
        createdAt: subscription.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating micro subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
