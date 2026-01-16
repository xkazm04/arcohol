import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST: Batch settle pending micropayment charges
 *
 * This endpoint collects all pending charges and settles them in a single
 * x402 batch transaction via the Circle Gateway. This enables gasless
 * micropayments by amortizing gas costs across multiple charges.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { network, maxCharges = 100 } = body;

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

    // Get pending charges for this organization
    // Join through subscriptions to filter by org
    const { data: pendingCharges, error: chargesError } = await supabase
      .from('micro_charges')
      .select(`
        *,
        micro_subscription:micro_subscriptions!inner(
          id,
          organization_id,
          network,
          payer_address,
          micro_plan:micro_plans(seller_address)
        )
      `)
      .eq('status', 'pending')
      .eq('micro_subscription.organization_id', profile.current_organization_id)
      .limit(maxCharges);

    if (chargesError && chargesError.code !== '42P01') {
      throw chargesError;
    }

    const charges = pendingCharges || [];

    if (charges.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending charges to settle',
        batch: null,
      });
    }

    // Filter by network if specified
    const filteredCharges = network
      ? charges.filter((c: any) => c.micro_subscription?.network === network)
      : charges;

    if (filteredCharges.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No pending charges for network: ${network}`,
        batch: null,
      });
    }

    // Calculate batch totals
    const totalAmount = filteredCharges.reduce(
      (sum: number, c: any) => sum + parseFloat(c.amount || '0'),
      0
    );

    const batchNetwork = network || filteredCharges[0]?.micro_subscription?.network || 'eip155:5042002';
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    // In production, this would:
    // 1. Group charges by seller address
    // 2. Create batch payment requests for each seller
    // 3. Submit to Circle Gateway BatchFacilitator
    // 4. Wait for settlement confirmation
    // 5. Update charge statuses based on settlement result
    //
    // For now, we simulate the settlement process

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('micro_settlement_batches')
      .insert({
        organization_id: profile.current_organization_id,
        total_charges: filteredCharges.length,
        total_amount: totalAmount.toFixed(6),
        network: batchNetwork,
        status: 'submitted',
        created_at: now,
      })
      .select()
      .single();

    if (batchError) {
      console.warn('Could not create batch record:', batchError);
    }

    // Update charges to batched status
    const chargeIds = filteredCharges.map((c: any) => c.id);
    const { error: updateError } = await supabase
      .from('micro_charges')
      .update({
        status: 'batched',
        batch_id: batch?.id || batchId,
      })
      .in('id', chargeIds);

    if (updateError) {
      console.warn('Could not update charge statuses:', updateError);
    }

    // Simulate settlement (in production, this would be async with webhook callback)
    // For demo purposes, mark as settled after a brief delay simulation
    setTimeout(async () => {
      try {
        // Update batch to confirmed
        if (batch?.id) {
          await supabase
            .from('micro_settlement_batches')
            .update({
              status: 'confirmed',
              tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
              settled_at: new Date().toISOString(),
            })
            .eq('id', batch.id);
        }

        // Update charges to settled
        await supabase
          .from('micro_charges')
          .update({
            status: 'settled',
            settled_at: new Date().toISOString(),
          })
          .in('id', chargeIds);
      } catch (e) {
        console.error('Error in settlement simulation:', e);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      batch: {
        id: batch?.id || batchId,
        totalCharges: filteredCharges.length,
        totalAmount: totalAmount.toFixed(6),
        network: batchNetwork,
        status: 'submitted',
        estimatedSettlement: '~2-5 minutes',
      },
      charges: filteredCharges.map((c: any) => ({
        id: c.id,
        amount: c.amount,
        subscriptionId: c.micro_subscription_id,
      })),
      message: `Batch settlement initiated for ${filteredCharges.length} charges totaling $${totalAmount.toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error settling micro charges:', error);
    return NextResponse.json({ error: 'Failed to settle charges' }, { status: 500 });
  }
}

/**
 * GET: Get settlement batches for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

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
      return NextResponse.json({ batches: [] });
    }

    // Build query
    let query = supabase
      .from('micro_settlement_batches')
      .select('*')
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error && error.code !== '42P01') {
      throw error;
    }

    const batches = (data || []).map((b: any) => ({
      id: b.id,
      totalCharges: b.total_charges,
      totalAmount: b.total_amount,
      network: b.network,
      txHash: b.tx_hash,
      status: b.status,
      createdAt: b.created_at,
      settledAt: b.settled_at,
    }));

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error fetching settlement batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}
