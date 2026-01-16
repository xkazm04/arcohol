import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST: Charge a micropayment subscription
 *
 * This endpoint processes a micropayment charge via x402 Gateway.
 * The payer signs an EIP-3009 authorization for the charge amount.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { units, description, signature } = body;

    if (!units || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: units, signature' },
        { status: 400 }
      );
    }

    if (units <= 0) {
      return NextResponse.json({ error: 'Units must be greater than 0' }, { status: 400 });
    }

    // Get the subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('micro_subscriptions')
      .select('*, micro_plan:micro_plans(*)')
      .eq('id', id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot charge subscription with status: ${subscription.status}` },
        { status: 400 }
      );
    }

    const plan = subscription.micro_plan;
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Parse price per unit (e.g., "$0.001" -> 0.001)
    const pricePerUnit = parseFloat(plan.price_per_unit.replace('$', ''));
    let chargeAmount = pricePerUnit * units;

    // Apply minimum charge if configured
    if (plan.min_charge) {
      const minCharge = parseFloat(plan.min_charge.replace('$', ''));
      chargeAmount = Math.max(chargeAmount, minCharge);
    }

    // Check daily limit
    const todayCharged = parseFloat(subscription.today_charged || '0');
    if (plan.max_charge_per_day) {
      const maxDaily = parseFloat(plan.max_charge_per_day.replace('$', ''));
      if (todayCharged + chargeAmount > maxDaily) {
        return NextResponse.json(
          {
            error: 'Daily spending limit exceeded',
            limit: maxDaily,
            charged: todayCharged,
            attempted: chargeAmount,
          },
          { status: 400 }
        );
      }
    }

    // Check monthly limit
    const monthCharged = parseFloat(subscription.month_charged || '0');
    if (plan.max_charge_per_month) {
      const maxMonthly = parseFloat(plan.max_charge_per_month.replace('$', ''));
      if (monthCharged + chargeAmount > maxMonthly) {
        return NextResponse.json(
          {
            error: 'Monthly spending limit exceeded',
            limit: maxMonthly,
            charged: monthCharged,
            attempted: chargeAmount,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // In production, this would:
    // 1. Verify the signature via BatchFacilitator
    // 2. Submit to Circle Gateway for batched settlement
    // 3. Wait for settlement confirmation
    //
    // For now, we simulate the process

    // Create charge record
    const { data: charge, error: chargeError } = await supabase
      .from('micro_charges')
      .insert({
        micro_subscription_id: id,
        amount: chargeAmount.toFixed(6),
        units,
        unit_price: pricePerUnit.toFixed(6),
        description,
        batch_id: batchId,
        status: 'batched',
        signature: signature.slice(0, 100), // Store truncated for reference
        created_at: now,
      })
      .select()
      .single();

    if (chargeError) {
      // If table doesn't exist, continue without storing
      console.warn('Could not store charge record:', chargeError);
    }

    // Update subscription totals
    const newTotalCharged = parseFloat(subscription.total_charged || '0') + chargeAmount;
    const newTodayCharged = todayCharged + chargeAmount;
    const newMonthCharged = monthCharged + chargeAmount;

    const { error: updateError } = await supabase
      .from('micro_subscriptions')
      .update({
        total_charged: newTotalCharged.toFixed(6),
        charge_count: (subscription.charge_count || 0) + 1,
        today_charged: newTodayCharged.toFixed(6),
        month_charged: newMonthCharged.toFixed(6),
        last_charge_at: now,
        last_charge_amount: chargeAmount.toFixed(6),
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      charge: {
        id: charge?.id || `charge_${Date.now()}`,
        subscriptionId: id,
        amount: chargeAmount.toFixed(6),
        units,
        unitPrice: pricePerUnit.toFixed(6),
        description,
        batchId,
        status: 'batched',
        createdAt: now,
      },
      subscription: {
        totalCharged: newTotalCharged.toFixed(6),
        chargeCount: (subscription.charge_count || 0) + 1,
        todayCharged: newTodayCharged.toFixed(6),
        monthCharged: newMonthCharged.toFixed(6),
      },
      estimatedSettlement: '~5 minutes',
    });
  } catch (error) {
    console.error('Error charging micro subscription:', error);
    return NextResponse.json({ error: 'Failed to process charge' }, { status: 500 });
  }
}
