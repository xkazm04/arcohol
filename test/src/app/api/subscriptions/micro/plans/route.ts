import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: List micropayment plans
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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
      return NextResponse.json({ plans: [] });
    }

    // Fetch plans
    const { data, error } = await supabase
      .from('micro_plans')
      .select('*')
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false });

    if (error && error.code !== '42P01') {
      throw error;
    }

    // Transform to camelCase
    const plans = (data || []).map((plan: any) => ({
      id: plan.id,
      organizationId: plan.organization_id,
      name: plan.name,
      description: plan.description,
      billingType: plan.billing_type,
      pricePerUnit: plan.price_per_unit,
      unitName: plan.unit_name,
      minCharge: plan.min_charge,
      maxChargePerDay: plan.max_charge_per_day,
      maxChargePerMonth: plan.max_charge_per_month,
      features: plan.features || [],
      active: plan.active,
      network: plan.network,
      sellerAddress: plan.seller_address,
      metadata: plan.metadata,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    }));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching micro plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

/**
 * POST: Create a micropayment plan
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      description,
      billingType,
      pricePerUnit,
      unitName = 'unit',
      minCharge,
      maxChargePerDay,
      maxChargePerMonth,
      features = [],
      network = 'eip155:5042002',
      sellerAddress,
      metadata,
    } = body;

    if (!name || !billingType || !pricePerUnit || !sellerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: name, billingType, pricePerUnit, sellerAddress' },
        { status: 400 }
      );
    }

    // Validate billing type
    const validBillingTypes = ['per_use', 'daily', 'hourly', 'per_minute'];
    if (!validBillingTypes.includes(billingType)) {
      return NextResponse.json(
        { error: `Invalid billingType. Must be one of: ${validBillingTypes.join(', ')}` },
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

    const now = new Date().toISOString();

    // Create plan
    const { data: plan, error: createError } = await supabase
      .from('micro_plans')
      .insert({
        organization_id: profile.current_organization_id,
        name,
        description,
        billing_type: billingType,
        price_per_unit: pricePerUnit,
        unit_name: unitName,
        min_charge: minCharge,
        max_charge_per_day: maxChargePerDay,
        max_charge_per_month: maxChargePerMonth,
        features,
        active: true,
        network,
        seller_address: sellerAddress,
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
      plan: {
        id: plan.id,
        organizationId: plan.organization_id,
        name: plan.name,
        description: plan.description,
        billingType: plan.billing_type,
        pricePerUnit: plan.price_per_unit,
        unitName: plan.unit_name,
        minCharge: plan.min_charge,
        maxChargePerDay: plan.max_charge_per_day,
        maxChargePerMonth: plan.max_charge_per_month,
        features: plan.features,
        active: plan.active,
        network: plan.network,
        sellerAddress: plan.seller_address,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating micro plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
