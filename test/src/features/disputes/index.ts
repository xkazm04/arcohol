export { useDisputes, useDispute } from './hooks/useDisputes';
export { useDisputeActions } from './hooks/useDisputeActions';
export { useDisputeAnalytics } from './hooks/useDisputeAnalytics';
export { useDisputeConfig } from './hooks/useDisputeConfig';
export type { DisputeAnalytics, CategoryBreakdown, MonthlyTrend } from './hooks/useDisputeAnalytics';

// Dispute configuration types
export type {
  DeliveryType,
  ProductType,
  EvidenceType,
  DisputeWebhookEvent,
  DisputeProtectionConfig,
  UpdateDisputeProtectionParams,
  DeliveryProofRule,
  CreateDeliveryProofRuleParams,
  UpdateDeliveryProofRuleParams,
  AutoResponseRule,
  DisputeConfigState,
} from './types';

export {
  DEFAULT_PROTECTION_CONFIG,
  DELIVERY_RULE_PRESETS,
} from './types';
