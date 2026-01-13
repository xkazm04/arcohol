# Invoice Module - Implementation Roadmap (Phase 2-4)

This document outlines the remaining implementation phases for the Invoice Module, building on the Phase 1 foundation completed in January 2025.

## Architecture Decision

We chose **Option A: Centralized** approach:
- Subscription logic stored in PostgreSQL
- Payments via direct ERC-20 `transferFrom` calls (customer approves org wallet)
- All business logic in Node.js/Next.js
- No custom smart contract required for MVP

This can be enhanced later with on-chain transparency (Hybrid approach) if needed.

---

## Phase 2: Billing Engine

### Overview
A background scheduler that automatically collects payments for active subscriptions when billing periods end.

### Components

#### 2.1 Scheduler Service
```
Location: test/src/workers/billing-engine.ts (or Vercel Cron)
```

**Flow:**
1. Run every hour (or configurable interval)
2. Query subscriptions where `next_payment_at <= NOW()` and `status = 'active'`
3. For each subscription:
   - Check customer's USDC allowance on-chain
   - If sufficient: execute `transferFrom(customer, merchant, amount)`
   - Create subscription_invoice record
   - Update subscription (next_payment_at, last_payment_at, total_paid)
   - Dispatch webhook event
4. Handle failures with retry logic and dunning

**Key Considerations:**
- Use ethers.js v6 for blockchain interactions
- Support multiple chains (Base, Ethereum, Polygon)
- Implement idempotency to prevent double-charging
- Queue-based processing for high volume (Bull/BullMQ)

#### 2.2 Allowance Checker
```typescript
// Pseudo-code for checking ERC-20 allowance
async function checkAllowance(customerWallet: string, merchantWallet: string, chain: string): Promise<bigint> {
  const provider = getProvider(chain);
  const usdcContract = new Contract(USDC_ADDRESS[chain], ERC20_ABI, provider);
  return await usdcContract.allowance(customerWallet, merchantWallet);
}
```

#### 2.3 Payment Executor
```typescript
// Pseudo-code for executing payment
async function collectPayment(
  customerWallet: string,
  merchantWallet: string,
  amount: bigint,
  chain: string
): Promise<{ txHash: string }> {
  const signer = getOrgSigner(chain); // Org's backend wallet with signing capability
  const usdcContract = new Contract(USDC_ADDRESS[chain], ERC20_ABI, signer);

  const tx = await usdcContract.transferFrom(customerWallet, merchantWallet, amount);
  const receipt = await tx.wait();

  return { txHash: receipt.hash };
}
```

**Note:** The org needs a funded wallet for gas. Consider:
- Gas sponsorship via Paymaster (Account Abstraction)
- Pre-funded gas pool per chain
- Pass gas cost to customer (add to invoice)

#### 2.4 Retry & Dunning Logic

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | Immediate | First charge attempt |
| 2 | 3 days | Retry + "Payment failed" email |
| 3 | 7 days | Retry + "Action required" email |
| 4 | 14 days | Mark as `unpaid`, pause service |

Store in `subscriptions.failed_payment_count` and `subscriptions.last_failed_reason`.

#### 2.5 Database Updates Needed
```sql
-- Add to subscriptions table
ALTER TABLE subscriptions ADD COLUMN retry_count INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN next_retry_at TIMESTAMPTZ;
```

---

## Phase 3: Invoice Generation & Delivery

### 3.1 PDF Generation

**Recommended Library:** `@react-pdf/renderer` (works server-side in Next.js)

```
Location: test/src/services/invoice-pdf.ts
```

**Template Structure:**
```
┌─────────────────────────────────────────┐
│ [Organization Logo]     INVOICE         │
│                         INV-2024-0001   │
├─────────────────────────────────────────┤
│ Bill To:               From:            │
│ Customer Name          Org Name         │
│ customer@email.com     org@email.com    │
│ 0x1234...5678          0xabcd...efgh    │
├─────────────────────────────────────────┤
│ Description          Qty    Unit   Total│
│ Pro Plan - Jan       1      $99    $99  │
│ API Overage          5000   $0.001 $5   │
├─────────────────────────────────────────┤
│                      Subtotal:    $104  │
│                      Tax (0%):    $0    │
│                      Total:       $104  │
├─────────────────────────────────────────┤
│ Payment: USDC on Base                   │
│ Due Date: February 15, 2024             │
│                                         │
│ [QR Code for payment URL]               │
└─────────────────────────────────────────┘
```

**API Route:**
```
GET /api/invoices/[id]/pdf - Returns PDF buffer
```

### 3.2 Email Service Integration

**Recommended Provider:** Resend (developer-friendly, good Next.js support)

```
Location: test/src/services/email.ts
```

**Email Templates Needed:**

| Template | Trigger | Content |
|----------|---------|---------|
| `invoice_sent` | Invoice created/sent | Invoice PDF attached, payment link |
| `invoice_reminder` | 3 days before due | Friendly reminder |
| `invoice_overdue` | Past due date | Urgent action needed |
| `payment_received` | Payment confirmed | Receipt with tx hash |
| `payment_failed` | Charge failed | Update payment method |
| `subscription_welcome` | New subscription | Welcome + what to expect |
| `subscription_renewed` | Successful renewal | Receipt for period |
| `subscription_canceled` | Cancellation | Confirmation + feedback request |
| `trial_ending` | 3 days before trial ends | Convert to paid |

**Implementation:**
```typescript
// test/src/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(invoice: Invoice, pdfBuffer: Buffer) {
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: invoice.buyer.email,
    subject: `Invoice ${invoice.reference} from ${orgName}`,
    html: renderInvoiceEmailTemplate(invoice),
    attachments: [{
      filename: `${invoice.reference}.pdf`,
      content: pdfBuffer,
    }],
  });
}
```

### 3.3 Magic Link Generation

For buyer portal access without passwords:

```typescript
// test/src/services/magic-link.ts
import jwt from 'jsonwebtoken';

export function generateMagicLink(orgSlug: string, invoiceId: string, email: string): string {
  const token = jwt.sign(
    { orgSlug, invoiceId, email, type: 'invoice_access' },
    process.env.MAGIC_LINK_SECRET!,
    { expiresIn: '7d' }
  );

  return `${process.env.NEXT_PUBLIC_APP_URL}/portal/${orgSlug}/invoices/${invoiceId}?token=${token}`;
}

export function verifyMagicLink(token: string): { orgSlug: string; invoiceId: string; email: string } {
  return jwt.verify(token, process.env.MAGIC_LINK_SECRET!) as any;
}
```

---

## Phase 4: Self-Service Buyer Portal

### 4.1 Portal Structure

```
test/src/app/portal/[orgSlug]/
├── layout.tsx              - Portal layout with org branding
├── page.tsx                - Redirect to invoices
├── auth/
│   └── route.ts            - Magic link verification API
├── invoices/
│   ├── page.tsx            - Invoice list for buyer
│   └── [id]/
│       ├── page.tsx        - Invoice detail + payment
│       └── pdf/route.ts    - PDF download
└── subscriptions/
    ├── page.tsx            - Active subscriptions
    └── [id]/
        └── page.tsx        - Subscription detail + actions
```

### 4.2 Authentication Flow

```
1. Buyer receives email with magic link
2. Link: /portal/acme/invoices/inv_123?token=eyJhbGc...
3. Portal verifies token via /api/portal/auth
4. Session cookie set (7-day expiry)
5. Buyer can view invoices, pay, manage subscriptions
```

**Session Storage Options:**
- HTTP-only cookie with JWT
- Supabase Auth (if buyer accounts are needed)
- Simple token in localStorage (less secure)

### 4.3 Wallet Connection

**Recommended:** RainbowKit + wagmi

```tsx
// Portal wallet connection
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export function PaymentSection({ invoice }) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, token: USDC_ADDRESS });

  // Check if buyer has enough USDC
  const hasEnoughBalance = balance?.value >= BigInt(invoice.amount * 1e6);

  return (
    <div>
      {!isConnected ? (
        <ConnectButton />
      ) : !hasEnoughBalance ? (
        <p>Insufficient USDC balance</p>
      ) : (
        <PayButton invoice={invoice} />
      )}
    </div>
  );
}
```

### 4.4 Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER PAYMENT FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Connect Wallet (RainbowKit)                             │
│         ↓                                                    │
│  2. Check USDC Balance                                       │
│         ↓                                                    │
│  3. Check Existing Allowance                                 │
│         ↓                                                    │
│  4. If allowance < invoice.amount:                          │
│     → Prompt approve() transaction                          │
│     → Wait for confirmation                                 │
│         ↓                                                    │
│  5. Execute Payment:                                         │
│     Option A: Direct transfer to merchant wallet            │
│     Option B: Call backend API to record + transfer         │
│         ↓                                                    │
│  6. Wait for tx confirmation                                │
│         ↓                                                    │
│  7. Backend updates invoice status via webhook/polling      │
│         ↓                                                    │
│  8. Show receipt with tx hash                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Direct Transfer Approach (Simpler):**
```tsx
async function payInvoice(invoice: Invoice) {
  const usdcContract = getContract({ address: USDC_ADDRESS, abi: ERC20_ABI });

  // 1. Check/request approval
  const allowance = await usdcContract.read.allowance([buyerAddress, merchantWallet]);
  if (allowance < invoiceAmount) {
    const approveTx = await usdcContract.write.approve([merchantWallet, MAX_UINT256]);
    await waitForTransaction({ hash: approveTx });
  }

  // 2. Transfer payment
  const transferTx = await usdcContract.write.transfer([merchantWallet, invoiceAmount]);
  const receipt = await waitForTransaction({ hash: transferTx });

  // 3. Notify backend
  await fetch(`/api/portal/invoices/${invoice.id}/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({ txHash: receipt.transactionHash }),
  });
}
```

### 4.5 Portal API Routes

```
POST /api/portal/auth              - Verify magic link, create session
GET  /api/portal/invoices          - List buyer's invoices
GET  /api/portal/invoices/[id]     - Get invoice detail
POST /api/portal/invoices/[id]/confirm-payment - Record payment tx
GET  /api/portal/subscriptions     - List buyer's subscriptions
POST /api/portal/subscriptions/[id]/cancel - Request cancellation
```

### 4.6 Subscription Management in Portal

Buyers should be able to:
- View active subscriptions
- See upcoming invoice/payment date
- Update payment wallet (re-approve)
- Request cancellation (with feedback form)
- View billing history

---

## Environment Variables Needed

```env
# Blockchain
PRIVATE_KEY=                    # Org's signing wallet for gas
BASE_RPC_URL=https://mainnet.base.org
ETHEREUM_RPC_URL=https://eth.llamarpc.com

# USDC Contract Addresses
USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
USDC_ETHEREUM=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Email
RESEND_API_KEY=re_xxxxx

# Magic Links
MAGIC_LINK_SECRET=your-secret-key-min-32-chars

# Portal
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxx
```

---

## Database Schema Additions (Future)

```sql
-- Buyer sessions for portal
CREATE TABLE portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment attempts log
CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(20, 6) NOT NULL,
    status TEXT NOT NULL, -- pending, succeeded, failed
    failure_reason TEXT,
    tx_hash TEXT,
    chain TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Webhook Events to Implement

| Event | Trigger | Payload |
|-------|---------|---------|
| `billing.payment_collected` | Successful auto-charge | subscriptionId, amount, txHash |
| `billing.payment_failed` | Failed auto-charge | subscriptionId, reason, retryAt |
| `invoice.paid` | Invoice marked paid | invoiceId, txHash, paidAt |
| `portal.invoice_viewed` | Buyer viewed invoice | invoiceId, viewedAt |

---

## Testing Strategy

### Unit Tests
- Billing engine date calculations
- Allowance checking logic
- PDF generation

### Integration Tests
- Full billing cycle (create sub → charge → invoice)
- Portal authentication flow
- Payment confirmation flow

### E2E Tests
- Buyer completes payment via portal
- Subscription lifecycle (create → renew → cancel)

### Testnet Deployment
- Use Base Sepolia for testing
- Mock USDC contract with faucet

---

## Estimated Effort

| Phase | Scope | Complexity |
|-------|-------|------------|
| Phase 2: Billing Engine | Scheduler + payment executor | Medium-High |
| Phase 3: PDF + Email | Template rendering + delivery | Medium |
| Phase 4: Portal | Auth + UI + wallet integration | High |

---

## Open Questions for Future

1. **Gas Sponsorship**: Should we use a Paymaster for gasless buyer approvals?
2. **Multi-currency**: Support for other stablecoins (USDT, DAI)?
3. **Fiat Off-ramp**: Integration with Circle for USD settlement?
4. **Dunning Customization**: Per-org retry schedules?
5. **Proration**: How to handle mid-cycle plan changes?

---

## References

- [ERC-20 Approve Pattern](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20-approve-address-uint256-)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [Resend API](https://resend.com/docs)
- [React PDF](https://react-pdf.org/)
- [Base USDC Contract](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
