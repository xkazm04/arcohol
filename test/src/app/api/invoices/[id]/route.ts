import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auditLogger, reminderScheduler } from '@/features/invoices';

// GET: Get a single invoice
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    // Get the invoice with customer
    const { data: inv, error: invError } = await supabase
      .from('invoices')
      .select('*, customer:customers(id, company_name, contact_name, email, wallet_address)')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (invError || !inv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get payments for this invoice
    const { data: payments } = await supabase
      .from('invoice_payments')
      .select('*')
      .eq('invoice_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      invoice: {
        id: inv.id,
        organizationId: inv.organization_id,
        customerId: inv.customer_id,
        customer: inv.customer
          ? {
              id: inv.customer.id,
              companyName: inv.customer.company_name,
              contactName: inv.customer.contact_name,
              email: inv.customer.email,
              walletAddress: inv.customer.wallet_address,
            }
          : undefined,
        reference: inv.reference,
        buyer: inv.buyer,
        subtotal: parseFloat(inv.subtotal),
        taxAmount: parseFloat(inv.tax_amount || '0'),
        discountAmount: parseFloat(inv.discount_amount || '0'),
        amount: parseFloat(inv.amount),
        feeRate: parseFloat(inv.fee_rate || '0'),
        feeAmount: parseFloat(inv.fee_amount || '0'),
        netAmount: parseFloat(inv.net_amount),
        currency: inv.currency,
        status: inv.status,
        issueDate: inv.issue_date,
        dueDate: inv.due_date,
        viewedAt: inv.viewed_at,
        paidAt: inv.paid_at,
        paymentUrl: inv.payment_url,
        qrCode: inv.qr_code,
        lineItems: inv.line_items || [],
        notes: inv.notes,
        terms: inv.terms,
        metadata: inv.metadata,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
      },
      payments: (payments || []).map((p) => ({
        id: p.id,
        amount: parseFloat(p.amount),
        currency: p.currency,
        txHash: p.tx_hash,
        chain: p.chain,
        payerAddress: p.payer_address,
        status: p.status,
        paidAt: p.paid_at,
        confirmedAt: p.confirmed_at,
        createdAt: p.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PATCH: Update an invoice
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

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

    // Get current invoice
    const { data: currentInv, error: currentError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (currentError || !currentInv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only allow updates on draft invoices (except status changes)
    const allowedStatusUpdates = ['draft', 'sent'];
    if (!allowedStatusUpdates.includes(currentInv.status) && !body.status) {
      return NextResponse.json(
        { error: `Cannot modify invoice with status: ${currentInv.status}` },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (body.lineItems !== undefined) {
      const lineItems = body.lineItems;
      const subtotal = lineItems.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }) =>
          sum + item.quantity * item.unitPrice,
        0
      );
      const taxRate = body.taxRate || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const discountAmount = body.discountAmount || 0;
      const amount = subtotal + taxAmount - discountAmount;
      const feeRate = 0.001;
      const feeAmount = amount * feeRate;
      const netAmount = amount - feeAmount;

      updates.line_items = lineItems.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));
      updates.subtotal = subtotal;
      updates.tax_amount = taxAmount;
      updates.discount_amount = discountAmount;
      updates.amount = amount;
      updates.fee_amount = feeAmount;
      updates.net_amount = netAmount;
    }

    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.terms !== undefined) updates.terms = body.terms;
    if (body.status !== undefined) updates.status = body.status;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Update the invoice
    const { data: inv, error: updateError } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log audit event
    const actor = { type: 'user' as const, id: user.id, email: user.email || undefined };

    if (body.status !== undefined && body.status !== currentInv.status) {
      await auditLogger.logStatusChanged(id, currentInv.status, body.status, actor);
    } else {
      await auditLogger.logUpdated(
        id,
        { status: currentInv.status },
        {
          status: inv.status,
          amount: parseFloat(inv.amount),
          dueDate: inv.due_date,
        },
        actor
      );
    }

    // Reschedule reminders if due date changed
    if (body.dueDate !== undefined && inv.due_date) {
      await reminderScheduler.rescheduleReminders(id, new Date(inv.due_date));
    }

    return NextResponse.json({
      invoice: {
        id: inv.id,
        reference: inv.reference,
        subtotal: parseFloat(inv.subtotal),
        taxAmount: parseFloat(inv.tax_amount || '0'),
        discountAmount: parseFloat(inv.discount_amount || '0'),
        amount: parseFloat(inv.amount),
        netAmount: parseFloat(inv.net_amount),
        status: inv.status,
        dueDate: inv.due_date,
        lineItems: inv.line_items,
        notes: inv.notes,
        terms: inv.terms,
        updatedAt: inv.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE: Delete a draft invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    // Get current invoice
    const { data: currentInv, error: currentError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (currentError || !currentInv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only allow deletion of draft invoices
    if (currentInv.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted. Cancel the invoice instead.' },
        { status: 400 }
      );
    }

    // Delete the invoice
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('organization_id', userData.organization_id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
