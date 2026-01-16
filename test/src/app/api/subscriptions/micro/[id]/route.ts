import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: Get a single micropayment subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
    }

    // Fetch subscription with plan details
    const { data: sub, error } = await supabase
      .from('micro_subscriptions')
      .select('*, micro_plan:micro_plans(*)')
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (error || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({
      subscription: {
        id: sub.id,
        organizationId: sub.organization_id,
        microPlanId: sub.micro_plan_id,
        microPlan: sub.micro_plan ? {
          id: sub.micro_plan.id,
          name: sub.micro_plan.name,
          description: sub.micro_plan.description,
          billingType: sub.micro_plan.billing_type,
          pricePerUnit: sub.micro_plan.price_per_unit,
          unitName: sub.micro_plan.unit_name,
          network: sub.micro_plan.network,
          sellerAddress: sub.micro_plan.seller_address,
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
        authorizationSignature: sub.authorization_signature ? '***' : null,
        authorizedAmount: sub.authorized_amount,
        network: sub.network,
        metadata: sub.metadata,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching micro subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

/**
 * PATCH: Update a micropayment subscription
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

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

    // Verify subscription exists
    const { data: existing, error: findError } = await supabase
      .from('micro_subscriptions')
      .select('id, status')
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.payerEmail !== undefined) updates.payer_email = body.payerEmail;
    if (body.depositBalance !== undefined) updates.deposit_balance = body.depositBalance;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    // Update the subscription
    const { data: sub, error: updateError } = await supabase
      .from('micro_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: sub.id,
        organizationId: sub.organization_id,
        microPlanId: sub.micro_plan_id,
        payerAddress: sub.payer_address,
        payerEmail: sub.payer_email,
        status: sub.status,
        totalCharged: sub.total_charged,
        chargeCount: sub.charge_count,
        network: sub.network,
        updatedAt: sub.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating micro subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
