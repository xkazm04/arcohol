import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

interface RouteParams {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET: List invoices for authenticated portal user
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgSlug } = await params;
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

    // Fetch invoices for customer
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, reference, amount, currency, status, due_date, issue_date, paid_at, pdf_url')
      .eq('organization_id', org.id)
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      invoices: (invoices || []).map(inv => ({
        id: inv.id,
        reference: inv.reference,
        amount: parseFloat(inv.amount),
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.due_date,
        issueDate: inv.issue_date,
        paidAt: inv.paid_at,
        pdfUrl: inv.pdf_url,
      })),
    });
  } catch (error) {
    console.error('Portal invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// Parse portal session from cookie
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
