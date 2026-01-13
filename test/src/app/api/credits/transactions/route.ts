import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/transactions - List credit transactions
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
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');

    let query = supabase
      .from('api_credit_transactions')
      .select(`
        *,
        account:api_credit_accounts(id, external_customer_id),
        endpoint:api_credit_endpoints(id, path, method)
      `, { count: 'exact' })
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      transactions: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error listing credit transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
