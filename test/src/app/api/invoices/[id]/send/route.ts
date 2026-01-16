import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/features/invoices/services/email-service';
import { auditLogger, reminderScheduler } from '@/features/invoices';

// POST: Send an invoice to the customer
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { email, personalMessage } = body as {
      email?: string;
      personalMessage?: string;
    };

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

    // Verify customer has email (or override email provided)
    const recipientEmail = email || inv.customer?.email;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Customer does not have an email address' },
        { status: 400 }
      );
    }

    // Send invoice using email service (generates PDF, magic link, and sends)
    const result = await emailService.sendInvoice(id, {
      email: recipientEmail,
      includePortalLink: true,
      personalMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send invoice email' },
        { status: 500 }
      );
    }

    // Log audit event
    await auditLogger.logSent(id, {
      type: 'user',
      id: user.id,
      email: user.email || undefined,
    }, {
      recipientEmail,
    });

    // Schedule reminders if invoice has a due date
    if (inv.due_date) {
      await reminderScheduler.scheduleReminders(id, inv.reminder_rule_id);
    }

    // Get updated invoice
    const { data: updatedInv } = await supabase
      .from('invoices')
      .select('id, reference, status, payment_url, portal_url, pdf_url')
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      invoice: {
        id: updatedInv?.id,
        reference: updatedInv?.reference,
        status: updatedInv?.status,
        paymentUrl: updatedInv?.payment_url,
        portalUrl: updatedInv?.portal_url,
        pdfUrl: updatedInv?.pdf_url,
      },
      message: `Invoice sent to ${recipientEmail}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
