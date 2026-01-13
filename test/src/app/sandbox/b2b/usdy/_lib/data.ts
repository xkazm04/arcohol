import type { SectionInfo, YieldStats, AutomationRule, YieldTransaction } from './types';

export const sections: SectionInfo[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description:
      'Initialize USDY yield integration for automated treasury management. Earn yield on idle funds.',
    useCase:
      'Treasury management, cash flow optimization, and passive income generation.',
  },
  {
    id: 'deposit-withdraw',
    label: 'Deposit & Withdraw',
    description:
      'Deposit funds to earn yield or withdraw to your operating balance. Instant liquidity with T+0 settlement.',
    useCase:
      'Manual treasury operations, liquidity management, and fund rebalancing.',
  },
  {
    id: 'yield-tracking',
    label: 'Yield Tracking',
    description:
      'Monitor yield accrual in real-time. Track APY changes, daily earnings, and projected returns.',
    useCase:
      'Financial reporting, yield optimization, and performance analytics.',
  },
  {
    id: 'automation-rules',
    label: 'Automation Rules',
    description:
      'Create intelligent rules to automatically move funds to USDY based on balance thresholds or schedules.',
    useCase:
      'Automated treasury, sweep accounts, and yield maximization strategies.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description:
      'Listen for yield events, deposit confirmations, and automation triggers in real-time.',
    useCase:
      'Accounting integrations, notifications, and audit trails.',
  },
];

// Default/fallback values when API is loading
export const defaultYieldStats: YieldStats = {
  totalBalance: 0,
  currentApy: 5.2,
  earnedThisMonth: 0,
  earnedAllTime: 0,
  dailyYield: 0,
  projectedMonthlyYield: 0,
  automatedDeposits: 0,
  activeRulesCount: 0,
  pendingDeposits: 0,
  chain: 'arc',
  currency: 'USDY',
};

// Mock data for demo/development purposes
export const mockYieldStats: YieldStats = {
  totalBalance: 125000,
  currentApy: 5.2,
  earnedThisMonth: 541.67,
  earnedAllTime: 3250.00,
  dailyYield: 17.81,
  projectedMonthlyYield: 541.67,
  pendingDeposits: 0,
  automatedDeposits: 47500,
  activeRulesCount: 2,
  chain: 'arc',
  currency: 'USDY',
};

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule_1',
    name: 'Subscription Revenue Split',
    type: 'percentage',
    enabled: true,
    description: 'Automatically deposit 30% of subscription revenue to USDY',
    config: {
      percentage: 30,
      sourceAccount: 'Subscription Income',
    },
    percentage: 30,
    sourceAccount: 'Subscription Income',
    lastTriggeredAt: '2024-01-15T10:30:00Z',
    totalDeposited: 35000,
    executionCount: 7,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule_2',
    name: 'Balance Threshold Sweep',
    type: 'threshold',
    enabled: true,
    description: 'Sweep funds to USDY when balance exceeds $50,000',
    config: {
      threshold: 50000,
      targetBalance: 25000,
      sourceAccount: 'Operating Balance',
    },
    threshold: 50000,
    sourceAccount: 'Operating Balance',
    lastTriggeredAt: '2024-01-10T08:00:00Z',
    totalDeposited: 12500,
    executionCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule_3',
    name: 'Weekly Deposit',
    type: 'scheduled',
    enabled: false,
    description: 'Deposit 10% of balance every Monday',
    config: {
      schedule: '0 9 * * MON',
      percentage: 10,
      sourceAccount: 'Operating Balance',
    },
    schedule: 'Every Monday at 9:00 AM',
    percentage: 10,
    sourceAccount: 'Operating Balance',
    totalDeposited: 0,
    executionCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockYieldTransactions: YieldTransaction[] = [
  {
    id: 'txn_1',
    type: 'deposit',
    amount: 5000,
    currency: 'USDC',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    description: 'Subscription Revenue Split',
  },
  {
    id: 'txn_2',
    type: 'yield',
    amount: 17.81,
    currency: 'USDY',
    status: 'completed',
    createdAt: '2024-01-15T00:00:00Z',
    description: 'Daily yield accrual',
  },
  {
    id: 'txn_3',
    type: 'deposit',
    amount: 12500,
    currency: 'USDC',
    status: 'completed',
    createdAt: '2024-01-10T08:00:00Z',
    description: 'Balance Threshold Sweep',
  },
  {
    id: 'txn_4',
    type: 'yield',
    amount: 17.12,
    currency: 'USDY',
    status: 'completed',
    createdAt: '2024-01-14T00:00:00Z',
    description: 'Daily yield accrual',
  },
  {
    id: 'txn_5',
    type: 'withdraw',
    amount: 10000,
    currency: 'USDC',
    status: 'completed',
    createdAt: '2024-01-08T14:20:00Z',
    description: 'Manual withdrawal',
  },
];
