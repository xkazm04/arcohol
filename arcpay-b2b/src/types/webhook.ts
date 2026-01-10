/**
 * Webhook Types
 * Unified webhook handling for all B2B events
 */

import type { CreditEventType } from './credit';
import type { DisputeEventType } from './dispute';
import type { GatewayEventType } from './gateway';
import type { TreasuryEventType } from './treasury';

// ============================================================================
// Webhook Event
// ============================================================================

export type WebhookEventType =
  | CreditEventType
  | DisputeEventType
  | GatewayEventType
  | TreasuryEventType;

export interface WebhookEvent<T = Record<string, unknown>> {
  /** Event ID */
  id: string;
  /** Event type */
  type: WebhookEventType;
  /** API version */
  apiVersion: string;
  /** Event timestamp */
  createdAt: Date;
  /** Event data */
  data: T;
  /** Request metadata */
  request?: {
    idempotencyKey?: string;
  };
}

// ============================================================================
// Webhook Endpoint
// ============================================================================

export interface WebhookEndpoint {
  /** Endpoint ID */
  id: string;
  /** Endpoint URL */
  url: string;
  /** Webhook secret */
  secret: string;
  /** Enabled event types (empty = all) */
  enabledEvents: WebhookEventType[];
  /** Endpoint status */
  status: WebhookEndpointStatus;
  /** Description */
  description?: string;
  /** Created at */
  createdAt: Date;
  /** Updated at */
  updatedAt: Date;
}

export type WebhookEndpointStatus = 'enabled' | 'disabled';

export interface CreateWebhookEndpointParams {
  /** Endpoint URL */
  url: string;
  /** Enabled event types (empty = all) */
  enabledEvents?: WebhookEventType[];
  /** Description */
  description?: string;
}

export interface UpdateWebhookEndpointParams {
  /** Endpoint URL */
  url?: string;
  /** Enabled event types */
  enabledEvents?: WebhookEventType[];
  /** Status */
  status?: WebhookEndpointStatus;
  /** Description */
  description?: string;
}

// ============================================================================
// Webhook Delivery
// ============================================================================

export interface WebhookDelivery {
  /** Delivery ID */
  id: string;
  /** Event ID */
  eventId: string;
  /** Endpoint ID */
  endpointId: string;
  /** Delivery status */
  status: WebhookDeliveryStatus;
  /** HTTP status code */
  httpStatus?: number;
  /** Response body (truncated) */
  responseBody?: string;
  /** Error message (if failed) */
  errorMessage?: string;
  /** Attempt number */
  attemptNumber: number;
  /** Next retry time */
  nextRetryAt?: Date;
  /** Delivered at */
  deliveredAt?: Date;
  /** Created at */
  createdAt: Date;
}

export type WebhookDeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'retrying';

// ============================================================================
// Webhook Signature
// ============================================================================

export interface WebhookSignatureHeader {
  /** Timestamp */
  timestamp: number;
  /** Signature */
  signature: string;
}

export interface VerifyWebhookParams {
  /** Raw request body */
  payload: string | Buffer;
  /** Signature header value */
  signature: string;
  /** Webhook secret */
  secret: string;
  /** Tolerance in seconds (default: 300 = 5 minutes) */
  tolerance?: number;
}

// ============================================================================
// Webhook Handler Types
// ============================================================================

export type WebhookHandler<T = Record<string, unknown>> = (
  event: WebhookEvent<T>
) => Promise<void> | void;

export type WebhookHandlers = {
  [K in WebhookEventType]?: WebhookHandler;
};
