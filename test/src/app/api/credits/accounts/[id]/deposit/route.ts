import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/credits/accounts/[id]/deposit - Add credits to account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify account belongs to org
    const { data: account, error: accountError } = await supabase
      .from('api_credit_accounts')
      .select('id, organization_id')
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      amount,
      type = 'deposit',
      txHash,
      payerAddress,
      chain,
      description,
      metadata = {},
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Use database function to add credits atomically
    const { data, error } = await supabase.rpc('add_api_credits', {
      p_account_id: id,
      p_amount: amount,
      p_type: type,
      p_tx_hash: txHash || null,
      p_payer_address: payerAddress || null,
      p_chain: chain || null,
      p_description: description || `Credit ${type}`,
      p_metadata: metadata,
    });

    if (error) {
      console.error('Error adding credits:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data?.[0] || data;

    if (!result?.success) {
      return NextResponse.json({
        error: result?.error_message || 'Failed to add credits',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transaction_id,
      balanceBefore: result.balance_before,
      balanceAfter: result.balance_after,
    });
  } catch (error) {
    console.error('Error depositing credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
