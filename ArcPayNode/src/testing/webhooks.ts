/**
 * Webhook testing utilities
 *
 * Helpers for testing webhook handlers and signature verification.
 *
 * @example
 * ```typescript
 * import { createSignedWebhookRequest, createWebhookEvent } from '@arcpay/node/testing';
 *
 * // Create a signed webhook request for testing
 * const event = createWebhookEvent('payment.completed', payment);
 * const { body, headers } = createSignedWebhookRequest(event, 'whsec_test_...');
 *
 * // Use with your test framework
 * const response = await request(app)
 *   .post('/webhooks')
 *   .set(headers)
 *   .send(body);
 * ```
 */

import { createHmac } from 'crypto';
import type { WebhookEvent } from '../types';
import type { MockWebhookRequest, MockExpressRequest, MockExpressResponse } from './types';
import { createWebhookEvent } from './fixtures';

const SIGNATURE_HEADER = 'arcpay-signature';

/**
 * Generate a webhook signature for testing
 */
export function generateSignature(
  payload: string,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: number } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const sig = createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return {
    signature: `t=${ts},v1=${sig}`,
    timestamp: ts,
  };
}

/**
 * Create a properly signed webhook request
 */
export function createSignedWebhookRequest(
  event: WebhookEvent,
  secret: string,
  options?: { timestamp?: number }
): MockWebhookRequest {
  const payload = JSON.stringify(event);
  const { signature, timestamp } = generateSignature(payload, secret, options?.timestamp);

  return {
    body: payload,
    headers: {
      'content-type': 'application/json',
      [SIGNATURE_HEADER]: signature,
    },
  };
}

/**
 * Create Express-compatible mock request and response objects
 */
export function createExpressMocks(
  event: WebhookEvent,
  secret: string,
  options?: { timestamp?: number }
): {
  req: MockExpressRequest;
  res: MockExpressResponse;
  next: () => void;
} {
  const { body, headers } = createSignedWebhookRequest(event, secret, options);

  const req: MockExpressRequest = {
    body: Buffer.from(body),
    headers,
    method: 'POST',
    path: '/webhooks',
  };

  let statusCode = 200;
  let responseData: unknown;

  const res: MockExpressResponse = {
    status(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      responseData = data;
      this._data = data;
    },
    send(data: unknown) {
      responseData = data;
      this._data = data;
    },
    statusCode,
    _data: undefined,
  };

  const next = () => {};

  return { req, res, next };
}

/**
 * Create a Next.js App Router Request object for testing
 */
export function createNextjsRequest(
  event: WebhookEvent,
  secret: string,
  options?: { timestamp?: number }
): Request {
  const { body, headers } = createSignedWebhookRequest(event, secret, options);

  return new Request('http://localhost:3000/api/webhooks', {
    method: 'POST',
    headers,
    body,
  });
}

/**
 * Simulate webhook delivery to a URL (for integration tests)
 */
export async function simulateWebhookDelivery(
  url: string,
  event: WebhookEvent,
  secret: string,
  options?: {
    timeout?: number;
    retries?: number;
  }
): Promise<{
  status: number;
  body: unknown;
  success: boolean;
  latency: number;
}> {
  const { body, headers } = createSignedWebhookRequest(event, secret);
  const start = Date.now();

  let lastError: Error | undefined;
  const maxRetries = options?.retries ?? 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options?.timeout ?? 30000
      );

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      return {
        status: response.status,
        body: responseBody,
        success: response.ok,
        latency: Date.now() - start,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  return {
    status: 0,
    body: { error: lastError?.message || 'Request failed' },
    success: false,
    latency: Date.now() - start,
  };
}

/**
 * Verify that a webhook signature is valid
 */
export function verifyTestSignature(
  payload: string,
  signature: string,
  secret: string,
  toleranceSeconds: number = 300
): { valid: boolean; error?: string } {
  try {
    // Parse signature header
    const parts = signature.split(',');
    let timestamp = 0;
    let sig = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = parseInt(value, 10);
      if (key === 'v1') sig = value;
    }

    if (!timestamp || !sig) {
      return { valid: false, error: 'Invalid signature format' };
    }

    // Check timestamp
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return { valid: false, error: 'Timestamp outside tolerance' };
    }

    // Verify signature
    const expectedSig = createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    if (sig !== expectedSig) {
      return { valid: false, error: 'Signature mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Create a batch of webhook events for testing webhook handler resilience
 */
export function createWebhookEventBatch(
  events: Array<{ type: string; delay?: number }>
): Array<{ event: WebhookEvent; delay: number }> {
  return events.map(({ type, delay = 0 }) => ({
    event: createWebhookEvent(type as any),
    delay,
  }));
}

export { SIGNATURE_HEADER };
