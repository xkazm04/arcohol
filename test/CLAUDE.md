# CLAUDE.md - ArcPay Dashboard Development Guide

This file provides context for AI assistants working on the ArcPay test application.

## Project Context

ArcPay is a B2B stablecoin payment infrastructure platform. This test application contains:
1. A production dashboard for managing payments, invoices, disputes, and treasury
2. A sandbox environment for testing SDK integrations
3. Integration tests for the @arcpay/b2b and @arcpay/react packages

## Dashboard Module (`src/app/dashboard/`)

### Architecture

The dashboard uses Next.js App Router with client-side rendering (`'use client'`). Each page follows a consistent pattern:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { StatCard, Card, GlowButton, staggerContainer } from '@/components/dashboard';

export default function PageName() {
  // State and effects
  // Supabase queries for data
  // Return motion.div with staggerContainer for animations
}
```

### Key Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Dashboard shell with collapsible sidebar, auth state, organization context |
| `page.tsx` | Overview dashboard with stats grid, performance metrics, activity feed |
| `credits/page.tsx` | Combined Assets & Treasury management (USDC + USDY) |
| `invoices/page.tsx` | Invoice CRUD with filtering, search, status management |
| `disputes/page.tsx` | Dispute management with AI-assisted resolution |
| `agents/page.tsx` | AI agent wallet configuration and budget management |
| `api-keys/page.tsx` | API key generation with permission scopes |
| `webhooks/page.tsx` | Webhook endpoint configuration |
| `x402/page.tsx` | HTTP 402 payment protocol endpoints |
| `crosschain/page.tsx` | Multi-chain balance management |
| `subscriptions/page.tsx` | Recurring payment management |
| `transactions/page.tsx` | Transaction history and analytics |
| `settings/page.tsx` | Organization configuration |

### Navigation Structure

Navigation items are defined in `layout.tsx`:
```typescript
const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '...' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '...' },
  { href: '/dashboard/credits', label: 'Assets', icon: '...' },
  // ... more items
];
```

## Component Library (`src/components/dashboard/`)

### Imports
Always import from the barrel export:
```typescript
import {
  StatCard, HeroStatCard,      // Stats display
  Card, CardHeader, CardBody,   // Layout containers
  Modal, ConfirmModal,          // Dialogs
  GlowButton, IconButton,       // Buttons with glow effects
  StatusBadge, StatusDot,       // Status indicators
  DataList, DataTable,          // Data display
  LoadingSpinner, EmptyState,   // Feedback states
  FilterTabs, FormInput,        // Form controls
  staggerContainer, listItem,   // Animation variants
} from '@/components/dashboard';
```

### Animation Patterns
Use Framer Motion with predefined variants:
```typescript
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={listItem}>
    {/* Content */}
  </motion.div>
</motion.div>
```

### Color Accents
Components support accent colors: `cyan`, `purple`, `emerald`, `amber`, `red`, `blue`
```typescript
<StatCard label="Revenue" value="$45,230" accent="cyan" />
<Card accent="emerald" delay={0.2}>...</Card>
```

## Supabase Integration

### Client Setup
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### Common Queries
```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get user's organization
const { data: profile } = await supabase
  .from('org_profiles')
  .select('current_organization_id')
  .eq('id', user.id)
  .single();

// Get organization details
const { data: org } = await supabase
  .from('organizations')
  .select('*')
  .eq('id', profile.current_organization_id)
  .single();
```

### Key Tables
- `org_profiles` - User profiles with organization associations
- `organizations` - Company/org data with settings
- `api_keys` - API credentials with permissions and wallet bindings
- `credit_accounts` - Balance tracking with yield settings
- `invoices` - Invoice records with line items
- `customers` - Customer/buyer information
- `disputes` - Dispute cases with evidence
- `webhook_endpoints` - Webhook configuration
- `agent_wallets` - AI agent budget controls

## TypeScript Types

Located in `src/lib/supabase/types.ts`:

```typescript
interface Organization {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  settings: OrganizationSettings;
  plan: 'starter' | 'growth' | 'enterprise';
  // ...
}

interface CreditAccount {
  id: string;
  available_balance: number;
  yield_balance: number;
  status: 'active' | 'suspended' | 'low_balance' | 'depleted';
  settings: { auto_refill_enabled: boolean; /* ... */ };
}

interface Invoice {
  id: string;
  reference: string;
  amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'canceled';
  // ...
}
```

## Feature Modules (`src/features/`)

Feature modules encapsulate business logic:

```typescript
// src/features/invoices/index.ts
export { useInvoices } from './hooks/useInvoices';
export type { Invoice, InvoiceStatus } from './types';

// Usage in pages:
import { useInvoices } from '@/features/invoices';
const { invoices, isLoading, sendInvoice, markAsPaid } = useInvoices();
```

## SDK Packages

### @arcpay/b2b (Server SDK)
Located at `../arcpay-b2b`. Provides:
- Invoice management APIs
- Dispute resolution
- Treasury operations
- Credit/debit operations
- Webhook handling
- Express/Next.js middleware

### @arcpay/react (Client SDK)
Located at `../arcpay-react`. Provides:
- `<Checkout />` - Payment flow component
- `<InvoiceView />` - Invoice display
- `<SubscriptionPlans />` - Plan selection
- `<Balance />` - Account balance display
- Headless hooks via `/headless` export

## Styling Conventions

### Tailwind Classes
- Background: `bg-slate-900`, `bg-slate-800`, `bg-slate-950`
- Text: `text-white`, `text-slate-400`, `text-slate-500`
- Borders: `border-slate-700`, `border-slate-800`
- Accents: `text-cyan-400`, `bg-cyan-500/10`, `border-cyan-500/30`

### Glow Effects
```typescript
style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
className="shadow-[0_0_15px_rgba(6,182,212,0.2)]"
```

### Font Mono
Use `font-mono` for:
- Account IDs
- Transaction references
- Amounts/numbers
- Technical values

## Common Patterns

### Page Header
```typescript
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center justify-between"
>
  <div className="flex items-center gap-3">
    <h1 className="text-lg font-semibold text-white">Page Title</h1>
    <FilterTabs tabs={[...]} activeTab={filter} onChange={setFilter} />
  </div>
  <GlowButton onClick={...}>Action</GlowButton>
</motion.div>
```

### Stats Grid
```typescript
<motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
  <StatCard label="Label" value="$1,234" accent="cyan" delay={0} />
  <StatCard label="Label" value="56" accent="emerald" delay={0.05} />
  {/* ... */}
</motion.div>
```

### Data Card with Table
```typescript
<Card accent="cyan" delay={0.2} className="overflow-hidden">
  <CardHeader title="Title" action={<SearchInput />} />
  <div className="grid grid-cols-12 ...">
    {/* Table header */}
  </div>
  <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
    {items.map(item => (
      <motion.div key={item.id} variants={listItem} whileHover={{ x: 3 }}>
        {/* Row content */}
      </motion.div>
    ))}
  </motion.div>
</Card>
```

## Development Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## File Naming

- Pages: `page.tsx` (Next.js App Router convention)
- Components: PascalCase (`StatCard.tsx`)
- Hooks: camelCase with `use` prefix (`useInvoices.ts`)
- Types: `types.ts` or `index.ts` barrel exports
- Utilities: camelCase (`animations.ts`)

## When Adding New Dashboard Pages

1. Create directory in `src/app/dashboard/[feature-name]/`
2. Add `page.tsx` with `'use client'` directive
3. Add navigation item to `layout.tsx` navItems array
4. Use existing components from `@/components/dashboard`
5. Follow motion.div + staggerContainer pattern for animations
6. Fetch data via Supabase client in useEffect
7. Add corresponding types to `src/lib/supabase/types.ts` if needed
