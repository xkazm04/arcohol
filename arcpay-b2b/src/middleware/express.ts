/**
 * Express.js Middleware
 * Middleware utilities for Express applications
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ArcPayB2BConfig, RecordUsageParams } from '../types';
import { ArcPayB2B } from '../client';
import { WebhookSignatureError } from '../utils/errors';

// ==========================================================================
// Webhook Middleware
// ==========================================================================

export interface WebhookMiddlewareOptions {
  /** Webhook secret for signature verification */
  secret: string;
  /** Tolerance in seconds for timestamp validation (default: 300) */
  tolerance?: number;
  /** Custom error handler */
  onError?: (error: Error, req: Request, res: Response) => void;
}

/**
 * Create Express middleware for webhook handling
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { webhookMiddleware } from '@arcpay/b2b/middleware/express';
 *
 * const app = express();
 *
 * app.post(
 *   '/webhooks/arcpay',
 *   express.raw({ type: 'application/json' }),
 *   webhookMiddleware({
 *     secret: process.env.ARCPAY_WEBHOOK_SECRET!,
 *   }),
 *   (req, res) => {
 *     const event = req.arcpayEvent;
 *     console.log('Received event:', event.type);
 *     res.sendStatus(200);
 *   }
 * );
 * ```
 */
export function webhookMiddleware(
  options: WebhookMiddlewareOptions
): RequestHandler {
  const { secret, tolerance = 300, onError } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get signature header
      const signature = req.headers['x-arcpay-signature'] as string | undefined;

      if (!signature) {
        const error = new WebhookSignatureError('Missing signature header');
        if (onError) {
          onError(error, req, res);
          return;
        }
        res.status(400).json({ error: 'Missing signature header' });
        return;
      }

      // Get raw body
      let payload: string;
      if (Buffer.isBuffer(req.body)) {
        payload = req.body.toString('utf8');
      } else if (typeof req.body === 'string') {
        payload = req.body;
      } else {
        payload = JSON.stringify(req.body);
      }

      // Create a temporary client to verify signature
      const tempClient = new ArcPayB2B({ secretKey: 'sk_temp' });
      const event = tempClient.webhooks.constructEvent(
        payload,
        signature,
        secret,
        tolerance
      );

      // Attach event to request
      (req as Request & { arcpayEvent: unknown }).arcpayEvent = event;

      next();
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error, req, res);
        return;
      }

      if (error instanceof WebhookSignatureError) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// ==========================================================================
// Usage Metering Middleware
// ==========================================================================

export interface UsageMiddlewareOptions {
  /** ArcPay B2B client or config */
  client: ArcPayB2B | ArcPayB2BConfig;
  /** Meter type to record */
  meter: string;
  /** Function to extract account ID from request */
  accountIdFrom: (req: Request) => string | undefined;
  /** Optional function to determine if request should be skipped */
  skipIf?: (req: Request) => boolean;
  /** Optional function to extract additional metadata */
  metadata?: (req: Request) => Record<string, string | number | boolean>;
  /** Record usage async (don't wait for response) */
  async?: boolean;
}

/**
 * Create Express middleware for automatic usage metering
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { usageMiddleware } from '@arcpay/b2b/middleware/express';
 * import { ArcPayB2B } from '@arcpay/b2b';
 *
 * const arcpay = new ArcPayB2B({ secretKey: process.env.ARCPAY_SECRET_KEY! });
 * const app = express();
 *
 * app.use(
 *   '/api',
 *   usageMiddleware({
 *     client: arcpay,
 *     meter: 'api_call',
 *     accountIdFrom: (req) => req.headers['x-account-id'] as string,
 *     skipIf: (req) => req.path === '/health',
 *   })
 * );
 * ```
 */
export function usageMiddleware(options: UsageMiddlewareOptions): RequestHandler {
  const {
    client,
    meter,
    accountIdFrom,
    skipIf,
    metadata,
    async: asyncMode = true,
  } = options;

  // Get or create client
  const arcpay =
    client instanceof ArcPayB2B
      ? client
      : new ArcPayB2B(client);

  return async (req: Request, _res: Response, next: NextFunction) => {
    // Check if should skip
    if (skipIf && skipIf(req)) {
      next();
      return;
    }

    // Get account ID
    const accountId = accountIdFrom(req);
    if (!accountId) {
      next();
      return;
    }

    // Build usage params
    const usageParams: RecordUsageParams = {
      meter,
      count: 1,
      metadata: metadata ? metadata(req) : undefined,
    };

    // Record usage
    const recordUsage = async () => {
      try {
        await arcpay.credits.recordUsage(accountId, usageParams);
      } catch (error) {
        console.error('[ArcPay B2B] Failed to record usage:', error);
      }
    };

    if (asyncMode) {
      // Fire and forget
      recordUsage();
      next();
    } else {
      // Wait for recording
      await recordUsage();
      next();
    }
  };
}

// ==========================================================================
// Authentication Middleware
// ==========================================================================

export interface AuthMiddlewareOptions {
  /** ArcPay B2B client or config */
  client: ArcPayB2B | ArcPayB2BConfig;
  /** Function to extract account ID from request */
  accountIdFrom: (req: Request) => string | undefined;
  /** Minimum balance required (optional) */
  minimumBalance?: number;
  /** Custom unauthorized handler */
  onUnauthorized?: (req: Request, res: Response) => void;
  /** Custom insufficient balance handler */
  onInsufficientBalance?: (req: Request, res: Response, balance: number) => void;
}

/**
 * Create Express middleware for credit account authentication
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { authMiddleware } from '@arcpay/b2b/middleware/express';
 *
 * const app = express();
 *
 * app.use(
 *   '/api',
 *   authMiddleware({
 *     client: arcpay,
 *     accountIdFrom: (req) => req.headers['x-account-id'] as string,
 *     minimumBalance: 1, // Require at least $1 balance
 *   })
 * );
 * ```
 */
export function authMiddleware(options: AuthMiddlewareOptions): RequestHandler {
  const {
    client,
    accountIdFrom,
    minimumBalance,
    onUnauthorized,
    onInsufficientBalance,
  } = options;

  const arcpay =
    client instanceof ArcPayB2B
      ? client
      : new ArcPayB2B(client);

  return async (req: Request, res: Response, next: NextFunction) => {
    const accountId = accountIdFrom(req);

    if (!accountId) {
      if (onUnauthorized) {
        onUnauthorized(req, res);
        return;
      }
      res.status(401).json({ error: 'Account ID required' });
      return;
    }

    try {
      // Get account balance
      const balance = await arcpay.credits.getBalance(accountId);
      const available = parseFloat(balance.available.amount);

      // Check minimum balance
      if (minimumBalance !== undefined && available < minimumBalance) {
        if (onInsufficientBalance) {
          onInsufficientBalance(req, res, available);
          return;
        }
        res.status(402).json({
          error: 'Insufficient balance',
          required: minimumBalance,
          available,
        });
        return;
      }

      // Attach balance to request
      (req as Request & { arcpayBalance: unknown }).arcpayBalance = balance;

      next();
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) {
        if (onUnauthorized) {
          onUnauthorized(req, res);
          return;
        }
        res.status(401).json({ error: 'Invalid account' });
        return;
      }

      next(error);
    }
  };
}

// ==========================================================================
// Type Augmentation
// ==========================================================================

declare global {
  namespace Express {
    interface Request {
      arcpayEvent?: import('../types').WebhookEvent;
      arcpayBalance?: import('../types').BalanceSnapshot;
    }
  }
}
