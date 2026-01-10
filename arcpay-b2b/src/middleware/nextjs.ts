/**
 * Next.js Middleware
 * Middleware utilities for Next.js applications
 */

import type { NextRequest } from 'next/server';
import type { ArcPayB2BConfig, WebhookEvent, WebhookHandlers } from '../types';
import { ArcPayB2B } from '../client';
import { WebhookSignatureError } from '../utils/errors';

// ==========================================================================
// Webhook Handler
// ==========================================================================

export interface WebhookHandlerOptions {
  /** Webhook secret for signature verification */
  secret: string;
  /** Tolerance in seconds for timestamp validation (default: 300) */
  tolerance?: number;
}

/**
 * Create a Next.js API route handler for webhooks
 *
 * @example
 * ```typescript
 * // app/api/webhooks/arcpay/route.ts
 * import { createWebhookHandler } from '@arcpay/b2b/middleware/nextjs';
 *
 * export const POST = createWebhookHandler({
 *   secret: process.env.ARCPAY_WEBHOOK_SECRET!,
 *   handlers: {
 *     'credits.deposited': async (event) => {
 *       console.log('Credits deposited:', event.data);
 *     },
 *     'dispute.created': async (event) => {
 *       console.log('Dispute created:', event.data);
 *     },
 *   },
 * });
 * ```
 */
export function createWebhookHandler(options: {
  secret: string;
  tolerance?: number;
  handlers: WebhookHandlers;
  onError?: (error: Error, event?: WebhookEvent) => Promise<void> | void;
}) {
  const { secret, tolerance = 300, handlers, onError } = options;

  return async (request: NextRequest): Promise<Response> => {
    try {
      // Get signature header
      const signature = request.headers.get('x-arcpay-signature');

      if (!signature) {
        return Response.json(
          { error: 'Missing signature header' },
          { status: 400 }
        );
      }

      // Get raw body
      const payload = await request.text();

      // Verify signature and construct event
      const tempClient = new ArcPayB2B({ secretKey: 'sk_temp' });
      const event = tempClient.webhooks.constructEvent(
        payload,
        signature,
        secret,
        tolerance
      );

      // Find and execute handler
      const handler = handlers[event.type];
      if (handler) {
        await handler(event);
      }

      return Response.json({ received: true });
    } catch (error) {
      if (onError && error instanceof Error) {
        await onError(error);
      }

      if (error instanceof WebhookSignatureError) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      console.error('[ArcPay B2B] Webhook error:', error);
      return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
  };
}

// ==========================================================================
// Usage Recording Helper
// ==========================================================================

/**
 * Record usage from a Next.js API route
 *
 * @example
 * ```typescript
 * // app/api/generate/route.ts
 * import { recordUsage } from '@arcpay/b2b/middleware/nextjs';
 *
 * const arcpay = new ArcPayB2B({ secretKey: process.env.ARCPAY_SECRET_KEY! });
 *
 * export async function POST(request: NextRequest) {
 *   const accountId = request.headers.get('x-account-id');
 *
 *   if (!accountId) {
 *     return Response.json({ error: 'Account ID required' }, { status: 401 });
 *   }
 *
 *   // Record usage
 *   await recordUsage(arcpay, {
 *     accountId,
 *     meter: 'api_call',
 *     metadata: { endpoint: '/api/generate' },
 *   });
 *
 *   // Process request...
 * }
 * ```
 */
export async function recordUsage(
  client: ArcPayB2B,
  options: {
    accountId: string;
    meter: string;
    count?: number;
    metadata?: Record<string, string | number | boolean>;
  }
): Promise<void> {
  try {
    await client.credits.recordUsage(options.accountId, {
      meter: options.meter,
      count: options.count ?? 1,
      metadata: options.metadata,
    });
  } catch (error) {
    console.error('[ArcPay B2B] Failed to record usage:', error);
    throw error;
  }
}

// ==========================================================================
// Balance Check Helper
// ==========================================================================

/**
 * Check account balance from a Next.js API route
 *
 * @example
 * ```typescript
 * // app/api/protected/route.ts
 * import { checkBalance } from '@arcpay/b2b/middleware/nextjs';
 *
 * export async function GET(request: NextRequest) {
 *   const accountId = request.headers.get('x-account-id');
 *
 *   if (!accountId) {
 *     return Response.json({ error: 'Account ID required' }, { status: 401 });
 *   }
 *
 *   const balanceCheck = await checkBalance(arcpay, accountId, { minimum: 10 });
 *
 *   if (!balanceCheck.ok) {
 *     return Response.json(
 *       { error: 'Insufficient balance', ...balanceCheck },
 *       { status: 402 }
 *     );
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export async function checkBalance(
  client: ArcPayB2B,
  accountId: string,
  options?: { minimum?: number }
): Promise<{
  ok: boolean;
  available: number;
  required?: number;
}> {
  try {
    const balance = await client.credits.getBalance(accountId);
    const available = parseFloat(balance.available.amount);

    if (options?.minimum !== undefined && available < options.minimum) {
      return {
        ok: false,
        available,
        required: options.minimum,
      };
    }

    return { ok: true, available };
  } catch (error) {
    console.error('[ArcPay B2B] Failed to check balance:', error);
    throw error;
  }
}

// ==========================================================================
// API Route Wrapper
// ==========================================================================

export interface WithArcPayOptions {
  /** ArcPay B2B client */
  client: ArcPayB2B;
  /** Function to extract account ID from request */
  accountIdFrom?: (request: NextRequest) => string | null;
  /** Minimum balance required */
  minimumBalance?: number;
  /** Meter to record usage */
  meter?: string;
}

/**
 * Wrap a Next.js API route with ArcPay authentication and usage metering
 *
 * @example
 * ```typescript
 * // app/api/generate/route.ts
 * import { withArcPay } from '@arcpay/b2b/middleware/nextjs';
 *
 * const handler = withArcPay({
 *   client: arcpay,
 *   accountIdFrom: (req) => req.headers.get('x-account-id'),
 *   minimumBalance: 1,
 *   meter: 'api_call',
 * })(async (request, context) => {
 *   // context.accountId is available
 *   // context.balance is available
 *   // Usage has been recorded
 *
 *   return Response.json({ success: true });
 * });
 *
 * export const POST = handler;
 * ```
 */
export function withArcPay(options: WithArcPayOptions) {
  const {
    client,
    accountIdFrom = (req) => req.headers.get('x-account-id'),
    minimumBalance,
    meter,
  } = options;

  return function wrapper(
    handler: (
      request: NextRequest,
      context: {
        accountId: string;
        balance: Awaited<ReturnType<typeof client.credits.getBalance>>;
      }
    ) => Promise<Response>
  ) {
    return async (request: NextRequest): Promise<Response> => {
      // Get account ID
      const accountId = accountIdFrom(request);

      if (!accountId) {
        return Response.json(
          { error: 'Account ID required' },
          { status: 401 }
        );
      }

      try {
        // Get balance
        const balance = await client.credits.getBalance(accountId);
        const available = parseFloat(balance.available.amount);

        // Check minimum balance
        if (minimumBalance !== undefined && available < minimumBalance) {
          return Response.json(
            {
              error: 'Insufficient balance',
              required: minimumBalance,
              available,
            },
            { status: 402 }
          );
        }

        // Record usage if meter specified
        if (meter) {
          // Fire and forget
          client.credits.recordUsage(accountId, { meter }).catch((err) => {
            console.error('[ArcPay B2B] Failed to record usage:', err);
          });
        }

        // Call handler
        return await handler(request, { accountId, balance });
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) {
          return Response.json({ error: 'Invalid account' }, { status: 401 });
        }

        console.error('[ArcPay B2B] Middleware error:', error);
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}
