# Arc Payment Infrastructure

A comprehensive payment SDK ecosystem for USDC payments on the Arc blockchain. **"Stripe for Web3"** - enabling developers to add crypto payments with minimal code.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@arcpay/react`](./arcpay-react/) | React SDK with UI components and hooks | Production |
| [`@arcpay/node`](./arcpay-node/) | Node.js backend SDK for server operations | Production |
| [`@arcpay/b2b`](./arcpay-b2b/) | B2B SDK for high-value transactions | Production |
| [`/test`](./test/) | Interactive sandbox & playground | Development |

---

## High-Level Capabilities

### @arcpay/react (Frontend SDK)

**Core Payment Features**
- Instant USDC send/receive on Arc blockchain
- QR code generation and scanning for payments
- Transaction history with pagination
- Exchange rate tracking

**Wallet Management**
- Circle Wallet integration (MPC-secured, gas-sponsored)
- External wallet support (MetaMask, WalletConnect)
- Embedded wallet creation for new users

**Fiat On/Off Ramps**
- **Coinbase Onramp** - Buy USDC with fiat (zero fees)
- **Transak Offramp** - Sell USDC to bank (64+ countries)

**Subscription System**
- Plan creation and management
- Subscription checkout flows
- Recurring payment handling

**Developer Experience**
- Full TypeScript support
- 3 customization levels (theme, CSS, headless)
- Multi-language support (EN, ES, FR, DE, PT, ZH)
- Testing utilities with mock providers

### @arcpay/node (Backend SDK)

**Payment Operations**
- Payment CRUD (create, retrieve, cancel, refund)
- Payment Intents (two-phase authorization + capture)
- Payment Links (shareable checkout URLs)

**Subscription Management**
- Plan lifecycle (create, update, archive)
- Subscription handling (activate, pause, resume, cancel)
- Automatic renewal with retry logic
- Trial period support

**Customer Management**
- Customer profiles and metadata
- Subscription tracking per customer
- Customer portal sessions

**Webhooks**
- 19+ event types for real-time notifications
- HMAC-SHA256 signature verification
- Timestamp validation and replay protection

**Integration**
- Express.js middleware
- Next.js middleware
- Health check system for configuration validation

### @arcpay/b2b (B2B SDK)

**Credit Accounts & Usage Metering**
- Prepaid credit accounts with yield on idle funds (USDY)
- Usage-based billing with flexible rate cards
- Auto top-up and low balance alerts
- Express/Next.js middleware for automatic metering

**Dispute Resolution (LLM-Powered)**
- Automated chargeback system for crypto transactions
- AI evaluation with confidence scoring
- Evidence management for buyers and merchants
- Delivery proof registration to prevent disputes

**Merchant Gateway**
- B2B invoicing with instant settlement
- Crosschain USDC acceptance via Circle Gateway
- Batch payments for payroll and vendors
- QR code generation for payment links

**Treasury Management**
- Multi-fund structure (Operating, Reserve, Vault)
- Automatic yield optimization via USDY
- Smart rebalancing between funds
- Payment execution with auto-conversion

**Fee Advantage**
| Transaction | Stripe | Arc B2B | Savings |
|-------------|--------|---------|---------|
| $10,000 | $290.30 | ~$5 | 98% |
| $100,000 | $2,900.30 | ~$15 | 99% |

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18+, TypeScript 5, Tailwind CSS 4, Zustand |
| **Backend** | Node.js 18+, TypeScript 5, Express/Next.js |
| **Blockchain** | viem, Circle SDK, Arc/Base networks |
| **Payments** | Circle Wallets, x402 Protocol, Coinbase, Transak |
| **Build** | Rollup, tsup, PostCSS |
| **Validation** | Zod |

---

## Quick Start

### Frontend (React)

```tsx
import { ArcPayProvider, PayButton } from '@arcpay/react';
import '@arcpay/react/styles';

function App() {
  return (
    <ArcPayProvider publicKey="pk_live_xxx">
      <PayButton
        amount={10.00}
        recipient="0x..."
        onSuccess={(tx) => console.log('Paid!', tx)}
      />
    </ArcPayProvider>
  );
}
```

### Backend (Node.js)

```typescript
import { ArcPay } from '@arcpay/node';

const arcpay = new ArcPay({ secretKey: 'sk_live_xxx' });

// Create a payment
const payment = await arcpay.payments.create({
  amount: 10.00,
  currency: 'USDC',
  recipient: '0x...',
  metadata: { orderId: 'order_123' }
});

// Create a subscription
const subscription = await arcpay.subscriptions.create({
  customerId: 'cus_xxx',
  planId: 'plan_xxx'
});
```

### B2B (High-Value Transactions)

```typescript
import { ArcPayB2B } from '@arcpay/b2b';

const arcpay = new ArcPayB2B({ secretKey: 'sk_live_xxx' });

// Create an invoice
const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  reference: 'INV-2024-001',
  buyer: { email: 'ap@acme.com', company: 'Acme Corp' },
  lineItems: [{ description: 'Annual License', quantity: 1, unitPrice: 10000 }],
  dueDate: new Date('2024-02-01'),
});

// Record usage for credit account
await arcpay.credits.recordUsage('acc_xxx', {
  meter: 'api_call',
  count: 100,
});
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                         │
├─────────────────────────────────────────────────────────────────┤
│  @arcpay/react (Frontend)    │    @arcpay/node (Backend)        │
│  ├─ UI Components            │    ├─ Payment API                │
│  ├─ Wallet Hooks             │    ├─ Subscription API           │
│  ├─ Payment Forms            │    ├─ Webhook Handler            │
│  └─ Ramp Integration         │    └─ Middleware                 │
├─────────────────────────────────────────────────────────────────┤
│  @arcpay/b2b (B2B SDK)                                          │
│  ├─ Credits & Usage Metering │    ├─ x402 Gateway (NEW)         │
│  ├─ Dispute Resolution       │    ├─ Cross-Chain Treasury       │
│  ├─ Merchant Gateway         │    ├─ x402 Middleware            │
│  └─ USDY Yield Management    │    └─ Gasless Payments           │
├─────────────────────────────────────────────────────────────────┤
│                    Arc Payment Infrastructure                    │
│  ├─ Circle Wallets (MPC Security)                               │
│  ├─ Arc Blockchain (USDC Settlement)                            │
│  ├─ Circle Gateway (x402 Batching)                              │
│  ├─ Coinbase Onramp (Fiat → USDC)                               │
│  └─ Transak Offramp (USDC → Fiat)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## x402 Gateway Integration (Circle Early Access)

The platform now integrates Circle's x402 Batching SDK for **gasless micropayments**.

### Installation (Private Beta)

The `@circlefin/x402-batching` package is hosted on Circle's private Cloudsmith registry.

**1. Set your Cloudsmith token** (provided by Circle team):

```bash
# Add to .env file
CLOUDSMITH_TOKEN=your_cloudsmith_entitlement_token

# Or export directly
export CLOUDSMITH_TOKEN=your_token_here
```

**2. Install the SDK** (`.npmrc` files are already configured):

```bash
cd arcpay-b2b && npm install
cd test && npm install
```

The `.npmrc` files configure npm to authenticate with Circle's registry for `@circlefin` scoped packages.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   x402 Gasless Payment Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DEPOSIT (One-time, on-chain)                                │
│     Customer deposits USDC → Circle Gateway Contract             │
│                                                                  │
│  2. PAY (Gasless, per-request)                                  │
│     Customer signs EIP-3009 message → Your API                  │
│     No gas required! Instant response.                          │
│                                                                  │
│  3. SETTLE (Batched, ~5 min)                                    │
│     Circle Gateway batches signatures → On-chain settlement     │
│     Your wallet receives USDC automatically                     │
│                                                                  │
│  4. WITHDRAW (Cross-chain instant)                              │
│     Withdraw to any supported chain (Arc, Base, ETH, Polygon)   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### New SDK Exports

```typescript
// Express middleware for x402 payment acceptance
import { x402Middleware } from '@arcpay/b2b/middleware/express';

const x402 = x402Middleware({
  sellerAddress: '0x...',
});

app.get('/api/premium', x402.require('$0.01'), (req, res) => {
  res.json({ premium: 'content', payment: req.x402Payment });
});

// Next.js route handler wrapper
import { withX402 } from '@arcpay/b2b/middleware/nextjs';

export const GET = withX402({
  sellerAddress: '0x...',
  price: '$0.05',
})(async (request, { payment }) => {
  return Response.json({ premium: 'data' });
});

// X402Resource for programmatic access
const arcpay = new ArcPayB2B({ secretKey: 'sk_...' });

// Get Gateway balance
const balance = await arcpay.x402.getBalance('0x...');

// Cross-chain withdrawal
const withdrawal = await arcpay.x402.crossChainWithdraw({
  amount: '1000.00',
  sourceChain: 'arc',
  destinationChain: 'base',
  recipient: '0x...',
});

// Verify/settle payments
const result = await arcpay.x402.settlePayment(payload, requirements);
```

### Dashboard Features

The management dashboard (`/dashboard/x402`) now supports two billing modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Credits** | Database-based prepaid credits | Traditional API billing |
| **x402 Gateway** | Gasless micropayments via Circle | Low-value, high-frequency APIs |

### Supported Networks

| Network | Gasless Batching | Deposits/Withdrawals |
|---------|-----------------|----------------------|
| Arc Testnet | ✅ | ✅ |
| Base Sepolia | - | ✅ |
| Ethereum Sepolia | - | ✅ |
| Base (mainnet) | Coming Soon | ✅ |
| Arbitrum | Coming Soon | ✅ |
| Polygon | Coming Soon | ✅ |

---

## Micropayment Subscriptions

Enable sub-dollar recurring payments using x402 gasless micropayments.

### Use Cases

- **API Usage Billing**: Charge $0.001 per API call
- **Streaming Services**: $0.05/hour of content
- **IoT Data**: $0.0001 per sensor reading
- **AI Inference**: $0.01 per model request

### Plan Types

| Billing Type | Description | Example |
|--------------|-------------|---------|
| `per_use` | Charge per action/request | $0.001 per API call |
| `daily` | Daily recurring charge | $0.05 per day |
| `hourly` | Hourly recurring charge | $0.01 per hour |
| `per_minute` | Per-minute billing | $0.001 per minute |

### SDK Usage

```typescript
import { useMicroSubscriptions } from '@/features/subscriptions';

function MicroPaymentDashboard() {
  const {
    plans,
    subscriptions,
    createPlan,
    chargeSubscription,
  } = useMicroSubscriptions();

  // Create a micropayment plan
  const plan = await createPlan({
    name: 'API Usage',
    billingType: 'per_use',
    pricePerUnit: '$0.001',
    unitName: 'API call',
    maxChargePerDay: '$10.00',
    sellerAddress: '0x...',
  });

  // Charge a subscription
  const charge = await chargeSubscription(subscriptionId, {
    units: 100,
    description: '100 API calls',
    signature: '0x...', // EIP-3009 authorization
  });
}
```

### Spending Controls

- **Daily Cap**: Maximum amount chargeable per day
- **Monthly Cap**: Maximum amount chargeable per month
- **Minimum Charge**: Minimum charge per transaction
- **Automatic Pause**: Subscription pauses when limits reached

---

## Key Features

| Feature | React SDK | Node SDK | B2B SDK |
|---------|-----------|----------|---------|
| USDC Payments | ✅ | ✅ | ✅ |
| Wallet Connection | ✅ | - | - |
| Subscriptions | ✅ | ✅ | - |
| Payment Links | - | ✅ | ✅ |
| Webhooks | - | ✅ | ✅ |
| Fiat On-Ramp | ✅ | - | - |
| Fiat Off-Ramp | ✅ | - | - |
| Credit Accounts | - | - | ✅ |
| Usage Metering | - | - | ✅ |
| Dispute Resolution | - | - | ✅ |
| B2B Invoicing | - | - | ✅ |
| Treasury Mgmt | - | - | ✅ |
| Yield (USDY) | - | - | ✅ |
| **x402 Gateway** | - | - | ✅ |
| **Cross-Chain** | - | - | ✅ |
| **Micro Subscriptions** | - | - | ✅ |
| TypeScript | ✅ | ✅ | ✅ |
| Testing Utils | ✅ | ✅ | ✅ |
| Health Checks | ✅ | ✅ | ✅ |

---

## Supported Networks

- **Arc** (Primary - Circle's L1 for USDC)
- **Base Sepolia** (Testnet)
- **Ethereum** (Secondary)

---

## Documentation

- [React SDK Documentation](./arcpay-react/docs/)
- [Node SDK Documentation](./arcpay-node/docs/)
- [AI Agent Payment Stack](./AI_Agent_Payment_TechStack.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Developer Experience Plan](./DEVELOPER_EXPERIENCE_PLAN.md)

---

## Roadmap

### Completed
- ✅ Production-ready SDKs for payments and subscriptions
- ✅ Comprehensive webhook system
- ✅ Developer testing utilities
- ✅ B2B Credit & Billing System
- ✅ Automated Dispute Resolution (LLM-powered)
- ✅ Merchant Gateway with instant settlement
- ✅ Treasury Management with USDY yield
- ✅ **x402 Gateway Integration** (Circle Early Access)
- ✅ **Cross-Chain Treasury Liquidity**
- ✅ **Gasless Micropayment Middleware**
- ✅ **x402 Invoice Payment Collection**
- ✅ **Micropayment Subscriptions** (sub-dollar recurring payments)

### In Progress
- Enhanced developer onboarding platform

### Future Directions
- Mobile SDKs (React Native, Flutter)
- White-label solutions
- Multi-sig treasury workflows
- x402 Mainnet deployment

---

## License

MIT
