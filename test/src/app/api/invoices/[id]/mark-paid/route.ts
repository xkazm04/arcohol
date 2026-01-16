import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auditLogger, reminderScheduler } from '@/features/invoices';

// POST: Mark an invoice as paid (manual payment recording)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    const { txHash, payerAddress, chain = 'base', notes } = body;

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

    // Get the invoice
    const { data: inv, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (invError || !inv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice can be marked as paid
    if (inv.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    if (inv.status === 'canceled') {
      return NextResponse.json({ error: 'Cannot mark canceled invoice as paid' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Create payment record
    const { error: paymentError } = await supabase.from('invoice_payments').insert({
      invoice_id: id,
      amount: inv.amount,
      currency: inv.currency,
      tx_hash: txHash || null,
      chain,
      payer_address: payerAddress || null,
      status: 'completed',
      paid_at: now,
      confirmed_at: now,
      metadata: notes ? { notes } : {},
    });

    if (paymentError) {
      throw paymentError;
    }

    // Update invoice status
    const { data: updatedInv, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update customer stats
    await supabase.rpc('update_customer_payment_stats', {
      p_customer_id: inv.customer_id,
      p_amount: parseFloat(inv.amount),
    }).catch(() => {
      // RPC might not exist, ignore error
    });

    // Log audit event
    await auditLogger.logPaid(id, {
      type: 'user',
      id: user.id,
      email: user.email || undefined,
    }, {
      txHash,
      payerAddress,
    });

    // Cancel any pending reminders
    await reminderScheduler.cancelReminders(id);

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInv.id,
        reference: updatedInv.reference,
        status: updatedInv.status,
        paidAt: updatedInv.paid_at,
        amount: parseFloat(updatedInv.amount),
      },
      message: 'Invoice marked as paid',
    });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 });
  }
}
