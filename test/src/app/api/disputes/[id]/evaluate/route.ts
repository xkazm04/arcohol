import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateDispute, EvaluationInput, EvaluationResult } from '@/services/dispute-evaluation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const startTime = Date.now();

  try {
    const { id: disputeId } = await context.params;
    const supabase = await createClient();

    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the dispute with all related data
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select(`
        *,
        dispute_evidence(*),
        merchant_responses(*),
        ai_evaluations(*)
      `)
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Check if already evaluated and not overridden
    const existingEval = dispute.ai_evaluations?.[0];
    if (existingEval && !existingEval.overridden) {
      return NextResponse.json(
        {
          message: 'Dispute already evaluated',
          evaluation: existingEval,
        },
        { status: 200 }
      );
    }

    // Fetch buyer profile (aggregate stats)
    const buyerProfile = await fetchPartyProfile(supabase, dispute.buyer_id, dispute.organization_id);

    // Fetch merchant profile (aggregate stats)
    const merchantProfile = await fetchPartyProfile(supabase, dispute.merchant_id, dispute.organization_id);

    // Fetch delivery proof if exists
    const { data: deliveryProof } = await supabase
      .from('delivery_proofs')
      .select('*')
      .eq('transaction_id', dispute.transaction_id)
      .eq('organization_id', dispute.organization_id)
      .single();

    // Prepare evaluation input
    const evaluationInput: EvaluationInput = {
      dispute: {
        id: dispute.id,
        category: dispute.category,
        amount: parseFloat(dispute.amount),
        currency: dispute.currency || 'USDC',
        description: dispute.description,
        desiredResolution: dispute.desired_resolution || 'full_refund',
        filedAt: dispute.filed_at,
      },
      transaction: {
        id: dispute.transaction_id,
        amount: parseFloat(dispute.amount),
        currency: dispute.currency || 'USDC',
        createdAt: dispute.filed_at, // Using filed_at as proxy
        status: 'completed',
      },
      buyerProfile,
      merchantProfile,
      buyerEvidence: (dispute.dispute_evidence || [])
        .filter((e: { submitted_by: string }) => e.submitted_by === 'buyer')
        .map(mapEvidence),
      merchantEvidence: (dispute.dispute_evidence || [])
        .filter((e: { submitted_by: string }) => e.submitted_by === 'merchant')
        .map(mapEvidence),
      deliveryProof: deliveryProof ? {
        trackingNumber: deliveryProof.proof?.tracking_number,
        carrier: deliveryProof.proof?.carrier,
        deliveredAt: deliveryProof.proof?.delivered_at,
        signature: deliveryProof.proof?.signature_url,
        ipAccessLogs: deliveryProof.proof?.ip_addresses,
      } : undefined,
      merchantResponse: dispute.merchant_responses?.[0] ? {
        acceptClaim: dispute.merchant_responses[0].accept_claim,
        responseText: dispute.merchant_responses[0].response_text,
        proposedResolution: dispute.merchant_responses[0].proposed_resolution,
        proposedRefundAmount: dispute.merchant_responses[0].proposed_refund_amount
          ? parseFloat(dispute.merchant_responses[0].proposed_refund_amount)
          : undefined,
      } : undefined,
    };

    // Run AI evaluation
    const result = await evaluateDispute(evaluationInput);

    const processingTime = Date.now() - startTime;

    // Store evaluation in database
    const { data: savedEvaluation, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        dispute_id: disputeId,
        recommendation: result.recommendation,
        confidence: result.confidence,
        reasoning: result.reasoning,
        factors: result.factors,
        model_version: 'claude-sonnet-4-20250514',
        processing_time_ms: processingTime,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving evaluation:', saveError);
      // Still return the result even if save fails
    }

    // Update dispute status if needed
    if (result.recommendation === 'escalate') {
      await supabase
        .from('disputes')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString(),
          metadata: {
            ...dispute.metadata,
            escalation_reason: result.escalationReason,
          },
        })
        .eq('id', disputeId);
    } else {
      await supabase
        .from('disputes')
        .update({ status: 'under_review' })
        .eq('id', disputeId);
    }

    return NextResponse.json({
      success: true,
      evaluation: savedEvaluation || {
        ...result,
        processing_time_ms: processingTime,
      },
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    );
  }
}

interface SupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: string) => {
        or?: (filter: string) => {
          gte?: (column: string, value: string) => Promise<{ data: unknown[]; error: unknown }>;
        };
      };
      gte?: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<{ data: unknown[]; error: unknown }>;
      };
    };
  };
}

interface PartyProfile {
  id: string;
  accountAge: number;
  transactionCount: number;
  disputeCount: number;
  disputeWinRate: number;
  avgTransactionAmount: number;
}

async function fetchPartyProfile(
  supabase: SupabaseClient,
  partyId: string,
  organizationId: string
): Promise<PartyProfile> {
  // Get disputes by this party
  const { data: disputes } = await supabase
    .from('disputes')
    .select('id, amount, status, resolved_at')
    .eq('organization_id', organizationId)
    .or(`buyer_id.eq.${partyId},merchant_id.eq.${partyId}`) as { data: Array<{ id: string; amount: string; status: string; resolved_at: string }> | null };

  const disputeCount = disputes?.length || 0;
  const resolvedDisputes = disputes?.filter(d => d.status === 'resolved') || [];
  const wonDisputes = resolvedDisputes.length; // Simplified - would need resolution data

  // Calculate average transaction amount from disputes
  const totalAmount = disputes?.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0) || 0;
  const avgAmount = disputeCount > 0 ? totalAmount / disputeCount : 0;

  return {
    id: partyId,
    accountAge: 90, // Default - would need actual account data
    transactionCount: disputeCount * 10, // Estimate - would need transaction data
    disputeCount,
    disputeWinRate: resolvedDisputes.length > 0 ? wonDisputes / resolvedDisputes.length : 0.5,
    avgTransactionAmount: avgAmount,
  };
}

interface EvidenceRecord {
  type: string;
  title: string;
  description?: string;
  file_url?: string;
  submitted_by: 'buyer' | 'merchant';
  created_at: string;
}

function mapEvidence(e: EvidenceRecord) {
  return {
    type: e.type,
    title: e.title,
    description: e.description,
    fileUrl: e.file_url,
    submittedBy: e.submitted_by as 'buyer' | 'merchant',
    submittedAt: e.created_at,
  };
}
