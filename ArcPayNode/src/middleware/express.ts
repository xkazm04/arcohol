/**
 * Express middleware for ArcPay webhooks
 *
 * Verifies webhook signatures and parses events.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { WebhookEvent } from '../types';
import { Webhook } from '../resources/webhooks';
import { WebhookSignatureError } from '../utils/crypto';

export interface WebhookMiddlewareOptions {
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

export interface WebhookRequest extends Request {
  /**
   * Parsed webhook event
   */
  webhookEvent: WebhookEvent;
}

/**
 * Express middleware for webhook signature verification
 *
 * Usage:
 * ```typescript
 * import express from 'express';
 * import { webhookMiddleware } from '@arcpay/node/middleware/express';
 *
 * const app = express();
 *
 * // IMPORTANT: Use raw body parser BEFORE the webhook route
 * app.post(
 *   '/webhooks/arcpay',
 *   express.raw({ type: 'application/json' }),
 *   webhookMiddleware({ secret: process.env.ARCPAY_WEBHOOK_SECRET! }),
 *   (req, res) => {
 *     const event = req.webhookEvent;
 *     console.log('Received event:', event.type);
 *     res.json({ received: true });
 *   }
 * );
 * ```
 */
export function webhookMiddleware(
  options: WebhookMiddlewareOptions
): RequestHandler {
  const {
    secret,
    signatureHeader = 'arcpay-signature',
    tolerance = 300,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get signature header
    const signature = req.headers[signatureHeader.toLowerCase()];

    if (!signature || typeof signature !== 'string') {
      res.status(400).json({
        error: {
          message: `Missing ${signatureHeader} header`,
          code: 'missing_signature',
        },
      });
      return;
    }

    // Get raw body
    let payload: string | Buffer;

    if (Buffer.isBuffer(req.body)) {
      payload = req.body;
    } else if (typeof req.body === 'string') {
      payload = req.body;
    } else if (typeof req.body === 'object') {
      // Body has already been parsed - need raw body
      res.status(400).json({
        error: {
          message: 'Webhook route requires raw body. Use express.raw() middleware.',
          code: 'invalid_body',
        },
      });
      return;
    } else {
      res.status(400).json({
        error: {
          message: 'Invalid request body',
          code: 'invalid_body',
        },
      });
      return;
    }

    try {
      // Verify and parse the event
      const event = Webhook.constructEvent(payload, signature, secret, tolerance);

      // Attach to request
      (req as WebhookRequest).webhookEvent = event;

      next();
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        res.status(401).json({
          error: {
            message: 'Invalid webhook signature',
            code: 'invalid_signature',
          },
        });
        return;
      }

      if (error instanceof SyntaxError) {
        res.status(400).json({
          error: {
            message: 'Invalid JSON payload',
            code: 'invalid_json',
          },
        });
        return;
      }

      // Unknown error
      next(error);
    }
  };
}

/**
 * Higher-order function for type-safe webhook handlers
 *
 * Usage:
 * ```typescript
 * app.post(
 *   '/webhooks/arcpay',
 *   express.raw({ type: 'application/json' }),
 *   webhookMiddleware({ secret }),
 *   webhookHandler((event, req, res) => {
 *     switch (event.type) {
 *       case 'payment.completed':
 *         // Handle payment
 *         break;
 *       case 'subscription.renewed':
 *         // Handle renewal
 *         break;
 *     }
 *     res.json({ received: true });
 *   })
 * );
 * ```
 */
export function webhookHandler(
  handler: (
    event: WebhookEvent,
    req: WebhookRequest,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const webhookReq = req as WebhookRequest;

      if (!webhookReq.webhookEvent) {
        res.status(500).json({
          error: {
            message: 'webhookMiddleware must be used before webhookHandler',
            code: 'middleware_order',
          },
        });
        return;
      }

      await handler(webhookReq.webhookEvent, webhookReq, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default webhookMiddleware;
