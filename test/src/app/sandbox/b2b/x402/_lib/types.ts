export interface Endpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | '*';
  price: string;
  currency: string;
  name?: string;
  description?: string;
  calls24h: number;
  calls30d: number;
  revenue24h: string;
  revenue30d: string;
  status: 'active' | 'paused';
  rateLimitPerMinute?: number;
}

export interface CreditAccount {
  id: string;
  externalCustomerId: string;
  balance: number;
  currency: string;
  totalSpent: number;
  totalRequests: number;
  lowBalanceThreshold: number;
  active: boolean;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'deduction' | 'refund' | 'bonus' | 'adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  endpoint?: string;
  description?: string;
  createdAt: string;
}

export interface UsageStats {
  totalRequests: number;
  totalRevenue: number;
  avgResponseTime: number;
  successRate: number;
  activeAccounts: number;
  totalBalance: number;
}

export interface RevenueData {
  day: string;
  amount: number;
  requests: number;
}

export type PricingModel = 'exact' | 'dynamic';

export type SectionId =
  | 'getting-started'
  | 'endpoints'
  | 'accounts'
  | 'middleware'
  | 'usage'
  | 'webhooks';

export type CodeTab = 'basic' | 'full' | 'hook';

export interface Section {
  id: SectionId;
  title: string;
  description: string;
  bestFor: string;
}

export const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Initialize the credits system and configure basic settings',
    bestFor: 'New integrations and quick setup',
  },
  {
    id: 'endpoints',
    title: 'Endpoint Pricing',
    description: 'Configure per-endpoint pricing for your API',
    bestFor: 'Setting up monetization rules',
  },
  {
    id: 'accounts',
    title: 'Customer Accounts',
    description: 'Manage customer credit accounts and balances',
    bestFor: 'Customer onboarding and balance management',
  },
  {
    id: 'middleware',
    title: 'API Protection',
    description: 'Protect your API routes with credit-based access control',
    bestFor: 'Securing and monetizing API endpoints',
  },
  {
    id: 'usage',
    title: 'Usage Analytics',
    description: 'Track usage, revenue, and customer activity',
    bestFor: 'Monitoring and reporting',
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Handle credit events and notifications',
    bestFor: 'Real-time notifications and automation',
  },
];
