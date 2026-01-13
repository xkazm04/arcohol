export type SectionId =
  | 'getting-started'
  | 'file-dispute'
  | 'respond'
  | 'ai-evaluation'
  | 'delivery-proof'
  | 'webhooks';

export type CodeTab = 'basic' | 'full' | 'hook';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface SectionInfo {
  id: SectionId;
  label: string;
  description: string;
  useCase: string;
}

export interface DemoProps {
  variant: CodeTab;
}

// All dispute categories matching arcpay-b2b SDK
export type DisputeCategory =
  | 'not_received'
  | 'not_as_described'
  | 'duplicate_charge'
  | 'quality_issue'
  | 'unauthorized'
  | 'other';

export interface DisputeFormData {
  transactionId: string;
  amount: string;
  category: DisputeCategory;
  claim: string;
}

export interface Dispute {
  id: string;
  amount: { amount: string };
  status: 'filed' | 'under_review' | 'awaiting_merchant_response' | 'merchant_responded' | 'escalated' | 'resolved';
  category: string;
  description: string;
  aiEvaluation?: {
    recommendation: 'approve' | 'deny' | 'escalate';
    confidence: number;
    reasoning: string;
    factors?: Record<string, unknown>;
  };
}
