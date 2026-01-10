/**
 * Mock ArcPay Server for testing
 *
 * Simulates API responses without making real network requests.
 *
 * @example
 * ```typescript
 * import { MockArcPayServer, createPayment } from '@arcpay/node/testing';
 *
 * const mock = new MockArcPayServer();
 *
 * // Configure mock responses
 * mock.payments.create.returns(createPayment({ status: 'completed' }));
 *
 * // Use in tests
 * const payment = await paymentService.processOrder(order);
 * expect(mock.getCalls('payments.create')).toHaveLength(1);
 * ```
 */

import type {
  Payment,
  PaymentIntent,
  PaymentLink,
  SubscriptionPlan,
  Subscription,
  Customer,
  WebhookEndpoint,
  PaginatedList,
} from '../types';
import type { MockBehavior, CallRecord, MockServerConfig } from './types';
import {
  createPayment,
  createPaymentIntent,
  createPaymentLink,
  createPlan,
  createSubscription,
  createCustomer,
  createPaginatedList,
} from './fixtures';

type MockMethod<T> = {
  returns(value: T): void;
  throws(error: Error): void;
  delays(ms: number): void;
  sequence(values: T[]): void;
  reset(): void;
  _behavior: MockBehavior<T>;
  _callIndex: number;
};

function createMockMethod<T>(defaultValue: () => T): MockMethod<T> {
  const method: MockMethod<T> = {
    _behavior: {},
    _callIndex: 0,
    returns(value: T) {
      this._behavior.returns = value;
    },
    throws(error: Error) {
      this._behavior.throws = error;
    },
    delays(ms: number) {
      this._behavior.delay = ms;
    },
    sequence(values: T[]) {
      this._behavior.sequence = values;
    },
    reset() {
      this._behavior = {};
      this._callIndex = 0;
    },
  };
  return method;
}

async function executeMock<T>(
  method: MockMethod<T>,
  defaultValue: () => T,
  delay?: number
): Promise<T> {
  const behavior = method._behavior;

  // Apply delay
  if (behavior.delay || delay) {
    await new Promise((r) => setTimeout(r, behavior.delay || delay || 0));
  }

  // Throw if configured
  if (behavior.throws) {
    throw behavior.throws;
  }

  // Return sequence value
  if (behavior.sequence && behavior.sequence.length > 0) {
    const value = behavior.sequence[method._callIndex % behavior.sequence.length];
    method._callIndex++;
    return value;
  }

  // Return configured value or default
  return behavior.returns !== undefined ? behavior.returns : defaultValue();
}

class MockPaymentsResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<Payment>(() => createPayment());
  retrieve = createMockMethod<Payment>(() => createPayment());
  list = createMockMethod<PaginatedList<Payment>>(() => createPaginatedList([createPayment()]));
  cancel = createMockMethod<Payment>(() => createPayment({ status: 'canceled' }));
  refund = createMockMethod<Payment>(() => createPayment({ status: 'refunded' }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  async _create(params: unknown): Promise<Payment> {
    this.calls.push({ method: 'create', args: [params], timestamp: new Date() });
    return executeMock(this.create, () => createPayment(params as Partial<Payment>), this.defaultDelay);
  }

  async _retrieve(id: string): Promise<Payment> {
    this.calls.push({ method: 'retrieve', args: [id], timestamp: new Date() });
    return executeMock(this.retrieve, () => createPayment({ id }), this.defaultDelay);
  }

  async _list(params?: unknown): Promise<PaginatedList<Payment>> {
    this.calls.push({ method: 'list', args: [params], timestamp: new Date() });
    return executeMock(this.list, () => createPaginatedList([createPayment()]), this.defaultDelay);
  }

  async _cancel(id: string): Promise<Payment> {
    this.calls.push({ method: 'cancel', args: [id], timestamp: new Date() });
    return executeMock(this.cancel, () => createPayment({ id, status: 'canceled' }), this.defaultDelay);
  }

  async _refund(id: string, params?: unknown): Promise<Payment> {
    this.calls.push({ method: 'refund', args: [id, params], timestamp: new Date() });
    return executeMock(this.refund, () => createPayment({ id, status: 'refunded' }), this.defaultDelay);
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.list.reset();
    this.cancel.reset();
    this.refund.reset();
  }
}

class MockPaymentIntentsResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<PaymentIntent>(() => createPaymentIntent());
  retrieve = createMockMethod<PaymentIntent>(() => createPaymentIntent());
  confirm = createMockMethod<PaymentIntent>(() => createPaymentIntent({ status: 'succeeded' }));
  cancel = createMockMethod<PaymentIntent>(() => createPaymentIntent({ status: 'canceled' }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  async _create(params: unknown): Promise<PaymentIntent> {
    this.calls.push({ method: 'create', args: [params], timestamp: new Date() });
    return executeMock(this.create, () => createPaymentIntent(params as Partial<PaymentIntent>), this.defaultDelay);
  }

  async _retrieve(id: string): Promise<PaymentIntent> {
    this.calls.push({ method: 'retrieve', args: [id], timestamp: new Date() });
    return executeMock(this.retrieve, () => createPaymentIntent({ id }), this.defaultDelay);
  }

  async _confirm(id: string, params?: unknown): Promise<PaymentIntent> {
    this.calls.push({ method: 'confirm', args: [id, params], timestamp: new Date() });
    return executeMock(this.confirm, () => createPaymentIntent({ id, status: 'succeeded' }), this.defaultDelay);
  }

  async _cancel(id: string): Promise<PaymentIntent> {
    this.calls.push({ method: 'cancel', args: [id], timestamp: new Date() });
    return executeMock(this.cancel, () => createPaymentIntent({ id, status: 'canceled' }), this.defaultDelay);
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.confirm.reset();
    this.cancel.reset();
  }
}

class MockPaymentLinksResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<PaymentLink>(() => createPaymentLink());
  retrieve = createMockMethod<PaymentLink>(() => createPaymentLink());
  list = createMockMethod<PaginatedList<PaymentLink>>(() => createPaginatedList([createPaymentLink()]));
  update = createMockMethod<PaymentLink>(() => createPaymentLink());
  deactivate = createMockMethod<PaymentLink>(() => createPaymentLink({ active: false }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.list.reset();
    this.update.reset();
    this.deactivate.reset();
  }
}

class MockPlansResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<SubscriptionPlan>(() => createPlan());
  retrieve = createMockMethod<SubscriptionPlan>(() => createPlan());
  list = createMockMethod<PaginatedList<SubscriptionPlan>>(() => createPaginatedList([createPlan()]));
  update = createMockMethod<SubscriptionPlan>(() => createPlan());
  archive = createMockMethod<SubscriptionPlan>(() => createPlan({ active: false }));
  delete = createMockMethod<{ deleted: boolean; id: string }>(() => ({ deleted: true, id: 'plan_123' }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.list.reset();
    this.update.reset();
    this.archive.reset();
    this.delete.reset();
  }
}

class MockSubscriptionsResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<Subscription>(() => createSubscription());
  retrieve = createMockMethod<Subscription>(() => createSubscription());
  list = createMockMethod<PaginatedList<Subscription>>(() => createPaginatedList([createSubscription()]));
  update = createMockMethod<Subscription>(() => createSubscription());
  cancel = createMockMethod<Subscription>(() => createSubscription({ status: 'canceled' }));
  pause = createMockMethod<Subscription>(() => createSubscription({ status: 'paused' }));
  resume = createMockMethod<Subscription>(() => createSubscription({ status: 'active' }));
  reactivate = createMockMethod<Subscription>(() => createSubscription({ status: 'active' }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.list.reset();
    this.update.reset();
    this.cancel.reset();
    this.pause.reset();
    this.resume.reset();
    this.reactivate.reset();
  }
}

class MockCustomersResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<Customer>(() => createCustomer());
  retrieve = createMockMethod<Customer>(() => createCustomer());
  retrieveByWallet = createMockMethod<Customer>(() => createCustomer());
  list = createMockMethod<PaginatedList<Customer>>(() => createPaginatedList([createCustomer()]));
  update = createMockMethod<Customer>(() => createCustomer());
  delete = createMockMethod<{ deleted: boolean; id: string }>(() => ({ deleted: true, id: 'cus_123' }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.retrieveByWallet.reset();
    this.list.reset();
    this.update.reset();
    this.delete.reset();
  }
}

class MockWebhooksResource {
  private calls: CallRecord[] = [];
  private defaultDelay?: number;

  create = createMockMethod<WebhookEndpoint>(() => ({
    id: 'we_123',
    url: 'https://example.com/webhooks',
    enabledEvents: ['*'],
    active: true,
    secret: 'whsec_test_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  retrieve = createMockMethod<WebhookEndpoint>(() => ({
    id: 'we_123',
    url: 'https://example.com/webhooks',
    enabledEvents: ['*'],
    active: true,
    secret: 'whsec_test_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  list = createMockMethod<PaginatedList<WebhookEndpoint>>(() => createPaginatedList([]));
  update = createMockMethod<WebhookEndpoint>(() => ({
    id: 'we_123',
    url: 'https://example.com/webhooks',
    enabledEvents: ['*'],
    active: true,
    secret: 'whsec_test_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  delete = createMockMethod<{ deleted: boolean; id: string }>(() => ({ deleted: true, id: 'we_123' }));
  rotateSecret = createMockMethod<WebhookEndpoint>(() => ({
    id: 'we_123',
    url: 'https://example.com/webhooks',
    enabledEvents: ['*'],
    active: true,
    secret: 'whsec_new_secret_456',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  constructor(config?: MockServerConfig) {
    this.defaultDelay = config?.defaultDelay;
  }

  getCalls(): CallRecord[] {
    return this.calls;
  }

  reset(): void {
    this.calls = [];
    this.create.reset();
    this.retrieve.reset();
    this.list.reset();
    this.update.reset();
    this.delete.reset();
    this.rotateSecret.reset();
  }
}

/**
 * Mock ArcPay Server for testing
 *
 * Provides mock implementations of all API resources that can be
 * configured to return specific values, throw errors, or simulate delays.
 */
export class MockArcPayServer {
  readonly payments: MockPaymentsResource;
  readonly paymentIntents: MockPaymentIntentsResource;
  readonly paymentLinks: MockPaymentLinksResource;
  readonly plans: MockPlansResource;
  readonly subscriptions: MockSubscriptionsResource;
  readonly customers: MockCustomersResource;
  readonly webhooks: MockWebhooksResource;

  private allCalls: CallRecord[] = [];
  private config: MockServerConfig;

  constructor(config?: MockServerConfig) {
    this.config = config || {};
    this.payments = new MockPaymentsResource(config);
    this.paymentIntents = new MockPaymentIntentsResource(config);
    this.paymentLinks = new MockPaymentLinksResource(config);
    this.plans = new MockPlansResource(config);
    this.subscriptions = new MockSubscriptionsResource(config);
    this.customers = new MockCustomersResource(config);
    this.webhooks = new MockWebhooksResource(config);
  }

  /**
   * Get all recorded calls across all resources
   */
  getAllCalls(): CallRecord[] {
    return [
      ...this.payments.getCalls(),
      ...this.paymentIntents.getCalls(),
      ...this.paymentLinks.getCalls(),
      ...this.plans.getCalls(),
      ...this.subscriptions.getCalls(),
      ...this.customers.getCalls(),
      ...this.webhooks.getCalls(),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get calls for a specific resource and method
   */
  getCalls(path: string): CallRecord[] {
    const [resource, method] = path.split('.');
    const resourceMap: Record<string, { getCalls(): CallRecord[] }> = {
      payments: this.payments,
      paymentIntents: this.paymentIntents,
      paymentLinks: this.paymentLinks,
      plans: this.plans,
      subscriptions: this.subscriptions,
      customers: this.customers,
      webhooks: this.webhooks,
    };

    const resourceInstance = resourceMap[resource];
    if (!resourceInstance) {
      return [];
    }

    const calls = resourceInstance.getCalls();
    if (method) {
      return calls.filter((c) => c.method === method);
    }
    return calls;
  }

  /**
   * Reset all mocks and call records
   */
  reset(): void {
    this.payments.reset();
    this.paymentIntents.reset();
    this.paymentLinks.reset();
    this.plans.reset();
    this.subscriptions.reset();
    this.customers.reset();
    this.webhooks.reset();
    this.allCalls = [];
  }

  /**
   * Assert that a specific call was made
   */
  assertCalled(path: string, times?: number): void {
    const calls = this.getCalls(path);
    if (times !== undefined && calls.length !== times) {
      throw new Error(
        `Expected ${path} to be called ${times} times, but was called ${calls.length} times`
      );
    }
    if (calls.length === 0) {
      throw new Error(`Expected ${path} to be called, but it was not`);
    }
  }

  /**
   * Assert that a specific call was NOT made
   */
  assertNotCalled(path: string): void {
    const calls = this.getCalls(path);
    if (calls.length > 0) {
      throw new Error(
        `Expected ${path} not to be called, but it was called ${calls.length} times`
      );
    }
  }
}
