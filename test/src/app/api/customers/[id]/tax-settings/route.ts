import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { taxCalculator } from '@/features/invoices';
import type { UpdateCustomerTaxParams } from '@/features/invoices';

// GET - Get customer tax settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify customer belongs to organization
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const taxSettings = await taxCalculator.getCustomerTaxSettings(id);

    return NextResponse.json({ taxSettings: taxSettings || null });
  } catch (error) {
    console.error('[API] Get customer tax settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get tax settings' },
      { status: 500 }
    );
  }
}

// PUT - Update customer tax settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify customer belongs to organization
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const body = (await request.json()) as UpdateCustomerTaxParams;

    // Validate tax ID if provided
    if (body.taxId && body.taxRegion) {
      const isValid = await taxCalculator.validateTaxId(body.taxId, body.taxRegion);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid tax ID format for the specified region' },
          { status: 400 }
        );
      }
    }

    const taxSettings = await taxCalculator.updateCustomerTaxSettings(id, body);

    if (!taxSettings) {
      return NextResponse.json(
        { error: 'Failed to update tax settings' },
        { status: 500 }
      );
    }

    // Mark tax ID as validated if it was validated
    if (body.taxId && body.taxRegion) {
      await taxCalculator.markTaxIdValidated(id);
    }

    return NextResponse.json({ taxSettings });
  } catch (error) {
    console.error('[API] Update customer tax settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update tax settings' },
      { status: 500 }
    );
  }
}
