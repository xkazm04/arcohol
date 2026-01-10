# @arcpay/node

Node.js SDK for ArcPay - USDC payments on Arc blockchain.

## Installation

```bash
npm install @arcpay/node
# or
yarn add @arcpay/node
# or
pnpm add @arcpay/node
```

## Quick Start

```typescript
import ArcPay from '@arcpay/node';

const arcpay = new ArcPay('sk_test_...');

// Create a payment
const payment = await arcpay.payments.create({
  amount: '100.00',
  currency: 'USDC',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
  description: 'Order #1234',
});

console.log('Payment created:', payment.id);
```

## Features

- **Payments** - One-time payments with USDC
- **Payment Intents** - Server-side payment preparation for client completion
- **Payment Links** - Shareable payment URLs
- **Subscriptions** - Recurring payments with flexible plans
- **Customers** - Customer profile management
- **Webhooks** - Real-time event notifications with signature verification

## API Reference

### Payments

```typescript
// Create a payment
const payment = await arcpay.payments.create({
  amount: '100.00',
  currency: 'USDC',
  recipient: '0x...',
  description: 'Order #1234',
  metadata: { orderId: '1234' },
});

// Retrieve a payment
const payment = await arcpay.payments.retrieve('pay_...');

// List payments
const payments = await arcpay.payments.list({ limit: 10 });

// Cancel a pending payment
const canceled = await arcpay.payments.cancel('pay_...');

// Refund a completed payment
const refunded = await arcpay.payments.refund('pay_...', {
  amount: '50.00', // Partial refund
  reason: 'Customer request',
});
```

### Payment Intents

```typescript
// Create a payment intent
const intent = await arcpay.paymentIntents.create({
  amount: '100.00',
  currency: 'USDC',
  description: 'Subscription payment',
});

// Pass clientSecret to your frontend for completion
console.log(intent.clientSecret);

// Confirm server-side (optional)
const confirmed = await arcpay.paymentIntents.confirm('pi_...', {
  walletAddress: '0x...',
});
```

### Payment Links

```typescript
// Create a shareable payment link
const link = await arcpay.paymentLinks.create({
  amount: '50.00',
  description: 'Premium Subscription',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel',
  collectEmail: true,
  collectName: true,
  maxCompletions: 100, // Optional limit
  expiresAt: new Date('2024-12-31'),
});

console.log('Share this link:', link.url);

// Deactivate a link
await arcpay.paymentLinks.deactivate('pl_...');
```

### Subscription Plans

```typescript
// Create a subscription plan
const plan = await arcpay.plans.create({
  name: 'Pro Plan',
  description: 'Full access to all features',
  amount: '29.99',
  currency: 'USDC',
  interval: 'monthly',
  trialDays: 14,
});

// List active plans
const plans = await arcpay.plans.list({ active: true });

// Archive a plan
await arcpay.plans.archive('plan_...');
```

### Subscriptions

```typescript
// Create a subscription
const subscription = await arcpay.subscriptions.create({
  planId: 'plan_...',
  customerWallet: '0x...',
  metadata: { userId: 'user_123' },
});

// Cancel at period end
await arcpay.subscriptions.cancel('sub_...', {
  cancelAtPeriodEnd: true,
});

// Pause a subscription
await arcpay.subscriptions.pause('sub_...', {
  resumesAt: new Date('2024-02-01'),
});

// Resume
await arcpay.subscriptions.resume('sub_...');

// List invoices
const invoices = await arcpay.subscriptions.listInvoices('sub_...');
```

### Customers

```typescript
// Create a customer
const customer = await arcpay.customers.create({
  walletAddress: '0x...',
  email: 'user@example.com',
  name: 'John Doe',
});

// Get or create by wallet
const customer = await arcpay.customers.getOrCreate('0x...', {
  email: 'user@example.com',
});

// List customer subscriptions
const subs = await arcpay.customers.listSubscriptions('cus_...');

// Create portal session for self-service
const portal = await arcpay.customers.createPortalSession({
  customerId: 'cus_...',
  returnUrl: 'https://yoursite.com/account',
});
```

### Webhooks

```typescript
// Create a webhook endpoint
const endpoint = await arcpay.webhooks.create({
  url: 'https://yoursite.com/webhooks/arcpay',
  enabledEvents: [
    'payment.completed',
    'subscription.renewed',
    'subscription.canceled',
  ],
});

// Rotate the signing secret
await arcpay.webhooks.rotateSecret('we_...');
```

## Webhook Handling

### Express

```typescript
import express from 'express';
import { webhookMiddleware, webhookHandler } from '@arcpay/node/middleware/express';

const app = express();

app.post(
  '/webhooks/arcpay',
  express.raw({ type: 'application/json' }),
  webhookMiddleware({ secret: process.env.ARCPAY_WEBHOOK_SECRET! }),
  webhookHandler((event, req, res) => {
    switch (event.type) {
      case 'payment.completed':
        console.log('Payment completed:', event.data.id);
        break;
      case 'subscription.renewed':
        console.log('Subscription renewed:', event.data.id);
        break;
    }
    res.json({ received: true });
  })
);
```

### Next.js (App Router)

```typescript
// app/api/webhooks/arcpay/route.ts
import { webhookHandler } from '@arcpay/node/middleware/nextjs';

export const POST = webhookHandler({
  secret: process.env.ARCPAY_WEBHOOK_SECRET!,
  onEvent: async (event) => {
    switch (event.type) {
      case 'payment.completed':
        // Handle payment...
        break;
      case 'subscription.canceled':
        // Handle cancellation...
        break;
    }
  },
});
```

### Next.js (Pages Router)

```typescript
// pages/api/webhooks/arcpay.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { constructWebhookEvent } from '@arcpay/node/middleware/nextjs';

export const config = {
  api: { bodyParser: false }, // REQUIRED!
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const event = await constructWebhookEvent(req, {
    secret: process.env.ARCPAY_WEBHOOK_SECRET!,
  });

  switch (event.type) {
    case 'payment.completed':
      // Handle...
      break;
  }

  res.json({ received: true });
}
```

### Manual Verification

```typescript
import { Webhook } from '@arcpay/node';

const payload = req.body; // Raw string or Buffer
const signature = req.headers['arcpay-signature'];

try {
  const event = Webhook.constructEvent(
    payload,
    signature,
    process.env.ARCPAY_WEBHOOK_SECRET!
  );
  // Handle event...
} catch (err) {
  console.error('Webhook verification failed:', err);
}
```

## Error Handling

```typescript
import ArcPay, {
  ArcPayError,
  AuthenticationError,
  InvalidRequestError,
  NotFoundError,
  RateLimitError,
} from '@arcpay/node';

try {
  await arcpay.payments.create({ ... });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof InvalidRequestError) {
    console.error('Invalid request:', error.message, error.details);
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited - slow down');
  } else if (error instanceof ArcPayError) {
    console.error('API error:', error.code, error.message);
  }
}
```

## Configuration

```typescript
const arcpay = new ArcPay('sk_...', {
  baseUrl: 'https://api.arcpay.io/v1', // Custom base URL
  timeout: 30000, // Request timeout in ms
  apiVersion: '2024-01-01', // API version
});
```

## Webhook Events

| Event | Description |
|-------|-------------|
| `payment.created` | Payment was created |
| `payment.pending` | Payment is pending confirmation |
| `payment.completed` | Payment completed successfully |
| `payment.failed` | Payment failed |
| `payment.canceled` | Payment was canceled |
| `payment.refunded` | Payment was refunded |
| `payment_link.created` | Payment link was created |
| `payment_link.completed` | Payment made through link |
| `subscription.created` | Subscription was created |
| `subscription.activated` | Subscription became active |
| `subscription.renewed` | Subscription renewed successfully |
| `subscription.paused` | Subscription was paused |
| `subscription.resumed` | Subscription was resumed |
| `subscription.canceled` | Subscription was canceled |
| `subscription.expired` | Subscription expired |
| `invoice.created` | Invoice was created |
| `invoice.paid` | Invoice was paid |
| `invoice.payment_failed` | Invoice payment failed |
| `customer.created` | Customer was created |
| `customer.updated` | Customer was updated |
| `customer.deleted` | Customer was deleted |

## Pagination

All list methods support cursor-based pagination:

```typescript
// First page
const { data, hasMore } = await arcpay.payments.list({ limit: 20 });

// Next page
if (hasMore) {
  const nextPage = await arcpay.payments.list({
    limit: 20,
    startingAfter: data[data.length - 1].id,
  });
}

// Iterate through all
async function* getAllPayments() {
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const result = await arcpay.payments.list({ limit: 100, startingAfter });
    for (const payment of result.data) yield payment;
    hasMore = result.hasMore;
    startingAfter = result.data[result.data.length - 1]?.id;
  }
}
```

## Idempotency

Prevent duplicate operations:

```typescript
const payment = await arcpay.payments.create({
  amount: '100.00',
  currency: 'USDC',
  recipient: '0x...',
  idempotencyKey: `order_${orderId}`,
});

// Retrying with the same key returns the original payment
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  Payment,
  PaymentIntent,
  PaymentLink,
  Subscription,
  SubscriptionPlan,
  Customer,
  WebhookEvent,
  PaymentStatus,
  SubscriptionStatus,
} from '@arcpay/node';
```

## Testing

The SDK includes comprehensive testing utilities to help you test your integration without making real API calls.

### Installation

Testing utilities are included in the main package:

```typescript
import {
  MockArcPayServer,
  createPayment,
  createSubscription,
  PaymentScenarios,
  createSignedWebhookRequest,
} from '@arcpay/node/testing';
```

### Mock Server

Create a mock server that simulates all ArcPay API endpoints:

```typescript
import { MockArcPayServer, createPayment } from '@arcpay/node/testing';

describe('Payment Flow', () => {
  const mock = new MockArcPayServer();

  beforeEach(() => {
    mock.reset();
  });

  it('should create a payment', async () => {
    const mockPayment = createPayment({ status: 'completed' });
    mock.payments.create.returns(mockPayment);

    // Your code that creates a payment
    const result = await yourPaymentService.create({ amount: '100.00' });

    expect(result.id).toBe(mockPayment.id);
    expect(mock.payments.create.calls).toHaveLength(1);
  });

  it('should handle errors', async () => {
    mock.payments.create.throws(new Error('Insufficient funds'));

    await expect(yourPaymentService.create({ amount: '100.00' }))
      .rejects.toThrow('Insufficient funds');
  });
});
```

### Test Fixtures

Create realistic test data with factory functions:

```typescript
import {
  createPayment,
  createPaymentIntent,
  createSubscription,
  createPlan,
  createCustomer,
  createInvoice,
  createWebhookEvent,
  setSeed,
} from '@arcpay/node/testing';

// Create a payment with defaults
const payment = createPayment();

// Create with overrides
const completedPayment = createPayment({
  status: 'completed',
  amount: '250.00',
});

// Create subscription flow
const plan = createPlan({ amount: '29.99', interval: 'monthly' });
const subscription = createSubscription({
  planId: plan.id,
  status: 'active',
});

// Create webhook event
const event = createWebhookEvent('payment.completed', payment);

// Reproducible tests with seeded random
setSeed(12345);
const payment1 = createPayment(); // Always same result
const payment2 = createPayment(); // Always same result
```

### Pre-built Scenarios

Use pre-built scenarios for common payment flows:

```typescript
import { PaymentScenarios, SubscriptionScenarios } from '@arcpay/node/testing';

describe('Payment Scenarios', () => {
  it('handles successful payment', () => {
    const scenario = PaymentScenarios.successfulPayment();
    // scenario.customer - The customer
    // scenario.intent - Initial payment intent
    // scenario.confirmedIntent - Confirmed intent
    // scenario.payment - Completed payment
    // scenario.webhookEvents - Array of webhook events
  });

  it('handles failed payment', () => {
    const scenario = PaymentScenarios.failedPayment();
    // Test your error handling
  });

  it('handles refund', () => {
    const scenario = PaymentScenarios.refundedPayment();
    // Test refund flow
  });
});

describe('Subscription Scenarios', () => {
  it('handles trial to active', () => {
    const scenario = SubscriptionScenarios.trialToActive();
    // scenario.customer
    // scenario.plan
    // scenario.subscription (trialing)
    // scenario.activeSubscription
    // scenario.invoice
    // scenario.webhookEvents
  });

  it('handles renewal failure', () => {
    const scenario = SubscriptionScenarios.renewalFailed();
    // Test dunning flow
  });

  it('handles plan upgrade', () => {
    const scenario = SubscriptionScenarios.planUpgrade();
    // scenario.basicPlan
    // scenario.proPlan
    // scenario.proratedInvoice
  });
});
```

### Webhook Testing

Test webhook handlers with signed requests:

```typescript
import {
  createSignedWebhookRequest,
  createWebhookEvent,
  createExpressMocks,
  createNextjsRequest,
} from '@arcpay/node/testing';

// Create a signed webhook request
const event = createWebhookEvent('payment.completed', { id: 'pay_123' });
const { body, headers } = createSignedWebhookRequest(event, 'whsec_test_secret');

// Test Express webhook handler
describe('Express webhook', () => {
  it('handles payment.completed', async () => {
    const { req, res } = createExpressMocks({
      body: body,
      headers: headers,
    });

    await webhookHandler(req, res);

    expect(res.statusCode).toBe(200);
  });
});

// Test Next.js webhook handler
describe('Next.js webhook', () => {
  it('handles payment.completed', async () => {
    const req = createNextjsRequest({
      body: body,
      headers: headers,
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
```

## Health Check

Verify your SDK configuration and API connectivity:

```typescript
import ArcPay from '@arcpay/node';

const arcpay = new ArcPay('sk_test_...');

// Run health check
const report = await arcpay.healthCheck();

console.log(report.overall); // 'healthy' | 'degraded' | 'unhealthy'
console.log(report.summary);
// { passed: 4, warnings: 0, failed: 0, total: 4 }

// Verbose check with all details
const verboseReport = await arcpay.healthCheck({ verbose: true });

// Include webhook verification
const fullReport = await arcpay.healthCheck({
  verbose: true,
  verifyWebhook: true,
  webhookSecret: 'whsec_...',
});

// Print formatted report
console.log(arcpay.formatHealthReport(report));
// ╔════════════════════════════════════════════╗
// ║         ArcPay SDK Health Check            ║
// ╚════════════════════════════════════════════╝
//
// Status: ✅ HEALTHY
// Environment: test
// SDK Version: 0.1.0
//
// Summary:
//   ✅ Passed: 4
//   ⚠️ Warnings: 0
//   ❌ Failed: 0
```

### Health Check Options

```typescript
interface HealthCheckOptions {
  timeout?: number;        // API timeout in ms (default: 5000)
  verifyWebhook?: boolean; // Verify webhook secret format
  webhookSecret?: string;  // Webhook secret for verification
  verbose?: boolean;       // Include all checks in report
}
```

### Health Check Report

```typescript
interface HealthCheckReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  environment: 'test' | 'live';
  checks: CheckResult[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}
```

## Requirements

- Node.js >= 18.0.0
- ArcPay API key from [dashboard.arcpay.io](https://dashboard.arcpay.io)

## Related Packages

- **[@arcpay/react](https://npm.im/@arcpay/react)** - React components for client-side payments

## License

MIT
