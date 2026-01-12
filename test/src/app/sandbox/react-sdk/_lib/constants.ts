import type { SectionInfo, PackageManager } from './types';

export const sections: SectionInfo[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description:
      'Install and configure the ArcPay React SDK in your application. Wrap your app with ArcPayProvider to enable payment features across all components.',
    useCase:
      'Required first step for any integration. Set up once in your root layout to enable all SDK features.',
  },
  {
    id: 'checkout',
    label: 'Checkout',
    description:
      'Complete checkout flow with order summary, chain selection, and payment processing. Supports multiple items, fees display, and transaction callbacks.',
    useCase: 'E-commerce checkouts, subscription purchases, one-time payments, and digital goods sales.',
  },
  {
    id: 'invoice',
    label: 'Invoice',
    description:
      'Professional invoice display with line items, totals, and integrated payment button. Supports customizable branding and PDF download.',
    useCase: 'B2B payments, freelancer invoicing, service billing, and accounts receivable.',
  },
  {
    id: 'plans',
    label: 'PlanSelector',
    description:
      'Subscription plan picker with feature comparison and billing cycle toggle. Supports annual discounts and popular plan highlighting.',
    useCase: 'SaaS pricing pages, membership tiers, subscription upgrades, and plan comparisons.',
  },
  {
    id: 'balance',
    label: 'Balance',
    description:
      'Real-time balance display across multiple chains. Auto-refreshes on demand and supports aggregated totals.',
    useCase: 'Wallet dashboards, account overviews, and pre-payment balance validation.',
  },
  {
    id: 'transaction-history',
    label: 'TransactionHistory',
    description:
      'Paginated transaction history with filtering and status indicators. Supports load more functionality and transaction details.',
    useCase: 'Activity feeds, transaction logs, payment history, and reconciliation views.',
  },
  {
    id: 'fiat-on-ramp',
    label: 'Fiat On-Ramp',
    description:
      'Allow users to purchase crypto with credit cards and bank transfers. Integrates with MoonPay, Transak, Coinbase Pay, and Circle. Seamlessly integrates with Checkout.',
    useCase:
      'Onboarding new crypto users, topping up balances, checkout fallback when balance is insufficient.',
  },
];

export const packageManagerCommands: Record<PackageManager, string> = {
  npm: 'npm install @arcpay/react',
  yarn: 'yarn add @arcpay/react',
  pnpm: 'pnpm add @arcpay/react',
  bun: 'bun add @arcpay/react',
};
