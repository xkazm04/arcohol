# ArcPay SDK Test Guide

Comprehensive test scenarios for all ArcPay packages with Arc testnet integration.

---

## Table of Contents

1. [@arcpay/b2b](#arcpayb2b---b2b-payment-infrastructure)
2. [@arcpay/x402](#arcpayx402---api-monetization)
3. [@arcpay/agents](#arcpayagents---ai-agent-payments)
4. [@arcpay/crosschain](#arcpaycrosschain---cross-chain-treasury)
5. [@arcpay/react](#arcpayreact---embedded-finance-sdk)

---

## Test Environment Setup

### Prerequisites

```bash
# Install dependencies
cd arc
npm install

# Start test app
cd test
npm run dev
```

### Arc Testnet Configuration

```typescript
// .env.local
NEXT_PUBLIC_ARC_RPC_URL=https://testnet.arc.dev/rpc
NEXT_PUBLIC_ARC_CHAIN_ID=1234
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...
```

### Test Wallet Setup

1. Create test wallet in MetaMask
2. Add Arc testnet network
3. Request testnet USDC from faucet
4. Note wallet address for testing

---

## @arcpay/b2b - B2B Payment Infrastructure

### Package Location
`arcpay-b2b/`

### Test Page
`/sandbox/b2b`

---

### Module 1: Credits System

#### Test 1.1: Issue Credits to Customer

**Scenario:** Issue prepaid credits to a B2B customer account

**Steps:**
1. Navigate to `/sandbox/b2b/credits`
2. Click "Issue Credits"
3. Enter customer ID: `cust_test_001`
4. Enter amount: `1000 USDC`
5. Set expiry: 90 days
6. Click "Issue"

**Expected Results:**
- [ ] Credit issuance transaction submitted to Arc testnet
- [ ] Transaction hash displayed
- [ ] Credit balance updated in UI
- [ ] Credit entry appears in credit ledger

**Blockchain Verification:**
```bash
# Verify credit mint on Arc testnet
cast call $CREDIT_CONTRACT "balanceOf(address)" $CUSTOMER_ADDRESS --rpc-url $ARC_RPC
```

---

#### Test 1.2: Consume Credits for Payment

**Scenario:** Use credits to pay for a service

**Steps:**
1. Navigate to `/sandbox/b2b/credits`
2. Select customer with existing credits
3. Click "Make Payment"
4. Enter amount: `250 USDC`
5. Confirm credit deduction

**Expected Results:**
- [ ] Credit balance decreases by 250
- [ ] Payment recorded in transaction history
- [ ] Merchant receives notification
- [ ] Credit consumption logged with timestamp

---

#### Test 1.3: Credit Expiration Handling

**Scenario:** Test expired credit behavior

**Steps:**
1. Issue credits with 1-minute expiry (test mode)
2. Wait for expiration
3. Attempt to use expired credits

**Expected Results:**
- [ ] System rejects expired credits
- [ ] Clear error message displayed
- [ ] Expired credits marked as void
- [ ] Audit trail preserved

---

#### Test 1.4: Transfer Credits Between Customers

**Scenario:** Transfer credits from one customer to another

**Steps:**
1. Select source customer with credits
2. Click "Transfer"
3. Enter destination customer ID
4. Enter transfer amount
5. Confirm transfer

**Expected Results:**
- [ ] Source balance decreases
- [ ] Destination balance increases
- [ ] Transfer transaction recorded
- [ ] Both parties notified

---

### Module 2: Disputes System

#### Test 2.1: File a Dispute

**Scenario:** Customer files a dispute for a transaction

**Test Page:** `/sandbox/b2b/disputes`

**Steps:**
1. Navigate to disputes page
2. Click "File Dispute"
3. Select transaction from history
4. Enter dispute reason: "Service not delivered"
5. Upload evidence (optional)
6. Submit dispute

**Expected Results:**
- [ ] Dispute created with unique ID
- [ ] Status shows "pending"
- [ ] Payment amount escrowed
- [ ] All parties notified

---

#### Test 2.2: LLM-Powered Dispute Evaluation

**Scenario:** AI evaluates dispute evidence and recommends resolution

**Steps:**
1. Open an existing dispute
2. Click "Request AI Evaluation"
3. Wait for LLM analysis

**Expected Results:**
- [ ] AI analyzes dispute details
- [ ] Confidence score displayed (0-100%)
- [ ] Recommendation provided (approve/deny/escalate)
- [ ] Key factors listed
- [ ] Suggested resolution amount shown

**Sample AI Response:**
```json
{
  "recommendation": "partial_refund",
  "confidence": 85,
  "suggestedAmount": "150.00",
  "reasoning": "Evidence supports partial service delivery..."
}
```

---

#### Test 2.3: Resolve Dispute

**Scenario:** Resolve dispute based on AI recommendation

**Steps:**
1. Review AI recommendation
2. Click "Accept Recommendation" or "Override"
3. If override, enter custom resolution
4. Confirm resolution

**Expected Results:**
- [ ] Escrowed funds released appropriately
- [ ] Dispute status updated to "resolved"
- [ ] Resolution recorded on-chain
- [ ] Parties notified of outcome

---

### Module 3: Payment Gateway

#### Test 3.1: Create Payment Intent

**Scenario:** Create a payment intent for checkout

**Steps:**
1. Navigate to `/sandbox/b2b/gateway`
2. Click "Create Payment"
3. Enter amount: `500 USDC`
4. Set metadata: `{ "orderId": "ORD-001" }`
5. Create intent

**Expected Results:**
- [ ] Payment intent created
- [ ] Unique payment ID generated
- [ ] QR code displayed
- [ ] Expiration timer shown (15 minutes)

---

#### Test 3.2: Complete Payment via Wallet

**Scenario:** Complete payment using connected wallet

**Steps:**
1. Create payment intent (Test 3.1)
2. Connect wallet (MetaMask)
3. Click "Pay with Wallet"
4. Approve USDC transaction
5. Confirm transaction

**Expected Results:**
- [ ] USDC transferred to merchant
- [ ] Transaction confirmed on Arc testnet
- [ ] Payment status: "confirmed"
- [ ] Webhook triggered (if configured)
- [ ] Receipt generated

**Blockchain Verification:**
```bash
# Verify USDC transfer
cast call $USDC_ADDRESS "balanceOf(address)" $MERCHANT_ADDRESS --rpc-url $ARC_RPC
```

---

#### Test 3.3: Payment Expiration

**Scenario:** Test payment intent expiration

**Steps:**
1. Create payment intent with 1-minute expiry
2. Wait for expiration without paying
3. Attempt to complete expired payment

**Expected Results:**
- [ ] Payment marked as "expired"
- [ ] Cannot complete payment
- [ ] Clear expiration message

---

### Module 4: Treasury Management

#### Test 4.1: View Treasury Overview

**Test Page:** `/sandbox/b2b/treasury`

**Steps:**
1. Navigate to treasury page
2. View dashboard

**Expected Results:**
- [ ] Total balance displayed
- [ ] Operating funds shown
- [ ] Reserve funds shown
- [ ] Yield-bearing (USDY) balance shown
- [ ] Current APY displayed

---

#### Test 4.2: Allocate Funds to Yield

**Scenario:** Move funds from operating to USDY reserve

**Steps:**
1. Click "Transfer to Reserve"
2. Enter amount: `5000 USDC`
3. Confirm transfer

**Expected Results:**
- [ ] USDC swapped to USDY on-chain
- [ ] Operating balance decreases
- [ ] Reserve balance increases
- [ ] Swap transaction visible in explorer

---

#### Test 4.3: Withdraw from Reserve

**Scenario:** Move funds from USDY reserve to operating

**Steps:**
1. Click "Withdraw from Reserve"
2. Enter amount: `2000 USDY`
3. Confirm withdrawal

**Expected Results:**
- [ ] USDY redeemed to USDC
- [ ] Operating balance increases
- [ ] Reserve balance decreases
- [ ] Redemption may have delay (T+1)

---

#### Test 4.4: View Yield Accrual

**Scenario:** Verify yield is accruing on reserve

**Steps:**
1. Note current USDY balance
2. Wait 24 hours (or use time-travel in test mode)
3. Check updated balance

**Expected Results:**
- [ ] USDY balance increased
- [ ] Yield rate matches displayed APY
- [ ] Yield history graph updated

---

## @arcpay/x402 - API Monetization

### Package Location
`arcpay-x402/`

---

### Test 5.1: Protected API Endpoint (Server)

**Scenario:** Set up API endpoint with x402 payment requirement

**Test File:** Create test API route

```typescript
// test/src/app/api/x402-test/route.ts
import { withX402 } from '@arcpay/x402/middleware/nextjs';

export const GET = withX402({
  amount: '0.01',
  currency: 'USDC',
  recipient: process.env.MERCHANT_ADDRESS!,
  facilitator: process.env.FACILITATOR_URL!,
})(async (request) => {
  return Response.json({
    message: 'Premium content accessed!',
    timestamp: new Date().toISOString()
  });
});
```

**Steps:**
1. Deploy API endpoint
2. Call endpoint without payment header
3. Verify 402 response

**Expected Results:**
- [ ] Returns HTTP 402 Payment Required
- [ ] Response includes `X-Payment-Required` header
- [ ] Payment requirement JSON in body:
```json
{
  "version": "1.0",
  "paymentId": "pay_xxx",
  "amount": "0.01",
  "currency": "USDC",
  "recipient": "0x...",
  "chains": ["base", "ethereum"],
  "expiresAt": "2025-01-11T12:00:00Z"
}
```

---

### Test 5.2: Complete x402 Payment (Client)

**Scenario:** Use x402 client to pay for API access

**Steps:**
1. Create x402 client with wallet
2. Make request to protected endpoint
3. Client auto-handles 402 response
4. Payment executed
5. Request completed

```typescript
import { X402Client } from '@arcpay/x402/client';

const client = new X402Client({
  wallet: viemWallet,
  budgetLimit: 1.0, // Max $1 per session
});

const response = await client.fetch('/api/x402-test');
const data = await response.json();
```

**Expected Results:**
- [ ] 402 response detected automatically
- [ ] Payment transaction submitted
- [ ] Request retried with payment proof
- [ ] API returns 200 with content
- [ ] Budget tracking updated

---

### Test 5.3: Budget Limit Enforcement

**Scenario:** Verify budget limits prevent overspending

**Steps:**
1. Set budget limit: `0.05 USDC`
2. Make requests until budget exhausted
3. Verify next request fails

**Expected Results:**
- [ ] First 5 requests succeed (0.01 each)
- [ ] 6th request fails with budget error
- [ ] Error message: "Budget limit exceeded"
- [ ] No payment attempted beyond limit

---

### Test 5.4: React Hook Integration

**Scenario:** Use useFetchWithPayment hook in React

**Steps:**
1. Implement component with hook
2. Trigger fetch to protected endpoint
3. Observe payment flow

```tsx
import { useFetchWithPayment } from '@arcpay/x402/react';

function PremiumContent() {
  const { fetch, pendingPayment, approve, budget } = useFetchWithPayment({
    wallet: connectedWallet,
    budgetLimit: 5.0,
    onPaymentRequired: (req) => console.log('Payment needed:', req),
  });

  const loadContent = async () => {
    const response = await fetch('/api/premium');
    // Handle response
  };
}
```

**Expected Results:**
- [ ] Payment modal/prompt shown on 402
- [ ] User can approve/reject payment
- [ ] Approved payment executes
- [ ] Content loads after payment
- [ ] Rejected payment cancels request

---

## @arcpay/agents - AI Agent Payments

### Package Location
`arcpay-agents/`

---

### Test 6.1: Create Agent Wallet

**Scenario:** Create autonomous wallet for AI agent

**Steps:**
1. Initialize AgentWalletManager
2. Generate new agent wallet
3. Fund wallet with testnet USDC

```typescript
import { AgentWalletManager } from '@arcpay/agents';

const manager = await AgentWalletManager.create({
  chain: 'arc-testnet',
  owner: ownerAddress,
  budget: {
    daily: 100,
    perTransaction: 10,
    maxTransactionsPerHour: 20,
  },
});

console.log('Agent address:', manager.getAddress());
```

**Expected Results:**
- [ ] Agent wallet created on Arc testnet
- [ ] Wallet address generated
- [ ] Budget controller initialized
- [ ] Owner permissions set

---

### Test 6.2: Budget-Controlled Payment

**Scenario:** Agent makes payment within budget

**Steps:**
1. Agent requests payment: `5 USDC`
2. Budget controller validates
3. Payment executes
4. Budget tracking updated

```typescript
const payment = await manager.pay({
  to: vendorAddress,
  amount: '5.00',
  currency: 'USDC',
  reason: 'API call to OpenAI',
  vendor: 'openai',
});
```

**Expected Results:**
- [ ] Payment approved by budget controller
- [ ] Transaction submitted to Arc testnet
- [ ] Daily usage increased by $5
- [ ] Transaction logged with reason
- [ ] Vendor-specific tracking updated

---

### Test 6.3: Budget Limit Rejection

**Scenario:** Agent attempts payment exceeding limits

**Steps:**
1. Set per-transaction limit: `10 USDC`
2. Agent requests: `15 USDC`
3. Verify rejection

**Expected Results:**
- [ ] Budget controller rejects payment
- [ ] Error: "Exceeds per-transaction limit"
- [ ] No transaction submitted
- [ ] Rejection logged for audit

---

### Test 6.4: Human-in-the-Loop Approval

**Scenario:** High-value payment requires human approval

**Steps:**
1. Configure approval threshold: `50 USDC`
2. Agent requests: `75 USDC`
3. System pauses for approval
4. Human approves via dashboard
5. Payment executes

```typescript
const manager = await AgentWalletManager.create({
  // ...
  approvals: {
    thresholdUSD: 50,
    approvers: [humanWalletAddress],
  },
});

const payment = await manager.pay({
  to: vendor,
  amount: '75.00',
  currency: 'USDC',
  reason: 'Large compute purchase',
});

// Returns pending status
console.log(payment.status); // 'pending_approval'
console.log(payment.approvalId); // 'apr_xxx'
```

**Expected Results:**
- [ ] Payment enters pending state
- [ ] Approval notification sent
- [ ] Human receives approval request
- [ ] After approval, payment executes
- [ ] Approval logged with approver identity

---

### Test 6.5: Vendor-Specific Limits

**Scenario:** Apply different limits per vendor

**Steps:**
1. Configure vendor limits:
   - OpenAI: $50/day
   - AWS: $200/day
2. Test payments to each vendor
3. Verify limits enforced independently

```typescript
const manager = await AgentWalletManager.create({
  budget: {
    daily: 500,
    vendors: {
      'openai': { daily: 50, perTransaction: 5 },
      'aws': { daily: 200, perTransaction: 50 },
    },
  },
});
```

**Expected Results:**
- [ ] OpenAI payments limited to $50/day
- [ ] AWS payments limited to $200/day
- [ ] Global daily limit still applies
- [ ] Each vendor tracked separately

---

### Test 6.6: Agent Earnings (Receipts)

**Scenario:** Agent receives payment for services

**Steps:**
1. External party pays agent wallet
2. Agent processes receipt
3. Earnings tracked

```typescript
const receipt = await manager.processReceipt({
  from: clientAddress,
  amount: '25.00',
  currency: 'USDC',
  txHash: '0x...',
  service: 'data-analysis',
});

const earnings = manager.getEarnings('today');
console.log(earnings); // { total: '25.00', byService: {...} }
```

**Expected Results:**
- [ ] Receipt processed and logged
- [ ] Earnings tracked by service type
- [ ] Balance reflects incoming payment
- [ ] Receipt available for reporting

---

### Test 6.7: Anomaly Detection

**Scenario:** Detect unusual spending patterns

**Steps:**
1. Establish normal spending pattern
2. Trigger anomalous transaction
3. Verify detection and alert

```typescript
// Normal: 5-10 small payments per day
// Anomaly: 50 rapid payments in 1 minute

// System should flag anomaly
```

**Expected Results:**
- [ ] Anomaly detected within 1 minute
- [ ] Alert sent to owner
- [ ] Option to pause agent wallet
- [ ] Anomaly logged with details

---

## @arcpay/crosschain - Cross-Chain Treasury

### Package Location
`arcpay-crosschain/`

---

### Test 7.1: Initialize Multi-Chain Treasury

**Scenario:** Set up treasury across multiple chains

**Steps:**
1. Initialize MultiChainTreasury
2. Configure chains and wallets
3. Fetch initial balances

```typescript
import { MultiChainTreasury } from '@arcpay/crosschain';

const treasury = new MultiChainTreasury({
  organizationId: 'org_test_001',
  chains: {
    base: { walletAddress: '0x...', rpcUrl: '...' },
    ethereum: { walletAddress: '0x...', rpcUrl: '...' },
    arbitrum: { walletAddress: '0x...', rpcUrl: '...' },
  },
  routing: {
    strategy: 'optimize_cost',
    preferredChain: 'base',
  },
});

await treasury.refreshBalances();
```

**Expected Results:**
- [ ] Treasury initialized for 3 chains
- [ ] Balances fetched for each chain
- [ ] Total balance calculated
- [ ] Chain allocation displayed

---

### Test 7.2: Get Treasury Overview

**Scenario:** View consolidated treasury status

**Steps:**
1. Call `getOverview()`
2. Verify data structure

```typescript
const overview = await treasury.getOverview();
console.log(overview);
```

**Expected Results:**
```json
{
  "totalBalance": { "amount": "50000.00", "currency": "USDC" },
  "chainBalances": {
    "base": { "amount": "20000.00", "percentage": 40 },
    "ethereum": { "amount": "25000.00", "percentage": 50 },
    "arbitrum": { "amount": "5000.00", "percentage": 10 }
  },
  "lastUpdated": "2025-01-11T10:00:00Z"
}
```

---

### Test 7.3: Cross-Chain Payment Routing

**Scenario:** Pay recipient on different chain, auto-route from cheapest source

**Steps:**
1. Recipient on Ethereum
2. Cheapest source is Base
3. Request payment routing
4. Verify bridge quote

```typescript
const route = await treasury.getBestRoute({
  amount: 1000,
  recipientChain: 'ethereum',
  recipient: '0x...',
});

console.log(route);
```

**Expected Results:**
- [ ] Route selected from Base (cheapest)
- [ ] Bridge fee estimated
- [ ] Total cost calculated
- [ ] Estimated time shown (15-30 seconds for CCTP)

```json
{
  "sourceChain": "base",
  "destinationChain": "ethereum",
  "requiresBridge": true,
  "bridgeProtocol": "CCTP",
  "estimatedFee": { "amount": "0.50", "currency": "USDC" },
  "estimatedTime": 20,
  "steps": [
    { "type": "bridge", "chain": "base", "action": "Bridge via CCTP" },
    { "type": "transfer", "chain": "ethereum", "action": "Transfer to recipient" }
  ]
}
```

---

### Test 7.4: Execute Cross-Chain Payment

**Scenario:** Execute routed payment with bridge

**Steps:**
1. Get route (Test 7.3)
2. Execute payment
3. Monitor bridge status
4. Verify completion

```typescript
const payment = await treasury.pay({
  amount: 1000,
  recipientChain: 'ethereum',
  recipient: '0x...',
});

console.log(payment.id, payment.status);

// Monitor status
const status = await treasury.getPaymentStatus(payment.id);
```

**Expected Results:**
- [ ] Bridge initiated on Base
- [ ] CCTP attestation received
- [ ] Funds minted on Ethereum
- [ ] Transfer to recipient completed
- [ ] Total time < 60 seconds

**Status Progression:**
1. `initiated` - Bridge transaction submitted
2. `bridging` - Waiting for attestation
3. `completing` - Executing on destination
4. `confirmed` - Payment complete

---

### Test 7.5: Same-Chain Payment

**Scenario:** Payment to recipient on same chain (no bridge needed)

**Steps:**
1. Request payment to Base recipient
2. Treasury has Base balance
3. Direct transfer

```typescript
const route = await treasury.getBestRoute({
  amount: 500,
  recipientChain: 'base',
  recipient: '0x...',
});

// Should select direct transfer
console.log(route.requiresBridge); // false
```

**Expected Results:**
- [ ] No bridge needed
- [ ] Lower fees (just gas)
- [ ] Faster completion (~5 seconds)
- [ ] Single transaction

---

### Test 7.6: Auto-Rebalancing

**Scenario:** Automatically rebalance treasury across chains

**Steps:**
1. Configure target allocation
2. Trigger imbalance
3. Generate rebalance plan
4. Execute rebalancing

```typescript
const treasury = new MultiChainTreasury({
  // ...
  rebalancing: {
    enabled: true,
    targetAllocation: {
      base: 50,      // 50%
      ethereum: 30,  // 30%
      arbitrum: 20,  // 20%
    },
    thresholdPercent: 10, // Rebalance if >10% off target
    minRebalanceAmount: 1000,
  },
});

// Check if rebalancing needed
const plan = await treasury.createRebalancePlan();
if (plan) {
  console.log('Rebalance moves:', plan.moves);
  await treasury.executeRebalance(plan);
}
```

**Expected Results:**
- [ ] Imbalance detected
- [ ] Optimal moves calculated
- [ ] Bridge transactions executed
- [ ] Allocation within target range
- [ ] Rebalance logged

---

### Test 7.7: Low Balance Alerts

**Scenario:** Alert when chain balance falls below threshold

**Steps:**
1. Configure alert threshold: `1000 USDC`
2. Trigger low balance condition
3. Verify alert fired

```typescript
const treasury = new MultiChainTreasury({
  // ...
  alerts: {
    lowBalanceThreshold: 1000,
    criticalBalanceThreshold: 100,
  },
  callbacks: {
    onLowBalance: (chain, balance) => {
      console.log(`Low balance on ${chain}: ${balance}`);
      // Send notification
    },
  },
});
```

**Expected Results:**
- [ ] Alert triggered when balance < 1000
- [ ] Critical alert at < 100
- [ ] Callback executed
- [ ] Alert logged

---

## @arcpay/react - Embedded Finance SDK

### Package Location
`arcpay-react/`

---

### Test 8.1: Theme Configuration

**Scenario:** Apply custom theme to components

**Steps:**
1. Wrap app with ArcPayProvider
2. Apply custom theme
3. Verify styling

```tsx
import { ArcPayProvider, createBrandTheme } from '@arcpay/react';

<ArcPayProvider
  publicKey="pk_test_xxx"
  theme={createBrandTheme('#6366f1')}
  preset="light"
>
  <App />
</ArcPayProvider>
```

**Expected Results:**
- [ ] Primary color applied to buttons
- [ ] Focus states use brand color
- [ ] All components styled consistently
- [ ] CSS variables set correctly

---

### Test 8.2: Checkout Component

**Scenario:** Complete checkout flow with UI component

**Test Page:** Create `/sandbox/react-checkout`

**Steps:**
1. Render Checkout component
2. Add items to cart
3. Select chain
4. Complete payment

```tsx
import { Checkout } from '@arcpay/react';

<Checkout
  items={[
    { name: 'Pro Plan', price: 99, quantity: 1 },
    { name: 'Extra Seats', price: 25, quantity: 3 },
  ]}
  recipient="0x..."
  currency="USDC"
  chains={['base', 'ethereum', 'arbitrum']}
  branding={{
    logo: '/logo.svg',
    companyName: 'Acme Inc',
  }}
  onSuccess={(payment) => {
    console.log('Payment confirmed:', payment);
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
  testMode={true}
/>
```

**Expected Results:**
- [ ] Cart summary displays items
- [ ] Subtotal calculated correctly: $174
- [ ] Chain selector shows 3 options
- [ ] Fee estimate updates per chain
- [ ] Pay button shows total
- [ ] Success state after payment
- [ ] onSuccess callback fired

---

### Test 8.3: Invoice Component

**Scenario:** Display and pay B2B invoice

**Steps:**
1. Render Invoice component
2. View invoice details
3. Download PDF
4. Pay invoice

```tsx
import { Invoice } from '@arcpay/react';

<Invoice
  invoice={{
    reference: 'INV-2025-001',
    customer: {
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      address: '123 Business Ave\nNew York, NY 10001',
    },
    items: [
      { description: 'Consulting - January 2025', amount: 5000 },
      { description: 'Travel Expenses', amount: 450 },
    ],
    currency: 'USDC',
    issuedDate: '2025-01-01',
    dueDate: '2025-01-31',
    notes: 'Thank you for your business!',
  }}
  branding={{
    logo: '/vendor-logo.svg',
    companyName: 'Vendor Inc',
    companyAddress: '456 Vendor Street',
  }}
  recipient="0x..."
  showPdfDownload
  showQRCode
  onPaid={(payment) => console.log('Invoice paid:', payment)}
  testMode
/>
```

**Expected Results:**
- [ ] Invoice header shows company branding
- [ ] Customer "Bill To" section populated
- [ ] Line items table rendered
- [ ] Totals calculated: $5,450
- [ ] QR code displayed
- [ ] PDF download works
- [ ] Pay button opens checkout
- [ ] Paid status after payment

---

### Test 8.4: Subscription Manager

**Scenario:** Manage subscription plans

**Steps:**
1. Render SubscriptionManager
2. View current plan
3. Switch billing cycle
4. Upgrade plan
5. View usage

```tsx
import { SubscriptionManager } from '@arcpay/react';

<SubscriptionManager
  customerId="cust_001"
  plans={[
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'monthly',
      features: ['5 users', '10GB storage', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      interval: 'monthly',
      features: ['Unlimited users', '100GB storage', 'Priority support'],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      interval: 'monthly',
      features: ['Everything in Pro', 'SLA', 'Dedicated support'],
    },
  ]}
  currentPlan="starter"
  subscription={{
    id: 'sub_001',
    planId: 'starter',
    status: 'active',
    currentPeriodStart: '2025-01-01',
    currentPeriodEnd: '2025-02-01',
  }}
  usage={[
    { metric: 'Users', used: 3, limit: 5 },
    { metric: 'Storage', used: 7.5, limit: 10, resetDate: '2025-02-01' },
  ]}
  showAnnualDiscount
  annualDiscountPercent={20}
  onUpgrade={async (planId) => {
    console.log('Upgrading to:', planId);
  }}
/>
```

**Expected Results:**
- [ ] Current plan card highlighted
- [ ] Plan comparison grid displays
- [ ] Monthly/yearly toggle works
- [ ] Annual prices show 20% discount
- [ ] "Popular" badge on Pro plan
- [ ] Usage meters show progress
- [ ] Upgrade button triggers callback
- [ ] Billing history section (if provided)

---

### Test 8.5: Headless useCheckout Hook

**Scenario:** Build custom checkout UI with hook

**Steps:**
1. Use useCheckout hook
2. Build custom UI
3. Test payment flow

```tsx
import { useCheckout } from '@arcpay/react';

function CustomCheckout() {
  const {
    items,
    addItem,
    removeItem,
    subtotal,
    estimatedFee,
    total,
    selectedChain,
    setChain,
    supportedChains,
    initiatePayment,
    isProcessing,
    status,
    payment,
    error,
  } = useCheckout({
    recipient: '0x...',
    currency: 'USDC',
    onSuccess: (p) => console.log('Paid!', p),
  });

  // Custom UI implementation
  return (
    <div className="my-custom-checkout">
      {/* Custom cart UI */}
      {/* Custom chain selector */}
      {/* Custom pay button */}
    </div>
  );
}
```

**Expected Results:**
- [ ] Hook provides all necessary state
- [ ] addItem/removeItem work correctly
- [ ] Totals update reactively
- [ ] Chain selection updates fees
- [ ] initiatePayment executes payment
- [ ] Status transitions correctly
- [ ] Custom UI fully functional

---

### Test 8.6: Balance Component

**Scenario:** Display multi-chain balance

**Steps:**
1. Render Balance component
2. Connect wallet (mock)
3. View balances

```tsx
import { Balance } from '@arcpay/react';

<Balance
  address="0x..."
  chains={['base', 'ethereum', 'arbitrum', 'polygon']}
  showTotal
  showBreakdown
  autoRefresh
  refreshInterval={30000}
/>
```

**Expected Results:**
- [ ] Total balance displayed prominently
- [ ] Per-chain breakdown shown
- [ ] Chain icons render correctly
- [ ] Auto-refresh updates balances
- [ ] Refresh button works
- [ ] Loading state shown during fetch

---

### Test 8.7: Transaction History Component

**Scenario:** View and filter transaction history

**Steps:**
1. Render TransactionHistory
2. View transactions
3. Apply filters
4. Load more

```tsx
import { TransactionHistory } from '@arcpay/react';

<TransactionHistory
  address="0x..."
  chains={['base', 'ethereum', 'arbitrum']}
  limit={10}
  showFilters
  showLoadMore
/>
```

**Expected Results:**
- [ ] Transactions listed with details
- [ ] Type icons (send/receive/bridge/swap)
- [ ] Status badges (confirmed/pending/failed)
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Filter by chain works
- [ ] Load more fetches next page
- [ ] Transaction links to explorer

---

### Test 8.8: Dark Theme

**Scenario:** Test dark mode styling

**Steps:**
1. Switch to dark preset
2. Verify all components

```tsx
<ArcPayProvider publicKey="pk_xxx" preset="dark">
  <App />
</ArcPayProvider>
```

**Expected Results:**
- [ ] Dark background applied
- [ ] Text colors inverted
- [ ] Borders use dark palette
- [ ] All components readable
- [ ] Focus states visible
- [ ] Success/error colors adjusted

---

## Integration Test Checklist

### End-to-End Flow: E-commerce Checkout

1. [ ] User browses products
2. [ ] Adds items to cart
3. [ ] Proceeds to checkout
4. [ ] Selects payment chain
5. [ ] Connects wallet
6. [ ] Approves USDC transfer
7. [ ] Transaction confirmed on Arc testnet
8. [ ] Order confirmed in system
9. [ ] Receipt generated
10. [ ] Webhook received by backend

### End-to-End Flow: B2B Invoice Payment

1. [ ] Vendor creates invoice
2. [ ] Customer receives invoice email
3. [ ] Customer views invoice page
4. [ ] Customer clicks "Pay Now"
5. [ ] Checkout modal opens
6. [ ] Payment completed
7. [ ] Invoice marked as paid
8. [ ] Both parties notified

### End-to-End Flow: SaaS Subscription

1. [ ] User visits pricing page
2. [ ] Selects plan
3. [ ] Enters payment details
4. [ ] Initial payment processed
5. [ ] Subscription created
6. [ ] Usage tracking begins
7. [ ] Monthly billing cycle runs
8. [ ] User can upgrade/downgrade

### End-to-End Flow: AI Agent Economy

1. [ ] AI agent wallet created
2. [ ] Owner funds wallet
3. [ ] Agent makes API calls (x402)
4. [ ] Payments auto-processed
5. [ ] Budget tracked
6. [ ] Agent earns from services
7. [ ] Owner reviews spending report

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Insufficient balance" | Wallet lacks USDC | Fund wallet from faucet |
| "Transaction failed" | Gas too low | Increase gas limit |
| "Network error" | Wrong RPC | Verify Arc testnet URL |
| "Invalid signature" | Wallet mismatch | Reconnect wallet |
| "Budget exceeded" | Limit reached | Reset or increase budget |

### Debug Mode

Enable debug logging:

```typescript
// In test environment
process.env.ARCPAY_DEBUG = 'true';
```

---

## Test Data

### Sample Addresses

```
Owner Wallet: 0x1234...abcd
Merchant Wallet: 0x5678...efgh
Customer Wallet: 0x9abc...ijkl
Agent Wallet: 0xdef0...mnop
```

### Sample USDC Contract

```
Arc Testnet USDC: 0x...
```

### Sample API Keys

```
Test Public Key: pk_test_xxx
Test Secret Key: sk_test_xxx
```

---

## Reporting Test Results

After completing tests, document results:

1. **Pass/Fail Status** - Check each box
2. **Blockchain Transactions** - Record tx hashes
3. **Screenshots** - Capture UI states
4. **Performance** - Note response times
5. **Issues Found** - Log bugs with reproduction steps

Submit test report to: `tests@arcpay.dev`
