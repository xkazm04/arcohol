# Development Directions V2: Next-Generation Payment Infrastructure

Building on the B2B foundation (v1), these new directions leverage **x402 Protocol** and **Circle CCTP V2** to capture emerging markets: AI agents, API monetization, and programmable finance.

---

## Current Architecture Reflection

### What We Built (v1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Arc Payment Stack                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  @arcpay/react          @arcpay/node          @arcpay/b2b              │
│  ┌─────────────┐        ┌─────────────┐       ┌─────────────────────┐  │
│  │ React SDK   │        │ Node SDK    │       │ B2B Infrastructure  │  │
│  │             │        │             │       │                     │  │
│  │ • Hooks     │        │ • API client│       │ • Credits & Billing │  │
│  │ • Components│        │ • Webhooks  │       │ • Dispute Resolution│  │
│  │ • Wallet    │        │ • Signing   │       │ • Merchant Gateway  │  │
│  │   connect   │        │             │       │ • Treasury Mgmt     │  │
│  └─────────────┘        └─────────────┘       └─────────────────────┘  │
│                                                                         │
│  Target: B2B SaaS companies with $10k+ transactions                    │
│  Value: 96%+ fee savings vs Stripe, instant settlement                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Gaps & Opportunities

| Gap | Opportunity |
|-----|-------------|
| No micropayment support | x402 enables $0.001 transactions |
| No AI agent support | Autonomous agents need payment rails |
| Single-chain focus | CCTP V2 enables instant cross-chain |
| No streaming payments | Real-time payment flows emerging |
| No embedded finance | SaaS wants white-label payment UX |

---

## New Technology Integration

### x402 Protocol

> *"HTTP 402 Payment Required - dormant since HTTP/1.1, now activated"*

| Aspect | Details |
|--------|---------|
| **What** | Open protocol for API payments via HTTP headers |
| **How** | Server returns 402 → Client pays via header → Retry with payment proof |
| **Backed by** | Coinbase, Cloudflare (x402 Foundation) |
| **Growth** | 46k → 930k weekly volume in one month (Oct 2025) |
| **Key insight** | AI agents don't have payment fatigue - micropayments work for them |

```
Client Request                    Server Response
     │                                 │
     │──────── GET /api/data ─────────→│
     │                                 │
     │←───── 402 Payment Required ─────│
     │       (PAYMENT-REQUIRED header) │
     │                                 │
     │──────── GET /api/data ─────────→│
     │       (PAYMENT-SIGNATURE header)│
     │                                 │
     │←───────── 200 OK ───────────────│
     │           (data)                │
```

### Circle CCTP V2 (March 2025)

| Feature | v1 | v2 |
|---------|----|----|
| Transfer time | 13-19 min | **Seconds** |
| Mechanism | Burn & mint | Burn & mint + Fast Transfers |
| Chains | 8 | **15+** (Ethereum, Solana, Base, Stellar...) |
| Hooks | ❌ | ✅ Auto-actions on receive |
| Fees | Gas only | Gas only |

```typescript
// Circle Bridge Kit - crosschain in one call
const result = await kit.bridge({
  from: { adapter: viemAdapter, chain: "Ethereum" },
  to: { adapter: solanaAdapter, chain: "Solana" },
  amount: "10000.00",
});
// Settles in seconds, not 13 minutes
```

---

## Direction 1: x402 API Monetization Platform

### Concept: "Stripe for API Payments"

Enable any API provider to monetize per-request with zero billing infrastructure. Arc becomes the **facilitator** in the x402 ecosystem.

### Why Now?

1. AI agent explosion - models calling APIs autonomously
2. x402 standard gaining traction (Coinbase, Cloudflare backing)
3. Current API billing is complex (usage tracking, invoicing, collections)
4. Micropayments now viable on L2s ($0.001 transactions feasible)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    x402 API Monetization Platform                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  API Provider                Arc Facilitator              API Consumer  │
│  ┌────────────┐              ┌──────────────┐            ┌───────────┐ │
│  │            │              │              │            │           │ │
│  │ Your API   │←── 402 ─────→│ • Validates  │←── Pay ───→│ Client/   │ │
│  │ + Arc      │              │   payments   │            │ AI Agent  │ │
│  │ middleware │              │ • Settles    │            │           │ │
│  │            │←── Payout ───│   on-chain   │            │           │ │
│  │            │              │ • Dashboard  │            │           │ │
│  └────────────┘              └──────────────┘            └───────────┘ │
│                                                                         │
│  Provider Integration:  1 line of middleware                           │
│  Consumer Integration:  1 hook (useFetchWithPayment)                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK

**For API Providers**

```typescript
import { x402Middleware } from '@arcpay/x402';

// Express - one line to monetize any endpoint
app.use('/api/premium', x402Middleware({
  price: { amount: '0.01', currency: 'USDC' },  // $0.01 per request
  facilitator: 'https://x402.arcpay.io',
  recipient: '0x...'  // Your wallet
}));

// Dynamic pricing based on request
app.use('/api/ai', x402Middleware({
  price: async (req) => {
    const tokens = estimateTokens(req.body);
    return { amount: (tokens * 0.00001).toString(), currency: 'USDC' };
  }
}));
```

**For API Consumers (React)**

```typescript
import { useFetchWithPayment } from '@arcpay/x402/react';

function DataFetcher() {
  const { fetch, isPaymentPending, balance } = useFetchWithPayment({
    wallet: connectedWallet,
    autoApprove: { maxAmount: '1.00', perRequest: '0.10' }
  });

  const getData = async () => {
    // Automatically handles 402, payment, and retry
    const response = await fetch('https://api.example.com/premium/data');
    return response.json();
  };
}
```

**For AI Agents (Headless)**

```typescript
import { X402Client } from '@arcpay/x402';

const client = new X402Client({
  wallet: agentWallet,
  budget: {
    daily: 100,      // $100/day max
    perRequest: 1,   // $1 max per request
    perEndpoint: {
      'api.openai.com': 50,  // $50/day to OpenAI
      '*': 10                 // $10/day to others
    }
  }
});

// Agent makes requests without human intervention
const data = await client.fetch('https://api.data.com/query', {
  method: 'POST',
  body: JSON.stringify({ query: '...' })
});
```

### Revenue Model

| Fee | Rate | Notes |
|-----|------|-------|
| Facilitation fee | 1% | On each x402 payment |
| Monthly minimum | $0 | No minimums, pure usage |
| Hosted facilitator | Free | Open source self-host option |
| Premium features | $99/mo | Analytics, custom branding |

### Target Customers

| Segment | Use Case |
|---------|----------|
| **AI/ML API providers** | Per-token, per-inference pricing |
| **Data providers** | Per-query, per-record fees |
| **Premium content** | Per-article, per-video access |
| **Developer tools** | Per-build, per-analysis pricing |

---

## Direction 2: AI Agent Payment Infrastructure

### Concept: "Wallets & Payment Rails for Autonomous Agents"

Purpose-built SDK for AI agents to hold funds, make payments, receive payments, and operate within budgets - without human approval for each transaction.

### The Opportunity

> "Micropayments failed because humans hate small payment decisions. AI doesn't care."

- GPT wrappers spending $100k+/month on API calls
- Autonomous agents need to pay for compute, data, services
- Agents increasingly earn revenue (completing tasks, selling outputs)
- No existing solution for agent-native payment flows

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   AI Agent Payment Infrastructure                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Agent Wallet                              │   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │   │
│  │  │ Spending     │  │ Receiving    │  │ Budget Controller      │ │   │
│  │  │ Account      │  │ Account      │  │                        │ │   │
│  │  │              │  │              │  │ • Daily limits         │ │   │
│  │  │ Auto-pay for │  │ Earnings     │  │ • Per-vendor limits    │ │   │
│  │  │ services     │  │ from tasks   │  │ • Approval thresholds  │ │   │
│  │  └──────────────┘  └──────────────┘  │ • Anomaly detection    │ │   │
│  │         │                 │          └────────────────────────┘ │   │
│  │         └────────┬────────┘                     │               │   │
│  │                  ▼                              │               │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │                   Treasury Pool                             │ │   │
│  │  │  (Auto-refill from org treasury, earn yield when idle)    │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK

**Creating an Agent Wallet**

```typescript
import { AgentWallet } from '@arcpay/agents';

const wallet = await AgentWallet.create({
  name: 'research-agent-01',
  organizationId: 'org_xxx',

  // Budget controls (required for agents)
  budget: {
    daily: 500,              // $500/day maximum
    weekly: 2000,            // $2000/week maximum
    perTransaction: 50,      // $50 max per transaction

    // Vendor-specific limits
    vendors: {
      'api.openai.com': { daily: 200 },
      'api.anthropic.com': { daily: 200 },
      'pinecone.io': { daily: 50 },
    },

    // Auto-refill from org treasury
    autoRefill: {
      threshold: 100,        // Refill when below $100
      amount: 500,           // Top up to $500
      source: 'treasury_xxx'
    }
  },

  // Security
  allowedOperations: ['pay', 'receive'],  // No 'withdraw'
  requiredApprovalAbove: 100,             // Human approval > $100
});

console.log(wallet.address);  // 0x... (dedicated address)
```

**Agent Making Payments**

```typescript
// Inside your AI agent code
import { useAgentPayment } from '@arcpay/agents';

class ResearchAgent {
  private payment: AgentPayment;

  async initialize() {
    this.payment = await useAgentPayment({
      walletId: 'wallet_xxx',
      // Optional: callbacks for audit logging
      onPayment: (txn) => this.logPayment(txn),
      onBudgetWarning: (warning) => this.alertOperator(warning)
    });
  }

  async fetchPremiumData(query: string) {
    // Payment handled automatically via x402
    const response = await this.payment.fetch(
      'https://premium-data-api.com/query',
      { method: 'POST', body: JSON.stringify({ query }) }
    );

    return response.json();
  }

  async purchaseCompute(hours: number) {
    // Direct payment for services
    await this.payment.pay({
      recipient: '0x...',           // Compute provider
      amount: hours * 10,           // $10/hour
      memo: `compute-${hours}hrs`,
      metadata: { hours, jobId: this.currentJob }
    });
  }
}
```

**Agent Receiving Payments**

```typescript
// Agent earns money for completed tasks
const earnings = await wallet.getEarnings({
  period: 'this_month'
});

// {
//   total: 2450.00,
//   transactions: [
//     { from: '0x...', amount: 50, memo: 'task-completion-123' },
//     { from: '0x...', amount: 100, memo: 'report-generation-456' },
//     ...
//   ]
// }

// Operator can withdraw to org treasury
await wallet.withdraw({
  amount: 2000,
  to: 'treasury_xxx',
  requiredApproval: true  // Needs human approval
});
```

**Monitoring & Controls**

```typescript
import { AgentDashboard } from '@arcpay/agents/dashboard';

// Real-time monitoring (React component)
<AgentDashboard
  agents={['wallet_xxx', 'wallet_yyy']}
  alerts={{
    budgetThreshold: 0.8,     // Alert at 80% budget used
    anomalyDetection: true,   // Flag unusual patterns
    velocityLimit: 100        // Max 100 txns/hour
  }}
  onAlert={(alert) => notifyOps(alert)}
/>
```

### Security Model

| Layer | Protection |
|-------|------------|
| **Budget limits** | Hard caps on daily/weekly/per-txn spending |
| **Vendor allowlist** | Only pay pre-approved addresses |
| **Velocity limits** | Max transactions per time period |
| **Anomaly detection** | ML flags unusual spending patterns |
| **Human escalation** | Require approval above thresholds |
| **Audit trail** | Immutable log of all agent transactions |

---

## Direction 3: Cross-Chain Treasury Router

### Concept: "Unified Multi-Chain Treasury with Smart Routing"

Leverage Circle CCTP V2 to manage treasury across 15+ chains with automatic routing for optimal fees and speed.

### The Problem

```
Current State:                    With Arc Router:

ETH  ──► $50k USDC               ┌─────────────────────────┐
                                  │   Unified Treasury      │
BASE ──► $30k USDC       ───►    │   $200k total           │
                                  │                         │
ARB  ──► $40k USDC               │   • Single dashboard    │
                                  │   • Auto-rebalancing    │
SOL  ──► $80k USDC               │   • Smart routing       │
                                  └─────────────────────────┘

• Fragmented balances            • Unified view
• Manual bridging                • Automatic routing
• Suboptimal gas costs           • Optimized fees
• Slow cross-chain               • Seconds via CCTP V2
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Cross-Chain Treasury Router                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Unified Treasury View                       │   │
│  │                                                                  │   │
│  │    ETH         BASE        ARB         SOL         POLYGON      │   │
│  │   $50,000     $30,000    $40,000     $80,000      $20,000      │   │
│  │  ████████    ██████     ███████    ██████████████  ████        │   │
│  │                                                                  │   │
│  │  Total: $220,000 USDC    Yield: $11,440/yr (5.2% on idle)      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       Routing Engine                             │   │
│  │                                                                  │   │
│  │  Payment Request: $15,000 to 0x... on Arbitrum                  │   │
│  │                                                                  │   │
│  │  Options analyzed:                                               │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │ 1. ARB direct    → $40k available   Fee: $0.50   ✓ Best │    │   │
│  │  │ 2. BASE→ARB      → $30k available   Fee: $1.20   2s     │    │   │
│  │  │ 3. ETH→ARB       → $50k available   Fee: $4.80   2s     │    │   │
│  │  │ 4. SOL→ARB       → $80k available   Fee: $0.80   3s     │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  Decision: Use ARB balance (cheapest, no bridge needed)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                              │                                          │
│                    Circle CCTP V2                                       │
│                    (when bridging needed)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK

```typescript
import { MultiChainTreasury } from '@arcpay/treasury';

const treasury = new MultiChainTreasury({
  organizationId: 'org_xxx',

  chains: {
    ethereum: { wallet: '0x...', rpc: process.env.ETH_RPC },
    base: { wallet: '0x...', rpc: process.env.BASE_RPC },
    arbitrum: { wallet: '0x...', rpc: process.env.ARB_RPC },
    solana: { wallet: '...', rpc: process.env.SOL_RPC },
  },

  routing: {
    strategy: 'optimize_cost',  // or 'optimize_speed', 'prefer_chain'
    rebalanceThreshold: 0.3,    // Trigger rebalance at 30% imbalance
    yieldOptimization: true,    // Move idle funds to yield-bearing
  }
});

// Get unified view
const overview = await treasury.getOverview();
// {
//   total: { amount: 220000, currency: 'USDC' },
//   byChain: {
//     ethereum: { balance: 50000, yieldRate: 0, gasPrice: '25 gwei' },
//     base: { balance: 30000, yieldRate: 0, gasPrice: '0.001 gwei' },
//     arbitrum: { balance: 40000, yieldRate: 0, gasPrice: '0.1 gwei' },
//     solana: { balance: 80000, yieldRate: 5.2, gasPrice: '0.00025 SOL' },
//     polygon: { balance: 20000, yieldRate: 0, gasPrice: '30 gwei' }
//   },
//   yieldEarning: 80000,       // Amount earning yield
//   projectedYield: 4160       // Annual yield
// }

// Smart payment - auto-routes
const payment = await treasury.pay({
  recipient: '0x...',
  recipientChain: 'arbitrum',
  amount: 15000,
  // Router automatically picks best source
});

// {
//   route: 'direct',           // No bridge needed
//   sourceChain: 'arbitrum',
//   fee: 0.50,
//   settledAt: '2025-01-11T...',
//   txHash: '0x...'
// }

// Force cross-chain payment
const crossChainPayment = await treasury.pay({
  recipient: 'SoL...',
  recipientChain: 'solana',
  amount: 25000,
  preferredSource: 'ethereum',  // Override auto-routing
});

// {
//   route: 'cctp_v2',
//   sourceChain: 'ethereum',
//   destinationChain: 'solana',
//   bridgeTime: '3s',          // CCTP V2 fast transfer
//   fee: 2.50,
//   txHash: '0x...',
//   bridgeTxHash: '...'
// }
```

**Auto-Rebalancing**

```typescript
// Enable automatic rebalancing
treasury.enableAutoRebalance({
  schedule: 'daily',           // or 'weekly', 'on_threshold'

  targets: {
    ethereum: 0.15,            // 15% of funds
    base: 0.20,                // 20% (cheap gas, good for payments)
    arbitrum: 0.15,            // 15%
    solana: 0.40,              // 40% (earning yield)
    polygon: 0.10              // 10%
  },

  constraints: {
    minMove: 5000,             // Don't bridge less than $5k
    maxDailyBridges: 3,        // Limit bridge operations
    preferredBridgeTime: '03:00 UTC'  // Low-activity hours
  }
});
```

---

## Direction 4: Programmable Payment Streams

### Concept: "Real-Time Money Flows"

Continuous payment streams for salaries, subscriptions, usage-based billing - money flows per-second instead of monthly invoices.

### Use Cases

| Use Case | Traditional | With Streams |
|----------|-------------|--------------|
| **Contractor salary** | Monthly invoice, net-30 | Per-second accrual, instant withdraw |
| **SaaS subscription** | Annual/monthly charge | Per-day, pause anytime |
| **API consumption** | Usage tracking → invoice | Real-time deduction as consumed |
| **Escrow** | Hold → milestone → release | Continuous release as work progresses |

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Programmable Payment Streams                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Sender                      Stream Contract                 Recipient  │
│    │                              │                              │      │
│    │── Create stream ($10k) ────→│                              │      │
│    │   (over 30 days)            │                              │      │
│    │                              │                              │      │
│    │         Time passes...       │                              │      │
│    │                              │── $13.89 claimable ─────────→│      │
│    │                              │   (after 1 hour)             │      │
│    │                              │                              │      │
│    │         More time...         │                              │      │
│    │                              │── $333.33 claimable ────────→│      │
│    │                              │   (after 1 day)              │      │
│    │                              │                              │      │
│    │── Pause stream ────────────→│                              │      │
│    │   (dispute/issue)           │── Stream paused ─────────────│      │
│    │                              │                              │      │
│    │── Resume stream ───────────→│                              │      │
│    │                              │── Resumes from pause ────────│      │
│                                                                         │
│  Features:                                                              │
│  • Per-second settlement                                                │
│  • Pause/resume anytime                                                 │
│  • Partial cancellation                                                 │
│  • Auto-claim to recipient                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK

**Creating Streams**

```typescript
import { PaymentStream } from '@arcpay/streams';

// Salary stream - $10k over 30 days
const salaryStream = await PaymentStream.create({
  sender: '0x...',
  recipient: '0x...',

  amount: 10000,
  currency: 'USDC',
  duration: { days: 30 },

  type: 'linear',           // or 'milestone', 'conditional'

  controls: {
    senderCanPause: true,   // For disputes
    senderCanCancel: true,  // Refunds remaining
    recipientCanClaim: true // Manual withdraw
  }
});

// Stream starts immediately
// $0.0039 flows per second
// Recipient can claim anytime
```

**Milestone-Based Streams**

```typescript
// Escrow with milestone releases
const projectStream = await PaymentStream.create({
  sender: '0x...',
  recipient: '0x...',

  amount: 50000,
  currency: 'USDC',

  type: 'milestone',
  milestones: [
    { name: 'Design complete', amount: 10000, condition: 'sender_approval' },
    { name: 'MVP delivered', amount: 20000, condition: 'sender_approval' },
    { name: 'Launch', amount: 20000, condition: 'sender_approval' }
  ],

  dispute: {
    enabled: true,
    resolver: 'arc_llm',    // LLM dispute resolution
    timeout: { days: 14 }   // Auto-release if no dispute
  }
});

// Approve milestone
await projectStream.approveMilestone('Design complete');
// $10k released to recipient
```

**Conditional Streams**

```typescript
// Pay only while service is up
const uptimeStream = await PaymentStream.create({
  sender: '0x...',
  recipient: '0x...',

  amount: 1000,             // $1000/month budget
  currency: 'USDC',
  duration: { days: 30 },

  type: 'conditional',
  condition: {
    type: 'oracle',
    oracle: 'https://monitor.arcpay.io/uptime/xxx',
    checkInterval: { minutes: 5 },
    flowWhen: 'status === "up"',
    pauseWhen: 'status === "down"'
  }
});

// Stream flows only when service is up
// Automatically pauses during downtime
// Fair payment for actual uptime
```

**Subscription Streams**

```typescript
// SaaS subscription - pay per day
const subscriptionStream = await PaymentStream.create({
  sender: '0x...',           // Customer
  recipient: '0x...',        // SaaS provider

  amount: 99,                // $99/month
  currency: 'USDC',
  duration: { days: 30 },
  renewOnEnd: true,          // Auto-renew

  cancellation: {
    allowed: true,
    refundRemaining: true,   // Pro-rated refund
    notice: { hours: 0 }     // Cancel anytime
  }
});

// Customer cancels after 15 days
await subscriptionStream.cancel();
// $49.50 refunded to customer
// $49.50 to provider (earned)
```

---

## Direction 5: Embedded Finance SDK

### Concept: "White-Label Payment Components for SaaS"

Drop-in React components for SaaS companies to embed payment infrastructure directly in their product - fully branded.

### Why?

- SaaS companies want to offer payments without building from scratch
- Stripe is expensive (2.9%) and doesn't support crypto
- Current crypto solutions have poor UX
- Opportunity to own "Stripe for Crypto" positioning

### Component Library

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Embedded Finance Components                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │   <Checkout />  │  │  <Invoice />    │  │  <Subscribe />  │        │
│  │                 │  │                 │  │                 │        │
│  │  • Cart summary │  │  • Line items   │  │  • Plan select  │        │
│  │  • Wallet conn  │  │  • Due date     │  │  • Payment      │        │
│  │  • Chain select │  │  • Pay button   │  │  • Management   │        │
│  │  • Confirmation │  │  • PDF export   │  │  • Usage        │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  <PayButton />  │  │  <Balance />    │  │  <TxHistory />  │        │
│  │                 │  │                 │  │                 │        │
│  │  • One-click    │  │  • Multi-chain  │  │  • Sortable     │        │
│  │  • Customizable │  │  • Real-time    │  │  • Filterable   │        │
│  │  • Callbacks    │  │  • Yield info   │  │  • Exportable   │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│  All components:                                                        │
│  • Fully customizable (CSS, themes, branded)                           │
│  • Headless variants available                                          │
│  • Accessible (WCAG 2.1 AA)                                            │
│  • Mobile-responsive                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK Usage

**Basic Checkout**

```tsx
import { ArcPayProvider, Checkout } from '@arcpay/embedded';

function CheckoutPage() {
  return (
    <ArcPayProvider
      merchantId="merch_xxx"
      theme={{
        primaryColor: '#6366f1',    // Your brand color
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <Checkout
        items={[
          { name: 'Pro Plan', price: 99, quantity: 1 },
          { name: 'Extra seats', price: 25, quantity: 3 }
        ]}
        currency="USDC"
        onSuccess={(payment) => {
          // Handle successful payment
          activateSubscription(payment.customerId);
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      />
    </ArcPayProvider>
  );
}
```

**Invoicing**

```tsx
import { Invoice } from '@arcpay/embedded';

<Invoice
  invoiceId="inv_xxx"
  // Or create inline:
  invoice={{
    reference: 'INV-2025-001',
    customer: {
      name: 'Acme Corp',
      email: 'billing@acme.com'
    },
    items: [
      { description: 'Consulting - January', amount: 5000 },
      { description: 'Travel expenses', amount: 450 }
    ],
    dueDate: '2025-02-15',
    notes: 'Thank you for your business!'
  }}
  branding={{
    logo: '/your-logo.svg',
    companyName: 'Your Company',
    accentColor: '#10b981'
  }}
  showPdfDownload={true}
  onPaid={(payment) => markInvoicePaid(payment)}
/>
```

**Subscription Management**

```tsx
import { SubscriptionManager } from '@arcpay/embedded';

<SubscriptionManager
  customerId="cust_xxx"
  plans={[
    { id: 'starter', name: 'Starter', price: 29, features: ['5 users', '10GB'] },
    { id: 'pro', name: 'Pro', price: 99, features: ['Unlimited', '100GB'], popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Everything', 'SLA'] }
  ]}
  currentPlan="starter"
  billingCycle="monthly"  // or 'annually' for discount

  onUpgrade={(newPlan) => {
    // Pro-rated upgrade
  }}
  onDowngrade={(newPlan) => {
    // Scheduled for next cycle
  }}
  onCancel={() => {
    // Handle cancellation
  }}

  showUsage={true}         // Current period usage
  showHistory={true}       // Payment history
/>
```

**Headless Mode**

```typescript
import { useCheckout, useBalance, useTransactionHistory } from '@arcpay/embedded/headless';

function CustomUI() {
  const {
    initiatePayment,
    isProcessing,
    estimatedFee,
    supportedChains
  } = useCheckout({ amount: 100 });

  const { balance, isLoading } = useBalance();
  const { transactions, pagination } = useTransactionHistory();

  // Build your own UI with these hooks
  return (
    <div>
      <p>Balance: ${balance?.total}</p>
      <button onClick={initiatePayment} disabled={isProcessing}>
        Pay $100 (Fee: ${estimatedFee})
      </button>
    </div>
  );
}
```

### Theming

```typescript
const theme = {
  // Colors
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  },

  // Typography
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },

  // Borders
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)'
  },

  // Component overrides
  components: {
    Button: {
      height: '44px',
      fontWeight: 600
    },
    Card: {
      padding: '24px'
    }
  }
};
```

---

## Summary: V2 Directions

| Direction | Target | Key Technology | Revenue Model |
|-----------|--------|----------------|---------------|
| **1. x402 API Monetization** | API providers | x402 Protocol | 1% facilitation fee |
| **2. AI Agent Payments** | AI/ML companies | x402 + Agent wallets | Wallet fees + facilitation |
| **3. Cross-Chain Treasury** | Multi-chain ops | Circle CCTP V2 | Premium features |
| **4. Payment Streams** | Contractors, SaaS | Smart contracts | Stream creation fees |
| **5. Embedded Finance** | SaaS platforms | React components | Per-transaction + SaaS tiers |

### Prioritization Recommendation

```
High Impact, High Feasibility:
├── Direction 1: x402 API Monetization (x402 is gaining traction NOW)
├── Direction 2: AI Agent Payments (massive untapped market)

Medium Impact, High Feasibility:
├── Direction 5: Embedded Finance (clear demand, proven model)

High Impact, Medium Feasibility:
├── Direction 3: Cross-Chain Treasury (CCTP V2 just launched)
├── Direction 4: Payment Streams (complex smart contracts)
```

---

## Sources

- [x402.org - Internet-Native Payments Standard](https://www.x402.org/)
- [Thirdweb - x402 Protocol Explained](https://blog.thirdweb.com/what-is-x402-protocol-the-http-based-payment-standard-for-onchain-commerce/)
- [Coinbase x402 Documentation](https://docs.cdp.coinbase.com/x402/welcome)
- [DappRadar - x402 Protocol Explained](https://dappradar.com/blog/x402-protocol-explained-the-revolution-for-seamless-web3-micropayments)
- [Circle CCTP Documentation](https://developers.circle.com/cctp)
- [Circle Bridge Kit](https://developers.circle.com/bridge-kit)
- [CoinDesk - Circle CCTP V2 Launch](https://www.coindesk.com/tech/2025/03/10/circle-upgrades-cross-chain-transfer-protocol-promising-faster-usdc-settlements/)
- [LI.FI - CCTP Deep Dive](https://li.fi/knowledge-hub/circles-cross-chain-transfer-protocol-cctp-a-deep-dive/)
