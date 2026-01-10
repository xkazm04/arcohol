# ArcPay Implementation Plan

## Phase 1: Recurring Payments (Subscriptions)
## Phase 2: Payment Links + Backend SDK

---

# Phase 1: Recurring Payments / Subscription Engine

## Overview

Enable merchants to charge customers on a recurring basis (weekly, monthly, yearly) using USDC on Arc blockchain.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  React SDK      │    │  Backend SDK    │    │  Smart Contract │     │
│  │  (@arcpay/react)│◄──►│  (@arcpay/node) │◄──►│  (Subscription) │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│          │                      │                      │                │
│          ▼                      ▼                      ▼                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  UI Components  │    │  Webhook Events │    │  On-chain State │     │
│  │  - SubButton    │    │  - sub.created  │    │  - Approvals    │     │
│  │  - SubManager   │    │  - sub.renewed  │    │  - Schedules    │     │
│  │  - PlanSelector │    │  - sub.cancelled│    │  - Payments     │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation Components

### 1.1 Subscription Types & Interfaces

```typescript
// types/subscription.ts

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: string;                    // Amount in USDC
  interval: 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;             // e.g., 2 = every 2 months
  trialDays?: number;
  metadata?: Record<string, string>;
  createdAt: Date;
}

interface Subscription {
  id: string;
  planId: string;
  customerId: string;                // Wallet address
  merchantId: string;                // Merchant wallet
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  approvalTxHash?: string;           // USDC approval transaction
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type: SubscriptionEventType;
  data: Record<string, unknown>;
  createdAt: Date;
}

type SubscriptionEventType =
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.renewed'
  | 'subscription.payment_failed'
  | 'subscription.canceled'
  | 'subscription.paused'
  | 'subscription.resumed';
```

### 1.2 React SDK Components

```
src/
├── components/
│   └── subscriptions/
│       ├── SubscribeButton.tsx      # One-click subscribe
│       ├── PlanSelector.tsx         # Choose from plans
│       ├── SubscriptionCard.tsx     # Display active sub
│       ├── SubscriptionManager.tsx  # Manage/cancel subs
│       ├── PlanPricingTable.tsx     # Pricing table display
│       └── index.ts
├── hooks/
│   ├── useSubscription.ts           # Single subscription
│   ├── useSubscriptions.ts          # All user subscriptions
│   └── useSubscriptionPlans.ts      # Available plans
└── core/
    └── SubscriptionClient.ts        # API client
```

### 1.3 React Components API

```tsx
// SubscribeButton - One-click subscription
<SubscribeButton
  planId="pro-monthly"
  onSubscribed={(subscription) => {
    console.log('Subscribed!', subscription);
  }}
  onError={(error) => {}}
  variant="primary"
  size="md"
>
  Subscribe for $29/month
</SubscribeButton>

// PlanSelector - Choose from multiple plans
<PlanSelector
  plans={[
    { id: 'basic', name: 'Basic', amount: '9.99', interval: 'monthly' },
    { id: 'pro', name: 'Pro', amount: '29.99', interval: 'monthly' },
    { id: 'enterprise', name: 'Enterprise', amount: '99.99', interval: 'monthly' },
  ]}
  onSelect={(planId) => {}}
  selectedPlanId={selectedPlan}
  showFeatures={true}
/>

// SubscriptionManager - Manage existing subscriptions
<SubscriptionManager
  subscriptionId="sub_123"
  showCancelButton={true}
  showPauseButton={true}
  showUpgradeOptions={true}
  onCancel={(sub) => {}}
  onPause={(sub) => {}}
  onResume={(sub) => {}}
/>

// PlanPricingTable - Full pricing display
<PlanPricingTable
  plans={plans}
  features={[
    { name: 'Users', basic: '1', pro: '5', enterprise: 'Unlimited' },
    { name: 'Storage', basic: '1GB', pro: '10GB', enterprise: '100GB' },
  ]}
  onSubscribe={(planId) => {}}
  currentPlanId={userPlan}
/>
```

### 1.4 React Hooks API

```typescript
// useSubscription - Single subscription management
const {
  subscription,           // Subscription | null
  isLoading,
  error,
  cancel,                 // () => Promise<void>
  pause,                  // () => Promise<void>
  resume,                 // () => Promise<void>
  changePlan,             // (newPlanId: string) => Promise<void>
} = useSubscription(subscriptionId);

// useSubscriptions - All user subscriptions
const {
  subscriptions,          // Subscription[]
  activeSubscriptions,    // Subscription[] (filtered)
  isLoading,
  subscribe,              // (planId: string) => Promise<Subscription>
  cancelAll,              // () => Promise<void>
} = useSubscriptions();

// useSubscriptionPlans - Available plans
const {
  plans,                  // SubscriptionPlan[]
  isLoading,
  getPlan,                // (planId: string) => SubscriptionPlan | undefined
} = useSubscriptionPlans(merchantId);
```

### 1.5 Subscription Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION FLOW                              │
└──────────────────────────────────────────────────────────────────┘

1. SUBSCRIBE
   User clicks "Subscribe"
           │
           ▼
   Check wallet connected ──No──► Prompt connect
           │
          Yes
           ▼
   Request USDC approval (ERC-20 approve)
           │
           ▼
   User signs approval transaction
           │
           ▼
   Create subscription record
           │
           ▼
   Emit 'subscription.created' webhook
           │
           ▼
   First payment executed
           │
           ▼
   Subscription active!

2. RENEWAL (Automated)
   Cron job checks due subscriptions
           │
           ▼
   For each due subscription:
           │
           ▼
   Check USDC allowance sufficient
           │
          Yes ──────────────────────► Execute transfer
           │                                  │
          No                                  ▼
           │                         Emit 'subscription.renewed'
           ▼
   Mark as 'past_due'
           │
           ▼
   Emit 'subscription.payment_failed'
           │
           ▼
   Retry logic (3 attempts over 7 days)
           │
           ▼
   If still failed → Cancel subscription

3. CANCEL
   User clicks "Cancel"
           │
           ▼
   Set cancelAtPeriodEnd = true
           │
           ▼
   Access continues until period end
           │
           ▼
   At period end: status = 'canceled'
           │
           ▼
   Emit 'subscription.canceled'
```

---

# Phase 2: Payment Links + Backend SDK

## 2.1 Backend SDK (@arcpay/node)

### Package Structure

```
ArcPayNode/
├── src/
│   ├── index.ts                     # Main exports
│   ├── ArcPayServer.ts              # Main client class
│   │
│   ├── resources/
│   │   ├── payments.ts              # Payments API
│   │   ├── paymentIntents.ts        # Payment intents
│   │   ├── paymentLinks.ts          # Payment links
│   │   ├── subscriptions.ts         # Subscriptions API
│   │   ├── plans.ts                 # Subscription plans
│   │   ├── customers.ts             # Customer management
│   │   ├── webhooks.ts              # Webhook utilities
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── payment.ts
│   │   ├── subscription.ts
│   │   ├── customer.ts
│   │   ├── webhook.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── crypto.ts                # Signature verification
│   │   ├── validation.ts
│   │   └── errors.ts
│   │
│   └── middleware/
│       ├── express.ts               # Express middleware
│       ├── nextjs.ts                # Next.js middleware
│       └── index.ts
│
├── package.json
├── tsconfig.json
├── README.md
└── tests/
    └── ...
```

### 2.2 Backend SDK API Design

```typescript
// Initialize client
import { ArcPayServer } from '@arcpay/node';

const arcpay = new ArcPayServer({
  secretKey: process.env.ARCPAY_SECRET_KEY!,
  webhookSecret: process.env.ARCPAY_WEBHOOK_SECRET,
});

// ============ PAYMENTS ============

// Create a payment (server-initiated)
const payment = await arcpay.payments.create({
  amount: '99.99',
  currency: 'USDC',
  recipient: '0x1234...',
  description: 'Order #12345',
  metadata: {
    orderId: '12345',
    customerId: 'cust_abc',
  },
});

// Retrieve a payment
const payment = await arcpay.payments.retrieve('pay_123');

// List payments
const payments = await arcpay.payments.list({
  limit: 10,
  startingAfter: 'pay_100',
  status: 'completed',
});

// ============ PAYMENT INTENTS ============

// Create payment intent (for frontend to complete)
const intent = await arcpay.paymentIntents.create({
  amount: '99.99',
  metadata: { orderId: '12345' },
});
// Returns { id, clientSecret, status }
// Send clientSecret to frontend

// Confirm payment intent was completed
const intent = await arcpay.paymentIntents.retrieve(intentId);
if (intent.status === 'succeeded') {
  // Fulfill order
}

// ============ PAYMENT LINKS ============

// Create a payment link
const link = await arcpay.paymentLinks.create({
  amount: '99.99',
  description: 'Pro License',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  metadata: { productId: 'prod_123' },
  allowPromotionCodes: true,
  collectEmail: true,
});
// Returns { id, url, ... }
// url = https://pay.arcpay.io/link/pl_abc123

// Retrieve link
const link = await arcpay.paymentLinks.retrieve('pl_abc123');

// Deactivate link
await arcpay.paymentLinks.deactivate('pl_abc123');

// List links
const links = await arcpay.paymentLinks.list({ active: true });

// ============ SUBSCRIPTIONS ============

// Create a subscription plan
const plan = await arcpay.plans.create({
  name: 'Pro Monthly',
  amount: '29.99',
  interval: 'monthly',
  trialDays: 14,
});

// Create a subscription
const subscription = await arcpay.subscriptions.create({
  customerId: '0x1234...', // Wallet address
  planId: 'plan_pro',
  metadata: { userId: 'user_123' },
});

// Cancel a subscription
await arcpay.subscriptions.cancel('sub_123', {
  cancelAtPeriodEnd: true, // or immediate
});

// ============ CUSTOMERS ============

// Create/update customer
const customer = await arcpay.customers.create({
  walletAddress: '0x1234...',
  email: 'customer@example.com',
  name: 'John Doe',
  metadata: { userId: 'user_123' },
});

// Get customer's subscriptions
const subs = await arcpay.customers.listSubscriptions('cust_123');

// Get customer's payments
const payments = await arcpay.customers.listPayments('cust_123');

// ============ WEBHOOKS ============

// Express middleware
import express from 'express';

app.post('/webhooks/arcpay',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['arcpay-signature'] as string;

    let event;
    try {
      event = arcpay.webhooks.constructEvent(
        req.body,
        sig,
        process.env.ARCPAY_WEBHOOK_SECRET!
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment.completed':
        const payment = event.data;
        await fulfillOrder(payment.metadata.orderId);
        break;

      case 'subscription.created':
        const subscription = event.data;
        await activateSubscription(subscription);
        break;

      case 'subscription.canceled':
        await deactivateAccess(event.data);
        break;

      case 'payment_link.completed':
        const linkPayment = event.data;
        await handleLinkPayment(linkPayment);
        break;
    }

    res.json({ received: true });
  }
);
```

### 2.3 Payment Links System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT LINKS SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MERCHANT                    ARCPAY                      CUSTOMER        │
│  ────────                    ──────                      ────────        │
│      │                          │                            │           │
│      │  Create Payment Link     │                            │           │
│      │─────────────────────────►│                            │           │
│      │                          │                            │           │
│      │  Return URL              │                            │           │
│      │◄─────────────────────────│                            │           │
│      │                          │                            │           │
│      │  Share link with customer                             │           │
│      │──────────────────────────────────────────────────────►│           │
│      │                          │                            │           │
│      │                          │   Visit link               │           │
│      │                          │◄───────────────────────────│           │
│      │                          │                            │           │
│      │                          │   Show payment page        │           │
│      │                          │───────────────────────────►│           │
│      │                          │                            │           │
│      │                          │   Connect wallet & pay     │           │
│      │                          │◄───────────────────────────│           │
│      │                          │                            │           │
│      │  Webhook: payment.completed                           │           │
│      │◄─────────────────────────│                            │           │
│      │                          │                            │           │
│      │                          │   Redirect to success URL  │           │
│      │                          │───────────────────────────►│           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Hosted Checkout Page

```
Payment Link Page Structure:

┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │              [Merchant Logo]                         │   │
│  │                                                      │   │
│  │              Merchant Name                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │   Product/Service Description                        │   │
│  │                                                      │   │
│  │   ┌─────────────────────────────────────────────┐   │   │
│  │   │              $99.99 USDC                     │   │   │
│  │   └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Email (optional)                                    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ customer@example.com                         │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │   ┌─────────────────────────────────────────────┐   │   │
│  │   │         🦊 Connect MetaMask                  │   │   │
│  │   └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │   ┌─────────────────────────────────────────────┐   │   │
│  │   │         🔗 WalletConnect                     │   │   │
│  │   └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │   ┌─────────────────────────────────────────────┐   │   │
│  │   │         💳 Pay with Coinbase                 │   │   │
│  │   └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Powered by ArcPay • Terms • Privacy          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Step 1: Backend SDK Foundation
1. Create @arcpay/node package structure
2. Implement ArcPayServer client
3. Implement Payments resource
4. Implement Webhook verification
5. Add Express/Next.js middleware

### Step 2: Payment Links
1. Add PaymentLinks resource to backend SDK
2. Create payment link data types
3. Implement link creation/management

### Step 3: Subscriptions Backend
1. Add Plans resource
2. Add Subscriptions resource
3. Add Customers resource
4. Implement subscription lifecycle

### Step 4: React SDK Subscriptions
1. Add subscription types to @arcpay/react
2. Create useSubscription hooks
3. Create subscription components
4. Integrate with backend SDK

### Step 5: Hosted Checkout (Future)
1. Create hosted checkout Next.js app
2. Implement payment link pages
3. Add customization options

---

## Database Schema (Reference)

```sql
-- Payment Links
CREATE TABLE payment_links (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 6) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDC',
  description TEXT,
  success_url VARCHAR(2048),
  cancel_url VARCHAR(2048),
  expires_at TIMESTAMP,
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(18, 6) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDC',
  interval VARCHAR(20) NOT NULL, -- weekly, monthly, yearly
  interval_count INTEGER DEFAULT 1,
  trial_days INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  plan_id VARCHAR(255) REFERENCES subscription_plans(id),
  customer_wallet VARCHAR(255) NOT NULL,
  merchant_wallet VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  trial_end TIMESTAMP,
  approval_tx_hash VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Events
CREATE TABLE subscription_events (
  id VARCHAR(255) PRIMARY KEY,
  subscription_id VARCHAR(255) REFERENCES subscriptions(id),
  type VARCHAR(100) NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id VARCHAR(255) PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Webhook Events

| Event | Description |
|-------|-------------|
| `payment.initiated` | Payment started |
| `payment.completed` | Payment successful |
| `payment.failed` | Payment failed |
| `payment_link.created` | Link created |
| `payment_link.completed` | Link payment successful |
| `payment_link.expired` | Link expired |
| `subscription.created` | New subscription |
| `subscription.activated` | Sub activated (after trial) |
| `subscription.renewed` | Recurring payment success |
| `subscription.payment_failed` | Recurring payment failed |
| `subscription.canceled` | Sub canceled |
| `subscription.paused` | Sub paused |
| `subscription.resumed` | Sub resumed |
| `customer.created` | New customer |
| `customer.updated` | Customer updated |

---

## Security Considerations

1. **Webhook Signature Verification**
   - HMAC-SHA256 signatures
   - Timestamp validation (prevent replay)
   - IP allowlisting option

2. **API Authentication**
   - Secret key for server-side
   - Public key for client-side (limited access)
   - Key rotation support

3. **Payment Validation**
   - Amount verification
   - Recipient verification
   - Duplicate payment prevention

4. **Subscription Security**
   - Approval amount limits
   - Rate limiting on renewals
   - Fraud detection hooks
