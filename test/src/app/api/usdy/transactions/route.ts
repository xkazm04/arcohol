import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'deposit' | 'withdraw' | 'yield' | null

    // Get the organization from the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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

    // Build query for treasury transactions related to USDY
    let query = supabase
      .from('treasury_transactions')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .or('from_fund.eq.reserve,to_fund.eq.reserve,type.eq.yield_credit')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if specified
    if (type === 'deposit') {
      query = supabase
        .from('treasury_transactions')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('type', 'transfer_to_reserve')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    } else if (type === 'withdraw') {
      query = supabase
        .from('treasury_transactions')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('type', 'transfer_from_reserve')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    } else if (type === 'yield') {
      query = supabase
        .from('treasury_transactions')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('type', 'yield_credit')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data: transactions, error: txError, count } = await query;

    if (txError) {
      throw txError;
    }

    // Transform to USDY-centric view
    const formattedTransactions = (transactions || []).map((tx) => ({
      id: tx.id,
      type: tx.type === 'transfer_to_reserve' ? 'deposit' :
            tx.type === 'transfer_from_reserve' ? 'withdraw' :
            tx.type === 'yield_credit' ? 'yield' : tx.type,
      amount: parseFloat(tx.amount),
      currency: tx.type === 'yield_credit' ? 'USDY' : 'USDC',
      status: tx.status,
      description: tx.description,
      createdAt: tx.created_at,
      completedAt: tx.completed_at,
      metadata: tx.metadata,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
