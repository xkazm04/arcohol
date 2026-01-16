import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: Get a single micropayment plan
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

    // Fetch the plan
    const { data: plan, error } = await supabase
      .from('micro_plans')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
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
        features: plan.features || [],
        active: plan.active,
        network: plan.network,
        sellerAddress: plan.seller_address,
        metadata: plan.metadata,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching micro plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

/**
 * PATCH: Update a micropayment plan
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

    // Verify plan exists and belongs to org
    const { data: existingPlan, error: findError } = await supabase
      .from('micro_plans')
      .select('id')
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (findError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.pricePerUnit !== undefined) updates.price_per_unit = body.pricePerUnit;
    if (body.unitName !== undefined) updates.unit_name = body.unitName;
    if (body.minCharge !== undefined) updates.min_charge = body.minCharge;
    if (body.maxChargePerDay !== undefined) updates.max_charge_per_day = body.maxChargePerDay;
    if (body.maxChargePerMonth !== undefined) updates.max_charge_per_month = body.maxChargePerMonth;
    if (body.features !== undefined) updates.features = body.features;
    if (body.active !== undefined) updates.active = body.active;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    // Update the plan
    const { data: plan, error: updateError } = await supabase
      .from('micro_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
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
        metadata: plan.metadata,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating micro plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

/**
 * DELETE: Delete (archive) a micropayment plan
 */
export async function DELETE(
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

    // Check if plan has active subscriptions
    const { count: activeCount } = await supabase
      .from('micro_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('micro_plan_id', id)
      .eq('status', 'active');

    if (activeCount && activeCount > 0) {
      // Soft delete by marking inactive instead of hard delete
      const { error: updateError } = await supabase
        .from('micro_plans')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organization_id', profile.current_organization_id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: 'Plan deactivated (has active subscriptions)',
        deactivated: true,
      });
    }

    // Hard delete if no active subscriptions
    const { error: deleteError } = await supabase
      .from('micro_plans')
      .delete()
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Plan deleted',
      deleted: true,
    });
  } catch (error) {
    console.error('Error deleting micro plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
