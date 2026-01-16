import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailService } from '@/features/invoices/services/email-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST: Send invoice reminder email
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { email, personalMessage } = body as {
      email?: string;
      personalMessage?: string;
    };

    // Verify authentication
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

    // Verify invoice belongs to organization and is sendable
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, organization_id')
      .eq('id', invoiceId)
      .eq('organization_id', userData.organization_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check invoice status
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    if (invoice.status === 'canceled') {
      return NextResponse.json({ error: 'Invoice is canceled' }, { status: 400 });
    }

    if (invoice.status === 'draft') {
      return NextResponse.json(
        { error: 'Invoice must be sent before sending reminders' },
        { status: 400 }
      );
    }

    // Send reminder
    const result = await emailService.sendReminder(invoiceId, {
      email,
      personalMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
