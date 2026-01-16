import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pdfGenerator } from '@/features/invoices/services/pdf-generator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET: Generate or retrieve invoice PDF
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    const regenerate = searchParams.get('regenerate') === 'true';

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

    // Verify invoice belongs to organization
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, reference, organization_id')
      .eq('id', invoiceId)
      .eq('organization_id', userData.organization_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (download) {
      // Generate PDF buffer for download
      const pdfBuffer = await pdfGenerator.generatePDF(invoiceId);
      const fileName = pdfGenerator.getFileName({
        reference: invoice.reference,
      } as Parameters<typeof pdfGenerator.getFileName>[0]);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } else {
      // Get or generate stored PDF URL
      const pdfUrl = await pdfGenerator.getPDFUrl(invoiceId, regenerate);
      return NextResponse.json({ url: pdfUrl });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
