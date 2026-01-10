/**
 * Dispute Resolution System Types
 * Direction 2: Automated Dispute Resolution
 */

import type {
  Identifiable,
  Metadata,
  Money,
  PaginationParams,
  Timestamped
} from './common';

// ============================================================================
// Dispute
// ============================================================================

export interface Dispute extends Identifiable, Timestamped {
  /** Transaction being disputed */
  transactionId: string;
  /** Buyer account ID */
  buyerId: string;
  /** Merchant account ID */
  merchantId: string;
  /** Disputed amount */
  amount: Money;
  /** Dispute category */
  category: DisputeCategory;
  /** Dispute status */
  status: DisputeStatus;
  /** Buyer's claim description */
  claim: string;
  /** Evidence submitted by buyer */
  buyerEvidence: Evidence[];
  /** Merchant's response */
  merchantResponse?: MerchantResponse;
  /** AI evaluation result */
  aiEvaluation?: AIEvaluation;
  /** Final resolution */
  resolution?: DisputeResolution;
  /** Desired resolution by buyer */
  desiredResolution: DesiredResolution;
  /** Deadline for merchant response */
  merchantResponseDeadline: Date;
  /** Estimated resolution date */
  estimatedResolution: Date;
  /** Dispute metadata */
  metadata?: Metadata;
}

export type DisputeCategory =
  | 'not_received'
  | 'not_as_described'
  | 'duplicate_charge'
  | 'quality_issue'
  | 'unauthorized'
  | 'other';

export type DisputeStatus =
  | 'filed'
  | 'under_review'
  | 'awaiting_merchant_response'
  | 'merchant_responded'
  | 'escalated'
  | 'resolved';

export type DesiredResolution =
  | 'full_refund'
  | 'partial_refund'
  | 'replacement'
  | 'other';

// ============================================================================
// Evidence
// ============================================================================

export interface Evidence {
  /** Evidence ID */
  id: string;
  /** Type of evidence */
  type: EvidenceType;
  /** URL to evidence file/document */
  url: string;
  /** Description of the evidence */
  description?: string;
  /** When the evidence was submitted */
  submittedAt: Date;
  /** Who submitted (buyer or merchant) */
  submittedBy: 'buyer' | 'merchant';
}

export type EvidenceType =
  | 'order_confirmation'
  | 'communication_log'
  | 'product_photos'
  | 'listing_screenshots'
  | 'delivery_proof'
  | 'tracking_info'
  | 'service_records'
  | 'contract'
  | 'invoice'
  | 'other';

// ============================================================================
// Merchant Response
// ============================================================================

export interface MerchantResponse {
  /** Response type */
  response: 'accept' | 'reject' | 'partial';
  /** Statement from merchant */
  statement: string;
  /** Evidence submitted by merchant */
  evidence: Evidence[];
  /** Partial refund amount (if response is 'partial') */
  partialAmount?: Money;
  /** When the response was submitted */
  submittedAt: Date;
}

// ============================================================================
// AI Evaluation
// ============================================================================

export interface AIEvaluation {
  /** AI recommendation */
  recommendation: 'approve' | 'deny' | 'escalate';
  /** Confidence score (0-1) */
  confidence: number;
  /** Reasoning for the recommendation */
  reasoning: string;
  /** Detailed analysis factors */
  factors: EvaluationFactors;
  /** Evaluation timestamp */
  evaluatedAt: Date;
  /** Model version used */
  modelVersion: string;
}

export interface EvaluationFactors {
  /** Buyer history analysis */
  buyerHistory: PartyHistoryAnalysis;
  /** Merchant history analysis */
  merchantHistory: PartyHistoryAnalysis;
  /** Evidence quality analysis */
  evidenceQuality: EvidenceQualityAnalysis;
  /** Transaction analysis */
  transactionAnalysis: TransactionAnalysis;
}

export interface PartyHistoryAnalysis {
  /** Total transactions */
  totalTransactions: number;
  /** Number of previous disputes */
  previousDisputes: number;
  /** Dispute rate (disputes / transactions) */
  disputeRate: number;
  /** Account age in days */
  accountAgeDays: number;
  /** Overall score (0-100) */
  score: number;
}

export interface EvidenceQualityAnalysis {
  /** Buyer evidence score (0-100) */
  buyerEvidenceScore: number;
  /** Merchant evidence score (0-100) */
  merchantEvidenceScore: number;
  /** Whether documentation is complete */
  documentationComplete: boolean;
  /** Missing evidence types */
  missingEvidence: EvidenceType[];
}

export interface TransactionAnalysis {
  /** Whether amount is typical for this buyer/merchant */
  amountTypical: boolean;
  /** Whether timing is suspicious */
  timingSuspicious: boolean;
  /** Any pattern matches found */
  patternMatch: string | null;
  /** Risk score (0-100) */
  riskScore: number;
}

// ============================================================================
// Dispute Resolution
// ============================================================================

export interface DisputeResolution {
  /** Resolution outcome */
  outcome: 'buyer_wins' | 'merchant_wins' | 'split';
  /** Refund amount (if any) */
  refundAmount?: Money;
  /** Resolution reason */
  reason: string;
  /** Whether resolved by AI or human */
  resolvedBy: 'ai' | 'human';
  /** Arbiter ID (if human) */
  arbiterId?: string;
  /** Resolution timestamp */
  resolvedAt: Date;
}

// ============================================================================
// Dispute Operations
// ============================================================================

export interface CreateDisputeParams {
  /** Transaction ID to dispute */
  transactionId: string;
  /** Dispute category */
  category: DisputeCategory;
  /** Description of the issue */
  description: string;
  /** Evidence to support the claim */
  evidence: CreateEvidenceParams[];
  /** Desired resolution */
  desiredResolution: DesiredResolution;
  /** Metadata */
  metadata?: Metadata;
}

export interface CreateEvidenceParams {
  /** Type of evidence */
  type: EvidenceType;
  /** URL to evidence */
  url: string;
  /** Description */
  description?: string;
}

export interface RespondToDisputeParams {
  /** Response type */
  response: 'accept' | 'reject' | 'partial';
  /** Statement explaining the response */
  statement: string;
  /** Counter-evidence */
  evidence?: CreateEvidenceParams[];
  /** Partial refund amount (if response is 'partial') */
  partialAmount?: number;
}

export interface ListDisputesParams extends PaginationParams {
  /** Filter by status */
  status?: DisputeStatus;
  /** Filter by category */
  category?: DisputeCategory;
  /** Filter by merchant ID */
  merchantId?: string;
  /** Filter by buyer ID */
  buyerId?: string;
  /** Filter by date range */
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// Dispute Protection Settings (for merchants)
// ============================================================================

export interface DisputeProtectionSettings {
  /** Merchant ID */
  merchantId: string;
  /** Whether dispute protection is enabled */
  enabled: boolean;
  /** Reserve percentage for potential refunds (0-10) */
  reservePercentage: number;
  /** Maximum reserve amount */
  reserveCap: number;
  /** Current reserve balance */
  reserveBalance: Money;
  /** Auto-approve threshold (0-1) */
  autoApproveThreshold: number;
  /** Auto-deny threshold (0-1) */
  autoDenyThreshold: number;
  /** Hours merchant has to respond */
  merchantResponseWindow: number;
  /** Webhook URL for dispute events */
  webhookUrl?: string;
  /** Email for dispute alerts */
  alertEmail?: string;
}

export interface UpdateDisputeProtectionParams {
  enabled?: boolean;
  reservePercentage?: number;
  reserveCap?: number;
  autoApproveThreshold?: number;
  autoDenyThreshold?: number;
  merchantResponseWindow?: number;
  webhookUrl?: string;
  alertEmail?: string;
}

// ============================================================================
// Delivery Proof (helps merchants win disputes)
// ============================================================================

export interface DeliveryProof extends Identifiable, Timestamped {
  /** Transaction ID */
  transactionId: string;
  /** Merchant ID */
  merchantId: string;
  /** Type of delivery */
  type: DeliveryType;
  /** Proof details */
  proof: DeliveryProofDetails;
}

export type DeliveryType =
  | 'digital_delivery'
  | 'physical_shipment'
  | 'service_rendered'
  | 'subscription_access';

export interface DeliveryProofDetails {
  /** Timestamp of delivery */
  timestamp: Date;
  /** Whether access/delivery was confirmed */
  confirmed: boolean;
  /** IP address (for digital) */
  ipAddress?: string;
  /** Download links (for digital) */
  downloadLinks?: string[];
  /** Tracking number (for physical) */
  trackingNumber?: string;
  /** Carrier (for physical) */
  carrier?: string;
  /** Signature (for physical) */
  signature?: string;
  /** Service completion details */
  serviceDetails?: string;
}

export interface RegisterDeliveryParams {
  transactionId: string;
  type: DeliveryType;
  proof: Omit<DeliveryProofDetails, 'timestamp'>;
}

// ============================================================================
// Dispute Events (for webhooks)
// ============================================================================

export type DisputeEventType =
  | 'dispute.created'
  | 'dispute.updated'
  | 'dispute.merchant_response_required'
  | 'dispute.merchant_responded'
  | 'dispute.escalated'
  | 'dispute.resolved'
  | 'dispute.refund_issued';

export interface DisputeEvent {
  type: DisputeEventType;
  disputeId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
