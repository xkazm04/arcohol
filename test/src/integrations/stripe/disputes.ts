import Stripe from 'stripe';

// Stripe reason to ArcPay category mapping
const STRIPE_REASON_MAP: Record<string, 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue' | 'unauthorized'> = {
  // Not received
  'product_not_received': 'not_received',
  'credit_not_processed': 'not_received',

  // Quality issues
  'product_unacceptable': 'quality_issue',

  // Unauthorized / Fraud
  'fraudulent': 'unauthorized',
  'unrecognized': 'unauthorized',

  // Duplicate
  'duplicate': 'duplicate_charge',

  // Not as described
  'subscription_canceled': 'not_as_described',
  'general': 'not_as_described',
};

// Map Stripe dispute status to ArcPay status
const STRIPE_STATUS_MAP: Record<string, string> = {
  'warning_needs_response': 'awaiting_merchant_response',
  'warning_under_review': 'under_review',
  'warning_closed': 'resolved',
  'needs_response': 'awaiting_merchant_response',
  'under_review': 'under_review',
  'charge_refunded': 'resolved',
  'won': 'resolved',
  'lost': 'resolved',
};

export interface StripeDisputeInput {
  stripeDispute: Stripe.Dispute;
  organizationId: string;
  merchantId: string;
}

export interface MappedDispute {
  organization_id: string;
  transaction_id: string;
  buyer_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  category: 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue' | 'unauthorized';
  description: string;
  desired_resolution: string;
  status: string;
  filed_at: string;
  merchant_response_deadline: string;
  resolution_deadline: string;
  metadata: {
    source: string;
    stripe_dispute_id: string;
    stripe_charge_id: string;
    stripe_payment_intent_id?: string;
    stripe_reason: string;
    stripe_status: string;
    stripe_network_reason_code?: string;
  };
}

export function mapStripeDispute(input: StripeDisputeInput): MappedDispute {
  const { stripeDispute, organizationId, merchantId } = input;

  // Map Stripe reason to ArcPay category
  const category = STRIPE_REASON_MAP[stripeDispute.reason] || 'not_as_described';

  // Map status
  const status = STRIPE_STATUS_MAP[stripeDispute.status] || 'filed';

  // Calculate deadlines
  const filedAt = new Date(stripeDispute.created * 1000);
  const responseDeadline = stripeDispute.evidence_details?.due_by
    ? new Date(stripeDispute.evidence_details.due_by * 1000)
    : new Date(filedAt.getTime() + 72 * 60 * 60 * 1000); // 72 hours default

  const resolutionDeadline = new Date(filedAt.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

  // Extract buyer ID from charge metadata or customer
  const buyerId = typeof stripeDispute.charge === 'string'
    ? stripeDispute.charge
    : (stripeDispute.charge?.customer as string) || 'unknown';

  return {
    organization_id: organizationId,
    transaction_id: stripeDispute.payment_intent as string || stripeDispute.charge as string || stripeDispute.id,
    buyer_id: buyerId,
    merchant_id: merchantId,
    amount: stripeDispute.amount / 100, // Convert from cents
    currency: stripeDispute.currency.toUpperCase(),
    category,
    description: getDisputeDescription(stripeDispute),
    desired_resolution: 'full_refund',
    status,
    filed_at: filedAt.toISOString(),
    merchant_response_deadline: responseDeadline.toISOString(),
    resolution_deadline: resolutionDeadline.toISOString(),
    metadata: {
      source: 'stripe',
      stripe_dispute_id: stripeDispute.id,
      stripe_charge_id: stripeDispute.charge as string,
      stripe_payment_intent_id: stripeDispute.payment_intent as string || undefined,
      stripe_reason: stripeDispute.reason,
      stripe_status: stripeDispute.status,
      stripe_network_reason_code: stripeDispute.evidence_details?.has_evidence ? 'evidence_submitted' : undefined,
    },
  };
}

function getDisputeDescription(dispute: Stripe.Dispute): string {
  const descriptions: Record<string, string> = {
    'product_not_received': 'Customer claims product was never received.',
    'product_unacceptable': 'Customer claims product quality is unacceptable.',
    'fraudulent': 'Customer claims transaction was unauthorized/fraudulent.',
    'duplicate': 'Customer claims charge was duplicated.',
    'subscription_canceled': 'Customer claims subscription was canceled but still charged.',
    'unrecognized': 'Customer does not recognize this charge.',
    'credit_not_processed': 'Customer claims refund/credit was not processed.',
    'general': 'Customer disputed the charge.',
  };

  return descriptions[dispute.reason] || `Dispute filed via Stripe: ${dispute.reason}`;
}

export interface EvidenceMapping {
  type: string;
  title: string;
  description?: string;
}

export function mapStripeEvidence(evidence: Stripe.Dispute.Evidence): EvidenceMapping[] {
  const mappedEvidence: EvidenceMapping[] = [];

  if (evidence.receipt) {
    mappedEvidence.push({
      type: 'receipt',
      title: 'Purchase Receipt',
      description: 'Receipt provided via Stripe',
    });
  }

  if (evidence.shipping_documentation) {
    mappedEvidence.push({
      type: 'shipping_proof',
      title: 'Shipping Documentation',
      description: evidence.shipping_carrier
        ? `Shipped via ${evidence.shipping_carrier}`
        : 'Shipping proof provided',
    });
  }

  if (evidence.customer_communication) {
    mappedEvidence.push({
      type: 'correspondence',
      title: 'Customer Communication',
      description: 'Communication logs with customer',
    });
  }

  if (evidence.refund_policy || evidence.refund_policy_disclosure) {
    mappedEvidence.push({
      type: 'policy',
      title: 'Refund Policy',
      description: 'Merchant refund policy documentation',
    });
  }

  if (evidence.access_activity_log) {
    mappedEvidence.push({
      type: 'access_log',
      title: 'Access Activity Log',
      description: 'Customer access activity for digital goods',
    });
  }

  return mappedEvidence;
}

// Helper to determine if a dispute should trigger auto-evaluation
export function shouldAutoEvaluate(dispute: Stripe.Dispute): boolean {
  // Auto-evaluate for amounts under $500
  if (dispute.amount < 50000) return true;

  // Auto-evaluate if evidence deadline is soon (within 24 hours)
  if (dispute.evidence_details?.due_by) {
    const deadline = dispute.evidence_details.due_by * 1000;
    const now = Date.now();
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    if (hoursLeft < 24) return true;
  }

  return false;
}

// Get recommended action based on Stripe dispute details
export function getRecommendedAction(dispute: Stripe.Dispute): {
  action: 'respond' | 'accept' | 'escalate';
  reason: string;
} {
  // If already won or lost, no action needed
  if (dispute.status === 'won' || dispute.status === 'lost' || dispute.status === 'charge_refunded') {
    return { action: 'accept', reason: 'Dispute already resolved' };
  }

  // Fraudulent disputes should be carefully reviewed
  if (dispute.reason === 'fraudulent' && dispute.amount > 50000) {
    return { action: 'escalate', reason: 'High-value fraud claim requires human review' };
  }

  // Duplicate charges can often be auto-resolved
  if (dispute.reason === 'duplicate') {
    return { action: 'respond', reason: 'Duplicate charge disputes often have clear evidence' };
  }

  // Default: respond with evidence
  return { action: 'respond', reason: 'Review and respond with available evidence' };
}
