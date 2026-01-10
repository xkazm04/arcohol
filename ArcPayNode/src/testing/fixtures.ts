/**
 * Test fixtures and data factories
 *
 * Create realistic test data for unit and integration tests.
 *
 * @example
 * ```typescript
 * import { createPayment, createSubscription } from '@arcpay/node/testing';
 *
 * const payment = createPayment({ amount: '100.00', status: 'completed' });
 * const subscription = createSubscription({ status: 'active' });
 * ```
 */

import type {
  Payment,
  PaymentIntent,
  PaymentLink,
  SubscriptionPlan,
  Subscription,
  SubscriptionInvoice,
  Customer,
  WebhookEvent,
  WebhookEventType,
  PaginatedList,
} from '../types';

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  string(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      chars[Math.floor(this.next() * chars.length)]
    ).join('');
  }

  hex(length: number = 40): string {
    return Array.from({ length }, () =>
      Math.floor(this.next() * 16).toString(16)
    ).join('');
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

let globalRandom = new SeededRandom();

/**
 * Set seed for reproducible test data
 */
export function setSeed(seed: number): void {
  globalRandom = new SeededRandom(seed);
}

/**
 * Reset to random seed
 */
export function resetSeed(): void {
  globalRandom = new SeededRandom();
}

// ID generators
const generateId = (prefix: string) => `${prefix}_${globalRandom.string(24)}`;
const generateAddress = () => `0x${globalRandom.hex(40)}`;
const generateTxHash = () => `0x${globalRandom.hex(64)}`;

/**
 * Create a mock Payment
 */
export function createPayment(overrides?: Partial<Payment>): Payment {
  const id = generateId('pay');
  const now = new Date();

  return {
    id,
    amount: '100.00',
    currency: 'USDC',
    status: 'pending',
    recipient: generateAddress(),
    sender: generateAddress(),
    description: 'Test payment',
    txHash: overrides?.status === 'completed' ? generateTxHash() : undefined,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple mock Payments
 */
export function createPayments(count: number, overrides?: Partial<Payment>): Payment[] {
  return Array.from({ length: count }, () => createPayment(overrides));
}

/**
 * Create a mock PaymentIntent
 */
export function createPaymentIntent(overrides?: Partial<PaymentIntent>): PaymentIntent {
  const id = generateId('pi');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  return {
    id,
    amount: '100.00',
    currency: 'USDC',
    status: 'requires_payment_method',
    recipient: generateAddress(),
    description: 'Test payment intent',
    clientSecret: `${id}_secret_${globalRandom.string(32)}`,
    expiresAt,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock PaymentLink
 */
export function createPaymentLink(overrides?: Partial<PaymentLink>): PaymentLink {
  const id = generateId('pl');
  const now = new Date();

  return {
    id,
    url: `https://pay.arcpay.io/l/${id}`,
    amount: '50.00',
    currency: 'USDC',
    description: 'A test payment link',
    active: true,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    completedPayments: 0,
    totalCollected: '0.00',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock SubscriptionPlan
 */
export function createPlan(overrides?: Partial<SubscriptionPlan>): SubscriptionPlan {
  const id = generateId('plan');
  const now = new Date();

  return {
    id,
    merchantId: generateId('merch'),
    name: 'Pro Plan',
    description: 'Full access to all features',
    amount: '29.99',
    currency: 'USDC',
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 14,
    active: true,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple mock Plans
 */
export function createPlans(count: number, overrides?: Partial<SubscriptionPlan>): SubscriptionPlan[] {
  const names = ['Starter', 'Pro', 'Business', 'Enterprise'];
  const amounts = ['9.99', '29.99', '99.99', '299.99'];

  return Array.from({ length: count }, (_, i) => createPlan({
    name: names[i % names.length],
    amount: amounts[i % amounts.length],
    ...overrides,
  }));
}

/**
 * Create a mock Subscription
 */
export function createSubscription(overrides?: Partial<Subscription>): Subscription {
  const id = generateId('sub');
  const planId = overrides?.planId || generateId('plan');
  const now = new Date();
  const periodStart = new Date(now);
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return {
    id,
    planId,
    customerId: generateId('cus'),
    customerWallet: generateAddress(),
    merchantWallet: generateAddress(),
    status: 'active',
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    failedPaymentCount: 0,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock SubscriptionInvoice
 */
export function createInvoice(overrides?: Partial<SubscriptionInvoice>): SubscriptionInvoice {
  const id = generateId('inv');
  const now = new Date();

  return {
    id,
    subscriptionId: generateId('sub'),
    customerId: generateId('cus'),
    amount: '29.99',
    currency: 'USDC',
    status: 'paid',
    periodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: now,
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    paidAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock Customer
 */
export function createCustomer(overrides?: Partial<Customer>): Customer {
  const id = generateId('cus');
  const now = new Date();

  return {
    id,
    walletAddress: generateAddress(),
    email: `test-${globalRandom.string(8)}@example.com`,
    name: 'Test Customer',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock WebhookEvent
 */
export function createWebhookEvent<T = unknown>(
  type: WebhookEventType,
  data?: T,
  overrides?: Partial<Omit<WebhookEvent<T>, 'type' | 'data'>>
): WebhookEvent<T> {
  const id = generateId('evt');
  const now = new Date();

  // Generate default data based on event type
  let defaultData: unknown;
  if (!data) {
    if (type.startsWith('payment.') || type.startsWith('payment_')) {
      if (type.startsWith('payment_link.')) {
        defaultData = createPaymentLink();
      } else {
        defaultData = createPayment({
          status: type === 'payment.completed' ? 'completed' : 'pending'
        });
      }
    } else if (type.startsWith('subscription.')) {
      defaultData = createSubscription({
        status: type === 'subscription.canceled' ? 'canceled' : 'active'
      });
    } else if (type.startsWith('invoice.')) {
      defaultData = createInvoice({
        status: type === 'invoice.paid' ? 'paid' : 'open',
      });
    } else if (type.startsWith('customer.')) {
      defaultData = createCustomer();
    } else if (type.startsWith('plan.')) {
      defaultData = createPlan();
    }
  }

  return {
    id,
    type,
    data: (data || defaultData) as T,
    apiVersion: '2024-01-01',
    createdAt: now,
    livemode: false,
    ...overrides,
  };
}

/**
 * Create a paginated list response
 */
export function createPaginatedList<T>(
  items: T[],
  hasMore: boolean = false
): PaginatedList<T> {
  return {
    data: items,
    hasMore,
    totalCount: hasMore ? items.length + 10 : items.length,
  };
}

/**
 * Create a set of related fixtures for a complete payment flow
 */
export function createPaymentFlow() {
  const customer = createCustomer();
  const intent = createPaymentIntent({
    recipient: customer.walletAddress,
    status: 'requires_payment_method',
  });
  const confirmedIntent = {
    ...intent,
    status: 'succeeded' as const,
  };
  const payment = createPayment({
    sender: customer.walletAddress,
    recipient: intent.recipient,
    amount: intent.amount,
    status: 'completed',
  });

  return {
    customer,
    intent,
    confirmedIntent,
    payment,
    webhookEvents: [
      createWebhookEvent('payment.initiated', payment),
      createWebhookEvent('payment.completed', { ...payment, status: 'completed' }),
    ],
  };
}

/**
 * Create a set of related fixtures for a subscription flow
 */
export function createSubscriptionFlow() {
  const customer = createCustomer();
  const plan = createPlan();
  const subscription = createSubscription({
    planId: plan.id,
    customerId: customer.id,
    customerWallet: customer.walletAddress,
    status: 'active',
  });
  const invoice = createInvoice({
    subscriptionId: subscription.id,
    amount: plan.amount,
  });

  return {
    customer,
    plan,
    subscription,
    invoice,
    webhookEvents: [
      createWebhookEvent('subscription.created', subscription),
      createWebhookEvent('invoice.paid', invoice),
      createWebhookEvent('subscription.activated', { ...subscription, status: 'active' }),
    ],
  };
}
