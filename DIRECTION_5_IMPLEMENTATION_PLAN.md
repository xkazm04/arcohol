# Direction 5: Embedded Finance SDK - Implementation Plan

Extending `@arcpay/react` with white-label payment components for SaaS platforms.

---

## Current State Analysis

### Existing @arcpay/react Capabilities

Based on the README, the current React SDK already provides:

| Feature | Status | Notes |
|---------|--------|-------|
| `ArcPayProvider` | ✅ | Context provider with config |
| `PayButton` | ✅ | Basic payment button |
| Wallet hooks | ✅ | `useWallet`, `useBalance`, etc. |
| Payment forms | ✅ | Basic checkout |
| QR codes | ✅ | For payments |
| Fiat ramps | ✅ | Coinbase/Transak |
| TypeScript | ✅ | Full support |
| Testing utils | ✅ | Mock providers |

### What's Missing for Embedded Finance

| Component | Priority | Complexity |
|-----------|----------|------------|
| **Checkout** (full cart) | High | Medium |
| **Invoice** component | High | Medium |
| **SubscriptionManager** | High | High |
| **TransactionHistory** | Medium | Low |
| **Balance** (multi-chain) | Medium | Medium |
| **PaymentModal** | Medium | Low |
| Headless hooks | High | Medium |
| Theming system | High | Medium |
| White-label customization | High | Low |

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Enhanced Theming System

Create a comprehensive theming system that allows full customization.

**File: `src/theme/types.ts`**

```typescript
export interface ArcPayTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderFocus: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  components: Partial<{
    Button: ComponentOverride;
    Card: ComponentOverride;
    Input: ComponentOverride;
    Modal: ComponentOverride;
    // ... more components
  }>;
}

export interface ComponentOverride {
  className?: string;
  style?: React.CSSProperties;
}
```

**File: `src/theme/presets.ts`**

```typescript
export const lightTheme: ArcPayTheme = { /* ... */ };
export const darkTheme: ArcPayTheme = { /* ... */ };
export const minimalTheme: ArcPayTheme = { /* ... */ };

// Brand preset generators
export function createBrandTheme(brandColor: string): Partial<ArcPayTheme>;
```

**File: `src/theme/ThemeProvider.tsx`**

```typescript
export function ArcPayThemeProvider({
  theme,
  children,
}: {
  theme?: Partial<ArcPayTheme>;
  children: React.ReactNode;
}) {
  // Merge with defaults, provide via context
}
```

#### 1.2 Component Architecture

Establish consistent component patterns:

```
src/components/
├── primitives/           # Base components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   └── Spinner.tsx
├── payment/              # Payment-specific
│   ├── Checkout/
│   │   ├── Checkout.tsx
│   │   ├── CartSummary.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── index.ts
│   ├── Invoice/
│   │   ├── Invoice.tsx
│   │   ├── InvoiceHeader.tsx
│   │   ├── LineItems.tsx
│   │   └── index.ts
│   ├── PayButton.tsx
│   └── PaymentModal.tsx
├── subscription/         # Subscription components
│   ├── SubscriptionManager/
│   ├── PlanSelector/
│   └── UsageDisplay/
├── wallet/               # Wallet components
│   ├── Balance.tsx
│   ├── WalletConnect.tsx
│   └── ChainSelector.tsx
└── common/               # Shared components
    ├── TransactionHistory.tsx
    ├── StatusBadge.tsx
    └── AmountDisplay.tsx
```

---

### Phase 2: Core Payment Components (Week 3-4)

#### 2.1 Checkout Component

Full cart checkout with customization.

**API Design:**

```tsx
import { Checkout } from '@arcpay/react';

<Checkout
  // Required
  items={[
    { name: 'Pro Plan', price: 99, quantity: 1 },
    { name: 'Extra seats', price: 25, quantity: 3 }
  ]}

  // Optional configuration
  currency="USDC"
  chains={['base', 'ethereum', 'polygon']}

  // Customization
  branding={{
    logo: '/logo.svg',
    companyName: 'Your Company',
    accentColor: '#6366f1',
  }}
  showSummary={true}
  showChainSelector={true}

  // Callbacks
  onSuccess={(payment) => {}}
  onError={(error) => {}}
  onCancel={() => {}}

  // Styling
  className="custom-checkout"
  theme={{ /* overrides */ }}
/>
```

**Implementation Tasks:**

1. Create `Checkout` container component
2. Create `CartSummary` sub-component
3. Create `PaymentMethodSelector` sub-component
4. Create `ChainSelector` sub-component
5. Wire up payment execution
6. Add loading/error states
7. Add success confirmation
8. Write tests

#### 2.2 Invoice Component

B2B invoice display and payment.

**API Design:**

```tsx
import { Invoice } from '@arcpay/react';

<Invoice
  // From API or inline
  invoiceId="inv_xxx"
  // OR
  invoice={{
    reference: 'INV-2025-001',
    customer: { name: 'Acme Corp', email: 'billing@acme.com' },
    items: [
      { description: 'Consulting - January', amount: 5000 },
      { description: 'Travel expenses', amount: 450 }
    ],
    dueDate: '2025-02-15',
    notes: 'Thank you!',
  }}

  // Branding
  branding={{
    logo: '/logo.svg',
    companyName: 'Your Company',
    companyAddress: '123 Main St...',
    accentColor: '#10b981',
  }}

  // Features
  showPdfDownload={true}
  showPayButton={true}
  showQRCode={true}

  // Callbacks
  onPaid={(payment) => {}}
  onDownload={() => {}}
/>
```

**Implementation Tasks:**

1. Create `Invoice` container
2. Create `InvoiceHeader` (logo, company, customer info)
3. Create `LineItems` table
4. Create `InvoiceTotals` (subtotal, tax, total)
5. Add PDF generation (using jsPDF or similar)
6. Add QR code for payment
7. Integrate with `PayButton`
8. Write tests

#### 2.3 PaymentModal Component

Reusable payment modal for inline payments.

**API Design:**

```tsx
import { PaymentModal, usePaymentModal } from '@arcpay/react';

function ProductPage() {
  const { open, close, isOpen } = usePaymentModal();

  return (
    <>
      <button onClick={() => open({ amount: 99 })}>Buy Now</button>

      <PaymentModal
        isOpen={isOpen}
        onClose={close}
        amount={99}
        recipient="0x..."
        description="Pro Plan"
        onSuccess={(payment) => {
          close();
          // Activate subscription
        }}
      />
    </>
  );
}
```

---

### Phase 3: Subscription Components (Week 5-6)

#### 3.1 SubscriptionManager

Complete subscription management UI.

**API Design:**

```tsx
import { SubscriptionManager } from '@arcpay/react';

<SubscriptionManager
  customerId="cust_xxx"

  // Plans to display
  plans={[
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      interval: 'monthly',
      features: ['5 users', '10GB storage']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      interval: 'monthly',
      features: ['Unlimited users', '100GB storage'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      interval: 'monthly',
      features: ['Everything', 'SLA', 'Support']
    }
  ]}

  // Current state (if managing existing)
  currentPlan="starter"
  currentBillingCycle="monthly"

  // Features to show
  showUsage={true}
  showHistory={true}
  showBillingInfo={true}
  allowCancellation={true}

  // Callbacks
  onUpgrade={(newPlan) => {}}
  onDowngrade={(newPlan) => {}}
  onCancel={() => {}}
  onPaymentMethodUpdate={() => {}}
/>
```

**Sub-components:**

1. `PlanSelector` - Grid/list of available plans
2. `PlanCard` - Individual plan display
3. `CurrentPlan` - Active subscription details
4. `UsageDisplay` - Usage meter visualization
5. `BillingHistory` - Past invoices/payments
6. `PaymentMethodManager` - Add/update payment methods

#### 3.2 PlanSelector (Standalone)

For checkout flows or landing pages.

```tsx
import { PlanSelector } from '@arcpay/react';

<PlanSelector
  plans={plans}
  selected="pro"
  onChange={(planId) => {}}
  showAnnualDiscount={true}
  annualDiscountPercent={20}
  layout="grid" // or 'list'
  highlightPopular={true}
/>
```

---

### Phase 4: Headless Mode (Week 7)

All components should have headless equivalents for custom UIs.

#### 4.1 Headless Hooks

**File: `src/hooks/headless/index.ts`**

```typescript
// Payment hooks
export function useCheckout(options: CheckoutOptions): {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  total: number;
  estimatedFee: number;
  supportedChains: Chain[];
  selectedChain: Chain;
  setChain: (chain: Chain) => void;
  isProcessing: boolean;
  initiatePayment: () => Promise<PaymentResult>;
  error: Error | null;
};

export function useInvoice(invoiceId: string): {
  invoice: Invoice | null;
  isLoading: boolean;
  error: Error | null;
  pay: () => Promise<PaymentResult>;
  downloadPdf: () => void;
  getQRCode: () => string;
};

export function useSubscription(customerId: string): {
  subscription: Subscription | null;
  plans: Plan[];
  usage: UsageData | null;
  history: PaymentRecord[];
  isLoading: boolean;
  upgrade: (planId: string) => Promise<void>;
  downgrade: (planId: string) => Promise<void>;
  cancel: () => Promise<void>;
  updatePaymentMethod: () => Promise<void>;
};

// Wallet hooks
export function useBalance(options?: { chains?: Chain[] }): {
  balances: Record<Chain, Money>;
  totalBalance: Money;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export function useTransactionHistory(options?: { limit?: number }): {
  transactions: Transaction[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  filter: (criteria: FilterCriteria) => void;
};
```

#### 4.2 Render Props Pattern (Alternative)

For more complex custom UIs:

```tsx
<Checkout.Headless items={items}>
  {({
    cart,
    total,
    estimatedFee,
    chains,
    selectedChain,
    setChain,
    initiatePayment,
    isProcessing,
  }) => (
    <YourCustomUI>
      {/* Full control over rendering */}
    </YourCustomUI>
  )}
</Checkout.Headless>
```

---

### Phase 5: Polish & Documentation (Week 8)

#### 5.1 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

#### 5.2 Internationalization

Add to existing i18n system:

```typescript
// New keys for embedded components
{
  "checkout.title": "Checkout",
  "checkout.summary": "Order Summary",
  "checkout.pay": "Pay {{amount}}",
  "checkout.processing": "Processing...",
  "invoice.download": "Download PDF",
  "invoice.due": "Due {{date}}",
  "subscription.upgrade": "Upgrade",
  "subscription.downgrade": "Downgrade",
  "subscription.cancel": "Cancel Subscription",
  // ... more
}
```

#### 5.3 Storybook Stories

Create comprehensive Storybook documentation:

```
stories/
├── components/
│   ├── Checkout.stories.tsx
│   ├── Invoice.stories.tsx
│   ├── SubscriptionManager.stories.tsx
│   ├── PaymentModal.stories.tsx
│   └── Balance.stories.tsx
├── patterns/
│   ├── EcommerceCheckout.stories.tsx
│   ├── SaaSSubscription.stories.tsx
│   └── B2BInvoicing.stories.tsx
└── theming/
    ├── CustomTheme.stories.tsx
    ├── BrandPresets.stories.tsx
    └── DarkMode.stories.tsx
```

#### 5.4 Documentation

Update docs with:

1. Component API reference
2. Theming guide
3. Headless usage examples
4. Migration guide (from basic PayButton)
5. Best practices
6. Troubleshooting

---

## File Structure Summary

```
arcpay-react/
├── src/
│   ├── components/
│   │   ├── primitives/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   ├── payment/
│   │   │   ├── Checkout/
│   │   │   │   ├── Checkout.tsx
│   │   │   │   ├── Checkout.headless.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   ├── PaymentMethodSelector.tsx
│   │   │   │   ├── ChainSelector.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Invoice/
│   │   │   │   ├── Invoice.tsx
│   │   │   │   ├── Invoice.headless.tsx
│   │   │   │   ├── InvoiceHeader.tsx
│   │   │   │   ├── LineItems.tsx
│   │   │   │   ├── InvoiceTotals.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PayButton.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── index.ts
│   │   ├── subscription/
│   │   │   ├── SubscriptionManager/
│   │   │   │   ├── SubscriptionManager.tsx
│   │   │   │   ├── PlanSelector.tsx
│   │   │   │   ├── PlanCard.tsx
│   │   │   │   ├── CurrentPlan.tsx
│   │   │   │   ├── UsageDisplay.tsx
│   │   │   │   ├── BillingHistory.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── wallet/
│   │   │   ├── Balance.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── ChainSelector.tsx
│   │   │   └── index.ts
│   │   └── common/
│   │       ├── TransactionHistory.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── AmountDisplay.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useCheckout.ts
│   │   ├── useInvoice.ts
│   │   ├── useSubscription.ts
│   │   ├── useBalance.ts
│   │   ├── useTransactionHistory.ts
│   │   ├── usePaymentModal.ts
│   │   └── index.ts
│   ├── theme/
│   │   ├── types.ts
│   │   ├── defaults.ts
│   │   ├── presets.ts
│   │   ├── ThemeProvider.tsx
│   │   ├── useTheme.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── pdf.ts           # PDF generation
│   │   ├── qrcode.ts        # QR code generation
│   │   ├── format.ts        # Money/date formatting
│   │   └── index.ts
│   └── index.ts             # Main exports
├── stories/
│   └── ...
└── docs/
    ├── theming.md
    ├── components.md
    ├── headless.md
    └── migration.md
```

---

## Export Structure

```typescript
// Main package exports
export {
  // Provider
  ArcPayProvider,
  ArcPayThemeProvider,

  // Payment components
  Checkout,
  Invoice,
  PayButton,
  PaymentModal,

  // Subscription components
  SubscriptionManager,
  PlanSelector,
  PlanCard,

  // Wallet components
  Balance,
  WalletConnect,
  ChainSelector,
  TransactionHistory,

  // Headless hooks
  useCheckout,
  useInvoice,
  useSubscription,
  useBalance,
  useTransactionHistory,
  usePaymentModal,

  // Theme
  useTheme,
  lightTheme,
  darkTheme,
  createBrandTheme,

  // Types
  type ArcPayTheme,
  type CheckoutProps,
  type InvoiceProps,
  type SubscriptionManagerProps,
  // ...
} from '@arcpay/react';

// Styles
import '@arcpay/react/styles';        // Default styles
import '@arcpay/react/styles/dark';   // Dark mode preset
```

---

## Integration Examples

### E-commerce Checkout

```tsx
import { ArcPayProvider, Checkout } from '@arcpay/react';
import '@arcpay/react/styles';

function CartPage() {
  const { items } = useCart();

  return (
    <ArcPayProvider publicKey="pk_xxx">
      <Checkout
        items={items.map(i => ({
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        }))}
        branding={{
          logo: '/logo.svg',
          companyName: 'My Store',
        }}
        onSuccess={(payment) => {
          completeOrder(payment.id);
          router.push('/order-confirmation');
        }}
      />
    </ArcPayProvider>
  );
}
```

### SaaS Subscription Portal

```tsx
import {
  ArcPayProvider,
  SubscriptionManager
} from '@arcpay/react';

function BillingPage() {
  const { user } = useAuth();

  return (
    <ArcPayProvider publicKey="pk_xxx">
      <SubscriptionManager
        customerId={user.customerId}
        plans={PLANS}
        currentPlan={user.plan}
        showUsage={true}
        showHistory={true}
        onUpgrade={async (planId) => {
          await api.upgradePlan(planId);
          toast.success('Plan upgraded!');
        }}
      />
    </ArcPayProvider>
  );
}
```

### B2B Invoice Payment

```tsx
import { ArcPayProvider, Invoice } from '@arcpay/react';

function InvoicePage({ invoiceId }: { invoiceId: string }) {
  return (
    <ArcPayProvider publicKey="pk_xxx">
      <Invoice
        invoiceId={invoiceId}
        branding={{
          logo: '/logo.svg',
          companyName: 'Vendor Inc',
          companyAddress: '123 Business Ave...',
        }}
        showPdfDownload
        showQRCode
        onPaid={(payment) => {
          toast.success('Invoice paid!');
        }}
      />
    </ArcPayProvider>
  );
}
```

### Custom Headless Implementation

```tsx
import { useCheckout } from '@arcpay/react';

function CustomCheckout() {
  const {
    items,
    total,
    estimatedFee,
    selectedChain,
    setChain,
    supportedChains,
    initiatePayment,
    isProcessing,
    error,
  } = useCheckout({
    items: cartItems,
    recipient: '0x...',
  });

  return (
    <div className="my-custom-checkout">
      {/* Completely custom UI */}
      <div className="my-cart">
        {items.map(item => (
          <CustomCartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="my-totals">
        <p>Total: {formatMoney(total)}</p>
        <p>Fee: {formatMoney(estimatedFee)}</p>
      </div>

      <select
        value={selectedChain}
        onChange={(e) => setChain(e.target.value)}
      >
        {supportedChains.map(chain => (
          <option key={chain} value={chain}>{chain}</option>
        ))}
      </select>

      <button
        onClick={initiatePayment}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>

      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Bundle size (components) | < 50KB gzipped |
| Time to integrate checkout | < 10 minutes |
| Accessibility score | 100% WCAG 2.1 AA |
| Storybook coverage | 100% of components |
| TypeScript coverage | 100% |
| Test coverage | > 80% |

---

## Dependencies to Add

```json
{
  "dependencies": {
    "jspdf": "^2.5.0",          // PDF generation
    "qrcode.react": "^3.1.0",   // QR codes
    "class-variance-authority": "^0.7.0"  // Component variants
  },
  "devDependencies": {
    "@storybook/react": "^8.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## Next Steps

1. **Review existing `@arcpay/react` codebase** to understand current patterns
2. **Create theme system** as foundation
3. **Implement Checkout component** as first major deliverable
4. **Add Storybook** for component development and documentation
5. **Iterate based on feedback**

This plan transforms `@arcpay/react` from a basic SDK into a comprehensive embedded finance toolkit that SaaS companies can white-label into their products.
