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
│                    Arc Payment Infrastructure                    │
│  ├─ Circle Wallets (MPC Security)                               │
│  ├─ Arc Blockchain (USDC Settlement)                            │
│  ├─ Coinbase Onramp (Fiat → USDC)                               │
│  └─ Transak Offramp (USDC → Fiat)                               │
└─────────────────────────────────────────────────────────────────┘
```

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

### In Progress
- Circle Gateway integration (crosschain USDC batching)
- x402 Protocol for AI agent micropayments
- Enhanced developer onboarding platform

### Future Directions
- Mobile SDKs (React Native, Flutter)
- White-label solutions
- Multi-sig treasury workflows

---

## License

MIT
