import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { amount, destination = 'operating' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

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

    // Get treasury account
    const { data: treasury, error: treasuryError } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (treasuryError || !treasury) {
      return NextResponse.json({ error: 'Treasury not found' }, { status: 404 });
    }

    // Check if reserve balance is sufficient
    const reserveBalance = parseFloat(treasury.reserve_balance || '0');
    if (reserveBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient USDY balance' },
        { status: 400 }
      );
    }

    // MVP: Mock the USDY → USDC conversion (no real contract interaction)
    // In production, this would call Ondo contracts with 24-hour unlock period

    const newReserveBalance = reserveBalance - amount;
    const newOperatingBalance = parseFloat(treasury.operating_balance || '0') + amount;

    // Update treasury balances
    const { error: updateError } = await supabase
      .from('treasury_accounts')
      .update({
        operating_balance: newOperatingBalance,
        reserve_balance: newReserveBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', treasury.id);

    if (updateError) {
      throw updateError;
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('treasury_transactions')
      .insert({
        organization_id: organizationId,
        treasury_id: treasury.id,
        type: 'transfer_from_reserve',
        amount,
        currency: 'USDC',
        from_fund: 'reserve',
        to_fund: 'operating',
        status: 'completed',
        description: `Withdraw ${amount} USDY to USDC operating`,
        metadata: { destination, mock: true },
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction record error:', txError);
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction?.id,
        amount,
        type: 'withdraw',
        status: 'completed',
        newBalance: newReserveBalance,
        timestamp: new Date().toISOString(),
      },
      message: 'Withdrawal completed (mock - instant settlement)',
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
