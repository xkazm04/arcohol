# ArcPay Test Application

A Next.js 16 application serving as the test environment and dashboard for the ArcPay B2B payment infrastructure platform.

## Overview

This application provides:
- **Dashboard** - Production-ready admin interface for managing B2B payments
- **Sandbox** - Interactive testing environment for SDK integrations
- **API Explorer** - Documentation and testing for React SDK hooks

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.1 |
| React | 19.2.3 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12.26 |
| State | Zustand 4.5 |
| Backend | Supabase (Auth + Database) |
| Language | TypeScript 5 |

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Production dashboard module
│   │   ├── layout.tsx      # Dashboard shell with sidebar navigation
│   │   ├── page.tsx        # Overview with stats and activity feed
│   │   ├── agents/         # AI agent wallet management
│   │   ├── api-keys/       # API key management
│   │   ├── credits/        # Assets & Treasury management
│   │   ├── crosschain/     # Multi-chain operations
│   │   ├── disputes/       # Dispute resolution center
│   │   ├── invoices/       # Invoice management
│   │   ├── settings/       # Organization settings
│   │   ├── subscriptions/  # Subscription management
│   │   ├── transactions/   # Transaction history
│   │   ├── webhooks/       # Webhook configuration
│   │   └── x402/           # x402 protocol API monetization
│   ├── sandbox/            # SDK testing environment
│   │   ├── b2b/            # B2B SDK sandbox
│   │   ├── api-explorer/   # Hook documentation
│   │   ├── generator/      # Code generator tools
│   │   ├── react-sdk/      # React SDK demos
│   │   └── wallet/         # Wallet integration testing
│   └── (auth)/             # Authentication flows
├── components/
│   └── dashboard/          # Reusable dashboard components
│       ├── ui/             # StatCard, StatusBadge, GlowButton, etc.
│       ├── layout/         # Card, Modal, DataList, DataTable
│       ├── feedback/       # LoadingSpinner, EmptyState, AlertBanner
│       ├── charts/         # BarChart, TrendLine, DonutChart
│       └── onboarding/     # WelcomeModal
├── features/               # Feature modules
│   ├── credits/            # Credit system logic
│   └── invoices/           # Invoice system logic
├── lib/
│   └── supabase/           # Supabase client configuration
├── hooks/                  # Custom React hooks
└── store/                  # Zustand stores
```

## Internal Packages

The application uses two local SDK packages:

### @arcpay/b2b
B2B payment SDK for server-side integrations.
- **Location**: `../arcpay-b2b`
- **Features**: Invoicing, disputes, treasury, credit system, webhooks
- **Middleware**: Express and Next.js integrations

### @arcpay/react
React SDK for embedded payment components.
- **Location**: `../arcpay-react`
- **Features**: Checkout, invoice display, subscription plans, balance components
- **Exports**: Main components + headless hooks

## Database Schema

The application uses Supabase with the following schema modules (see `db/` directory):

| File | Description |
|------|-------------|
| 001_schema.sql | Core schema (org_profiles, organizations, api_keys) |
| 002_credits.sql | Credit accounts, deposits, usage metering |
| 003_invoices.sql | Customers, invoices, payments, settlements |
| 004_disputes.sql | Disputes, evidence, AI evaluation |
| 005_treasury.sql | Multi-fund treasury, rebalancing, alerts |
| 006_webhooks.sql | Endpoints, events, deliveries |
| 007_agents.sql | AI agent wallets, budgets, anomaly detection |
| 010_transactions.sql | API transaction tracking |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Configure in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Dashboard Features

### Overview (`/dashboard`)
- Real-time stats: Credits, Treasury, Invoices, Disputes
- 30-day performance metrics with revenue tracking
- Activity feed with recent transactions
- Quick action links to all modules

### Assets & Treasury (`/dashboard/credits`)
- Combined operating balance (USDC) and yield reserve (USDY)
- Auto-pilot for automated treasury management
- Projected yield curves and earnings tracking
- Quick deposit functionality

### Invoices (`/dashboard/invoices`)
- Create, send, and track B2B invoices
- Status management (draft, sent, viewed, paid, overdue)
- Customer filtering and search
- Payment tracking with settlement details

### Disputes (`/dashboard/disputes`)
- AI-assisted dispute resolution
- Evidence submission and review
- Outcome tracking and analytics

### Additional Modules
- **Agents**: AI agent wallet management with budgets
- **API Keys**: Key generation with permission scopes
- **x402**: HTTP 402 payment protocol integration
- **CrossChain**: Multi-chain balance and bridging
- **Webhooks**: Event delivery configuration
- **Subscriptions**: Recurring payment management

## Component Library

The `@/components/dashboard` module exports reusable components:

```typescript
// UI Components
import { StatCard, StatusBadge, GlowButton, FilterTabs } from '@/components/dashboard';

// Layout Components
import { Card, CardHeader, Modal, DataList, DataTable } from '@/components/dashboard';

// Feedback Components
import { LoadingSpinner, EmptyState, AlertBanner } from '@/components/dashboard';

// Charts
import { BarChart, TrendLine, DonutChart, ProgressBar } from '@/components/dashboard';
```

## License

MIT
