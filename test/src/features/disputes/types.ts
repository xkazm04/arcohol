/**
 * Disputes Feature Types
 * Configuration for automated dispute resolution
 */

// Delivery proof types (from SDK)
export type DeliveryType =
  | 'digital_delivery'
  | 'physical_shipment'
  | 'service_rendered'
  | 'subscription_access';

// Product types for delivery proof rules
export type ProductType = 'api' | 'subscription' | 'digital' | 'physical';

// Evidence types for required evidence
export type EvidenceType =
  | 'api_logs'
  | 'access_records'
  | 'usage_history'
  | 'activation_proof'
  | 'delivery_confirmation'
  | 'tracking_info'
  | 'service_records'
  | 'contract'
  | 'invoice'
  | 'communication_log';

// Webhook event types
export type DisputeWebhookEvent =
  | 'dispute.created'
  | 'dispute.updated'
  | 'dispute.response_required'
  | 'dispute.escalated'
  | 'dispute.resolved'
  | 'dispute.ai_evaluated';

// Dispute protection configuration
export interface DisputeProtectionConfig {
  id: string;
  organizationId: string;
  enabled: boolean;
  // Reserve settings
  reservePercentage: number; // 0-10
  reserveCap: number;
  reserveBalance: number;
  // AI thresholds
  autoApproveThreshold: number; // 0-1, e.g., 0.85
  autoDenyThreshold: number; // 0-1, e.g., 0.75
  // Response settings
  responseWindowHours: number; // Default 72
  // Notifications
  webhookUrl?: string;
  alertEmail?: string;
  webhookEvents: DisputeWebhookEvent[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Params for updating protection config
export interface UpdateDisputeProtectionParams {
  enabled?: boolean;
  reservePercentage?: number;
  reserveCap?: number;
  autoApproveThreshold?: number;
  autoDenyThreshold?: number;
  responseWindowHours?: number;
  webhookUrl?: string;
  alertEmail?: string;
  webhookEvents?: DisputeWebhookEvent[];
}

// Delivery proof rule for a product type
export interface DeliveryProofRule {
  id: string;
  organizationId: string;
  productType: ProductType;
  deliveryType: DeliveryType;
  requiredEvidence: EvidenceType[];
  autoAttach: boolean;
  createdAt: string;
}

// Params for creating/updating delivery proof rules
export interface CreateDeliveryProofRuleParams {
  productType: ProductType;
  deliveryType: DeliveryType;
  requiredEvidence: EvidenceType[];
  autoAttach?: boolean;
}

export interface UpdateDeliveryProofRuleParams {
  requiredEvidence?: EvidenceType[];
  autoAttach?: boolean;
}

// Auto-response rule for specific dispute categories
export interface AutoResponseRule {
  category: string;
  action: 'check_proof' | 'request_verification' | 'manual_review';
  autoRespondIfProofFound: boolean;
}

// Full config state used by the hook
export interface DisputeConfigState {
  protection: DisputeProtectionConfig | null;
  deliveryRules: DeliveryProofRule[];
  isLoading: boolean;
  error: string | null;
  noApiKey: boolean;
}

// Default values for new configurations
export const DEFAULT_PROTECTION_CONFIG: Omit<DisputeProtectionConfig, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> = {
  enabled: false,
  reservePercentage: 2,
  reserveCap: 5000,
  reserveBalance: 0,
  autoApproveThreshold: 0.85,
  autoDenyThreshold: 0.75,
  responseWindowHours: 72,
  webhookEvents: ['dispute.created', 'dispute.resolved'],
};

// Presets for different business types
export const DELIVERY_RULE_PRESETS: Record<ProductType, Omit<DeliveryProofRule, 'id' | 'organizationId' | 'createdAt'>> = {
  api: {
    productType: 'api',
    deliveryType: 'digital_delivery',
    requiredEvidence: ['api_logs', 'access_records'],
    autoAttach: true,
  },
  subscription: {
    productType: 'subscription',
    deliveryType: 'subscription_access',
    requiredEvidence: ['activation_proof', 'usage_history'],
    autoAttach: true,
  },
  digital: {
    productType: 'digital',
    deliveryType: 'digital_delivery',
    requiredEvidence: ['delivery_confirmation', 'access_records'],
    autoAttach: true,
  },
  physical: {
    productType: 'physical',
    deliveryType: 'physical_shipment',
    requiredEvidence: ['tracking_info', 'delivery_confirmation'],
    autoAttach: false,
  },
};
