/**
 * Disputes Resource
 * Direction 2: Automated Dispute Resolution System
 */

import { BaseResource } from './base';
import type {
  ArcPayB2BConfig,
  PaginatedList,
  Dispute,
  CreateDisputeParams,
  RespondToDisputeParams,
  ListDisputesParams,
  DisputeProtectionSettings,
  UpdateDisputeProtectionParams,
  DeliveryProof,
  RegisterDeliveryParams,
  Evidence,
  CreateEvidenceParams,
} from '../types';
import {
  validateString,
  validateUrl,
  validateEnum,
} from '../utils/validation';

const DISPUTE_CATEGORIES = [
  'not_received',
  'not_as_described',
  'duplicate_charge',
  'quality_issue',
  'unauthorized',
  'other',
] as const;

const DESIRED_RESOLUTIONS = [
  'full_refund',
  'partial_refund',
  'replacement',
  'other',
] as const;

const EVIDENCE_TYPES = [
  'order_confirmation',
  'communication_log',
  'product_photos',
  'listing_screenshots',
  'delivery_proof',
  'tracking_info',
  'service_records',
  'contract',
  'invoice',
  'other',
] as const;

export class DisputesResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  // ==========================================================================
  // Dispute Operations
  // ==========================================================================

  /**
   * Create a new dispute (buyer action)
   */
  async create(params: CreateDisputeParams): Promise<Dispute> {
    validateString(params.transactionId, 'transactionId');
    validateString(params.description, 'description', { minLength: 20 });
    validateEnum(params.category, DISPUTE_CATEGORIES, 'category');
    validateEnum(params.desiredResolution, DESIRED_RESOLUTIONS, 'desiredResolution');

    // Validate evidence
    for (let i = 0; i < params.evidence.length; i++) {
      const ev = params.evidence[i];
      validateEnum(ev.type, EVIDENCE_TYPES, `evidence[${i}].type`);
      validateUrl(ev.url, `evidence[${i}].url`);
    }

    return this.request<Dispute>({
      method: 'POST',
      path: '/disputes',
      body: params,
    });
  }

  /**
   * Get a dispute by ID
   */
  async get(disputeId: string): Promise<Dispute> {
    validateString(disputeId, 'disputeId');

    return this.request<Dispute>({
      method: 'GET',
      path: `/disputes/${disputeId}`,
    });
  }

  /**
   * List disputes
   */
  async list(params?: ListDisputesParams): Promise<PaginatedList<Dispute>> {
    return this.listRequest<Dispute>('/disputes', params);
  }

  /**
   * Respond to a dispute (merchant action)
   */
  async respond(
    disputeId: string,
    params: RespondToDisputeParams
  ): Promise<Dispute> {
    validateString(disputeId, 'disputeId');
    validateString(params.statement, 'statement', { minLength: 20 });
    validateEnum(params.response, ['accept', 'reject', 'partial'], 'response');

    if (params.response === 'partial' && !params.partialAmount) {
      throw new Error('partialAmount is required when response is "partial"');
    }

    // Validate evidence if provided
    if (params.evidence) {
      for (let i = 0; i < params.evidence.length; i++) {
        const ev = params.evidence[i];
        validateEnum(ev.type, EVIDENCE_TYPES, `evidence[${i}].type`);
        validateUrl(ev.url, `evidence[${i}].url`);
      }
    }

    return this.request<Dispute>({
      method: 'POST',
      path: `/disputes/${disputeId}/respond`,
      body: params,
    });
  }

  /**
   * Add additional evidence to a dispute
   */
  async addEvidence(
    disputeId: string,
    evidence: CreateEvidenceParams
  ): Promise<Evidence> {
    validateString(disputeId, 'disputeId');
    validateEnum(evidence.type, EVIDENCE_TYPES, 'type');
    validateUrl(evidence.url, 'url');

    return this.request<Evidence>({
      method: 'POST',
      path: `/disputes/${disputeId}/evidence`,
      body: evidence,
    });
  }

  /**
   * Request escalation to human review
   */
  async escalate(disputeId: string, reason: string): Promise<Dispute> {
    validateString(disputeId, 'disputeId');
    validateString(reason, 'reason', { minLength: 10 });

    return this.request<Dispute>({
      method: 'POST',
      path: `/disputes/${disputeId}/escalate`,
      body: { reason },
    });
  }

  /**
   * Accept a dispute resolution (for appeals)
   */
  async acceptResolution(disputeId: string): Promise<Dispute> {
    validateString(disputeId, 'disputeId');

    return this.request<Dispute>({
      method: 'POST',
      path: `/disputes/${disputeId}/accept`,
    });
  }

  /**
   * Appeal a dispute resolution (one-time)
   */
  async appeal(disputeId: string, reason: string): Promise<Dispute> {
    validateString(disputeId, 'disputeId');
    validateString(reason, 'reason', { minLength: 20 });

    return this.request<Dispute>({
      method: 'POST',
      path: `/disputes/${disputeId}/appeal`,
      body: { reason },
    });
  }

  // ==========================================================================
  // Dispute Protection Settings (Merchant)
  // ==========================================================================

  /**
   * Get dispute protection settings
   */
  async getProtectionSettings(merchantId: string): Promise<DisputeProtectionSettings> {
    validateString(merchantId, 'merchantId');

    return this.request<DisputeProtectionSettings>({
      method: 'GET',
      path: `/merchants/${merchantId}/dispute-protection`,
    });
  }

  /**
   * Update dispute protection settings
   */
  async updateProtectionSettings(
    merchantId: string,
    params: UpdateDisputeProtectionParams
  ): Promise<DisputeProtectionSettings> {
    validateString(merchantId, 'merchantId');

    return this.request<DisputeProtectionSettings>({
      method: 'PATCH',
      path: `/merchants/${merchantId}/dispute-protection`,
      body: params,
    });
  }

  /**
   * Enable dispute protection
   */
  async enableProtection(merchantId: string): Promise<DisputeProtectionSettings> {
    return this.updateProtectionSettings(merchantId, { enabled: true });
  }

  /**
   * Disable dispute protection
   */
  async disableProtection(merchantId: string): Promise<DisputeProtectionSettings> {
    return this.updateProtectionSettings(merchantId, { enabled: false });
  }

  // ==========================================================================
  // Delivery Proof (Merchant)
  // ==========================================================================

  /**
   * Register delivery proof for a transaction
   */
  async registerDelivery(params: RegisterDeliveryParams): Promise<DeliveryProof> {
    validateString(params.transactionId, 'transactionId');

    return this.request<DeliveryProof>({
      method: 'POST',
      path: '/delivery-proofs',
      body: {
        ...params,
        proof: {
          ...params.proof,
          timestamp: new Date(),
        },
      },
    });
  }

  /**
   * Get delivery proof for a transaction
   */
  async getDeliveryProof(transactionId: string): Promise<DeliveryProof | null> {
    validateString(transactionId, 'transactionId');

    try {
      return await this.request<DeliveryProof>({
        method: 'GET',
        path: `/delivery-proofs/${transactionId}`,
      });
    } catch (error) {
      // Return null if not found
      if ((error as { statusCode?: number }).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update delivery proof
   */
  async updateDeliveryProof(
    transactionId: string,
    proof: Partial<RegisterDeliveryParams['proof']>
  ): Promise<DeliveryProof> {
    validateString(transactionId, 'transactionId');

    return this.request<DeliveryProof>({
      method: 'PATCH',
      path: `/delivery-proofs/${transactionId}`,
      body: { proof },
    });
  }
}

// ==========================================================================
// Dispute Protection Helper Class
// ==========================================================================

/**
 * Helper class for managing dispute protection
 */
export class DisputeProtection {
  private readonly disputes: DisputesResource;
  private readonly merchantId: string;

  constructor(options: {
    disputes: DisputesResource;
    merchantId: string;
  }) {
    this.disputes = options.disputes;
    this.merchantId = options.merchantId;
  }

  /**
   * Get current settings
   */
  async getSettings(): Promise<DisputeProtectionSettings> {
    return this.disputes.getProtectionSettings(this.merchantId);
  }

  /**
   * Update settings
   */
  async updateSettings(
    params: UpdateDisputeProtectionParams
  ): Promise<DisputeProtectionSettings> {
    return this.disputes.updateProtectionSettings(this.merchantId, params);
  }

  /**
   * Register delivery proof
   */
  async registerDelivery(
    params: Omit<RegisterDeliveryParams, 'merchantId'>
  ): Promise<DeliveryProof> {
    return this.disputes.registerDelivery(params);
  }

  /**
   * Respond to a dispute
   */
  async respond(
    disputeId: string,
    params: RespondToDisputeParams
  ): Promise<Dispute> {
    return this.disputes.respond(disputeId, params);
  }

  /**
   * List disputes for this merchant
   */
  async listDisputes(
    params?: Omit<ListDisputesParams, 'merchantId'>
  ): Promise<PaginatedList<Dispute>> {
    return this.disputes.list({
      ...params,
      merchantId: this.merchantId,
    });
  }
}
