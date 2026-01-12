# Arc B2B Management Platform - Implementation Plan

## Executive Summary

This plan outlines the implementation of a comprehensive B2B management platform within the existing NextJS `/test` application. The platform will serve as both a sandbox showcase and a production-ready dashboard for managing Arc payment services.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           B2B MANAGEMENT PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            PRESENTATION LAYER                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Credits    │  │   Invoices   │  │   Disputes   │  │   Treasury   │  │  │
│  │  │   Module     │  │   Module     │  │   Module     │  │   Module     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Agents     │  │   x402 API   │  │  CrossChain  │  │   Webhooks   │  │  │
│  │  │   Module     │  │   Module     │  │   Module     │  │   Module     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                             HOOKS & STATE LAYER                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ useCredits   │  │ useInvoices  │  │ useDisputes  │  │ useTreasury  │  │  │
│  │  │ useAgents    │  │ useX402      │  │ useCrossChain│  │ useWebhooks  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                              PROVIDER LAYER                                │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐ │  │
│  │  │  B2BProvider (Context + API Client + WebSocket + State Management)   │ │  │
│  │  └──────────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            SDK INTEGRATION LAYER                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ @arcpay/b2b  │  │@arcpay/agents│  │ @arcpay/x402 │  │@arcpay/cross │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVICES                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │Circle Wallets│  │Arc Blockchain│  │  x402 Infra  │  │  CCTP Bridge     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Current State Analysis

### Existing B2B Sandbox (`test/src/app/sandbox/b2b/`)

| Module | Status | Current State |
|--------|--------|---------------|
| Dashboard | Mocked | Stats cards, module grid, value props |
| Credits | Mocked | Digital card UI, usage simulator, yield tracking |
| Invoices | Mocked | Invoice form, preview document, batch history |
| Disputes | Mocked | File form, AI terminal animation, resolution flow |
| Treasury | Mocked | AUM display, funds allocation, rebalancing controls |

### Available SDK Packages

| Package | Version | Key Exports |
|---------|---------|-------------|
| `@arcpay/b2b` | src | `ArcPayB2B`, Credits, Disputes, Gateway, Treasury, Webhooks |
| `@arcpay/agents` | src | `AgentWalletManager`, `BudgetController` |
| `@arcpay/x402` | src | `X402Client`, middleware, payment signing |
| `@arcpay/crosschain` | src | `MultiChainTreasury`, `PaymentRouter`, CCTP bridges |

---

## Implementation Phases

### Phase 1: Foundation & Provider Setup

**Goal:** Establish core infrastructure and provider architecture

#### 1.1 B2B Provider System
```
test/src/providers/
├── B2BProvider.tsx          # Main context provider
├── B2BAuthProvider.tsx      # Organization auth & API keys
├── B2BWebSocketProvider.tsx # Real-time updates
└── index.ts
```

**B2BProvider Features:**
- SDK client initialization (ArcPayB2B instance)
- Organization context (orgId, settings, limits)
- Real-time WebSocket connection for live updates
- Error boundary and retry logic
- Mode switching (sandbox/production)

#### 1.2 Custom Hooks Layer
```
test/src/hooks/b2b/
├── useB2B.ts              # Main provider hook
├── useCredits.ts          # Credit accounts & usage
├── useInvoices.ts         # Invoice operations
├── useDisputes.ts         # Dispute management
├── useTreasury.ts         # Treasury operations
├── useAgents.ts           # Agent wallet management
├── useX402.ts             # x402 payment operations
├── useCrossChain.ts       # Cross-chain transfers
├── useWebhooks.ts         # Webhook management
├── useAnalytics.ts        # Dashboard analytics
└── index.ts
```

#### 1.3 Type Definitions
```
test/src/types/b2b/
├── credits.ts
├── invoices.ts
├── disputes.ts
├── treasury.ts
├── agents.ts
├── x402.ts
├── crosschain.ts
├── webhooks.ts
├── analytics.ts
└── index.ts
```

---

### Phase 2: Core B2B Modules Enhancement

**Goal:** Upgrade existing sandbox pages to functional modules

#### 2.1 Credits Module (`/sandbox/b2b/credits`)

**Features:**
- [ ] Credit account creation & management
- [ ] Real-time balance display (available + yield)
- [ ] Usage metering dashboard with charts
- [ ] Auto-refill configuration
- [ ] Yield transfer controls (USDC ↔ USDY)
- [ ] Deposit history with pagination
- [ ] Usage breakdown by meter type
- [ ] Low balance alerts configuration

**Components:**
```
test/src/components/b2b/credits/
├── CreditAccountCard.tsx      # Digital card visualization
├── BalanceDisplay.tsx         # Multi-currency balance
├── UsageMeter.tsx             # Real-time usage tracking
├── UsageChart.tsx             # Usage visualization
├── YieldPanel.tsx             # USDY yield management
├── DepositModal.tsx           # Add funds modal
├── AutoRefillSettings.tsx     # Auto-refill config
├── UsageHistory.tsx           # Usage log table
└── index.ts
```

**API Integration:**
```typescript
// Hook usage example
const {
  account,
  balance,
  recordUsage,
  transferToYield,
  deposits
} = useCredits(accountId);
```

#### 2.2 Invoices Module (`/sandbox/b2b/invoices`)

**Features:**
- [ ] Invoice creation wizard
- [ ] Live invoice preview
- [ ] Payment link & QR generation
- [ ] Invoice status tracking (draft → paid)
- [ ] Settlement monitoring
- [ ] Batch payment creation
- [ ] Invoice templates
- [ ] Customer management

**Components:**
```
test/src/components/b2b/invoices/
├── InvoiceForm.tsx            # Create/edit form
├── InvoicePreview.tsx         # Live preview document
├── InvoiceList.tsx            # Searchable invoice list
├── InvoiceStatusBadge.tsx     # Status indicator
├── PaymentLinkGenerator.tsx   # QR + URL generator
├── SettlementTracker.tsx      # Settlement status
├── BatchPaymentForm.tsx       # Batch payment creation
├── CustomerSelector.tsx       # Customer dropdown
└── index.ts
```

#### 2.3 Disputes Module (`/sandbox/b2b/disputes`)

**Features:**
- [ ] Dispute filing interface
- [ ] AI analysis visualization
- [ ] Merchant response form
- [ ] Evidence upload system
- [ ] Resolution timeline
- [ ] Dispute analytics
- [ ] Delivery proof registration
- [ ] Protection settings

**Components:**
```
test/src/components/b2b/disputes/
├── DisputeForm.tsx            # File new dispute
├── DisputeList.tsx            # Active/resolved tabs
├── DisputeDetail.tsx          # Full dispute view
├── AIAnalysisPanel.tsx        # AI evaluation display
├── MerchantResponseForm.tsx   # Response submission
├── EvidenceUploader.tsx       # Evidence management
├── ResolutionTimeline.tsx     # Status timeline
├── DeliveryProofForm.tsx      # Register delivery
└── index.ts
```

#### 2.4 Treasury Module (`/sandbox/b2b/treasury`)

**Features:**
- [ ] Multi-fund overview dashboard
- [ ] Operating/Reserve/Vault allocation
- [ ] Rebalancing controls
- [ ] Yield projection charts
- [ ] Payment execution from treasury
- [ ] Transaction history
- [ ] Alert management
- [ ] Strategy configuration

**Components:**
```
test/src/components/b2b/treasury/
├── TreasuryOverview.tsx       # AUM summary
├── FundAllocation.tsx         # Visual allocation
├── YieldProjection.tsx        # Projected earnings
├── RebalanceControls.tsx      # Manual/auto rebalance
├── TreasuryPaymentForm.tsx    # Execute payments
├── TransactionHistory.tsx     # Treasury tx log
├── AlertsPanel.tsx            # Active alerts
├── StrategySettings.tsx       # Allocation strategy
└── index.ts
```

---

### Phase 3: Extended Modules

**Goal:** Add new B2B modules for agents, x402, and cross-chain

#### 3.1 Agents Module (`/sandbox/b2b/agents`)

**New page for AI agent wallet management**

**Features:**
- [ ] Agent wallet creation
- [ ] Budget configuration (daily/monthly limits)
- [ ] Spending analytics
- [ ] Vendor-specific budgets
- [ ] Anomaly detection settings
- [ ] Approval workflow
- [ ] Activity log

**Page Structure:**
```
test/src/app/sandbox/b2b/agents/
├── page.tsx                   # Main agents dashboard
├── [agentId]/
│   └── page.tsx               # Individual agent detail
└── create/
    └── page.tsx               # Create new agent
```

**Components:**
```
test/src/components/b2b/agents/
├── AgentList.tsx              # All agents grid
├── AgentCard.tsx              # Agent summary card
├── BudgetConfig.tsx           # Budget settings
├── SpendingChart.tsx          # Usage visualization
├── VendorBudgets.tsx          # Per-vendor limits
├── ApprovalQueue.tsx          # Pending approvals
├── ActivityFeed.tsx           # Agent activity log
└── index.ts
```

#### 3.2 x402 API Module (`/sandbox/b2b/x402`)

**New page for HTTP 402 API monetization**

**Features:**
- [ ] Endpoint configuration
- [ ] Pricing management
- [ ] Payment analytics
- [ ] Client SDK generator
- [ ] Rate limiting settings
- [ ] Revenue dashboard
- [ ] Integration docs

**Page Structure:**
```
test/src/app/sandbox/b2b/x402/
├── page.tsx                   # x402 overview
├── endpoints/
│   └── page.tsx               # Manage endpoints
├── analytics/
│   └── page.tsx               # Payment analytics
└── integration/
    └── page.tsx               # Integration guide
```

#### 3.3 Cross-Chain Module (`/sandbox/b2b/crosschain`)

**New page for multi-chain treasury operations**

**Features:**
- [ ] Chain allocation overview
- [ ] Bridge execution
- [ ] Rebalancing across chains
- [ ] Bridge status monitoring
- [ ] Fee comparison
- [ ] Route optimization

**Page Structure:**
```
test/src/app/sandbox/b2b/crosschain/
├── page.tsx                   # Multi-chain overview
├── bridge/
│   └── page.tsx               # Execute bridge
└── allocations/
    └── page.tsx               # Chain allocations
```

---

### Phase 4: Real-Time & Webhooks

**Goal:** Implement live updates and webhook management

#### 4.1 WebSocket Integration

```typescript
// Real-time event types
type B2BRealtimeEvent =
  | { type: 'credits.balance_updated'; data: BalanceSnapshot }
  | { type: 'invoice.status_changed'; data: Invoice }
  | { type: 'dispute.updated'; data: Dispute }
  | { type: 'treasury.rebalanced'; data: TreasuryOverview }
  | { type: 'agent.transaction'; data: AgentTransaction };
```

**Features:**
- [ ] Live balance updates
- [ ] Invoice status changes
- [ ] Dispute progress notifications
- [ ] Treasury alerts
- [ ] Agent activity stream

#### 4.2 Webhooks Module (`/sandbox/b2b/webhooks`)

**Features:**
- [ ] Endpoint registration
- [ ] Event subscription management
- [ ] Delivery logs
- [ ] Retry configuration
- [ ] Signature verification testing
- [ ] Event simulation

**Components:**
```
test/src/components/b2b/webhooks/
├── EndpointList.tsx           # Registered endpoints
├── EndpointForm.tsx           # Create/edit endpoint
├── EventSelector.tsx          # Event type selection
├── DeliveryLogs.tsx           # Delivery history
├── WebhookTester.tsx          # Test webhook
└── index.ts
```

---

### Phase 5: Dashboard & Analytics

**Goal:** Create comprehensive analytics and reporting

#### 5.1 Enhanced B2B Dashboard (`/sandbox/b2b`)

**Features:**
- [ ] Real-time KPI cards
- [ ] Revenue trends chart
- [ ] Usage analytics
- [ ] Invoice pipeline
- [ ] Dispute metrics
- [ ] Treasury performance
- [ ] Quick actions panel
- [ ] Recent activity feed

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│                        B2B Dashboard                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │Credits │ │Revenue │ │Disputes│ │Treasury│ │ APY    │        │
│  │$50,000 │ │$12,500 │ │ 3 Open │ │$250,000│ │ 5.2%   │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │     Revenue Trends (30d)    │ │    Usage by Meter Type     ││
│  │         [Chart]             │ │         [Chart]            ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │     Invoice Pipeline        │ │      Recent Activity       ││
│  │  Draft: 5  Sent: 12  Paid:8 │ │  • Invoice #123 paid       ││
│  │         [Chart]             │ │  • Dispute resolved        ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2 Analytics Components
```
test/src/components/b2b/analytics/
├── KPICard.tsx                # Metric card with trend
├── RevenueChart.tsx           # Line/area chart
├── UsageBreakdown.tsx         # Pie/donut chart
├── InvoicePipeline.tsx        # Funnel visualization
├── DisputeMetrics.tsx         # Win rate, resolution time
├── TreasuryPerformance.tsx    # Yield tracking
├── ActivityFeed.tsx           # Recent events
└── index.ts
```

---

### Phase 6: Settings & Configuration

**Goal:** Organization and module settings

#### 6.1 Settings Module (`/sandbox/b2b/settings`)

**Sections:**
- [ ] Organization profile
- [ ] API key management
- [ ] Team members & permissions
- [ ] Notification preferences
- [ ] Billing & limits
- [ ] Integration settings

**Page Structure:**
```
test/src/app/sandbox/b2b/settings/
├── page.tsx                   # Settings overview
├── organization/
│   └── page.tsx               # Org settings
├── api-keys/
│   └── page.tsx               # API key management
├── team/
│   └── page.tsx               # Team management
├── notifications/
│   └── page.tsx               # Alert preferences
└── integrations/
    └── page.tsx               # Third-party integrations
```

---

## File Structure Summary

```
test/
├── src/
│   ├── app/
│   │   └── sandbox/
│   │       └── b2b/
│   │           ├── page.tsx              # Dashboard
│   │           ├── layout.tsx            # B2B navigation
│   │           ├── credits/
│   │           │   └── page.tsx
│   │           ├── invoices/
│   │           │   └── page.tsx
│   │           ├── disputes/
│   │           │   └── page.tsx
│   │           ├── treasury/
│   │           │   └── page.tsx
│   │           ├── agents/               # NEW
│   │           │   ├── page.tsx
│   │           │   ├── [agentId]/page.tsx
│   │           │   └── create/page.tsx
│   │           ├── x402/                 # NEW
│   │           │   ├── page.tsx
│   │           │   ├── endpoints/page.tsx
│   │           │   ├── analytics/page.tsx
│   │           │   └── integration/page.tsx
│   │           ├── crosschain/           # NEW
│   │           │   ├── page.tsx
│   │           │   ├── bridge/page.tsx
│   │           │   └── allocations/page.tsx
│   │           ├── webhooks/             # NEW
│   │           │   └── page.tsx
│   │           └── settings/             # NEW
│   │               ├── page.tsx
│   │               ├── organization/page.tsx
│   │               ├── api-keys/page.tsx
│   │               ├── team/page.tsx
│   │               ├── notifications/page.tsx
│   │               └── integrations/page.tsx
│   │
│   ├── components/
│   │   └── b2b/
│   │       ├── credits/
│   │       ├── invoices/
│   │       ├── disputes/
│   │       ├── treasury/
│   │       ├── agents/
│   │       ├── x402/
│   │       ├── crosschain/
│   │       ├── webhooks/
│   │       ├── analytics/
│   │       ├── settings/
│   │       └── shared/
│   │           ├── B2BNavigation.tsx
│   │           ├── ModuleCard.tsx
│   │           ├── StatusBadge.tsx
│   │           ├── MoneyDisplay.tsx
│   │           └── index.ts
│   │
│   ├── providers/
│   │   ├── B2BProvider.tsx
│   │   ├── B2BAuthProvider.tsx
│   │   └── B2BWebSocketProvider.tsx
│   │
│   ├── hooks/
│   │   └── b2b/
│   │       ├── useB2B.ts
│   │       ├── useCredits.ts
│   │       ├── useInvoices.ts
│   │       ├── useDisputes.ts
│   │       ├── useTreasury.ts
│   │       ├── useAgents.ts
│   │       ├── useX402.ts
│   │       ├── useCrossChain.ts
│   │       ├── useWebhooks.ts
│   │       ├── useAnalytics.ts
│   │       └── index.ts
│   │
│   ├── types/
│   │   └── b2b/
│   │       ├── credits.ts
│   │       ├── invoices.ts
│   │       ├── disputes.ts
│   │       ├── treasury.ts
│   │       ├── agents.ts
│   │       ├── x402.ts
│   │       ├── crosschain.ts
│   │       ├── webhooks.ts
│   │       └── index.ts
│   │
│   └── lib/
│       └── b2b/
│           ├── client.ts          # SDK client initialization
│           ├── api.ts             # API helpers
│           ├── websocket.ts       # WebSocket client
│           └── utils.ts           # Utility functions
│
└── package.json                   # Add SDK dependencies
```

---

## Implementation Sequence

### Sprint 1: Foundation (Core Infrastructure)
1. Create B2BProvider with mock/real mode switching
2. Implement base hooks structure
3. Set up type definitions from SDK packages
4. Update layout with expanded navigation

### Sprint 2: Credits & Treasury (Financial Core)
1. Upgrade Credits module with real SDK integration
2. Implement Treasury module with yield management
3. Add balance displays and usage tracking
4. Create shared financial components

### Sprint 3: Invoices & Disputes (Operational)
1. Upgrade Invoices module with full CRUD
2. Implement Disputes module with AI panel
3. Add settlement tracking
4. Create status management components

### Sprint 4: Extended Modules (New Features)
1. Build Agents module for AI wallet management
2. Create x402 module for API monetization
3. Implement CrossChain module for multi-chain ops
4. Add Webhooks management

### Sprint 5: Dashboard & Analytics
1. Build comprehensive dashboard
2. Add charts and visualizations
3. Implement real-time updates
4. Create activity feeds

### Sprint 6: Settings & Polish
1. Build settings pages
2. Add API key management
3. Implement team permissions
4. Final testing and refinement

---

## Technical Decisions

### State Management
- **Provider Context** for global B2B state
- **React Query/SWR** for server state caching
- **Zustand** for complex local state (if needed)

### API Layer
- **SDK First:** Use @arcpay/* packages directly
- **Mock Mode:** Toggle between mock/live data
- **Error Handling:** Centralized error boundaries

### Styling
- **Tailwind CSS** (existing)
- **Component Library:** Extend existing UI components
- **Dark Mode:** Support via theme provider

### Real-Time
- **WebSocket** for live updates
- **Optimistic Updates** for better UX
- **Polling Fallback** when WS unavailable

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@arcpay/b2b": "workspace:*",
    "@arcpay/agents": "workspace:*",
    "@arcpay/x402": "workspace:*",
    "@arcpay/crosschain": "workspace:*",
    "recharts": "^2.10.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "socket.io-client": "^4.7.0",
    "zod": "^3.23.0"
  }
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Module Coverage | 100% of SDK features accessible |
| Mock/Live Toggle | Seamless switching |
| Real-time Updates | <500ms latency |
| Mobile Responsive | All modules |
| Type Safety | 100% TypeScript coverage |
| Error Handling | Graceful degradation |

---

## Next Steps

1. **Approve this plan** - Review and confirm the approach
2. **Start Phase 1** - Provider and hooks foundation
3. **Iterate by module** - One module at a time
4. **Test integration** - Verify SDK connectivity
5. **Deploy sandbox** - Showcase to stakeholders

---

## Questions for Clarification

Before implementation begins, please clarify:

1. **Authentication Model:** How should organizations authenticate? (API keys, OAuth, etc.)
2. **Multi-tenancy:** Should the platform support multiple organizations per user?
3. **Sandbox vs Production:** Should we maintain separate environments?
4. **Backend Requirements:** Do we need API routes for proxying SDK calls?
5. **Priority Modules:** Which modules should be completed first?
