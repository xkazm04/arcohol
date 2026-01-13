import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/accounts - List credit accounts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = supabase
      .from('api_credit_accounts')
      .select(`
        *,
        customer:customers(id, company_name, contact_name, email)
      `, { count: 'exact' })
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`external_customer_id.ilike.%${search}%`);
    }

    if (active !== null && active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      accounts: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error listing credit accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/credits/accounts - Create credit account
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    const {
      externalCustomerId,
      customerId,
      initialBalance = 0,
      currency = 'USDC',
      lowBalanceThreshold = 10,
      metadata = {},
    } = body;

    if (!externalCustomerId) {
      return NextResponse.json({ error: 'externalCustomerId is required' }, { status: 400 });
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('api_credit_accounts')
      .select('id')
      .eq('organization_id', profile.current_organization_id)
      .eq('external_customer_id', externalCustomerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Account already exists for this customer' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('api_credit_accounts')
      .insert({
        organization_id: profile.current_organization_id,
        external_customer_id: externalCustomerId,
        customer_id: customerId,
        balance: initialBalance,
        currency,
        low_balance_threshold: lowBalanceThreshold,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating credit account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
