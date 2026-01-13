import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/endpoints - List credit endpoints
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
    const active = searchParams.get('active');

    let query = supabase
      .from('api_credit_endpoints')
      .select('*')
      .eq('organization_id', profile.current_organization_id)
      .order('path');

    if (active !== null && active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get usage stats for each endpoint
    const { data: usageData } = await supabase
      .from('api_usage_logs')
      .select('endpoint_id, price_charged')
      .eq('organization_id', profile.current_organization_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Aggregate usage by endpoint
    const usageByEndpoint: Record<string, { calls: number; revenue: number }> = {};
    for (const log of usageData || []) {
      if (!log.endpoint_id) continue;
      if (!usageByEndpoint[log.endpoint_id]) {
        usageByEndpoint[log.endpoint_id] = { calls: 0, revenue: 0 };
      }
      usageByEndpoint[log.endpoint_id].calls++;
      usageByEndpoint[log.endpoint_id].revenue += Number(log.price_charged);
    }

    // Merge stats with endpoints
    const endpoints = (data || []).map(endpoint => ({
      ...endpoint,
      stats30d: usageByEndpoint[endpoint.id] || { calls: 0, revenue: 0 },
    }));

    return NextResponse.json({ endpoints });
  } catch (error) {
    console.error('Error listing credit endpoints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/credits/endpoints - Create credit endpoint
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
      path,
      method = 'POST',
      pricePerCall,
      currency = 'USDC',
      name,
      description,
      rateLimitPerMinute,
      rateLimitPerHour,
      rateLimitPerDay,
      metadata = {},
    } = body;

    if (!path) {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    if (pricePerCall === undefined || pricePerCall < 0) {
      return NextResponse.json({ error: 'pricePerCall must be >= 0' }, { status: 400 });
    }

    // Check if endpoint already exists
    const { data: existing } = await supabase
      .from('api_credit_endpoints')
      .select('id')
      .eq('organization_id', profile.current_organization_id)
      .eq('path', path)
      .eq('method', method.toUpperCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Endpoint already exists' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('api_credit_endpoints')
      .insert({
        organization_id: profile.current_organization_id,
        path,
        method: method.toUpperCase(),
        price_per_call: pricePerCall,
        currency,
        name,
        description,
        rate_limit_per_minute: rateLimitPerMinute,
        rate_limit_per_hour: rateLimitPerHour,
        rate_limit_per_day: rateLimitPerDay,
        metadata,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating credit endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
