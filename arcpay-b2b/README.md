# @arcpay/b2b

B2B Payment SDK for the Arc ecosystem. Built for high-value transactions with fee savings, instant settlement, and automated dispute resolution.

## Features

- **Credit Accounts** - Prepaid credit system with usage metering
- **Dispute Resolution** - LLM-powered automated chargebacks
- **Merchant Gateway** - Invoicing with instant settlement
- **Treasury Management** - Yield optimization via USDY
- **Express/Next.js Middleware** - Easy framework integration

## Installation

```bash
npm install @arcpay/b2b
```

## Quick Start

```typescript
import { ArcPayB2B } from '@arcpay/b2b';

const arcpay = new ArcPayB2B({
  secretKey: process.env.ARCPAY_SECRET_KEY!,
});
```

## Credit Accounts & Usage Metering

```typescript
// Create a credit account
const account = await arcpay.credits.createAccount({
  organizationId: 'org_xxx',
  name: 'Main Account',
  settings: {
    lowBalanceAlert: 1000,
    yieldEnabled: true,
    yieldThreshold: 5000,
  },
});

// Deposit funds
await arcpay.credits.deposit(account.id, {
  amount: 10000,
  method: 'wire',
  reference: 'Q1-2024-prepay',
});

// Check balance
const balance = await arcpay.credits.getBalance(account.id);
console.log(`Available: $${balance.available.amount}`);
console.log(`In Yield: $${balance.inYield.amount}`);

// Record usage
await arcpay.credits.recordUsage(account.id, {
  meter: 'api_call',
  count: 100,
  metadata: { endpoint: '/v1/generate' },
});

// Get usage summary
const usage = await arcpay.credits.getUsageSummary(account.id);
console.log(`Total cost this period: $${usage.total.amount}`);
```

### Usage Meter Helper

```typescript
const meter = arcpay.createUsageMeter({
  accountId: 'acc_xxx',
  rateCard: {
    api_call: 0.01,      // $0.01 per call
    data_export: 0.50,   // $0.50 per export
  },
});

// Record usage easily
await meter.record('api_call', { count: 100 });
const summary = await meter.getSummary();
```

## Dispute Resolution

```typescript
// Create a dispute (buyer)
const dispute = await arcpay.disputes.create({
  transactionId: 'txn_xxx',
  category: 'not_received',
  description: 'Ordered software license on Jan 5, never received access.',
  evidence: [
    { type: 'order_confirmation', url: 'https://...' },
    { type: 'communication_log', url: 'https://...' },
  ],
  desiredResolution: 'full_refund',
});

// Respond to dispute (merchant)
await arcpay.disputes.respond(dispute.id, {
  response: 'reject',
  statement: 'Access was granted on Jan 6, see attached logs.',
  evidence: [
    { type: 'delivery_proof', url: 'https://...' },
    { type: 'service_records', url: 'https://...' },
  ],
});

// Register delivery proof (prevents disputes)
await arcpay.disputes.registerDelivery({
  transactionId: 'txn_xxx',
  type: 'digital_delivery',
  proof: {
    confirmed: true,
    ipAddress: '1.2.3.4',
    downloadLinks: ['https://...'],
  },
});
```

### Dispute Protection Helper

```typescript
const protection = arcpay.createDisputeProtection({
  merchantId: 'merch_xxx',
});

// Update protection settings
await protection.updateSettings({
  reservePercentage: 2,
  autoApproveThreshold: 0.90,
  merchantResponseWindow: 48,
});

// List disputes for this merchant
const disputes = await protection.listDisputes({ status: 'filed' });
```

## Merchant Gateway

```typescript
// Create an invoice
const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  currency: 'USD',
  reference: 'INV-2024-001',
  buyer: {
    company: 'Acme Corp',
    email: 'ap@acme.com',
  },
  lineItems: [
    { description: 'Annual SaaS License', quantity: 1, unitPrice: 8000 },
    { description: 'Implementation Services', quantity: 1, unitPrice: 2000 },
  ],
  dueDate: new Date('2024-02-08'),
  sendEmail: true,
});

console.log(`Payment URL: ${invoice.paymentUrl}`);
console.log(`QR Code: ${invoice.qrCode}`);

// Check settlement status
const settlement = await arcpay.gateway.getSettlement(invoice.id);
if (settlement) {
  console.log(`Settled at: ${settlement.settledAt}`);
  console.log(`Latency: ${settlement.latencySeconds}s`);
}

// Batch payments (payroll, vendors)
const batch = await arcpay.gateway.createBatch({
  reference: 'payroll-jan-2024',
  payments: [
    { recipient: '0x...', amount: 5000, memo: 'Contractor - John' },
    { recipient: '0x...', amount: 3000, memo: 'Contractor - Jane' },
  ],
});
```

## Treasury Management

```typescript
// Create treasury
const treasury = await arcpay.treasury.create({
  organizationId: 'org_xxx',
  name: 'Main Treasury',
  strategy: {
    operating: { target: 50000, minimum: 25000, currency: 'USDC' },
    reserve: { enabled: true, targetPercentage: 60 },
    autoRebalance: true,
  },
});

// Get overview
const overview = await arcpay.treasury.getOverview(treasury.id);
console.log(`Operating: $${overview.operating.balance.amount}`);
console.log(`Reserve: $${overview.reserve.balance.amount} (${overview.reserve.apy}% APY)`);
console.log(`Projected Annual Yield: $${overview.projectedAnnualYield.amount}`);

// Make a payment (auto-converts from reserve if needed)
await arcpay.treasury.pay(treasury.id, {
  recipient: '0x...',
  amount: 75000,
  memo: 'Vendor payment Q1',
});

// Transfer to reserve for yield
await arcpay.treasury.transferToReserve(treasury.id, 50000);
```

### Treasury Helper

```typescript
const treasury = arcpay.createTreasury({ treasuryId: 'tres_xxx' });

const overview = await treasury.getOverview();
await treasury.pay({ recipient: '0x...', amount: 5000, memo: 'Payment' });
await treasury.rebalance();
```

## Webhooks

```typescript
// Create webhook endpoint
const endpoint = await arcpay.webhooks.createEndpoint({
  url: 'https://api.example.com/webhooks/arcpay',
  enabledEvents: [
    'credits.deposited',
    'credits.low_balance',
    'dispute.created',
    'invoice.paid',
  ],
});

// Verify webhook signature
const event = arcpay.webhooks.constructEvent(
  rawBody,
  signature,
  endpoint.secret
);

// Use webhook handler
const handler = arcpay.webhooks.handler({
  'credits.deposited': async (event) => {
    console.log('Credits deposited:', event.data);
  },
  'dispute.created': async (event) => {
    console.log('Dispute created:', event.data);
  },
}, { secret: endpoint.secret });
```

## Express Middleware

```typescript
import express from 'express';
import { webhookMiddleware, usageMiddleware, authMiddleware } from '@arcpay/b2b/middleware/express';

const app = express();

// Webhook handling
app.post(
  '/webhooks/arcpay',
  express.raw({ type: 'application/json' }),
  webhookMiddleware({ secret: process.env.WEBHOOK_SECRET! }),
  (req, res) => {
    console.log('Received:', req.arcpayEvent.type);
    res.sendStatus(200);
  }
);

// Usage metering
app.use(
  '/api',
  usageMiddleware({
    client: arcpay,
    meter: 'api_call',
    accountIdFrom: (req) => req.headers['x-account-id'],
    skipIf: (req) => req.path === '/health',
  })
);

// Authentication with balance check
app.use(
  '/api',
  authMiddleware({
    client: arcpay,
    accountIdFrom: (req) => req.headers['x-account-id'],
    minimumBalance: 1,
  })
);
```

## Next.js Middleware

```typescript
// app/api/webhooks/arcpay/route.ts
import { createWebhookHandler } from '@arcpay/b2b/middleware/nextjs';

export const POST = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
  handlers: {
    'credits.deposited': async (event) => {
      console.log('Credits deposited:', event.data);
    },
  },
});

// app/api/protected/route.ts
import { withArcPay } from '@arcpay/b2b/middleware/nextjs';

export const POST = withArcPay({
  client: arcpay,
  minimumBalance: 1,
  meter: 'api_call',
})(async (request, { accountId, balance }) => {
  // accountId and balance are available
  return Response.json({ success: true });
});
```

## Testing

```typescript
import { MockArcPayB2BServer, createCreditAccount, createBalanceSnapshot, scenarios } from '@arcpay/b2b/testing';

const mock = new MockArcPayB2BServer();

// Configure mock behavior
mock.credits.getBalance.returns(
  createBalanceSnapshot({ available: { amount: '500.00', currency: 'USDC' } })
);

// Use pre-built scenarios
scenarios.insufficientCredits(mock, 5);

// Check recorded calls
const calls = mock.credits.getBalance.getCalls();
expect(calls).toHaveLength(1);
```

## Error Handling

```typescript
import {
  ArcPayB2BError,
  AuthenticationError,
  InsufficientCreditsError,
  NotFoundError,
} from '@arcpay/b2b';

try {
  await arcpay.credits.recordUsage(accountId, { meter: 'api_call' });
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    console.log(`Need ${error.required}, have ${error.available}`);
  } else if (error instanceof NotFoundError) {
    console.log(`${error.resourceType} not found: ${error.resourceId}`);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  }
}
```

## Fee Comparison

| Transaction | Stripe Fee | Arc Fee | Savings |
|-------------|------------|---------|---------|
| $1,000 | $29.30 | ~$2 | 93% |
| $10,000 | $290.30 | ~$5 | 98% |
| $100,000 | $2,900.30 | ~$15 | 99% |

## License

MIT
