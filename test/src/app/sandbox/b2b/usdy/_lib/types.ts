// Re-export types from features
export type {
  UsdyStats as YieldStats,
  AutomationRule,
  UsdyTransaction as YieldTransaction,
  AutomationLog,
  CreateAutomationRuleParams,
  UpdateAutomationRuleParams,
  DepositParams,
  WithdrawParams,
} from '@/features/usdy';

export type SectionId =
  | 'getting-started'
  | 'deposit-withdraw'
  | 'yield-tracking'
  | 'automation-rules'
  | 'webhooks';

export type CodeTab = 'basic' | 'full' | 'hook';

export interface SectionInfo {
  id: SectionId;
  label: string;
  description: string;
  useCase: string;
}
