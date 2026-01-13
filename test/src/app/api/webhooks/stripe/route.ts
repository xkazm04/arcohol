import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  mapStripeDispute,
  mapStripeEvidence,
  shouldAutoEvaluate,
} from '@/integrations/stripe/disputes';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Initialize Supabase with service role for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.updated':
        await handleDisputeUpdated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleDisputeCreated(stripeDispute: Stripe.Dispute) {
  console.log('Processing dispute created:', stripeDispute.id);

  // Find the organization connected to this Stripe account
  // First, try to find by Stripe charge or payment intent metadata
  const chargeId = typeof stripeDispute.charge === 'string'
    ? stripeDispute.charge
    : stripeDispute.charge?.id;

  // Look up organization by Stripe connection or transaction reference
  const { data: orgMapping } = await supabase
    .from('stripe_connections')
    .select('organization_id, merchant_id')
    .eq('stripe_account_id', stripeDispute.livemode ? 'live' : 'test')
    .single();

  if (!orgMapping) {
    // Fallback: Try to find by API key metadata or other means
    console.warn('No organization mapping found for Stripe dispute:', stripeDispute.id);

    // For development, use a default organization if one exists
    const { data: defaultOrg } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();

    if (!defaultOrg) {
      console.error('No organization found to associate dispute with');
      return;
    }

    // Create dispute with default org
    const mappedDispute = mapStripeDispute({
      stripeDispute,
      organizationId: defaultOrg.id,
      merchantId: 'stripe_merchant',
    });

    await createDisputeInDatabase(mappedDispute, stripeDispute);
    return;
  }

  // Create the dispute
  const mappedDispute = mapStripeDispute({
    stripeDispute,
    organizationId: orgMapping.organization_id,
    merchantId: orgMapping.merchant_id || 'stripe_merchant',
  });

  await createDisputeInDatabase(mappedDispute, stripeDispute);
}

async function createDisputeInDatabase(
  mappedDispute: ReturnType<typeof mapStripeDispute>,
  stripeDispute: Stripe.Dispute
) {
  // Check if dispute already exists
  const { data: existing } = await supabase
    .from('disputes')
    .select('id')
    .eq('metadata->stripe_dispute_id', stripeDispute.id)
    .single();

  if (existing) {
    console.log('Dispute already exists:', existing.id);
    return existing;
  }

  // Insert dispute
  const { data: dispute, error: insertError } = await supabase
    .from('disputes')
    .insert(mappedDispute)
    .select()
    .single();

  if (insertError) {
    console.error('Error creating dispute:', insertError);
    throw insertError;
  }

  console.log('Created dispute:', dispute.id);

  // Map and insert any evidence from Stripe
  if (stripeDispute.evidence) {
    const evidenceItems = mapStripeEvidence(stripeDispute.evidence);

    if (evidenceItems.length > 0) {
      const evidenceRecords = evidenceItems.map(e => ({
        dispute_id: dispute.id,
        submitted_by: 'merchant',
        submitter_id: mappedDispute.merchant_id,
        type: e.type,
        title: e.title,
        description: e.description,
        metadata: { source: 'stripe' },
      }));

      await supabase.from('dispute_evidence').insert(evidenceRecords);
    }
  }

  // Trigger auto-evaluation if applicable
  if (shouldAutoEvaluate(stripeDispute)) {
    console.log('Triggering auto-evaluation for dispute:', dispute.id);
    // Call internal evaluation API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/disputes/${dispute.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Auto-evaluation failed:', err);
    }
  }

  return dispute;
}

async function handleDisputeUpdated(stripeDispute: Stripe.Dispute) {
  console.log('Processing dispute updated:', stripeDispute.id);

  // Find existing dispute
  const { data: dispute, error: findError } = await supabase
    .from('disputes')
    .select('*')
    .eq('metadata->stripe_dispute_id', stripeDispute.id)
    .single();

  if (findError || !dispute) {
    console.warn('Dispute not found for update:', stripeDispute.id);
    return;
  }

  // Update status
  const statusMap: Record<string, string> = {
    'warning_needs_response': 'awaiting_merchant_response',
    'warning_under_review': 'under_review',
    'needs_response': 'awaiting_merchant_response',
    'under_review': 'under_review',
  };

  const newStatus = statusMap[stripeDispute.status] || dispute.status;

  const { error: updateError } = await supabase
    .from('disputes')
    .update({
      status: newStatus,
      metadata: {
        ...dispute.metadata,
        stripe_status: stripeDispute.status,
        last_updated_from_stripe: new Date().toISOString(),
      },
    })
    .eq('id', dispute.id);

  if (updateError) {
    console.error('Error updating dispute:', updateError);
  }

  // Update evidence if new evidence was submitted
  if (stripeDispute.evidence) {
    const evidenceItems = mapStripeEvidence(stripeDispute.evidence);

    for (const e of evidenceItems) {
      // Check if evidence already exists
      const { data: existing } = await supabase
        .from('dispute_evidence')
        .select('id')
        .eq('dispute_id', dispute.id)
        .eq('type', e.type)
        .single();

      if (!existing) {
        await supabase.from('dispute_evidence').insert({
          dispute_id: dispute.id,
          submitted_by: 'merchant',
          submitter_id: dispute.merchant_id,
          type: e.type,
          title: e.title,
          description: e.description,
          metadata: { source: 'stripe' },
        });
      }
    }
  }
}

async function handleDisputeClosed(stripeDispute: Stripe.Dispute) {
  console.log('Processing dispute closed:', stripeDispute.id);

  // Find existing dispute
  const { data: dispute, error: findError } = await supabase
    .from('disputes')
    .select('*')
    .eq('metadata->stripe_dispute_id', stripeDispute.id)
    .single();

  if (findError || !dispute) {
    console.warn('Dispute not found for close:', stripeDispute.id);
    return;
  }

  // Determine outcome
  let outcome: 'buyer_wins' | 'merchant_wins' | 'split';
  let reason: string;

  switch (stripeDispute.status) {
    case 'won':
      outcome = 'merchant_wins';
      reason = 'Dispute resolved in merchant\'s favor by Stripe';
      break;
    case 'lost':
      outcome = 'buyer_wins';
      reason = 'Dispute resolved in buyer\'s favor by Stripe';
      break;
    case 'charge_refunded':
      outcome = 'buyer_wins';
      reason = 'Charge was refunded';
      break;
    default:
      outcome = 'split';
      reason = `Dispute closed with status: ${stripeDispute.status}`;
  }

  // Create resolution record
  const { error: resolutionError } = await supabase
    .from('dispute_resolutions')
    .insert({
      dispute_id: dispute.id,
      outcome,
      refund_amount: outcome === 'buyer_wins' ? dispute.amount : 0,
      currency: dispute.currency,
      reason,
      resolved_by: 'human',
    });

  if (resolutionError) {
    console.error('Error creating resolution:', resolutionError);
  }

  // Update dispute status
  const { error: updateError } = await supabase
    .from('disputes')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      metadata: {
        ...dispute.metadata,
        stripe_status: stripeDispute.status,
        stripe_outcome: outcome,
        closed_at: new Date().toISOString(),
      },
    })
    .eq('id', dispute.id);

  if (updateError) {
    console.error('Error updating dispute status:', updateError);
  }

  console.log('Dispute resolved:', dispute.id, outcome);
}
