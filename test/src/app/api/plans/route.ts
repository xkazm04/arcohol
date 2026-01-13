import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List all subscription plans
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

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

    // Build query
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data: plans, error: plansError } = await query;

    if (plansError) {
      throw plansError;
    }

    // Transform to frontend format
    const formattedPlans = (plans || []).map((plan) => ({
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
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST: Create a new subscription plan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      description,
      amount,
      currency = 'USDC',
      interval,
      intervalCount = 1,
      trialDays = 0,
      features = [],
      usageLimits = {},
      metadata = {},
    } = body;

    // Validate required fields
    if (!name || !amount || !interval) {
      return NextResponse.json(
        { error: 'Name, amount, and interval are required' },
        { status: 400 }
      );
    }

    // Validate interval
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
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

    // Create the plan
    const { data: plan, error: createError } = await supabase
      .from('subscription_plans')
      .insert({
        organization_id: organizationId,
        name,
        description: description || null,
        amount,
        currency,
        interval,
        interval_count: intervalCount,
        trial_days: trialDays,
        features,
        usage_limits: usageLimits,
        metadata,
        active: true,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
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
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
