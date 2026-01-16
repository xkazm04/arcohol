import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST: Submit x402 authorization for a micropayment subscription
 *
 * This endpoint allows customers to pre-authorize spending for recurring charges.
 * The authorization is an EIP-3009 signature that allows the service to charge
 * up to the authorized amount without requiring per-transaction signatures.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { signature, amount, payerAddress } = body;

    if (!signature || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: signature, amount' },
        { status: 400 }
      );
    }

    // Validate amount
    const authorizedAmount = parseFloat(amount.toString().replace('$', ''));
    if (isNaN(authorizedAmount) || authorizedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get the subscription
    const { data: subscription, error: subError } = await supabase
      .from('micro_subscriptions')
      .select('*, micro_plan:micro_plans(*)')
      .eq('id', id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Verify payer address if provided
    if (payerAddress && payerAddress.toLowerCase() !== subscription.payer_address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Payer address does not match subscription' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Verify the EIP-3009 signature against the payer address
    // 2. Validate the authorization parameters (amount, nonce, deadline)
    // 3. Store the signature securely for future charge authorization
    //
    // For now, we store the authorization and update the subscription

    const now = new Date().toISOString();

    // Update subscription with authorization
    const { data: updated, error: updateError } = await supabase
      .from('micro_subscriptions')
      .update({
        authorization_signature: signature,
        authorized_amount: authorizedAmount.toFixed(6),
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const plan = subscription.micro_plan;
    const pricePerUnit = parseFloat((plan?.price_per_unit || '$0.01').replace('$', ''));
    const estimatedCharges = Math.floor(authorizedAmount / pricePerUnit);

    return NextResponse.json({
      success: true,
      authorization: {
        subscriptionId: id,
        authorizedAmount: authorizedAmount.toFixed(6),
        spentAmount: subscription.total_charged || '0',
        remainingAmount: (authorizedAmount - parseFloat(subscription.total_charged || '0')).toFixed(6),
        estimatedCharges,
        pricePerUnit: plan?.price_per_unit,
        unitName: plan?.unit_name,
      },
      message: 'Authorization successful. The service can now charge up to the authorized amount.',
    });
  } catch (error) {
    console.error('Error authorizing micro subscription:', error);
    return NextResponse.json({ error: 'Failed to process authorization' }, { status: 500 });
  }
}

/**
 * GET: Get authorization status for a subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the subscription
    const { data: subscription, error } = await supabase
      .from('micro_subscriptions')
      .select('id, authorized_amount, total_charged, authorization_signature, micro_plan:micro_plans(price_per_unit, unit_name)')
      .eq('id', id)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const hasAuthorization = !!subscription.authorization_signature;
    const authorizedAmount = parseFloat(subscription.authorized_amount || '0');
    const spentAmount = parseFloat(subscription.total_charged || '0');
    const remainingAmount = Math.max(0, authorizedAmount - spentAmount);

    const plan = subscription.micro_plan as { price_per_unit: string; unit_name: string } | null;
    const pricePerUnit = parseFloat((plan?.price_per_unit || '$0.01').replace('$', ''));
    const estimatedRemainingCharges = Math.floor(remainingAmount / pricePerUnit);

    return NextResponse.json({
      subscriptionId: id,
      hasAuthorization,
      authorizedAmount: authorizedAmount.toFixed(6),
      spentAmount: spentAmount.toFixed(6),
      remainingAmount: remainingAmount.toFixed(6),
      estimatedRemainingCharges,
      pricePerUnit: plan?.price_per_unit,
      unitName: plan?.unit_name,
      needsReauthorization: hasAuthorization && remainingAmount < pricePerUnit * 10,
    });
  } catch (error) {
    console.error('Error getting authorization status:', error);
    return NextResponse.json({ error: 'Failed to get authorization status' }, { status: 500 });
  }
}
