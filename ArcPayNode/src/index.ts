/**
 * @arcpay/node - ArcPay Server SDK for Node.js
 *
 * A complete SDK for building crypto payment integrations
 * with the ArcPay platform.
 *
 * @example
 * ```typescript
 * import ArcPay from '@arcpay/node';
 *
 * const arcpay = new ArcPay('sk_test_...');
 *
 * // Create a payment
 * const payment = await arcpay.payments.create({
 *   amount: '100.00',
 *   currency: 'USDC',
 *   recipient: '0x...',
 *   description: 'Order #1234'
 * });
 *
 * // Create a subscription
 * const subscription = await arcpay.subscriptions.create({
 *   planId: 'plan_...',
 *   customerWallet: '0x...'
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { ArcPayServer, ArcPayServer as default } from './client';

// Type exports
export type {
  // Common
  PaginationParams,
  PaginatedList,
  ArcPayConfig,
  ApiResponse,
  ApiError,
  Currency,
  PaymentStatus,
  Metadata,
  Timestamps,
  // Payments
  Payment,
  CreatePaymentParams,
  ListPaymentsParams,
  PaymentIntent,
  PaymentIntentStatus,
  CreatePaymentIntentParams,
  PaymentLink,
  CreatePaymentLinkParams,
  UpdatePaymentLinkParams,
  ListPaymentLinksParams,
  // Subscriptions
  SubscriptionPlan,
  SubscriptionInterval,
  CreatePlanParams,
  UpdatePlanParams,
  ListPlansParams,
  Subscription,
  SubscriptionStatus,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  ListSubscriptionsParams,
  CancelSubscriptionParams,
  PauseSubscriptionParams,
  SubscriptionEvent,
  SubscriptionEventType,
  SubscriptionInvoice,
  InvoiceStatus,
  // Customers
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
  ListCustomersParams,
  CustomerPortalSession,
  CreatePortalSessionParams,
  // Webhooks
  WebhookEvent,
  WebhookEventType,
  PaymentEvent,
  PaymentLinkEvent,
  SubscriptionWebhookEvent,
  PlanEvent,
  InvoiceEvent,
  CustomerEvent,
  WebhookEndpoint,
  CreateWebhookEndpointParams,
  UpdateWebhookEndpointParams,
  WebhookSignatureParams,
} from './types';

// Error classes
export {
  ArcPayError,
  AuthenticationError,
  InvalidRequestError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from './utils/errors';

// Health check types
export type {
  HealthCheckReport,
  HealthCheckOptions,
  CheckResult,
} from './utils/healthCheck';

// Webhook utilities
export { Webhook } from './resources/webhooks';
export { WebhookSignatureError } from './utils/crypto';

// Resource classes (for advanced usage)
export { PaymentsResource } from './resources/payments';
export { PaymentIntentsResource } from './resources/paymentIntents';
export { PaymentLinksResource } from './resources/paymentLinks';
export { PlansResource } from './resources/plans';
export { SubscriptionsResource } from './resources/subscriptions';
export { CustomersResource } from './resources/customers';
export { WebhooksResource } from './resources/webhooks';
