# ArcPay Developer Experience Implementation Plan

## Overview

This plan covers three directions for improving developer onboarding:

1. **Testing Utilities** - Integrated into `@arcpay/node` and `@arcpay/react`
2. **Interactive Sandbox** - Built in `/test` repository as a sandbox module
3. **Health Check** - Integrated into both SDK packages

---

## Direction 1: Testing Utilities

### Goal
Enable developers to test their integrations without hitting production APIs or requiring real wallets.

### Architecture

```
@arcpay/node
├── src/
│   ├── testing/                 # NEW: Testing submodule
│   │   ├── index.ts             # Public exports
│   │   ├── MockArcPayServer.ts  # Mock server client
│   │   ├── fixtures.ts          # Data factories
│   │   ├── webhooks.ts          # Webhook testing helpers
│   │   └── scenarios.ts         # Pre-built test scenarios
│   └── index.ts                 # Add testing re-export

@arcpay/react
├── src/
│   ├── testing/                 # NEW: Testing submodule
│   │   ├── index.ts             # Public exports
│   │   ├── MockProvider.tsx     # Full mock provider
│   │   ├── fixtures.ts          # React-specific fixtures
│   │   ├── TestWrapper.tsx      # Test utility wrapper
│   │   └── scenarios.ts         # UI test scenarios
│   └── index.ts                 # Add testing re-export
```

### Implementation Tasks

#### 1.1 Backend Testing (`@arcpay/node/testing`)

**File: `src/testing/fixtures.ts`**
```typescript
// Data factories for creating realistic test data

export interface FixtureOptions {
  seed?: number;  // For reproducible random data
}

// Payment fixtures
export function createPayment(overrides?: Partial<Payment>): Payment;
export function createPaymentIntent(overrides?: Partial<PaymentIntent>): PaymentIntent;
export function createPaymentLink(overrides?: Partial<PaymentLink>): PaymentLink;

// Subscription fixtures
export function createPlan(overrides?: Partial<SubscriptionPlan>): SubscriptionPlan;
export function createSubscription(overrides?: Partial<Subscription>): Subscription;
export function createInvoice(overrides?: Partial<SubscriptionInvoice>): SubscriptionInvoice;

// Customer fixtures
export function createCustomer(overrides?: Partial<Customer>): Customer;

// Webhook fixtures
export function createWebhookEvent<T>(type: WebhookEventType, data: T): WebhookEvent<T>;

// Batch creation
export function createPayments(count: number, overrides?: Partial<Payment>): Payment[];
export function createPaginatedList<T>(items: T[], hasMore?: boolean): PaginatedList<T>;
```

**File: `src/testing/MockArcPayServer.ts`**
```typescript
// Mock server that simulates API responses

export interface MockBehavior<T> {
  returns?: T;
  throws?: Error;
  delay?: number;
  sequence?: T[];  // Return different values on each call
}

export class MockArcPayServer {
  // Configure mock responses
  payments: MockPaymentsResource;
  paymentIntents: MockPaymentIntentsResource;
  paymentLinks: MockPaymentLinksResource;
  plans: MockPlansResource;
  subscriptions: MockSubscriptionsResource;
  customers: MockCustomersResource;
  webhooks: MockWebhooksResource;

  constructor(config?: {
    defaultDelay?: number;
    recordCalls?: boolean;
  });

  // Reset all mocks
  reset(): void;

  // Get recorded calls for assertions
  getCalls(resource: string): CallRecord[];

  // Simulate mode (auto-respond with realistic data)
  enableSimulation(): void;
}

// Usage example:
// const mock = new MockArcPayServer();
// mock.payments.create.returns(createPayment({ status: 'completed' }));
// mock.payments.create.throws(new InvalidRequestError('Invalid amount'));
// mock.payments.create.delays(2000);
```

**File: `src/testing/webhooks.ts`**
```typescript
// Webhook testing utilities

export interface MockWebhookRequest {
  body: string;
  headers: Record<string, string>;
}

// Create a properly signed webhook request
export function createSignedWebhookRequest(
  event: WebhookEvent,
  secret: string,
  options?: { timestamp?: number }
): MockWebhookRequest;

// Create Express-compatible mock request/response
export function createExpressMocks(event: WebhookEvent, secret: string): {
  req: MockRequest;
  res: MockResponse;
  next: jest.Mock;
};

// Create Next.js-compatible request
export function createNextjsRequest(event: WebhookEvent, secret: string): Request;

// Simulate webhook delivery
export async function simulateWebhook(
  url: string,
  event: WebhookEvent,
  secret: string
): Promise<Response>;
```

**File: `src/testing/scenarios.ts`**
```typescript
// Pre-built test scenarios for common flows

export const PaymentScenarios = {
  // Successful payment flow
  successfulPayment: () => ({
    intent: createPaymentIntent({ status: 'requires_payment' }),
    confirmed: createPaymentIntent({ status: 'succeeded' }),
    payment: createPayment({ status: 'completed' }),
    webhookEvents: [
      createWebhookEvent('payment.created', ...),
      createWebhookEvent('payment.completed', ...),
    ],
  }),

  // Failed payment
  failedPayment: () => ({...}),

  // Refund flow
  refundedPayment: () => ({...}),
};

export const SubscriptionScenarios = {
  // New subscription with trial
  trialSubscription: () => ({...}),

  // Subscription renewal
  renewalSuccess: () => ({...}),
  renewalFailed: () => ({...}),

  // Cancellation flow
  cancellation: () => ({...}),

  // Upgrade/downgrade
  planChange: () => ({...}),
};
```

**File: `src/testing/index.ts`**
```typescript
// Public exports for @arcpay/node/testing

export { MockArcPayServer } from './MockArcPayServer';
export * from './fixtures';
export * from './webhooks';
export { PaymentScenarios, SubscriptionScenarios } from './scenarios';

// Re-export types for testing
export type { MockBehavior, MockWebhookRequest } from './types';
```

#### 1.2 React Testing (`@arcpay/react/testing`)

**File: `src/testing/MockProvider.tsx`**
```typescript
// Full mock provider for testing React components

export interface MockProviderConfig {
  // Initial state
  wallet?: MockWallet | null;
  balance?: string;
  transactions?: Transaction[];
  subscriptions?: Subscription[];

  // Behavior
  autoConnect?: boolean;
  simulateDelay?: boolean;
  failOnTransfer?: boolean;

  // Callbacks for assertions
  onConnect?: () => void;
  onTransfer?: (params: TransferParams) => void;
  onSubscribe?: (planId: string) => void;
}

export function MockArcPayProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: MockProviderConfig;
}): JSX.Element;

// Individual mock hooks for granular testing
export function useMockWallet(config?: Partial<MockProviderConfig>): WalletState;
export function useMockBalance(balance?: string): BalanceState;
export function useMockTransfer(config?: TransferConfig): TransferState;
export function useMockSubscription(config?: SubscriptionConfig): SubscriptionState;
```

**File: `src/testing/TestWrapper.tsx`**
```typescript
// Convenient test wrapper combining all providers

export interface TestWrapperProps {
  children: React.ReactNode;
  mockConfig?: MockProviderConfig;
  theme?: ThemeConfig;
  locale?: LocaleCode;
}

export function TestWrapper({ children, ...props }: TestWrapperProps): JSX.Element;

// Usage with testing-library:
// render(<PayButton />, { wrapper: TestWrapper })

// Custom render helper
export function renderWithArcPay(
  ui: React.ReactElement,
  options?: {
    mockConfig?: MockProviderConfig;
    theme?: ThemeConfig;
  }
): RenderResult;
```

**File: `src/testing/fixtures.ts`**
```typescript
// React-specific fixtures

export function createMockWallet(overrides?: Partial<MockWallet>): MockWallet;
export function createMockTransaction(overrides?: Partial<Transaction>): Transaction;

// Component props factories
export function createPayButtonProps(overrides?: Partial<PayButtonProps>): PayButtonProps;
export function createPlanSelectorProps(plans?: SubscriptionPlan[]): PlanSelectorProps;
export function createSubscriptionCardProps(sub?: Subscription): SubscriptionCardProps;
```

**File: `src/testing/scenarios.ts`**
```typescript
// UI test scenarios

export const UIScenarios = {
  // Wallet states
  disconnectedWallet: (): MockProviderConfig => ({
    wallet: null,
  }),

  connectedWallet: (): MockProviderConfig => ({
    wallet: createMockWallet(),
    balance: '1000.00',
  }),

  lowBalance: (): MockProviderConfig => ({
    wallet: createMockWallet(),
    balance: '5.00',
  }),

  // Payment states
  pendingPayment: (): MockProviderConfig => ({...}),
  completedPayment: (): MockProviderConfig => ({...}),
  failedPayment: (): MockProviderConfig => ({...}),

  // Subscription states
  activeSubscription: (): MockProviderConfig => ({...}),
  trialSubscription: (): MockProviderConfig => ({...}),
  canceledSubscription: (): MockProviderConfig => ({...}),
};
```

#### 1.3 Package.json Updates

**@arcpay/node/package.json**
```json
{
  "exports": {
    ".": { ... },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "import": "./dist/testing/index.mjs",
      "require": "./dist/testing/index.js"
    }
  }
}
```

**@arcpay/react/package.json**
```json
{
  "exports": {
    ".": { ... },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "import": "./dist/testing/index.mjs",
      "require": "./dist/testing/index.js"
    }
  }
}
```

#### 1.4 Usage Examples

**Backend Unit Test (Jest)**
```typescript
import ArcPay, { MockArcPayServer, createPayment, createWebhookEvent } from '@arcpay/node/testing';

describe('PaymentService', () => {
  let mock: MockArcPayServer;

  beforeEach(() => {
    mock = new MockArcPayServer();
  });

  it('should create payment', async () => {
    const expectedPayment = createPayment({ amount: '100.00' });
    mock.payments.create.returns(expectedPayment);

    const result = await paymentService.processOrder(order);

    expect(result.paymentId).toBe(expectedPayment.id);
    expect(mock.getCalls('payments.create')).toHaveLength(1);
  });

  it('should handle webhook', async () => {
    const event = createWebhookEvent('payment.completed', createPayment());
    const { req, res, next } = createExpressMocks(event, 'whsec_test');

    await webhookHandler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
```

**React Component Test (Testing Library)**
```typescript
import { renderWithArcPay, UIScenarios, createMockWallet } from '@arcpay/react/testing';
import { PayButton } from '@arcpay/react';

describe('PayButton', () => {
  it('should show connect prompt when disconnected', () => {
    const { getByText } = renderWithArcPay(
      <PayButton amount={100} recipient="0x..." />,
      { mockConfig: UIScenarios.disconnectedWallet() }
    );

    expect(getByText('Connect Wallet to Pay')).toBeInTheDocument();
  });

  it('should process payment when connected', async () => {
    const onSuccess = jest.fn();
    const { getByText, user } = renderWithArcPay(
      <PayButton amount={100} recipient="0x..." onSuccess={onSuccess} />,
      { mockConfig: UIScenarios.connectedWallet() }
    );

    await user.click(getByText('Pay $100.00'));

    expect(onSuccess).toHaveBeenCalled();
  });
});
```

---

## Direction 2: Interactive Sandbox (in `/test` repository)

### Goal
Provide a web-based playground where developers can experiment with all SDK features.

### Architecture

```
test/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Existing shop demo
│   │   ├── sandbox/              # NEW: Sandbox module
│   │   │   ├── page.tsx          # Sandbox home
│   │   │   ├── layout.tsx        # Sandbox layout with sidebar
│   │   │   ├── payments/
│   │   │   │   └── page.tsx      # Payment playground
│   │   │   ├── subscriptions/
│   │   │   │   └── page.tsx      # Subscription playground
│   │   │   ├── webhooks/
│   │   │   │   └── page.tsx      # Webhook tester
│   │   │   ├── components/
│   │   │   │   └── page.tsx      # Component gallery
│   │   │   └── api-explorer/
│   │   │       └── page.tsx      # API request builder
│   │   └── api/
│   │       └── sandbox/          # Sandbox API routes
│   │           ├── mock/[...path]/route.ts  # Mock API
│   │           └── webhooks/route.ts
│   ├── sandbox/                  # NEW: Sandbox module code
│   │   ├── components/
│   │   │   ├── SandboxLayout.tsx
│   │   │   ├── SandboxSidebar.tsx
│   │   │   ├── CodePreview.tsx
│   │   │   ├── RequestBuilder.tsx
│   │   │   ├── ResponseViewer.tsx
│   │   │   ├── WebhookEventLog.tsx
│   │   │   ├── PaymentSimulator.tsx
│   │   │   ├── SubscriptionSimulator.tsx
│   │   │   └── ComponentPlayground.tsx
│   │   ├── hooks/
│   │   │   ├── useSandboxState.ts
│   │   │   ├── useCodeGeneration.ts
│   │   │   └── useWebhookLog.ts
│   │   ├── lib/
│   │   │   ├── mockApi.ts
│   │   │   ├── codeGenerator.ts
│   │   │   └── webhookSimulator.ts
│   │   └── store/
│   │       └── sandboxStore.ts
│   └── mocks/                    # Existing + enhanced
│       └── MockArcPayProvider.tsx
```

### Implementation Tasks

#### 2.1 Sandbox Layout & Navigation

**File: `src/sandbox/components/SandboxLayout.tsx`**
```typescript
'use client';

import { SandboxSidebar } from './SandboxSidebar';
import { SandboxHeader } from './SandboxHeader';

export function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-50">
      <SandboxSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SandboxHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**File: `src/sandbox/components/SandboxSidebar.tsx`**
```typescript
const navigation = [
  {
    title: 'Playground',
    items: [
      { name: 'Payments', href: '/sandbox/payments', icon: CreditCardIcon },
      { name: 'Subscriptions', href: '/sandbox/subscriptions', icon: RefreshIcon },
      { name: 'Payment Links', href: '/sandbox/payment-links', icon: LinkIcon },
    ],
  },
  {
    title: 'Testing',
    items: [
      { name: 'Webhook Tester', href: '/sandbox/webhooks', icon: WebhookIcon },
      { name: 'API Explorer', href: '/sandbox/api-explorer', icon: CodeIcon },
    ],
  },
  {
    title: 'Components',
    items: [
      { name: 'Component Gallery', href: '/sandbox/components', icon: ComponentIcon },
      { name: 'Theme Editor', href: '/sandbox/themes', icon: PaletteIcon },
    ],
  },
];
```

#### 2.2 Payment Playground

**File: `src/app/sandbox/payments/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { PaymentSimulator } from '@/sandbox/components/PaymentSimulator';
import { CodePreview } from '@/sandbox/components/CodePreview';
import { ResponseViewer } from '@/sandbox/components/ResponseViewer';

export default function PaymentPlayground() {
  const [paymentConfig, setPaymentConfig] = useState({
    amount: '100.00',
    currency: 'USDC',
    recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f...',
    description: 'Test payment',
  });
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left: Configuration */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Payment Configuration</h2>

          {/* Amount input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount (USDC)</label>
            <input
              type="text"
              value={paymentConfig.amount}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, amount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Recipient input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Recipient Address</label>
            <input
              type="text"
              value={paymentConfig.recipient}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, recipient: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={paymentConfig.description}
              onChange={(e) => setPaymentConfig({ ...paymentConfig, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Simulate buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => simulatePayment('success')}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700"
            >
              ✓ Simulate Success
            </button>
            <button
              onClick={() => simulatePayment('failure')}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 font-medium hover:bg-red-700"
            >
              ✗ Simulate Failure
            </button>
          </div>
        </div>

        {/* Flow visualization */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Payment Flow</h3>
          <PaymentFlowDiagram step={currentStep} />
        </div>
      </div>

      {/* Right: Code & Response */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
            Generated Code
          </TabButton>
          <TabButton active={activeTab === 'response'} onClick={() => setActiveTab('response')}>
            API Response
          </TabButton>
        </div>

        {activeTab === 'code' ? (
          <CodePreview
            code={generatePaymentCode(paymentConfig)}
            language="typescript"
            copyable
          />
        ) : (
          <ResponseViewer response={response} />
        )}
      </div>
    </div>
  );
}
```

#### 2.3 Webhook Tester

**File: `src/app/sandbox/webhooks/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { WebhookEventLog } from '@/sandbox/components/WebhookEventLog';

const WEBHOOK_EVENTS = [
  { type: 'payment.created', description: 'When a payment is created' },
  { type: 'payment.completed', description: 'When a payment succeeds' },
  { type: 'payment.failed', description: 'When a payment fails' },
  { type: 'subscription.created', description: 'When a subscription is created' },
  { type: 'subscription.renewed', description: 'When a subscription renews' },
  { type: 'invoice.payment_failed', description: 'When invoice payment fails' },
  // ... more events
];

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:3001/api/webhooks');
  const [secret, setSecret] = useState('whsec_test_...');
  const [eventLog, setEventLog] = useState<WebhookLogEntry[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('payment.completed');

  const sendTestWebhook = async () => {
    const event = createMockWebhookEvent(selectedEvent);
    const result = await simulateWebhookDelivery(webhookUrl, event, secret);

    setEventLog([
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        event,
        response: result,
        success: result.status < 400,
      },
      ...eventLog,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Webhook Configuration</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="https://yoursite.com/api/webhooks"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Signing Secret</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-mono"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Event Type</label>
          <div className="grid grid-cols-3 gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <button
                key={event.type}
                onClick={() => setSelectedEvent(event.type)}
                className={`p-3 rounded-lg border text-left text-sm ${
                  selectedEvent === event.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <div className="font-mono text-xs text-blue-600">{event.type}</div>
                <div className="text-zinc-500 text-xs mt-1">{event.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={sendTestWebhook}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700"
        >
          Send Test Webhook
        </button>
      </div>

      {/* Event Log */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Event Log</h2>
        <WebhookEventLog entries={eventLog} />
      </div>

      {/* Signature Verification Tool */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Signature Verifier</h2>
        <SignatureVerifier />
      </div>
    </div>
  );
}
```

#### 2.4 Component Gallery

**File: `src/app/sandbox/components/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import {
  PayButton,
  WalletButton,
  BalanceDisplay,
  PlanSelector,
  SubscriptionCard,
  TransactionList,
} from '@arcpay/react';
import { MockArcPayProvider } from '@/mocks/MockArcPayProvider';
import { CodePreview } from '@/sandbox/components/CodePreview';

const COMPONENTS = [
  {
    name: 'PayButton',
    description: 'One-click payment button',
    component: PayButton,
    defaultProps: { amount: 99.99, recipient: '0x...' },
    code: `<PayButton amount={99.99} recipient="0x..." onSuccess={handleSuccess} />`,
  },
  {
    name: 'WalletButton',
    description: 'Connect/disconnect wallet',
    component: WalletButton,
    defaultProps: {},
    code: `<WalletButton />`,
  },
  {
    name: 'BalanceDisplay',
    description: 'Show wallet balance',
    component: BalanceDisplay,
    defaultProps: { showCurrency: true },
    code: `<BalanceDisplay showCurrency />`,
  },
  {
    name: 'PlanSelector',
    description: 'Subscription plan picker',
    component: PlanSelector,
    defaultProps: { plans: mockPlans },
    code: `<PlanSelector plans={plans} onSelect={handleSelect} />`,
  },
  // ... more components
];

export default function ComponentGallery() {
  const [selectedComponent, setSelectedComponent] = useState(COMPONENTS[0]);
  const [props, setProps] = useState(selectedComponent.defaultProps);
  const [theme, setTheme] = useState('default');

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Component List */}
      <div className="space-y-2">
        {COMPONENTS.map((comp) => (
          <button
            key={comp.name}
            onClick={() => {
              setSelectedComponent(comp);
              setProps(comp.defaultProps);
            }}
            className={`w-full p-3 rounded-lg text-left ${
              selectedComponent.name === comp.name
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white hover:bg-zinc-50'
            } border`}
          >
            <div className="font-medium">{comp.name}</div>
            <div className="text-sm text-zinc-500">{comp.description}</div>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="col-span-2 space-y-6">
        {/* Live Preview */}
        <div className="bg-white rounded-xl p-8 shadow-sm border">
          <h3 className="font-semibold mb-4">Live Preview</h3>
          <div className="flex items-center justify-center p-8 bg-zinc-50 rounded-lg">
            <MockArcPayProvider initialBalance="1250.00">
              <selectedComponent.component {...props} />
            </MockArcPayProvider>
          </div>
        </div>

        {/* Props Editor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Props</h3>
          <PropsEditor
            schema={selectedComponent.propsSchema}
            value={props}
            onChange={setProps}
          />
        </div>

        {/* Code */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Code</h3>
          <CodePreview code={selectedComponent.code} language="tsx" />
        </div>
      </div>
    </div>
  );
}
```

#### 2.5 API Explorer

**File: `src/app/sandbox/api-explorer/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { RequestBuilder } from '@/sandbox/components/RequestBuilder';
import { ResponseViewer } from '@/sandbox/components/ResponseViewer';

const API_ENDPOINTS = [
  { method: 'POST', path: '/payments', name: 'Create Payment' },
  { method: 'GET', path: '/payments/:id', name: 'Get Payment' },
  { method: 'GET', path: '/payments', name: 'List Payments' },
  { method: 'POST', path: '/payment_intents', name: 'Create Payment Intent' },
  { method: 'POST', path: '/subscriptions', name: 'Create Subscription' },
  { method: 'POST', path: '/plans', name: 'Create Plan' },
  // ... all endpoints
];

export default function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [request, setRequest] = useState({ headers: {}, body: {} });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    // Send to mock API
    const result = await fetch(`/api/sandbox/mock${selectedEndpoint.path}`, {
      method: selectedEndpoint.method,
      headers: request.headers,
      body: selectedEndpoint.method !== 'GET' ? JSON.stringify(request.body) : undefined,
    });
    setResponse(await result.json());
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left: Request Builder */}
      <div className="space-y-6">
        {/* Endpoint Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <select
            value={`${selectedEndpoint.method} ${selectedEndpoint.path}`}
            onChange={(e) => {
              const [method, path] = e.target.value.split(' ');
              setSelectedEndpoint(API_ENDPOINTS.find(
                (ep) => ep.method === method && ep.path === path
              )!);
            }}
            className="w-full border rounded-lg px-3 py-2"
          >
            {API_ENDPOINTS.map((ep) => (
              <option key={`${ep.method} ${ep.path}`} value={`${ep.method} ${ep.path}`}>
                {ep.method} {ep.path} - {ep.name}
              </option>
            ))}
          </select>
        </div>

        {/* Request Builder */}
        <RequestBuilder
          endpoint={selectedEndpoint}
          value={request}
          onChange={setRequest}
        />

        <button
          onClick={executeRequest}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>

      {/* Right: Response & Code Gen */}
      <div className="space-y-6">
        <ResponseViewer response={response} loading={loading} />

        {/* Generated Code */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Generated Code</h3>
          <div className="flex gap-2 mb-4">
            <TabButton>TypeScript</TabButton>
            <TabButton>cURL</TabButton>
            <TabButton>Python</TabButton>
          </div>
          <CodePreview code={generateCode(selectedEndpoint, request)} />
        </div>
      </div>
    </div>
  );
}
```

#### 2.6 Mock API Route

**File: `src/app/api/sandbox/mock/[...path]/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  createPayment,
  createSubscription,
  createPlan,
  createCustomer,
  createPaginatedList,
} from '@arcpay/node/testing';

// In-memory store for sandbox state
const store = {
  payments: new Map(),
  subscriptions: new Map(),
  plans: new Map(),
  customers: new Map(),
};

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await request.json();

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  switch (path) {
    case 'payments': {
      const payment = createPayment({
        amount: body.amount,
        currency: body.currency || 'USDC',
        recipient: body.recipient,
        description: body.description,
        status: 'pending',
      });
      store.payments.set(payment.id, payment);
      return NextResponse.json({ data: payment });
    }

    case 'subscriptions': {
      const subscription = createSubscription({
        planId: body.plan_id,
        customerWallet: body.customer_wallet,
        status: 'incomplete',
      });
      store.subscriptions.set(subscription.id, subscription);
      return NextResponse.json({ data: subscription });
    }

    // ... handle other endpoints
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');

  // Handle list endpoints
  if (path === 'payments') {
    return NextResponse.json(
      createPaginatedList(Array.from(store.payments.values()))
    );
  }

  // Handle single resource
  const [resource, id] = path.split('/');
  const item = store[resource + 's']?.get(id);

  if (item) {
    return NextResponse.json({ data: item });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

---

## Direction 3: Health Check

### Goal
Help developers validate their integration is configured correctly.

### Architecture

```
@arcpay/node
├── src/
│   ├── health/                  # NEW: Health check module
│   │   ├── index.ts
│   │   ├── checks.ts            # Individual health checks
│   │   └── types.ts
│   └── client.ts                # Add healthCheck() method

@arcpay/react
├── src/
│   ├── health/                  # NEW: Health check module
│   │   ├── index.ts
│   │   ├── useHealthCheck.ts    # Health check hook
│   │   └── HealthStatus.tsx     # Dev tools component
│   └── index.ts
```

### Implementation Tasks

#### 3.1 Backend Health Check (`@arcpay/node`)

**File: `src/health/types.ts`**
```typescript
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  latency: number;  // ms
  checks: {
    connection: CheckResult;
    authentication: CheckResult;
    permissions: CheckResult;
    webhooks?: CheckResult;
  };
  environment: 'test' | 'live';
  apiVersion: string;
  sdkVersion: string;
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  details?: Record<string, unknown>;
}

export interface WebhookHealthResult {
  endpointId: string;
  url: string;
  status: 'active' | 'disabled' | 'failing';
  lastDelivery?: Date;
  successRate: number;  // 0-1
  pendingRetries: number;
}
```

**File: `src/health/checks.ts`**
```typescript
import type { ArcPayConfig } from '../types';
import type { CheckResult } from './types';

// Check API connectivity
export async function checkConnection(config: ArcPayConfig): Promise<CheckResult> {
  const start = Date.now();

  try {
    const response = await fetch(`${config.baseUrl || DEFAULT_URL}/health`, {
      headers: { 'Authorization': `Bearer ${config.secretKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return {
        status: 'pass',
        details: { latency: Date.now() - start },
      };
    }

    return {
      status: 'fail',
      message: `API returned ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// Check authentication
export async function checkAuthentication(config: ArcPayConfig): Promise<CheckResult> {
  try {
    const response = await fetch(`${config.baseUrl || DEFAULT_URL}/account`, {
      headers: { 'Authorization': `Bearer ${config.secretKey}` },
    });

    if (response.status === 401) {
      return {
        status: 'fail',
        message: 'Invalid API key',
      };
    }

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'pass',
        details: {
          accountId: data.id,
          environment: config.secretKey.startsWith('sk_test') ? 'test' : 'live',
        },
      };
    }

    return { status: 'fail', message: 'Authentication check failed' };
  } catch (error) {
    return { status: 'fail', message: 'Unable to verify authentication' };
  }
}

// Check permissions
export async function checkPermissions(config: ArcPayConfig): Promise<CheckResult> {
  // Attempt minimal operations to verify permissions
  const permissions: string[] = [];
  const missing: string[] = [];

  // Check read permission
  try {
    await fetch(`${config.baseUrl || DEFAULT_URL}/payments?limit=1`, {
      headers: { 'Authorization': `Bearer ${config.secretKey}` },
    });
    permissions.push('payments:read');
  } catch {
    missing.push('payments:read');
  }

  // Check write permission (dry-run if API supports it)
  // ...

  return {
    status: missing.length === 0 ? 'pass' : 'warn',
    message: missing.length > 0 ? `Missing permissions: ${missing.join(', ')}` : undefined,
    details: { permissions, missing },
  };
}

// Check webhook configuration
export async function checkWebhooks(config: ArcPayConfig): Promise<CheckResult> {
  try {
    const response = await fetch(`${config.baseUrl || DEFAULT_URL}/webhook_endpoints`, {
      headers: { 'Authorization': `Bearer ${config.secretKey}` },
    });

    if (!response.ok) {
      return { status: 'warn', message: 'Unable to check webhooks' };
    }

    const { data: endpoints } = await response.json();

    if (endpoints.length === 0) {
      return {
        status: 'warn',
        message: 'No webhook endpoints configured',
        details: { endpoints: [] },
      };
    }

    const failingEndpoints = endpoints.filter((ep: any) => ep.status === 'failing');

    return {
      status: failingEndpoints.length > 0 ? 'warn' : 'pass',
      message: failingEndpoints.length > 0
        ? `${failingEndpoints.length} endpoint(s) failing`
        : undefined,
      details: {
        total: endpoints.length,
        active: endpoints.filter((ep: any) => ep.status === 'active').length,
        failing: failingEndpoints.length,
      },
    };
  } catch {
    return { status: 'warn', message: 'Unable to check webhooks' };
  }
}
```

**File: `src/health/index.ts`**
```typescript
import type { ArcPayConfig } from '../types';
import type { HealthCheckResult, WebhookHealthResult } from './types';
import {
  checkConnection,
  checkAuthentication,
  checkPermissions,
  checkWebhooks,
} from './checks';

export async function performHealthCheck(
  config: ArcPayConfig
): Promise<HealthCheckResult> {
  const start = Date.now();

  // Run checks in parallel
  const [connection, authentication, permissions, webhooks] = await Promise.all([
    checkConnection(config),
    checkAuthentication(config),
    checkPermissions(config),
    checkWebhooks(config),
  ]);

  // Determine overall status
  const allChecks = [connection, authentication, permissions, webhooks];
  const hasFail = allChecks.some((c) => c.status === 'fail');
  const hasWarn = allChecks.some((c) => c.status === 'warn');

  return {
    status: hasFail ? 'unhealthy' : hasWarn ? 'degraded' : 'healthy',
    timestamp: new Date(),
    latency: Date.now() - start,
    checks: { connection, authentication, permissions, webhooks },
    environment: config.secretKey.startsWith('sk_test') ? 'test' : 'live',
    apiVersion: config.apiVersion || 'latest',
    sdkVersion: SDK_VERSION,
  };
}

export type { HealthCheckResult, CheckResult, WebhookHealthResult } from './types';
```

**Add to `src/client.ts`**
```typescript
import { performHealthCheck, type HealthCheckResult } from './health';

export class ArcPayServer {
  // ... existing code ...

  /**
   * Perform a health check to validate SDK configuration
   *
   * @example
   * const health = await arcpay.healthCheck();
   * if (health.status === 'unhealthy') {
   *   console.error('ArcPay configuration issues:', health.checks);
   * }
   */
  async healthCheck(): Promise<HealthCheckResult> {
    return performHealthCheck(this.config);
  }

  /**
   * Quick connectivity test
   */
  async ping(): Promise<{ ok: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.payments.list({ limit: 1 });
      return { ok: true, latency: Date.now() - start };
    } catch {
      return { ok: false, latency: Date.now() - start };
    }
  }
}
```

#### 3.2 React Health Check (`@arcpay/react`)

**File: `src/health/useHealthCheck.ts`**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useArcPay } from '../providers';
import { useWallet } from '../hooks/useWallet';

export interface ReactHealthStatus {
  // Provider status
  providerConfigured: boolean;
  providerError?: string;

  // Wallet status
  walletConnected: boolean;
  walletAddress?: string;
  networkCorrect: boolean;
  expectedNetwork?: string;
  actualNetwork?: string;

  // API status
  apiReachable: boolean;
  apiLatency?: number;
  apiError?: string;

  // Overall
  status: 'ready' | 'partial' | 'error';
  issues: HealthIssue[];
}

export interface HealthIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  docsUrl?: string;
}

export function useHealthCheck(): ReactHealthStatus & {
  refresh: () => Promise<void>;
  isChecking: boolean;
} {
  const [status, setStatus] = useState<ReactHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const arcpay = useArcPay();
  const wallet = useWallet();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const issues: HealthIssue[] = [];

    // Check provider
    const providerConfigured = !!arcpay;
    if (!providerConfigured) {
      issues.push({
        code: 'PROVIDER_MISSING',
        message: 'ArcPayProvider not found in component tree',
        severity: 'error',
        docsUrl: 'https://docs.arcpay.io/react/setup',
      });
    }

    // Check wallet
    const walletConnected = wallet.isConnected;
    if (!walletConnected) {
      issues.push({
        code: 'WALLET_DISCONNECTED',
        message: 'No wallet connected',
        severity: 'info',
      });
    }

    // Check network
    let networkCorrect = true;
    if (walletConnected && arcpay?.config.network) {
      networkCorrect = wallet.chainId === arcpay.config.expectedChainId;
      if (!networkCorrect) {
        issues.push({
          code: 'WRONG_NETWORK',
          message: `Connected to wrong network. Expected ${arcpay.config.network}`,
          severity: 'warning',
          docsUrl: 'https://docs.arcpay.io/react/networks',
        });
      }
    }

    // Check API
    let apiReachable = false;
    let apiLatency: number | undefined;
    try {
      const start = Date.now();
      await fetch(`${arcpay?.config.apiUrl}/health`);
      apiReachable = true;
      apiLatency = Date.now() - start;
    } catch (error) {
      issues.push({
        code: 'API_UNREACHABLE',
        message: 'Cannot reach ArcPay API',
        severity: 'error',
      });
    }

    // Determine overall status
    const hasError = issues.some((i) => i.severity === 'error');
    const hasWarning = issues.some((i) => i.severity === 'warning');

    setStatus({
      providerConfigured,
      walletConnected,
      walletAddress: wallet.address,
      networkCorrect,
      apiReachable,
      apiLatency,
      status: hasError ? 'error' : hasWarning ? 'partial' : 'ready',
      issues,
    });

    setIsChecking(false);
  }, [arcpay, wallet]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...(status || {
      providerConfigured: false,
      walletConnected: false,
      networkCorrect: false,
      apiReachable: false,
      status: 'error' as const,
      issues: [],
    }),
    refresh: checkHealth,
    isChecking,
  };
}
```

**File: `src/health/HealthStatus.tsx`**
```typescript
'use client';

import { useHealthCheck } from './useHealthCheck';

interface HealthStatusProps {
  showDetails?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Developer tools component showing SDK health status
 *
 * Only renders in development mode by default.
 *
 * @example
 * <ArcPayProvider>
 *   <App />
 *   {process.env.NODE_ENV === 'development' && <HealthStatus />}
 * </ArcPayProvider>
 */
export function HealthStatus({
  showDetails = true,
  position = 'bottom-right'
}: HealthStatusProps) {
  const health = useHealthCheck();
  const [expanded, setExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const statusColors = {
    ready: 'bg-green-500',
    partial: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Collapsed indicator */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
          bg-white border border-zinc-200 hover:bg-zinc-50
          text-sm font-medium
        `}
      >
        <span className={`w-2 h-2 rounded-full ${statusColors[health.status]}`} />
        <span>ArcPay</span>
        {health.issues.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
            {health.issues.length}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {expanded && showDetails && (
        <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-lg shadow-xl border p-4">
          <h3 className="font-semibold mb-3">ArcPay SDK Status</h3>

          {/* Checklist */}
          <div className="space-y-2 mb-4">
            <CheckItem
              label="Provider Configured"
              status={health.providerConfigured ? 'pass' : 'fail'}
            />
            <CheckItem
              label="Wallet Connected"
              status={health.walletConnected ? 'pass' : 'info'}
              detail={health.walletAddress?.slice(0, 10) + '...'}
            />
            <CheckItem
              label="Correct Network"
              status={health.networkCorrect ? 'pass' : 'warn'}
            />
            <CheckItem
              label="API Reachable"
              status={health.apiReachable ? 'pass' : 'fail'}
              detail={health.apiLatency ? `${health.apiLatency}ms` : undefined}
            />
          </div>

          {/* Issues */}
          {health.issues.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Issues</h4>
              <div className="space-y-2">
                {health.issues.map((issue, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center gap-1">
                      <IssueIcon severity={issue.severity} />
                      <span>{issue.message}</span>
                    </div>
                    {issue.docsUrl && (
                      <a
                        href={issue.docsUrl}
                        target="_blank"
                        className="text-blue-600 text-xs hover:underline ml-4"
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={() => health.refresh()}
            disabled={health.isChecking}
            className="mt-3 w-full py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded"
          >
            {health.isChecking ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, status, detail }: {
  label: string;
  status: 'pass' | 'fail' | 'warn' | 'info';
  detail?: string;
}) {
  const icons = {
    pass: '✓',
    fail: '✗',
    warn: '⚠',
    info: 'ℹ',
  };

  const colors = {
    pass: 'text-green-600',
    fail: 'text-red-600',
    warn: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={colors[status]}>{icons[status]}</span>
        <span>{label}</span>
      </div>
      {detail && <span className="text-zinc-400 text-xs">{detail}</span>}
    </div>
  );
}
```

---

## Implementation Order

### Phase 1: Testing Utilities (Foundation)
1. Create `@arcpay/node/testing` with fixtures and MockArcPayServer
2. Create `@arcpay/react/testing` with MockProvider and TestWrapper
3. Update package.json exports for both packages
4. Write documentation with usage examples

### Phase 2: Health Check (Quick Win)
1. Add health check module to `@arcpay/node`
2. Add healthCheck() method to ArcPayServer client
3. Create useHealthCheck hook for React
4. Create HealthStatus dev tools component

### Phase 3: Interactive Sandbox (Full Experience)
1. Create sandbox layout and navigation
2. Build Payment Playground page
3. Build Subscription Playground page
4. Create Webhook Tester with signature verification
5. Create Component Gallery with live preview
6. Build API Explorer with code generation
7. Create mock API routes

---

## File Summary

### New Files to Create

**@arcpay/node:**
- `src/testing/index.ts`
- `src/testing/fixtures.ts`
- `src/testing/MockArcPayServer.ts`
- `src/testing/webhooks.ts`
- `src/testing/scenarios.ts`
- `src/testing/types.ts`
- `src/health/index.ts`
- `src/health/checks.ts`
- `src/health/types.ts`

**@arcpay/react:**
- `src/testing/index.ts`
- `src/testing/MockProvider.tsx`
- `src/testing/TestWrapper.tsx`
- `src/testing/fixtures.ts`
- `src/testing/scenarios.ts`
- `src/health/index.ts`
- `src/health/useHealthCheck.ts`
- `src/health/HealthStatus.tsx`

**test/ (Sandbox):**
- `src/app/sandbox/layout.tsx`
- `src/app/sandbox/page.tsx`
- `src/app/sandbox/payments/page.tsx`
- `src/app/sandbox/subscriptions/page.tsx`
- `src/app/sandbox/webhooks/page.tsx`
- `src/app/sandbox/components/page.tsx`
- `src/app/sandbox/api-explorer/page.tsx`
- `src/app/api/sandbox/mock/[...path]/route.ts`
- `src/sandbox/components/*.tsx` (8+ components)
- `src/sandbox/hooks/*.ts` (3+ hooks)
- `src/sandbox/lib/*.ts` (3+ utilities)
- `src/sandbox/store/sandboxStore.ts`

### Files to Modify

- `@arcpay/node/package.json` - Add testing export
- `@arcpay/node/tsup.config.ts` - Add testing entry
- `@arcpay/node/src/client.ts` - Add healthCheck method
- `@arcpay/node/src/index.ts` - Re-export health types
- `@arcpay/react/package.json` - Add testing export
- `@arcpay/react/rollup.config.js` - Add testing entry
- `@arcpay/react/src/index.ts` - Export health components
- `test/package.json` - Add @arcpay/node dependency
