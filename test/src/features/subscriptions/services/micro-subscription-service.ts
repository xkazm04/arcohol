/**
 * Micro Subscription Service
 *
 * Server-side service for managing micropayment subscriptions with x402 gasless payments.
 * This service provides core operations for plans, subscriptions, charges, and settlements.
 */

import { createClient } from '@/lib/supabase/server';
import type {
  MicroPlan,
  MicroSubscription,
  MicroCharge,
  CreateMicroPlanParams,
  UpdateMicroPlanParams,
  CreateMicroSubscriptionParams,
  ChargeMicroSubscriptionParams,
} from '../types';

// =====================================================
// Plan Operations
// =====================================================

export async function createMicroPlan(
  organizationId: string,
  params: CreateMicroPlanParams
): Promise<MicroPlan> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('micro_plans')
    .insert({
      organization_id: organizationId,
      name: params.name,
      description: params.description,
      billing_type: params.billingType,
      price_per_unit: params.pricePerUnit,
      unit_name: params.unitName || 'unit',
      min_charge: params.minCharge,
      max_charge_per_day: params.maxChargePerDay,
      max_charge_per_month: params.maxChargePerMonth,
      features: params.features || [],
      network: params.network || 'eip155:5042002',
      seller_address: params.sellerAddress,
      metadata: params.metadata || {},
      active: true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return transformPlan(data);
}

export async function updateMicroPlan(
  planId: string,
  params: UpdateMicroPlanParams
): Promise<MicroPlan> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.name !== undefined) updates.name = params.name;
  if (params.description !== undefined) updates.description = params.description;
  if (params.pricePerUnit !== undefined) updates.price_per_unit = params.pricePerUnit;
  if (params.minCharge !== undefined) updates.min_charge = params.minCharge;
  if (params.maxChargePerDay !== undefined) updates.max_charge_per_day = params.maxChargePerDay;
  if (params.maxChargePerMonth !== undefined) updates.max_charge_per_month = params.maxChargePerMonth;
  if (params.features !== undefined) updates.features = params.features;
  if (params.active !== undefined) updates.active = params.active;
  if (params.metadata !== undefined) updates.metadata = params.metadata;

  const { data, error } = await supabase
    .from('micro_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;
  return transformPlan(data);
}

export async function getMicroPlan(planId: string): Promise<MicroPlan | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('micro_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) return null;
  return transformPlan(data);
}

export async function listMicroPlans(
  organizationId: string,
  options: { activeOnly?: boolean } = {}
): Promise<MicroPlan[]> {
  const supabase = await createClient();

  let query = supabase
    .from('micro_plans')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (options.activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(transformPlan);
}

// =====================================================
// Subscription Operations
// =====================================================

export async function createMicroSubscription(
  organizationId: string,
  params: CreateMicroSubscriptionParams
): Promise<MicroSubscription> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Get the plan to inherit network
  const { data: plan } = await supabase
    .from('micro_plans')
    .select('network')
    .eq('id', params.microPlanId)
    .single();

  const { data, error } = await supabase
    .from('micro_subscriptions')
    .insert({
      organization_id: organizationId,
      micro_plan_id: params.microPlanId,
      payer_address: params.payerAddress,
      payer_email: params.payerEmail,
      network: params.network || plan?.network || 'eip155:5042002',
      metadata: params.metadata || {},
      status: 'active',
      total_charged: '0',
      charge_count: 0,
      today_charged: '0',
      month_charged: '0',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return transformSubscription(data);
}

export async function getMicroSubscription(
  subscriptionId: string
): Promise<MicroSubscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('micro_subscriptions')
    .select('*, micro_plan:micro_plans(*)')
    .eq('id', subscriptionId)
    .single();

  if (error) return null;
  return transformSubscription(data);
}

export async function listMicroSubscriptions(
  organizationId: string,
  options: { status?: string; planId?: string; limit?: number } = {}
): Promise<MicroSubscription[]> {
  const supabase = await createClient();

  let query = supabase
    .from('micro_subscriptions')
    .select('*, micro_plan:micro_plans(*)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(options.limit || 50);

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.planId) {
    query = query.eq('micro_plan_id', options.planId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(transformSubscription);
}

// =====================================================
// Charge Operations
// =====================================================

export async function recordCharge(
  subscriptionId: string,
  params: ChargeMicroSubscriptionParams
): Promise<MicroCharge> {
  const supabase = await createClient();

  // Get subscription with plan
  const { data: subscription, error: subError } = await supabase
    .from('micro_subscriptions')
    .select('*, micro_plan:micro_plans(*)')
    .eq('id', subscriptionId)
    .single();

  if (subError || !subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status !== 'active') {
    throw new Error(`Cannot charge subscription with status: ${subscription.status}`);
  }

  const plan = subscription.micro_plan;
  const pricePerUnit = parseFloat((plan?.price_per_unit || '$0.01').replace('$', ''));
  let chargeAmount = pricePerUnit * params.units;

  // Apply minimum charge
  if (plan?.min_charge) {
    const minCharge = parseFloat(plan.min_charge.replace('$', ''));
    chargeAmount = Math.max(chargeAmount, minCharge);
  }

  const now = new Date().toISOString();
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Create charge record
  const { data: charge, error: chargeError } = await supabase
    .from('micro_charges')
    .insert({
      micro_subscription_id: subscriptionId,
      amount: chargeAmount.toFixed(6),
      units: params.units,
      unit_price: pricePerUnit.toFixed(6),
      description: params.description,
      batch_id: batchId,
      status: 'batched',
      signature: params.signature?.slice(0, 100),
      created_at: now,
    })
    .select()
    .single();

  if (chargeError) throw chargeError;

  // Update subscription totals
  const newTotalCharged = parseFloat(subscription.total_charged || '0') + chargeAmount;
  const newTodayCharged = parseFloat(subscription.today_charged || '0') + chargeAmount;
  const newMonthCharged = parseFloat(subscription.month_charged || '0') + chargeAmount;

  await supabase
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
    .eq('id', subscriptionId);

  return transformCharge(charge);
}

// =====================================================
// Authorization Operations
// =====================================================

export async function authorizeSpend(
  subscriptionId: string,
  signature: string,
  amount: string | number
): Promise<{ authorizedAmount: string; remainingAmount: string }> {
  const supabase = await createClient();

  const authorizedAmount = typeof amount === 'string'
    ? parseFloat(amount.replace('$', ''))
    : amount;

  const { data: subscription, error: subError } = await supabase
    .from('micro_subscriptions')
    .select('total_charged')
    .eq('id', subscriptionId)
    .single();

  if (subError) throw subError;

  const { error: updateError } = await supabase
    .from('micro_subscriptions')
    .update({
      authorization_signature: signature,
      authorized_amount: authorizedAmount.toFixed(6),
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (updateError) throw updateError;

  const spentAmount = parseFloat(subscription?.total_charged || '0');
  const remainingAmount = Math.max(0, authorizedAmount - spentAmount);

  return {
    authorizedAmount: authorizedAmount.toFixed(6),
    remainingAmount: remainingAmount.toFixed(6),
  };
}

// =====================================================
// Settlement Operations
// =====================================================

export async function batchSettle(
  organizationId: string,
  options: { network?: string; maxCharges?: number } = {}
): Promise<{
  batchId: string;
  totalCharges: number;
  totalAmount: string;
  status: string;
} | null> {
  const supabase = await createClient();

  // Get pending charges
  const { data: charges, error: chargesError } = await supabase
    .from('micro_charges')
    .select(`
      *,
      micro_subscription:micro_subscriptions!inner(
        organization_id,
        network
      )
    `)
    .eq('status', 'pending')
    .eq('micro_subscription.organization_id', organizationId)
    .limit(options.maxCharges || 100);

  if (chargesError) throw chargesError;

  if (!charges || charges.length === 0) {
    return null;
  }

  // Filter by network if specified
  const filteredCharges = options.network
    ? charges.filter((c: any) => c.micro_subscription?.network === options.network)
    : charges;

  if (filteredCharges.length === 0) {
    return null;
  }

  const totalAmount = filteredCharges.reduce(
    (sum: number, c: any) => sum + parseFloat(c.amount || '0'),
    0
  );

  const network = options.network || filteredCharges[0]?.micro_subscription?.network || 'eip155:5042002';
  const now = new Date().toISOString();

  // Create batch record
  const { data: batch, error: batchError } = await supabase
    .from('micro_settlement_batches')
    .insert({
      organization_id: organizationId,
      total_charges: filteredCharges.length,
      total_amount: totalAmount.toFixed(6),
      network,
      status: 'submitted',
      created_at: now,
    })
    .select()
    .single();

  if (batchError) throw batchError;

  // Update charges to batched status
  const chargeIds = filteredCharges.map((c: any) => c.id);
  await supabase
    .from('micro_charges')
    .update({
      status: 'batched',
      batch_id: batch.id,
    })
    .in('id', chargeIds);

  return {
    batchId: batch.id,
    totalCharges: filteredCharges.length,
    totalAmount: totalAmount.toFixed(6),
    status: 'submitted',
  };
}

// =====================================================
// Stats Operations
// =====================================================

export async function getUsageStats(
  organizationId: string
): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: string;
  totalCharges: number;
}> {
  const supabase = await createClient();

  // Get subscription counts
  const { count: totalCount } = await supabase
    .from('micro_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  const { count: activeCount } = await supabase
    .from('micro_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  // Get revenue stats
  const { data: subscriptions } = await supabase
    .from('micro_subscriptions')
    .select('total_charged, charge_count')
    .eq('organization_id', organizationId);

  const totalRevenue = (subscriptions || []).reduce(
    (sum, s) => sum + parseFloat(s.total_charged || '0'),
    0
  );

  const totalCharges = (subscriptions || []).reduce(
    (sum, s) => sum + (s.charge_count || 0),
    0
  );

  return {
    totalSubscriptions: totalCount || 0,
    activeSubscriptions: activeCount || 0,
    totalRevenue: totalRevenue.toFixed(6),
    totalCharges,
  };
}

// =====================================================
// Transform Helpers
// =====================================================

function transformPlan(data: any): MicroPlan {
  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    description: data.description,
    billingType: data.billing_type,
    pricePerUnit: data.price_per_unit,
    unitName: data.unit_name,
    minCharge: data.min_charge,
    maxChargePerDay: data.max_charge_per_day,
    maxChargePerMonth: data.max_charge_per_month,
    features: data.features || [],
    active: data.active,
    network: data.network,
    sellerAddress: data.seller_address,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformSubscription(data: any): MicroSubscription {
  return {
    id: data.id,
    organizationId: data.organization_id,
    microPlanId: data.micro_plan_id,
    microPlan: data.micro_plan ? transformPlan(data.micro_plan) : undefined,
    payerAddress: data.payer_address,
    payerEmail: data.payer_email,
    status: data.status,
    totalCharged: data.total_charged,
    chargeCount: data.charge_count,
    todayCharged: data.today_charged,
    monthCharged: data.month_charged,
    lastChargeAt: data.last_charge_at,
    lastChargeAmount: data.last_charge_amount,
    depositBalance: data.deposit_balance,
    network: data.network,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformCharge(data: any): MicroCharge {
  return {
    id: data.id,
    microSubscriptionId: data.micro_subscription_id,
    amount: data.amount,
    units: data.units,
    unitPrice: data.unit_price,
    description: data.description,
    batchId: data.batch_id,
    status: data.status,
    signature: data.signature,
    transaction: data.transaction,
    settledAt: data.settled_at,
    createdAt: data.created_at,
  };
}
