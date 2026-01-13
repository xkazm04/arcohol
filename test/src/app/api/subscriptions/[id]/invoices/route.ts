import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List invoices for a subscription
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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

    // Verify subscription exists and belongs to org
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('subscription_invoices')
      .select('*')
      .eq('subscription_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error: invoicesError } = await query;

    if (invoicesError) {
      throw invoicesError;
    }

    // Get total count
    let countQuery = supabase
      .from('subscription_invoices')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_id', id);

    if (status) countQuery = countQuery.eq('status', status);

    const { count } = await countQuery;

    // Transform to frontend format
    const formattedInvoices = (invoices || []).map((inv) => ({
      id: inv.id,
      subscriptionId: inv.subscription_id,
      invoiceId: inv.invoice_id,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      amount: parseFloat(inv.amount),
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.due_date,
      finalizedAt: inv.finalized_at,
      paidAt: inv.paid_at,
      voidedAt: inv.voided_at,
      paymentTxHash: inv.payment_tx_hash,
      paymentAttempts: inv.payment_attempts,
      lastPaymentError: inv.last_payment_error,
      metadata: inv.metadata,
      createdAt: inv.created_at,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching subscription invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription invoices' }, { status: 500 });
  }
}
