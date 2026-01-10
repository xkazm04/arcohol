/**
 * Next.js API route helpers for ArcPay webhooks
 *
 * Works with both Pages Router and App Router.
 */

import type { WebhookEvent } from '../types';
import { Webhook } from '../resources/webhooks';
import { WebhookSignatureError } from '../utils/crypto';

export interface WebhookConfig {
  /**
   * Webhook signing secret
   */
  secret: string;

  /**
   * Signature header name (default: 'arcpay-signature')
   */
  signatureHeader?: string;

  /**
   * Timestamp tolerance in seconds (default: 300)
   */
  tolerance?: number;
}

/**
 * Verify and construct webhook event from Next.js request
 *
 * For Pages Router:
 * ```typescript
 * // pages/api/webhooks/arcpay.ts
 * import type { NextApiRequest, NextApiResponse } from 'next';
 * import { constructWebhookEvent } from '@arcpay/node/middleware/nextjs';
 *
 * export const config = {
 *   api: { bodyParser: false }  // REQUIRED!
 * };
 *
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   if (req.method !== 'POST') {
 *     return res.status(405).json({ error: 'Method not allowed' });
 *   }
 *
 *   const event = await constructWebhookEvent(req, {
 *     secret: process.env.ARCPAY_WEBHOOK_SECRET!
 *   });
 *
 *   // Handle event...
 *   res.json({ received: true });
 * }
 * ```
 */
export async function constructWebhookEvent(
  req: { headers: Record<string, string | string[] | undefined>; body?: unknown },
  config: WebhookConfig
): Promise<WebhookEvent> {
  const {
    secret,
    signatureHeader = 'arcpay-signature',
    tolerance = 300,
  } = config;

  // Get signature
  const signature = req.headers[signatureHeader.toLowerCase()];

  if (!signature || typeof signature !== 'string') {
    throw new WebhookSignatureError(`Missing ${signatureHeader} header`);
  }

  // Get raw body
  let payload: string;

  if (typeof req.body === 'string') {
    payload = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    payload = req.body.toString('utf8');
  } else if (req.body && typeof req.body === 'object') {
    // Already parsed - this is a problem
    throw new Error(
      'Request body was already parsed. Set bodyParser: false in API config.'
    );
  } else {
    // Need to read body from stream (Pages Router with bodyParser: false)
    payload = await readRawBody(req as unknown as NodeJS.ReadableStream);
  }

  return Webhook.constructEvent(payload, signature, secret, tolerance);
}

/**
 * Read raw body from request stream
 */
async function readRawBody(req: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

/**
 * App Router webhook handler helper
 *
 * For App Router:
 * ```typescript
 * // app/api/webhooks/arcpay/route.ts
 * import { webhookHandler } from '@arcpay/node/middleware/nextjs';
 *
 * export const POST = webhookHandler({
 *   secret: process.env.ARCPAY_WEBHOOK_SECRET!,
 *   onEvent: async (event) => {
 *     switch (event.type) {
 *       case 'payment.completed':
 *         // Handle payment...
 *         break;
 *     }
 *   }
 * });
 * ```
 */
export function webhookHandler(config: WebhookConfig & {
  onEvent: (event: WebhookEvent) => Promise<void> | void;
}): (request: Request) => Promise<Response> {
  const { secret, signatureHeader = 'arcpay-signature', tolerance, onEvent } = config;

  return async (request: Request): Promise<Response> => {
    // Get signature
    const signature = request.headers.get(signatureHeader);

    if (!signature) {
      return Response.json(
        { error: { message: `Missing ${signatureHeader} header`, code: 'missing_signature' } },
        { status: 400 }
      );
    }

    // Get raw body
    const payload = await request.text();

    if (!payload) {
      return Response.json(
        { error: { message: 'Empty request body', code: 'empty_body' } },
        { status: 400 }
      );
    }

    try {
      const event = Webhook.constructEvent(payload, signature, secret, tolerance);
      await onEvent(event);
      return Response.json({ received: true });
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        return Response.json(
          { error: { message: 'Invalid webhook signature', code: 'invalid_signature' } },
          { status: 401 }
        );
      }

      if (error instanceof SyntaxError) {
        return Response.json(
          { error: { message: 'Invalid JSON payload', code: 'invalid_json' } },
          { status: 400 }
        );
      }

      console.error('Webhook handler error:', error);
      return Response.json(
        { error: { message: 'Internal server error', code: 'internal_error' } },
        { status: 500 }
      );
    }
  };
}

/**
 * Verify webhook signature only (doesn't parse body)
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  tolerance?: number
): boolean {
  return Webhook.verifySignature(payload, signature, secret, tolerance);
}

export default webhookHandler;
