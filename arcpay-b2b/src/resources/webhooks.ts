/**
 * Webhooks Resource
 * Unified webhook handling for all B2B events
 */

import { BaseResource } from './base';
import type {
  ArcPayB2BConfig,
  PaginatedList,
  WebhookEndpoint,
  CreateWebhookEndpointParams,
  UpdateWebhookEndpointParams,
  WebhookDelivery,
  WebhookEvent,
  WebhookEventType,
  WebhookHandlers,
} from '../types';
import { validateString, validateUrl } from '../utils/validation';
import { verifySignature, generateSignatureHeader } from '../utils/crypto';
import { WebhookSignatureError } from '../utils/errors';

export class WebhooksResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  // ==========================================================================
  // Webhook Endpoint Management
  // ==========================================================================

  /**
   * Create a webhook endpoint
   */
  async createEndpoint(
    params: CreateWebhookEndpointParams
  ): Promise<WebhookEndpoint> {
    validateUrl(params.url, 'url');

    return this.request<WebhookEndpoint>({
      method: 'POST',
      path: '/webhook-endpoints',
      body: params,
    });
  }

  /**
   * Get a webhook endpoint
   */
  async getEndpoint(endpointId: string): Promise<WebhookEndpoint> {
    validateString(endpointId, 'endpointId');

    return this.request<WebhookEndpoint>({
      method: 'GET',
      path: `/webhook-endpoints/${endpointId}`,
    });
  }

  /**
   * Update a webhook endpoint
   */
  async updateEndpoint(
    endpointId: string,
    params: UpdateWebhookEndpointParams
  ): Promise<WebhookEndpoint> {
    validateString(endpointId, 'endpointId');

    if (params.url) {
      validateUrl(params.url, 'url');
    }

    return this.request<WebhookEndpoint>({
      method: 'PATCH',
      path: `/webhook-endpoints/${endpointId}`,
      body: params,
    });
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteEndpoint(endpointId: string): Promise<void> {
    validateString(endpointId, 'endpointId');

    await this.request<void>({
      method: 'DELETE',
      path: `/webhook-endpoints/${endpointId}`,
    });
  }

  /**
   * List webhook endpoints
   */
  async listEndpoints(
    params?: { limit?: number; cursor?: string }
  ): Promise<PaginatedList<WebhookEndpoint>> {
    return this.listRequest<WebhookEndpoint>('/webhook-endpoints', params);
  }

  /**
   * Rotate webhook secret
   */
  async rotateSecret(endpointId: string): Promise<WebhookEndpoint> {
    validateString(endpointId, 'endpointId');

    return this.request<WebhookEndpoint>({
      method: 'POST',
      path: `/webhook-endpoints/${endpointId}/rotate-secret`,
    });
  }

  // ==========================================================================
  // Webhook Delivery
  // ==========================================================================

  /**
   * List webhook deliveries for an endpoint
   */
  async listDeliveries(
    endpointId: string,
    params?: { status?: string; limit?: number; cursor?: string }
  ): Promise<PaginatedList<WebhookDelivery>> {
    validateString(endpointId, 'endpointId');

    return this.listRequest<WebhookDelivery>(
      `/webhook-endpoints/${endpointId}/deliveries`,
      params
    );
  }

  /**
   * Retry a failed webhook delivery
   */
  async retryDelivery(
    endpointId: string,
    deliveryId: string
  ): Promise<WebhookDelivery> {
    validateString(endpointId, 'endpointId');
    validateString(deliveryId, 'deliveryId');

    return this.request<WebhookDelivery>({
      method: 'POST',
      path: `/webhook-endpoints/${endpointId}/deliveries/${deliveryId}/retry`,
    });
  }

  // ==========================================================================
  // Signature Verification
  // ==========================================================================

  /**
   * Verify webhook signature
   */
  verify(
    payload: string | Buffer,
    signature: string,
    secret: string,
    tolerance?: number
  ): boolean {
    return verifySignature(payload, signature, secret, tolerance);
  }

  /**
   * Construct event from verified payload
   */
  constructEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
    tolerance?: number
  ): WebhookEvent {
    // Verify signature
    this.verify(payload, signature, secret, tolerance);

    // Parse payload
    const payloadString =
      typeof payload === 'string' ? payload : payload.toString('utf8');

    try {
      const event = JSON.parse(payloadString) as WebhookEvent;

      // Transform dates
      if (event.createdAt && typeof event.createdAt === 'string') {
        event.createdAt = new Date(event.createdAt);
      }

      return event;
    } catch (error) {
      throw new WebhookSignatureError('Invalid webhook payload');
    }
  }

  // ==========================================================================
  // Webhook Handler
  // ==========================================================================

  /**
   * Create a webhook handler function
   */
  handler(
    handlers: WebhookHandlers,
    options?: {
      secret?: string;
      tolerance?: number;
      onError?: (error: Error, event?: WebhookEvent) => void;
    }
  ) {
    const secret = options?.secret;
    const tolerance = options?.tolerance;
    const onError = options?.onError;

    return async (req: {
      body: string | Buffer | unknown;
      headers: Record<string, string | string[] | undefined>;
    }): Promise<{ status: number; body?: unknown }> => {
      try {
        // Get signature header
        const signatureHeader =
          req.headers['x-arcpay-signature'] ||
          req.headers['X-ArcPay-Signature'];

        const signature = Array.isArray(signatureHeader)
          ? signatureHeader[0]
          : signatureHeader;

        if (!signature) {
          return { status: 400, body: { error: 'Missing signature header' } };
        }

        // Get payload
        let payload: string;
        if (typeof req.body === 'string') {
          payload = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          payload = req.body.toString('utf8');
        } else {
          payload = JSON.stringify(req.body);
        }

        // Construct event (verifies signature if secret provided)
        let event: WebhookEvent;
        if (secret) {
          event = this.constructEvent(payload, signature, secret, tolerance);
        } else {
          event = JSON.parse(payload) as WebhookEvent;
          if (event.createdAt && typeof event.createdAt === 'string') {
            event.createdAt = new Date(event.createdAt);
          }
        }

        // Find handler
        const handler = handlers[event.type];
        if (handler) {
          await handler(event);
        }

        return { status: 200 };
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }

        if (error instanceof WebhookSignatureError) {
          return { status: 400, body: { error: error.message } };
        }

        return { status: 500, body: { error: 'Internal server error' } };
      }
    };
  }
}

// ==========================================================================
// Test Utilities
// ==========================================================================

/**
 * Generate a test webhook event
 */
export function generateTestEvent<T = Record<string, unknown>>(
  type: WebhookEventType,
  data: T
): WebhookEvent<T> {
  return {
    id: `evt_test_${Date.now()}`,
    type,
    apiVersion: '2024-01-01',
    createdAt: new Date(),
    data,
  };
}

/**
 * Generate a test signature for webhook testing
 */
export function generateTestSignature(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  return generateSignatureHeader(payload, secret, timestamp);
}
