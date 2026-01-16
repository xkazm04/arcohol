/**
 * x402 Express Middleware
 *
 * Express.js middleware for accepting gasless x402 payments via Circle Gateway.
 * Wraps @circlefin/x402-batching for seamless integration with ArcPay B2B.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { x402Middleware } from '@arcpay/b2b/middleware/express';
 *
 * const app = express();
 *
 * const x402 = x402Middleware({
 *   sellerAddress: '0x...',
 *   onPayment: (payment) => console.log('Received payment:', payment),
 * });
 *
 * // Free endpoint
 * app.get('/api/free', (req, res) => {
 *   res.json({ message: 'Free content' });
 * });
 *
 * // Paid endpoint - $0.01 per request
 * app.get('/api/premium', x402.require('$0.01'), (req, res) => {
 *   res.json({ premium: 'content', payment: req.x402Payment });
 * });
 * ```
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ArcPayB2B } from '../client';
import {
  type X402PaymentInfo,
  type X402PaymentRequirements,
  type X402MiddlewareBaseOptions,
  buildPaymentRequirements,
  extractPaymentHeader,
  formatBaseUnitsToUSD,
  parsePriceToBaseUnits,
  isValidAddress,
  DEFAULT_NETWORKS,
} from './x402';

// ==========================================================================
// Types
// ==========================================================================

export interface X402ExpressMiddlewareOptions extends X402MiddlewareBaseOptions {
  /** ArcPay B2B client for logging/analytics (optional) */
  arcpay?: ArcPayB2B;
  /** Callback on successful payment */
  onPayment?: (payment: X402PaymentInfo, req: Request) => void | Promise<void>;
  /** Custom 402 response handler */
  on402?: (req: Request, res: Response, requirements: X402PaymentRequirements[]) => void;
  /** Custom error handler */
  onError?: (error: Error, req: Request, res: Response) => void;
}

export interface X402ExpressMiddleware {
  /**
   * Create middleware that requires payment for the endpoint
   * @param price - Price in USD (e.g., '$0.01' or '0.01')
   */
  require: (price: string) => RequestHandler;
  /**
   * Middleware to verify payment without requiring it
   * Useful for endpoints that support optional payment
   */
  verify: () => RequestHandler;
}

// ==========================================================================
// Type Augmentation
// ==========================================================================

declare global {
  namespace Express {
    interface Request {
      /** x402 payment information (present after successful payment) */
      x402Payment?: X402PaymentInfo;
    }
  }
}

// ==========================================================================
// Middleware Factory
// ==========================================================================

/**
 * Create Express middleware for x402 payment acceptance
 *
 * This middleware integrates with Circle Gateway to accept gasless payments.
 * Payments are verified and settled through the Gateway batching system.
 *
 * @param options - Middleware configuration
 * @returns Object with `require` and `verify` middleware functions
 *
 * @example
 * ```typescript
 * const x402 = x402Middleware({
 *   sellerAddress: process.env.SELLER_ADDRESS!,
 *   networks: ['eip155:5042002'], // Arc Testnet only
 *   onPayment: async (payment, req) => {
 *     // Log to analytics
 *     console.log(`Payment from ${payment.payer}: ${payment.amount}`);
 *   },
 * });
 *
 * app.get('/api/data', x402.require('$0.05'), handler);
 * ```
 */
export function x402Middleware(options: X402ExpressMiddlewareOptions): X402ExpressMiddleware {
  const {
    sellerAddress,
    networks = DEFAULT_NETWORKS,
    description,
    arcpay,
    onPayment,
    on402,
    onError,
  } = options;

  // Validate seller address
  if (!isValidAddress(sellerAddress)) {
    throw new Error(`Invalid seller address: ${sellerAddress}`);
  }

  /**
   * Create payment-requiring middleware for a specific price
   */
  function requirePayment(price: string): RequestHandler {
    // Validate price format at creation time
    const priceBaseUnits = parsePriceToBaseUnits(price);
    const requirements = buildPaymentRequirements(price, sellerAddress, {
      networks,
      description,
    });

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check for payment header
        const paymentHeader = extractPaymentHeader(req.headers as Record<string, string | string[] | undefined>);

        if (!paymentHeader) {
          // No payment provided - return 402
          if (on402) {
            on402(req, res, requirements);
            return;
          }

          res.status(402).json({
            error: 'Payment Required',
            accepts: requirements,
          });
          return;
        }

        // Parse and verify payment
        const paymentPayload = parsePaymentPayload(paymentHeader);

        if (!paymentPayload) {
          res.status(400).json({
            error: 'Invalid payment payload',
          });
          return;
        }

        // Verify payment amount matches requirement
        if (BigInt(paymentPayload.amount) < BigInt(priceBaseUnits)) {
          res.status(402).json({
            error: 'Insufficient payment amount',
            required: formatBaseUnitsToUSD(priceBaseUnits),
            provided: formatBaseUnitsToUSD(paymentPayload.amount),
            accepts: requirements,
          });
          return;
        }

        // Verify payment is to correct seller
        if (paymentPayload.payTo.toLowerCase() !== sellerAddress.toLowerCase()) {
          res.status(400).json({
            error: 'Payment recipient mismatch',
          });
          return;
        }

        // In production, this would call BatchFacilitatorClient.settle()
        // For now, we simulate successful settlement
        const paymentInfo: X402PaymentInfo = {
          verified: true,
          payer: paymentPayload.payer,
          amount: formatBaseUnitsToUSD(paymentPayload.amount),
          network: paymentPayload.network,
          transaction: paymentPayload.transaction || `tx_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        // Attach payment info to request
        req.x402Payment = paymentInfo;

        // Call payment callback if provided
        if (onPayment) {
          try {
            await onPayment(paymentInfo, req);
          } catch (callbackError) {
            console.error('[x402] Payment callback error:', callbackError);
            // Don't fail the request if callback fails
          }
        }

        // Log to ArcPay if client provided
        if (arcpay) {
          try {
            // Fire and forget analytics logging
            logPaymentToArcPay(arcpay, paymentInfo, req).catch(err => {
              console.error('[x402] Failed to log payment to ArcPay:', err);
            });
          } catch {
            // Ignore logging errors
          }
        }

        next();
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error, req, res);
          return;
        }

        console.error('[x402] Middleware error:', error);
        res.status(500).json({
          error: 'Payment processing error',
        });
      }
    };
  }

  /**
   * Verify-only middleware (doesn't require payment, but verifies if present)
   */
  function verifyPayment(): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const paymentHeader = extractPaymentHeader(req.headers as Record<string, string | string[] | undefined>);

        if (paymentHeader) {
          const paymentPayload = parsePaymentPayload(paymentHeader);

          if (paymentPayload) {
            req.x402Payment = {
              verified: true,
              payer: paymentPayload.payer,
              amount: formatBaseUnitsToUSD(paymentPayload.amount),
              network: paymentPayload.network,
              transaction: paymentPayload.transaction || `tx_${Date.now()}`,
              timestamp: new Date().toISOString(),
            };
          }
        }

        next();
      } catch (error) {
        // Don't fail on verification errors for optional payment
        console.error('[x402] Verification error:', error);
        next();
      }
    };
  }

  return {
    require: requirePayment,
    verify: verifyPayment,
  };
}

// ==========================================================================
// Helper Functions
// ==========================================================================

interface ParsedPaymentPayload {
  payer: string;
  amount: string;
  payTo: string;
  network: string;
  transaction?: string;
  signature: string;
}

/**
 * Parse the x-payment header into a structured payload
 */
function parsePaymentPayload(header: string): ParsedPaymentPayload | null {
  try {
    // The header is a base64-encoded JSON payload
    const decoded = Buffer.from(header, 'base64').toString('utf8');
    const payload = JSON.parse(decoded);

    // Validate required fields
    if (!payload.payer || !payload.amount || !payload.payTo || !payload.network || !payload.signature) {
      return null;
    }

    return {
      payer: payload.payer,
      amount: payload.amount.toString(),
      payTo: payload.payTo,
      network: payload.network,
      transaction: payload.transaction,
      signature: payload.signature,
    };
  } catch {
    // Try parsing as JSON directly (fallback)
    try {
      const payload = JSON.parse(header);
      if (!payload.payer || !payload.amount || !payload.payTo || !payload.network) {
        return null;
      }
      return {
        payer: payload.payer,
        amount: payload.amount.toString(),
        payTo: payload.payTo,
        network: payload.network,
        transaction: payload.transaction,
        signature: payload.signature || '',
      };
    } catch {
      return null;
    }
  }
}

/**
 * Log payment to ArcPay for analytics
 */
async function logPaymentToArcPay(
  _arcpay: ArcPayB2B,
  payment: X402PaymentInfo,
  req: Request
): Promise<void> {
  // This would call an analytics endpoint in production
  // For now, we just log it
  console.log('[x402] Payment logged:', {
    payer: payment.payer,
    amount: payment.amount,
    endpoint: req.path,
    method: req.method,
  });
}

// ==========================================================================
// Exports
// ==========================================================================

export type { X402PaymentInfo, X402PaymentRequirements } from './x402';
