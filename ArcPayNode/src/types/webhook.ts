/**
 * Webhook related types
 */

import type { Payment, PaymentLink } from './payment';
import type { Subscription, SubscriptionPlan, SubscriptionInvoice } from './subscription';
import type { Customer } from './customer';

export interface WebhookEvent<T = unknown> {
  id: string;
  type: WebhookEventType;
  data: T;
  apiVersion: string;
  createdAt: Date;
  livemode: boolean;
}

export type WebhookEventType =
  // Payment events
  | 'payment.initiated'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.canceled'
  | 'payment.refunded'
  // Payment link events
  | 'payment_link.created'
  | 'payment_link.updated'
  | 'payment_link.completed'
  | 'payment_link.expired'
  // Subscription events
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.trial_started'
  | 'subscription.trial_ended'
  | 'subscription.renewed'
  | 'subscription.payment_succeeded'
  | 'subscription.payment_failed'
  | 'subscription.past_due'
  | 'subscription.canceled'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'subscription.expired'
  // Plan events
  | 'plan.created'
  | 'plan.updated'
  | 'plan.deleted'
  // Invoice events
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.voided'
  // Customer events
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted';

// Event data types
export type PaymentEvent = WebhookEvent<Payment>;
export type PaymentLinkEvent = WebhookEvent<PaymentLink>;
export type SubscriptionEvent = WebhookEvent<Subscription>;
export type PlanEvent = WebhookEvent<SubscriptionPlan>;
export type InvoiceEvent = WebhookEvent<SubscriptionInvoice>;
export type CustomerEvent = WebhookEvent<Customer>;

// Webhook endpoint configuration
export interface WebhookEndpoint {
  id: string;
  url: string;
  enabledEvents: WebhookEventType[] | ['*'];
  secret: string;
  active: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebhookEndpointParams {
  url: string;
  enabledEvents: WebhookEventType[] | ['*'];
  description?: string;
}

export interface UpdateWebhookEndpointParams {
  url?: string;
  enabledEvents?: WebhookEventType[] | ['*'];
  active?: boolean;
  description?: string;
}

// Webhook signature verification
export interface WebhookSignatureParams {
  payload: string | Buffer;
  signature: string;
  secret: string;
  tolerance?: number; // Timestamp tolerance in seconds
}
