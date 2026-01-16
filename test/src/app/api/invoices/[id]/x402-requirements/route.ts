import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: Get x402 payment requirements for an invoice
 *
 * Returns the payment requirements needed to pay this invoice
 * via the x402 Gateway protocol.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, organization:organizations(id, name, settings)')
      .eq('id', id)
      .single();

    if (invError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice can be paid
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    if (invoice.status === 'canceled') {
      return NextResponse.json({ error: 'Invoice has been canceled' }, { status: 400 });
    }

    // Get the organization's gateway config
    const { data: gatewayConfig } = await supabase
      .from('gateway_configs')
      .select('*')
      .eq('organization_id', invoice.organization_id)
      .eq('enabled', true)
      .single();

    if (!gatewayConfig) {
      return NextResponse.json(
        {
          error: 'x402 Gateway is not enabled for this merchant',
          x402Enabled: false,
        },
        { status: 400 }
      );
    }

    // Convert amount to base units (6 decimals for USDC)
    const amountInBaseUnits = Math.round(parseFloat(invoice.amount) * 1_000_000).toString();

    // Build x402 payment requirements
    const requirements = {
      x402Version: 1,
      scheme: 'exact',
      network: gatewayConfig.networks?.[0] || 'eip155:5042002',
      maxAmountRequired: amountInBaseUnits,
      resource: `invoice:${invoice.id}`,
      description: `Payment for invoice ${invoice.reference}`,
      payTo: gatewayConfig.seller_address,
      maxTimeoutSeconds: 3600,
      extra: {
        invoiceId: invoice.id,
        reference: invoice.reference,
        currency: invoice.currency,
        merchantName: invoice.organization?.name,
      },
    };

    return NextResponse.json({
      x402Enabled: true,
      requirements,
      invoice: {
        id: invoice.id,
        reference: invoice.reference,
        amount: parseFloat(invoice.amount),
        currency: invoice.currency,
        status: invoice.status,
      },
      gateway: {
        sellerAddress: gatewayConfig.seller_address,
        network: gatewayConfig.networks?.[0] || 'eip155:5042002',
      },
    });
  } catch (error) {
    console.error('Error fetching x402 requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch payment requirements' }, { status: 500 });
  }
}
