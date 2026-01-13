'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreateDisputeInput {
  organizationId: string;
  transactionId: string;
  invoiceId?: string;
  buyerId: string;
  merchantId: string;
  amount: number;
  currency?: string;
  category: 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue' | 'unauthorized';
  description: string;
  desiredResolution: 'full_refund' | 'partial_refund' | 'replacement' | 'other';
  evidence?: Array<{
    type: string;
    title: string;
    description?: string;
    fileUrl?: string;
  }>;
}

interface RespondToDisputeInput {
  disputeId: string;
  acceptClaim: boolean;
  responseText: string;
  proposedResolution: 'full_refund' | 'partial_refund' | 'replacement' | 'reject';
  proposedRefundAmount?: number;
  evidence?: Array<{
    type: string;
    title: string;
    description?: string;
    fileUrl?: string;
  }>;
}

interface AddEvidenceInput {
  disputeId: string;
  submittedBy: 'buyer' | 'merchant';
  submitterId: string;
  type: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

interface ResolveDisputeInput {
  disputeId: string;
  outcome: 'buyer_wins' | 'merchant_wins' | 'split';
  refundAmount?: number;
  reason: string;
  resolvedBy: 'ai' | 'human';
  arbiterId?: string;
}

export function useDisputeActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const createDispute = useCallback(async (input: CreateDisputeInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate response deadline (72 hours from now)
      const merchantResponseDeadline = new Date();
      merchantResponseDeadline.setHours(merchantResponseDeadline.getHours() + 72);

      // Calculate resolution deadline (14 days from now)
      const resolutionDeadline = new Date();
      resolutionDeadline.setDate(resolutionDeadline.getDate() + 14);

      const { data: dispute, error: createError } = await supabase
        .from('disputes')
        .insert({
          organization_id: input.organizationId,
          transaction_id: input.transactionId,
          invoice_id: input.invoiceId,
          buyer_id: input.buyerId,
          merchant_id: input.merchantId,
          amount: input.amount,
          currency: input.currency || 'USDC',
          category: input.category,
          description: input.description,
          desired_resolution: input.desiredResolution,
          status: 'filed',
          filed_at: new Date().toISOString(),
          merchant_response_deadline: merchantResponseDeadline.toISOString(),
          resolution_deadline: resolutionDeadline.toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add evidence if provided
      if (input.evidence && input.evidence.length > 0) {
        const evidenceRecords = input.evidence.map(e => ({
          dispute_id: dispute.id,
          submitted_by: 'buyer',
          submitter_id: input.buyerId,
          type: e.type,
          title: e.title,
          description: e.description,
          file_url: e.fileUrl,
        }));

        const { error: evidenceError } = await supabase
          .from('dispute_evidence')
          .insert(evidenceRecords);

        if (evidenceError) {
          console.error('Error adding evidence:', evidenceError);
        }
      }

      return dispute;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dispute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const respondToDispute = useCallback(async (input: RespondToDisputeInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create merchant response
      const { data: response, error: responseError } = await supabase
        .from('merchant_responses')
        .insert({
          dispute_id: input.disputeId,
          accept_claim: input.acceptClaim,
          response_text: input.responseText,
          proposed_resolution: input.proposedResolution,
          proposed_refund_amount: input.proposedRefundAmount,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Update dispute status
      const newStatus = input.acceptClaim ? 'resolved' : 'merchant_responded';
      const updateData: Record<string, unknown> = {
        status: newStatus,
        merchant_responded_at: new Date().toISOString(),
      };

      if (input.acceptClaim) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', input.disputeId);

      if (updateError) throw updateError;

      // Add evidence if provided
      if (input.evidence && input.evidence.length > 0) {
        const evidenceRecords = input.evidence.map(e => ({
          dispute_id: input.disputeId,
          submitted_by: 'merchant',
          submitter_id: 'merchant', // Should be actual merchant ID
          type: e.type,
          title: e.title,
          description: e.description,
          file_url: e.fileUrl,
        }));

        await supabase.from('dispute_evidence').insert(evidenceRecords);
      }

      // If merchant accepts, create resolution
      if (input.acceptClaim) {
        await supabase.from('dispute_resolutions').insert({
          dispute_id: input.disputeId,
          outcome: 'buyer_wins',
          refund_amount: input.proposedRefundAmount,
          reason: 'Merchant accepted the claim',
          resolved_by: 'human',
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond to dispute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const addEvidence = useCallback(async (input: AddEvidenceInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('dispute_evidence')
        .insert({
          dispute_id: input.disputeId,
          submitted_by: input.submittedBy,
          submitter_id: input.submitterId,
          type: input.type,
          title: input.title,
          description: input.description,
          file_url: input.fileUrl,
          file_type: input.fileType,
          file_size: input.fileSize,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add evidence';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const escalateDispute = useCallback(async (disputeId: string, reason: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('disputes')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString(),
          metadata: { escalation_reason: reason },
        })
        .eq('id', disputeId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to escalate dispute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const resolveDispute = useCallback(async (input: ResolveDisputeInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create resolution record
      const { data: resolution, error: resolutionError } = await supabase
        .from('dispute_resolutions')
        .insert({
          dispute_id: input.disputeId,
          outcome: input.outcome,
          refund_amount: input.refundAmount,
          reason: input.reason,
          resolved_by: input.resolvedBy,
          arbiter_id: input.arbiterId,
        })
        .select()
        .single();

      if (resolutionError) throw resolutionError;

      // Update dispute status
      const { error: updateError } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', input.disputeId);

      if (updateError) throw updateError;

      return resolution;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve dispute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateDisputeStatus = useCallback(async (disputeId: string, status: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('disputes')
        .update({ status })
        .eq('id', disputeId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dispute status';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const evaluateDispute = useCallback(async (disputeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/disputes/${disputeId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Evaluation failed');
      }

      const data = await response.json();
      return data.evaluation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to evaluate dispute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createDispute,
    respondToDispute,
    addEvidence,
    escalateDispute,
    resolveDispute,
    updateDisputeStatus,
    evaluateDispute,
  };
}
