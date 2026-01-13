export type SectionId =
  | 'getting-started'
  | 'create-subscription'
  | 'manage-subscriptions'
  | 'usage-metering'
  | 'webhooks'
  | 'dashboard-api';

export type CodeTab = 'basic' | 'full' | 'hook';

export interface SectionInfo {
  id: SectionId;
  label: string;
  description: string;
  useCase: string;
}

export interface MeterOption {
  value: string;
  label: string;
  rate: number;
  unit: string;
}

export interface Subscription {
  id: string;
  name: string;
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  subscriptionsChange: number;
  monthlyIncome: number;
  incomeChange: number;
  expectedYield: number;
  yieldPercentage: number;
}
