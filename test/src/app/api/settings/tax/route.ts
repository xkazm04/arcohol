import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { taxCalculator } from '@/features/invoices';
import type { CreateTaxConfigParams } from '@/features/invoices';

// GET - List tax configurations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const configurations = await taxCalculator.listTaxConfigurations(
      userData.organization_id
    );

    return NextResponse.json({ configurations });
  } catch (error) {
    console.error('[API] List tax configs error:', error);
    return NextResponse.json(
      { error: 'Failed to list tax configurations' },
      { status: 500 }
    );
  }
}

// POST - Create tax configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = (await request.json()) as CreateTaxConfigParams;

    // Validate required fields
    if (!body.name || !body.regionCode || !body.taxType || body.defaultRate === undefined) {
      return NextResponse.json(
        { error: 'name, regionCode, taxType, and defaultRate are required' },
        { status: 400 }
      );
    }

    const config = await taxCalculator.createTaxConfiguration(
      userData.organization_id,
      {
        name: body.name,
        regionCode: body.regionCode,
        taxType: body.taxType,
        defaultRate: body.defaultRate,
        regionalRates: body.regionalRates,
        reverseChargeEnabled: body.reverseChargeEnabled ?? false,
        reverseChargeThreshold: body.reverseChargeThreshold,
        isDefault: body.isDefault ?? false,
        enabled: body.enabled ?? true,
      }
    );

    if (!config) {
      return NextResponse.json(
        { error: 'Failed to create tax configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ configuration: config }, { status: 201 });
  } catch (error) {
    console.error('[API] Create tax config error:', error);
    return NextResponse.json(
      { error: 'Failed to create tax configuration' },
      { status: 500 }
    );
  }
}
