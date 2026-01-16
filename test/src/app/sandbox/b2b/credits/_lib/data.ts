import type { MeterOption, SectionInfo, Subscription, SubscriptionStats } from './types';

export const meterOptions: MeterOption[] = [
  { value: 'api_call', label: 'API Call', rate: 0.01, unit: 'call' },
  { value: 'data_export', label: 'Data Export', rate: 0.50, unit: 'GB' },
  { value: 'premium_feature', label: 'Premium Feature', rate: 5.00, unit: 'usage' },
  { value: 'storage_gb', label: 'Storage', rate: 0.10, unit: 'GB/mo' },
];

export const sections: SectionInfo[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description:
      'Initialize the ArcPay B2B SDK for subscription management. Set up recurring billing with metered usage support.',
    useCase:
      'SaaS platforms, API services, and any business with recurring revenue models.',
  },
  {
    id: 'create-subscription',
    label: 'Create Subscription',
    description:
      'Create new subscriptions with flexible billing intervals, usage-based pricing, and automatic payment collection.',
    useCase:
      'Onboarding new customers, plan upgrades, and trial conversions.',
  },
  {
    id: 'manage-subscriptions',
    label: 'Manage',
    description:
      'Update, pause, resume, or cancel subscriptions. Handle plan changes and prorated billing automatically.',
    useCase:
      'Customer self-service portals, admin dashboards, and churn prevention.',
  },
  {
    id: 'usage-metering',
    label: 'Usage Metering',
    description:
      'Track and bill for usage-based consumption. Report usage events and calculate charges in real-time.',
    useCase:
      'API platforms, cloud services, and consumption-based pricing models.',
  },
  {
    id: 'micro-subscriptions',
    label: 'Micro Subscriptions',
    description:
      'x402 gasless micropayments for per-use billing. Pre-authorize spend limits and batch settle charges for minimal gas costs.',
    useCase:
      'AI API usage, pay-per-request services, IoT data streaming, and fractional payments.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description:
      'Listen for subscription lifecycle events. Handle renewals, failures, and status changes in real-time.',
    useCase:
      'Automated provisioning, dunning workflows, and analytics integrations.',
  },
  {
    id: 'dashboard-api',
    label: 'Dashboard API',
    description:
      'Use the built-in Next.js API routes for subscription and invoice management. Includes authentication and organization context.',
    useCase:
      'Building custom dashboards, integrating with existing Next.js apps, and white-label solutions.',
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    name: 'Enterprise API',
    planId: 'plan_enterprise',
    planName: 'Enterprise',
    status: 'active',
    amount: 999,
    currency: 'USDC',
    interval: 'monthly',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    customer: { id: 'cus_1', name: 'Acme Corp', email: 'billing@acme.com' },
    createdAt: '2023-06-15',
  },
  {
    id: 'sub_2',
    name: 'Pro Plan',
    planId: 'plan_pro',
    planName: 'Pro',
    status: 'active',
    amount: 299,
    currency: 'USDC',
    interval: 'monthly',
    currentPeriodStart: '2024-01-05',
    currentPeriodEnd: '2024-02-05',
    customer: { id: 'cus_2', name: 'TechStart Inc', email: 'finance@techstart.io' },
    createdAt: '2023-09-20',
  },
  {
    id: 'sub_3',
    name: 'Starter Plan',
    planId: 'plan_starter',
    planName: 'Starter',
    status: 'active',
    amount: 49,
    currency: 'USDC',
    interval: 'monthly',
    currentPeriodStart: '2024-01-10',
    currentPeriodEnd: '2024-02-10',
    customer: { id: 'cus_3', name: 'DevShop LLC', email: 'admin@devshop.co' },
    createdAt: '2023-11-01',
  },
  {
    id: 'sub_4',
    name: 'Enterprise Annual',
    planId: 'plan_enterprise_annual',
    planName: 'Enterprise (Annual)',
    status: 'active',
    amount: 9990,
    currency: 'USDC',
    interval: 'yearly',
    currentPeriodStart: '2023-07-01',
    currentPeriodEnd: '2024-07-01',
    customer: { id: 'cus_4', name: 'Global Systems', email: 'ap@globalsystems.com' },
    createdAt: '2023-07-01',
  },
  {
    id: 'sub_5',
    name: 'Pro Plan',
    planId: 'plan_pro',
    planName: 'Pro',
    status: 'past_due',
    amount: 299,
    currency: 'USDC',
    interval: 'monthly',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    customer: { id: 'cus_5', name: 'StartupXYZ', email: 'billing@startupxyz.com' },
    createdAt: '2023-08-15',
  },
];

export const mockStats: SubscriptionStats = {
  totalSubscriptions: 47,
  subscriptionsChange: 5,
  monthlyIncome: 12450,
  incomeChange: 8.5,
  expectedYield: 62.25,
  yieldPercentage: 5.2,
};
