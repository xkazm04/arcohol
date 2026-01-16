import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { taxCalculator } from '@/features/invoices';
import type { UpdateTaxConfigParams } from '@/features/invoices';

// PATCH - Update tax configuration
export async function PATCH(
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

    const body = (await request.json()) as UpdateTaxConfigParams;
    const config = await taxCalculator.updateTaxConfiguration(id, body);

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ configuration: config });
  } catch (error) {
    console.error('[API] Update tax config error:', error);
    return NextResponse.json(
      { error: 'Failed to update tax configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tax configuration
export async function DELETE(
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

    const success = await taxCalculator.deleteTaxConfiguration(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete tax config error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tax configuration' },
      { status: 500 }
    );
  }
}
