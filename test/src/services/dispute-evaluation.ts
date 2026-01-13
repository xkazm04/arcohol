import Anthropic from '@anthropic-ai/sdk';

// Types
export interface DisputeData {
  id: string;
  category: 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue' | 'unauthorized';
  amount: number;
  currency: string;
  description: string;
  desiredResolution: string;
  filedAt: string;
}

export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
  status: string;
}

export interface PartyProfile {
  id: string;
  accountAge: number; // days
  transactionCount: number;
  disputeCount: number;
  disputeWinRate: number;
  avgTransactionAmount: number;
}

export interface Evidence {
  type: string;
  title: string;
  description?: string;
  fileUrl?: string;
  submittedBy: 'buyer' | 'merchant';
  submittedAt: string;
}

export interface DeliveryProof {
  trackingNumber?: string;
  carrier?: string;
  deliveredAt?: string;
  signature?: string;
  ipAccessLogs?: string[];
}

export interface EvaluationInput {
  dispute: DisputeData;
  transaction: TransactionData;
  buyerProfile: PartyProfile;
  merchantProfile: PartyProfile;
  buyerEvidence: Evidence[];
  merchantEvidence: Evidence[];
  deliveryProof?: DeliveryProof;
  merchantResponse?: {
    acceptClaim: boolean;
    responseText: string;
    proposedResolution: string;
    proposedRefundAmount?: number;
  };
}

export interface EvaluationFactors {
  buyerHistory: {
    score: number;
    accountAge: string;
    disputeRate: string;
    trustLevel: string;
  };
  merchantHistory: {
    score: number;
    accountAge: string;
    disputeRate: string;
    deliveryProofRate: string;
  };
  evidenceQuality: {
    score: number;
    buyerEvidenceStrength: string;
    merchantEvidenceStrength: string;
    documentationGaps: string[];
  };
  transactionAnalysis: {
    score: number;
    amountPattern: string;
    timingFlags: string[];
    riskSignals: string[];
  };
  claimValidity: {
    score: number;
    categoryMatch: string;
    supportingFactors: string[];
    contradictions: string[];
  };
}

export interface EvaluationResult {
  recommendation: 'approve' | 'deny' | 'escalate';
  confidence: number;
  reasoning: string;
  factors: EvaluationFactors;
  suggestedResolution?: {
    type: 'full_refund' | 'partial_refund' | 'no_refund' | 'replacement';
    amount?: number;
  };
  escalationReason?: string;
}

// Evaluation weights from the plan
const EVALUATION_WEIGHTS = {
  partyHistory: 0.25,
  evidenceQuality: 0.30,
  transactionAnalysis: 0.20,
  claimValidity: 0.25,
};

// Decision thresholds
const THRESHOLDS = {
  autoApprove: 0.85,
  autoReject: 0.85,
  recommend: 0.70,
  escalate: 0.70,
  highValueAmount: 5000,
};

// Category-specific criteria
const CATEGORY_CRITERIA = {
  not_received: {
    keyEvidence: ['delivery_proof', 'tracking_info', 'ip_access_logs'],
    merchantMustProvide: ['tracking_number', 'delivery_confirmation'],
    buyerMustProvide: ['order_confirmation', 'communication_logs'],
  },
  not_as_described: {
    keyEvidence: ['product_photos', 'listing_screenshots', 'communication_logs'],
    merchantMustProvide: ['original_listing', 'product_specs'],
    buyerMustProvide: ['received_product_photos', 'discrepancy_description'],
  },
  duplicate_charge: {
    keyEvidence: ['transaction_ids', 'timestamps', 'bank_statements'],
    merchantMustProvide: ['transaction_logs', 'refund_history'],
    buyerMustProvide: ['bank_statement', 'duplicate_receipts'],
  },
  quality_issue: {
    keyEvidence: ['photo_evidence', 'industry_standards', 'expert_opinion'],
    merchantMustProvide: ['quality_specs', 'inspection_records'],
    buyerMustProvide: ['defect_photos', 'quality_comparison'],
  },
  unauthorized: {
    keyEvidence: ['auth_logs', 'ip_patterns', 'device_info'],
    merchantMustProvide: ['authentication_logs', 'ip_verification'],
    buyerMustProvide: ['identity_verification', 'fraud_report'],
  },
};

function buildSystemPrompt(): string {
  return `You are an expert dispute resolution AI for ArcPay, a B2B payment protection platform. Your role is to fairly evaluate disputes between buyers and merchants based on evidence, history, and platform policies.

## Evaluation Framework

You must evaluate disputes using these weighted factors:
1. **Party History (25%)**: Account age, transaction patterns, dispute history, trust level
2. **Evidence Quality (30%)**: Documentation completeness, evidence types, authenticity indicators
3. **Transaction Analysis (20%)**: Amount patterns, timing, risk signals, consistency
4. **Claim Validity (25%)**: Category-specific criteria, supporting factors, contradictions

## Decision Thresholds

- **APPROVE (favor buyer)**: When evidence strongly supports the buyer's claim
  - Auto-approve: Confidence > 85%
  - Recommend approval: Confidence 70-85%

- **DENY (favor merchant)**: When evidence strongly supports the merchant
  - Auto-deny: Confidence > 85%
  - Recommend denial: Confidence 70-85%

- **ESCALATE**: When human review is needed
  - Confidence < 70%
  - Contradictory evidence from both parties
  - High-value disputes (> $5,000)
  - VIP/enterprise accounts
  - Complex multi-party situations

## Category-Specific Criteria

### NOT_RECEIVED
- Must verify: Delivery proof, tracking information, IP access logs (for digital goods)
- Merchant must provide: Valid tracking number with delivery confirmation
- Red flags: Delivered to wrong address, no signature when required

### NOT_AS_DESCRIBED
- Must verify: Original listing vs actual product comparison
- Evidence weight: Photos, specifications, communication history
- Consider: Minor vs material differences, industry standards

### DUPLICATE_CHARGE
- Must verify: Transaction IDs, exact timestamps, amounts
- Merchant must prove: Transactions were for different items/services
- Auto-approve if: Identical transaction within 60 seconds

### QUALITY_ISSUE
- Must verify: Product photos, industry quality standards
- Consider: Subjective vs objective quality measures
- Evidence: Third-party inspection, expert opinion carries weight

### UNAUTHORIZED
- Must verify: Authentication logs, IP patterns, device fingerprints
- High scrutiny: Account security, 2FA status
- Merchant liability: Inadequate security measures

## Output Format

You must respond with a JSON object containing:
- recommendation: 'approve' | 'deny' | 'escalate'
- confidence: number between 0 and 1
- reasoning: human-readable explanation (2-3 sentences)
- factors: detailed breakdown of each evaluation factor
- suggestedResolution: (optional) { type, amount }
- escalationReason: (if escalating) specific reason

Be fair, thorough, and always explain your reasoning clearly.`;
}

function buildUserPrompt(input: EvaluationInput): string {
  const {
    dispute,
    transaction,
    buyerProfile,
    merchantProfile,
    buyerEvidence,
    merchantEvidence,
    deliveryProof,
    merchantResponse,
  } = input;

  return `## Dispute Details
- **ID**: ${dispute.id}
- **Category**: ${dispute.category}
- **Amount**: ${dispute.amount} ${dispute.currency}
- **Filed**: ${dispute.filedAt}
- **Claim**: ${dispute.description}
- **Desired Resolution**: ${dispute.desiredResolution}

## Transaction Information
- **Transaction ID**: ${transaction.id}
- **Amount**: ${transaction.amount} ${transaction.currency}
- **Date**: ${transaction.createdAt}
- **Status**: ${transaction.status}
${transaction.description ? `- **Description**: ${transaction.description}` : ''}

## Buyer Profile
- **Account Age**: ${buyerProfile.accountAge} days
- **Total Transactions**: ${buyerProfile.transactionCount}
- **Previous Disputes**: ${buyerProfile.disputeCount}
- **Dispute Win Rate**: ${(buyerProfile.disputeWinRate * 100).toFixed(0)}%
- **Average Transaction**: ${buyerProfile.avgTransactionAmount} ${dispute.currency}

## Merchant Profile
- **Account Age**: ${merchantProfile.accountAge} days
- **Total Transactions**: ${merchantProfile.transactionCount}
- **Previous Disputes**: ${merchantProfile.disputeCount}
- **Dispute Win Rate**: ${(merchantProfile.disputeWinRate * 100).toFixed(0)}%
- **Average Transaction**: ${merchantProfile.avgTransactionAmount} ${dispute.currency}

## Evidence from Buyer (${buyerEvidence.length} items)
${buyerEvidence.length > 0 ? buyerEvidence.map((e, i) => `${i + 1}. **${e.type}**: ${e.title}${e.description ? ` - ${e.description}` : ''}`).join('\n') : 'No evidence submitted'}

## Evidence from Merchant (${merchantEvidence.length} items)
${merchantEvidence.length > 0 ? merchantEvidence.map((e, i) => `${i + 1}. **${e.type}**: ${e.title}${e.description ? ` - ${e.description}` : ''}`).join('\n') : 'No evidence submitted'}

${deliveryProof ? `## Delivery Proof
- **Tracking Number**: ${deliveryProof.trackingNumber || 'Not provided'}
- **Carrier**: ${deliveryProof.carrier || 'Not provided'}
- **Delivered At**: ${deliveryProof.deliveredAt || 'Not confirmed'}
- **Signature**: ${deliveryProof.signature || 'Not required/provided'}
${deliveryProof.ipAccessLogs?.length ? `- **IP Access Logs**: ${deliveryProof.ipAccessLogs.length} entries` : ''}` : ''}

${merchantResponse ? `## Merchant Response
- **Accepts Claim**: ${merchantResponse.acceptClaim ? 'Yes' : 'No'}
- **Response**: ${merchantResponse.responseText}
- **Proposed Resolution**: ${merchantResponse.proposedResolution}
${merchantResponse.proposedRefundAmount ? `- **Proposed Refund**: ${merchantResponse.proposedRefundAmount} ${dispute.currency}` : ''}` : ''}

Please evaluate this dispute and provide your recommendation in JSON format.`;
}

function parseEvaluationResponse(content: string): EvaluationResult {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  if (!parsed.recommendation || !['approve', 'deny', 'escalate'].includes(parsed.recommendation)) {
    throw new Error('Invalid recommendation in response');
  }

  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error('Invalid confidence score in response');
  }

  return {
    recommendation: parsed.recommendation,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning || 'No reasoning provided',
    factors: parsed.factors || createDefaultFactors(),
    suggestedResolution: parsed.suggestedResolution,
    escalationReason: parsed.escalationReason,
  };
}

function createDefaultFactors(): EvaluationFactors {
  return {
    buyerHistory: {
      score: 0.5,
      accountAge: 'Unknown',
      disputeRate: 'Unknown',
      trustLevel: 'Standard',
    },
    merchantHistory: {
      score: 0.5,
      accountAge: 'Unknown',
      disputeRate: 'Unknown',
      deliveryProofRate: 'Unknown',
    },
    evidenceQuality: {
      score: 0.5,
      buyerEvidenceStrength: 'Moderate',
      merchantEvidenceStrength: 'Moderate',
      documentationGaps: [],
    },
    transactionAnalysis: {
      score: 0.5,
      amountPattern: 'Normal',
      timingFlags: [],
      riskSignals: [],
    },
    claimValidity: {
      score: 0.5,
      categoryMatch: 'Partial',
      supportingFactors: [],
      contradictions: [],
    },
  };
}

function shouldAutoEscalate(input: EvaluationInput): { escalate: boolean; reason?: string } {
  // High-value dispute
  if (input.dispute.amount > THRESHOLDS.highValueAmount) {
    return {
      escalate: true,
      reason: `High-value dispute ($${input.dispute.amount} exceeds $${THRESHOLDS.highValueAmount} threshold)`,
    };
  }

  // First-time buyer with large transaction
  if (input.buyerProfile.transactionCount <= 1 && input.dispute.amount > 1000) {
    return {
      escalate: true,
      reason: 'New buyer with significant transaction amount',
    };
  }

  // Merchant has very high dispute rate
  const merchantDisputeRate = input.merchantProfile.disputeCount / Math.max(input.merchantProfile.transactionCount, 1);
  if (merchantDisputeRate > 0.1 && input.merchantProfile.disputeCount > 5) {
    return {
      escalate: true,
      reason: `Merchant has elevated dispute rate (${(merchantDisputeRate * 100).toFixed(1)}%)`,
    };
  }

  return { escalate: false };
}

export async function evaluateDispute(input: EvaluationInput): Promise<EvaluationResult> {
  // Check for auto-escalation conditions
  const autoEscalate = shouldAutoEscalate(input);
  if (autoEscalate.escalate) {
    return {
      recommendation: 'escalate',
      confidence: 0.5,
      reasoning: autoEscalate.reason || 'Automated escalation triggered',
      factors: createDefaultFactors(),
      escalationReason: autoEscalate.reason,
    };
  }

  // If merchant accepts the claim, auto-approve
  if (input.merchantResponse?.acceptClaim) {
    return {
      recommendation: 'approve',
      confidence: 1.0,
      reasoning: 'Merchant has accepted the buyer\'s claim and agreed to resolution.',
      factors: createDefaultFactors(),
      suggestedResolution: {
        type: input.merchantResponse.proposedRefundAmount
          ? (input.merchantResponse.proposedRefundAmount >= input.dispute.amount ? 'full_refund' : 'partial_refund')
          : 'full_refund',
        amount: input.merchantResponse.proposedRefundAmount || input.dispute.amount,
      },
    };
  }

  // Initialize Anthropic client
  const anthropic = new Anthropic();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(input),
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    const result = parseEvaluationResponse(textContent.text);

    // Apply confidence thresholds
    if (result.confidence < THRESHOLDS.escalate && result.recommendation !== 'escalate') {
      return {
        ...result,
        recommendation: 'escalate',
        escalationReason: `Low confidence (${(result.confidence * 100).toFixed(0)}%) requires human review`,
      };
    }

    return result;
  } catch (error) {
    console.error('AI evaluation error:', error);

    // Fallback to escalation on error
    return {
      recommendation: 'escalate',
      confidence: 0,
      reasoning: 'AI evaluation failed. Escalating to human review.',
      factors: createDefaultFactors(),
      escalationReason: error instanceof Error ? error.message : 'Unknown evaluation error',
    };
  }
}

// Export utilities for testing
export const _internal = {
  buildSystemPrompt,
  buildUserPrompt,
  parseEvaluationResponse,
  shouldAutoEscalate,
  EVALUATION_WEIGHTS,
  THRESHOLDS,
  CATEGORY_CRITERIA,
};
