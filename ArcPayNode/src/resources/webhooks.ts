/**
 * Webhooks resource
 *
 * Webhooks allow you to receive real-time notifications
 * about events in your ArcPay account.
 */

import { BaseResource } from './base';
import type {
  WebhookEndpoint,
  WebhookEvent,
  CreateWebhookEndpointParams,
  UpdateWebhookEndpointParams,
  PaginatedList,
} from '../types';
import { validateUrl } from '../utils/validation';
import { verifySignature, WebhookSignatureError } from '../utils/crypto';

export class WebhooksResource extends BaseResource {
  /**
   * Create a webhook endpoint
   */
  async create(params: CreateWebhookEndpointParams): Promise<WebhookEndpoint> {
    const url = validateUrl(params.url, 'url');

    if (!params.enabledEvents || params.enabledEvents.length === 0) {
      throw new Error('enabledEvents is required and cannot be empty');
    }

    const body = this.transformRequest({
      url,
      enabledEvents: params.enabledEvents,
      description: params.description,
    });

    const response = await this.request<{ data: WebhookEndpoint }>({
      method: 'POST',
      path: '/webhook_endpoints',
      body,
    });

    return this.transformResponse<WebhookEndpoint>(response.data);
  }

  /**
   * Retrieve a webhook endpoint by ID
   */
  async retrieve(endpointId: string): Promise<WebhookEndpoint> {
    const response = await this.request<{ data: WebhookEndpoint }>({
      method: 'GET',
      path: `/webhook_endpoints/${endpointId}`,
    });

    return this.transformResponse<WebhookEndpoint>(response.data);
  }

  /**
   * List webhook endpoints
   */
  async list(
    params?: { limit?: number; startingAfter?: string }
  ): Promise<PaginatedList<WebhookEndpoint>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;

    const response = await this.request<PaginatedList<WebhookEndpoint>>({
      method: 'GET',
      path: '/webhook_endpoints',
      query,
    });

    return {
      ...response,
      data: response.data.map((ep) => this.transformResponse<WebhookEndpoint>(ep)),
    };
  }

  /**
   * Update a webhook endpoint
   */
  async update(
    endpointId: string,
    params: UpdateWebhookEndpointParams
  ): Promise<WebhookEndpoint> {
    const url = params.url ? validateUrl(params.url, 'url') : undefined;

    const body = this.transformRequest({
      url,
      enabledEvents: params.enabledEvents,
      active: params.active,
      description: params.description,
    });

    const response = await this.request<{ data: WebhookEndpoint }>({
      method: 'PATCH',
      path: `/webhook_endpoints/${endpointId}`,
      body,
    });

    return this.transformResponse<WebhookEndpoint>(response.data);
  }

  /**
   * Delete a webhook endpoint
   */
  async delete(endpointId: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.request<{ deleted: boolean; id: string }>({
      method: 'DELETE',
      path: `/webhook_endpoints/${endpointId}`,
    });

    return response;
  }

  /**
   * Rotate webhook secret
   *
   * Generates a new signing secret for the endpoint.
   */
  async rotateSecret(endpointId: string): Promise<WebhookEndpoint> {
    const response = await this.request<{ data: WebhookEndpoint }>({
      method: 'POST',
      path: `/webhook_endpoints/${endpointId}/rotate_secret`,
    });

    return this.transformResponse<WebhookEndpoint>(response.data);
  }

  /**
   * Enable a webhook endpoint
   */
  async enable(endpointId: string): Promise<WebhookEndpoint> {
    return this.update(endpointId, { active: true });
  }

  /**
   * Disable a webhook endpoint
   */
  async disable(endpointId: string): Promise<WebhookEndpoint> {
    return this.update(endpointId, { active: false });
  }
}

/**
 * Webhook verification utilities
 *
 * Use these to verify webhook signatures in your handlers.
 */
export const Webhook = {
  /**
   * Construct a webhook event from the raw payload
   *
   * Verifies the signature and returns the parsed event.
   *
   * @param payload - Raw request body (string or Buffer)
   * @param signature - Value of the 'ArcPay-Signature' header
   * @param secret - Your webhook endpoint's signing secret
   * @param tolerance - Max age in seconds (default: 300 = 5 minutes)
   */
  constructEvent<T = unknown>(
    payload: string | Buffer,
    signature: string,
    secret: string,
    tolerance?: number
  ): WebhookEvent<T> {
    // Verify signature
    const isValid = verifySignature(payload, signature, secret, tolerance);

    if (!isValid) {
      throw new WebhookSignatureError('Webhook signature verification failed');
    }

    // Parse payload
    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
    const event = JSON.parse(payloadString) as WebhookEvent<T>;

    return event;
  },

  /**
   * Verify webhook signature without parsing
   *
   * Returns true if valid, throws if invalid.
   */
  verifySignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
    tolerance?: number
  ): boolean {
    return verifySignature(payload, signature, secret, tolerance);
  },

  /**
   * Generate a signature for testing
   *
   * Useful for testing webhook handlers locally.
   */
  generateTestSignature(
    payload: string,
    secret: string,
    timestamp?: number
  ): string {
    const crypto = require('crypto');
    const ts = timestamp || Math.floor(Date.now() / 1000);
    const signedPayload = `${ts}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    return `t=${ts},v1=${signature}`;
  },
};
