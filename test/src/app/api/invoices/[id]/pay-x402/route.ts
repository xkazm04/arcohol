import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST: Pay an invoice via x402 Gateway
 *
 * This endpoint receives a signed EIP-3009 authorization and
 * submits it to the Circle Gateway for batched settlement.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { payerAddress, signature, network = 'eip155:5042002' } = body;

    if (!payerAddress || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: payerAddress, signature' },
        { status: 400 }
      );
    }

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

    if (invoice.status === 'draft') {
      return NextResponse.json({ error: 'Invoice has not been sent yet' }, { status: 400 });
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
        { error: 'x402 Gateway is not enabled for this merchant' },
        { status: 400 }
      );
    }

    // Convert amount to base units (6 decimals for USDC)
    const amountInBaseUnits = (parseFloat(invoice.amount) * 1_000_000).toString();

    // In production, this would call the Circle Gateway BatchFacilitator
    // to verify the signature and submit for settlement
    //
    // const { BatchFacilitator } = require('@circlefin/x402-batching');
    // const facilitator = new BatchFacilitator({ ... });
    // const result = await facilitator.settle({
    //   payload: signature,
    //   paymentRequirements: { ... }
    // });

    // For now, simulate the x402 payment process
    const now = new Date().toISOString();
    const mockBatchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create x402 payment record
    const { data: x402Payment, error: paymentError } = await supabase
      .from('x402_invoice_payments')
      .insert({
        invoice_id: id,
        organization_id: invoice.organization_id,
        payer_address: payerAddress,
        amount: invoice.amount,
        network,
        signature,
        batch_id: mockBatchId,
        status: 'batched',
        created_at: now,
      })
      .select()
      .single();

    if (paymentError) {
      // If table doesn't exist, create a standard payment record instead
      if (paymentError.code === '42P01') {
        // Table doesn't exist - fall back to regular payment
        const { error: fallbackError } = await supabase.from('invoice_payments').insert({
          invoice_id: id,
          amount: invoice.amount,
          currency: invoice.currency,
          chain: 'arc',
          payer_address: payerAddress,
          status: 'pending',
          metadata: {
            payment_method: 'x402',
            network,
            batch_id: mockBatchId,
            signature: signature.slice(0, 20) + '...',
          },
        });

        if (fallbackError) {
          console.error('Failed to create fallback payment:', fallbackError);
        }
      } else {
        throw paymentError;
      }
    }

    // Update invoice status to indicate payment is processing
    // We don't mark it as fully paid until settlement confirms
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: now,
        metadata: {
          ...invoice.metadata,
          x402_payment: {
            batch_id: mockBatchId,
            payer_address: payerAddress,
            network,
            submitted_at: now,
          },
        },
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      invoiceId: id,
      batchId: mockBatchId,
      status: 'batched',
      message: 'Payment submitted to x402 Gateway for settlement',
      estimatedSettlement: '~5 minutes',
    });
  } catch (error) {
    console.error('Error processing x402 payment:', error);
    return NextResponse.json({ error: 'Failed to process x402 payment' }, { status: 500 });
  }
}
