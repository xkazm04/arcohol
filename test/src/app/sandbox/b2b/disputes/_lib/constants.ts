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
  '> Initializing dispute evaluation model...',
  '> Analyzing transaction history...',
  '> Verifying delivery metadata...',
  '> Checking buyer reputation score...',
  '> Checking merchant reputation score...',
  '> Evaluating evidence quality...',
  '> AGGREGATING SIGNALS...',
  '> COMPUTING CONFIDENCE SCORE...',
  '> DONE.',
];
