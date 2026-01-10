/**
 * @arcpay/node/testing - Testing utilities for ArcPay Node SDK
 *
 * This module provides tools for testing your ArcPay integration
 * without making real API calls.
 *
 * @example
 * ```typescript
 * import {
 *   MockArcPayServer,
 *   createPayment,
 *   createSubscription,
 *   createSignedWebhookRequest,
 *   PaymentScenarios,
 * } from '@arcpay/node/testing';
 *
 * // Mock API responses
 * const mock = new MockArcPayServer();
 * mock.payments.create.returns(createPayment({ status: 'completed' }));
 *
 * // Test webhook handlers
 * const event = createWebhookEvent('payment.completed', payment);
 * const { body, headers } = createSignedWebhookRequest(event, 'whsec_...');
 *
 * // Use pre-built scenarios
 * const scenario = PaymentScenarios.successfulPayment();
 * ```
 *
 * @packageDocumentation
 */

// Mock server
export { MockArcPayServer } from './MockArcPayServer';

// Fixtures
export {
  // Seed management
  setSeed,
  resetSeed,
  // Single entity factories
  createPayment,
  createPayments,
  createPaymentIntent,
  createPaymentLink,
  createPlan,
  createPlans,
  createSubscription,
  createInvoice,
  createCustomer,
  createWebhookEvent,
  createPaginatedList,
  // Flow factories
  createPaymentFlow,
  createSubscriptionFlow,
} from './fixtures';

// Webhook utilities
export {
  generateSignature,
  createSignedWebhookRequest,
  createExpressMocks,
  createNextjsRequest,
  simulateWebhookDelivery,
  verifyTestSignature,
  createWebhookEventBatch,
  SIGNATURE_HEADER,
} from './webhooks';

// Scenarios
export {
  PaymentScenarios,
  SubscriptionScenarios,
  CustomerScenarios,
} from './scenarios';

// Types
export type {
  MockBehavior,
  CallRecord,
  MockServerConfig,
  MockResourceConfig,
  FixtureOptions,
  MockWebhookRequest,
  MockExpressRequest,
  MockExpressResponse,
} from './types';
