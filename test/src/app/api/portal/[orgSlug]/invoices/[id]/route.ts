import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

interface RouteParams {
  params: Promise<{ orgSlug: string; id: string }>;
}

/**
 * GET: Get single invoice details for portal
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgSlug, id } = await params;
    const supabase = createAdminClient();

    // Verify session
    const session = await getPortalSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify customer belongs to org
    if (session.organizationId !== org.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('organization_id', org.id)
      .eq('customer_id', session.customerId)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Mark as viewed if not already
    if (invoice.status === 'sent' && !invoice.viewed_at) {
      await supabase
        .from('invoices')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('id', id);
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        reference: invoice.reference,
        amount: parseFloat(invoice.amount),
        currency: invoice.currency,
        status: invoice.status === 'sent' ? 'viewed' : invoice.status,
        dueDate: invoice.due_date,
        issueDate: invoice.issue_date,
        paidAt: invoice.paid_at,
        lineItems: invoice.line_items || [],
        subtotal: parseFloat(invoice.subtotal || '0'),
        taxAmount: parseFloat(invoice.tax_amount || '0'),
        discountAmount: parseFloat(invoice.discount_amount || '0'),
        notes: invoice.notes,
        terms: invoice.terms,
        pdfUrl: invoice.pdf_url,
      },
    });
  } catch (error) {
    console.error('Portal invoice detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// Parse portal session
async function getPortalSession(): Promise<{ organizationId: string; customerId: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('portal_session');
    if (!sessionCookie?.value) return null;

    const secret = process.env.SESSION_SECRET || 'arcpay-portal-session-secret';
    const decoded = Buffer.from(sessionCookie.value, 'base64url').toString();
    const [organizationId, customerId, expiryStr, signature] = decoded.split(':');

    if (!organizationId || !customerId || !expiryStr || !signature) return null;

    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) return null;

    const data = `${organizationId}:${customerId}:${expiryStr}`;
    const expectedSignature = createHash('sha256')
      .update(data + secret)
      .digest('hex')
      .slice(0, 16);

    if (signature !== expectedSignature) return null;

    return { organizationId, customerId };
  } catch {
    return null;
  }
}
