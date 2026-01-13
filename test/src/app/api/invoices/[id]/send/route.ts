import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Send an invoice to the customer
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      .select('*, customer:customers(id, email, contact_name)')
      .eq('id', id)
      .eq('organization_id', userData.organization_id)
      .single();

    if (invError || !inv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice can be sent
    if (!['draft', 'sent'].includes(inv.status)) {
      return NextResponse.json(
        { error: `Cannot send invoice with status: ${inv.status}` },
        { status: 400 }
      );
    }

    // Verify customer has email
    if (!inv.customer?.email) {
      return NextResponse.json(
        { error: 'Customer does not have an email address' },
        { status: 400 }
      );
    }

    // Get organization details for email
    const { data: org } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', userData.organization_id)
      .single();

    // Generate payment URL (for the buyer portal)
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${org?.slug || 'default'}/invoices/${id}`;

    // Update invoice status and payment URL
    const { data: updatedInv, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        payment_url: paymentUrl,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // TODO: Implement actual email sending via Resend/SendGrid
    // For now, we'll just return success and log the intent
    console.log('Invoice email would be sent to:', {
      to: inv.customer.email,
      invoiceRef: inv.reference,
      amount: inv.amount,
      paymentUrl,
    });

    // In a real implementation, you would:
    // 1. Generate PDF of the invoice
    // 2. Send email with PDF attachment and payment link
    // 3. Log the email send event

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInv.id,
        reference: updatedInv.reference,
        status: updatedInv.status,
        paymentUrl: updatedInv.payment_url,
      },
      message: `Invoice sent to ${inv.customer.email}`,
      // In production, this would be the actual email delivery status
      emailStatus: 'simulated',
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
