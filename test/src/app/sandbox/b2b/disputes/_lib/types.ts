export interface DisputeFormData {
  transactionId: string;
  amount: string;
  category: 'not_received' | 'quality';
  claim: string;
}

export interface Dispute {
  id: string;
  amount: { amount: string };
  status: 'filed' | 'under_review' | 'resolved';
  aiEvaluation?: {
    recommendation: 'approve' | 'deny' | 'review';
    confidence: number;
    reasoning: string;
  };
}
