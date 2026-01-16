import type { SectionInfo, PackageManager } from './types';

export const sections: SectionInfo[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description:
      'Install and configure the ArcPay B2B SDK for dispute protection. Initialize the client with your API key to enable buyer protection features.',
    useCase:
      'Required first step for any integration. Set up once in your backend to enable dispute management.',
  },
  {
    id: 'file-dispute',
    label: 'File Dispute',
    description:
      'Create a new dispute for a transaction. Buyers can file disputes with evidence, category, and desired resolution.',
    useCase:
      'Allow buyers to contest transactions for non-delivery, quality issues, unauthorized charges, or other problems.',
  },
  {
    id: 'respond',
    label: 'Merchant Response',
    description:
      'Respond to disputes as a merchant. Accept or contest claims with evidence and proposed resolutions.',
    useCase:
      'Merchant workflow for defending against disputes with documentation and delivery proofs.',
  },
  {
    id: 'ai-evaluation',
    label: 'AI Evaluation',
    description:
      'Trigger AI-powered dispute evaluation. The AI analyzes evidence, transaction history, and party reputation to recommend a resolution.',
    useCase:
      'Automated dispute resolution for faster processing. AI provides confidence scores and detailed reasoning.',
  },
  {
    id: 'delivery-proof',
    label: 'Delivery Proof',
    description:
      'Register proactive delivery proofs to prevent disputes. Store tracking numbers, signatures, and access logs.',
    useCase:
      'Dispute prevention for merchants. Pre-register delivery confirmation to automatically resolve "not received" claims.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description:
      'Listen for dispute events in real-time. Receive notifications for new disputes, status changes, and resolutions.',
    useCase:
      'Real-time integrations, notifications, automated workflows, and external system synchronization.',
  },
];

export const packageManagerCommands: Record<PackageManager, string> = {
  npm: 'npm install @arcpay/b2b',
  yarn: 'yarn add @arcpay/b2b',
  pnpm: 'pnpm add @arcpay/b2b',
  bun: 'bun add @arcpay/b2b',
};

export const categoryLabels: Record<string, string> = {
  not_received: 'Not Received',
  not_as_described: 'Not As Described',
  duplicate_charge: 'Duplicate Charge',
  quality_issue: 'Quality Issue',
  unauthorized: 'Unauthorized',
  other: 'Other',
};

export const terminalLines = [
  '> Initializing AI dispute evaluation model v4.2...',
  '> Loading factor weights: party_history=25%, evidence=30%, transaction=20%, claim=25%',
  '',
  '> [FACTOR 1/4] Analyzing party history (25% weight)...',
  '  - Buyer dispute rate: 2.1% (low risk)',
  '  - Merchant dispute rate: 0.8% (excellent)',
  '  - Account age verified: buyer=14mo, merchant=3yr',
  '',
  '> [FACTOR 2/4] Evaluating evidence quality (30% weight)...',
  '  - Evidence completeness: 85%',
  '  - Checking delivery proofs...',
  '  - Verifying API access logs...',
  '  - Cross-referencing timestamps...',
  '',
  '> [FACTOR 3/4] Transaction analysis (20% weight)...',
  '  - Amount within typical range: YES',
  '  - Velocity check: PASSED',
  '  - Pattern anomalies: NONE',
  '',
  '> [FACTOR 4/4] Claim validity assessment (25% weight)...',
  '  - Claim matches category: YES',
  '  - Evidence supports claim: PARTIAL',
  '  - Resolution precedent found: 3 similar cases',
  '',
  '> AGGREGATING WEIGHTED FACTORS...',
  '> COMPUTING FINAL CONFIDENCE SCORE...',
  '> GENERATING RECOMMENDATION...',
  '> EVALUATION COMPLETE.',
];

// Factor weights used in AI evaluation
export const aiFactorWeights = {
  partyHistory: { weight: 0.25, label: 'Party History' },
  evidenceQuality: { weight: 0.30, label: 'Evidence Quality' },
  transactionAnalysis: { weight: 0.20, label: 'Transaction Analysis' },
  claimValidity: { weight: 0.25, label: 'Claim Validity' },
};
