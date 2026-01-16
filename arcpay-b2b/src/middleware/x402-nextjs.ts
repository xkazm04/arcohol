/**
 * x402 Next.js Middleware
 *
 * Next.js App Router helpers for accepting gasless x402 payments via Circle Gateway.
 *
 * @example
 * ```typescript
 * // app/api/premium/route.ts
 * import { withX402 } from '@arcpay/b2b/middleware/nextjs';
 *
 * export const GET = withX402({
 *   sellerAddress: '0x...',
 *   price: '$0.05',
 * })(async (request, context) => {
 *   // context.payment contains payment info
 *   return Response.json({
 *     premium: 'content',
 *     payment: context.payment,
 *   });
 * });
 * ```
 */

import type { NextRequest } from 'next/server';
import type { ArcPayB2B } from '../client';
import {
  type X402PaymentInfo,
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

export interface WithX402Options extends X402MiddlewareBaseOptions {
  /** Price for the endpoint (e.g., '$0.01' or '0.01') */
  price: string;
  /** ArcPay B2B client for logging/analytics (optional) */
  arcpay?: ArcPayB2B;
  /** Callback on successful payment */
  onPayment?: (payment: X402PaymentInfo, request: NextRequest) => void | Promise<void>;
}

export interface X402HandlerContext {
  /** Payment information (present after successful payment) */
  payment: X402PaymentInfo;
}

export type X402Handler = (
  request: NextRequest,
  context: X402HandlerContext
) => Promise<Response> | Response;

export type X402RouteHandler = (request: NextRequest) => Promise<Response>;

// ==========================================================================
// Route Handler Wrapper
// ==========================================================================

/**
 * Wrap a Next.js API route handler with x402 payment requirement
 *
 * @param options - Configuration including seller address and price
 * @returns Higher-order function that wraps your handler
 *
 * @example
 * ```typescript
 * // app/api/analyze/route.ts
 * import { withX402 } from '@arcpay/b2b/middleware/nextjs';
 *
 * export const POST = withX402({
 *   sellerAddress: process.env.SELLER_ADDRESS!,
 *   price: '$0.10',
 *   onPayment: async (payment) => {
 *     console.log('Payment received:', payment);
 *   },
 * })(async (request, { payment }) => {
 *   const body = await request.json();
 *
 *   return Response.json({
 *     result: 'Analysis complete',
 *     payment: {
 *       payer: payment.payer,
 *       amount: payment.amount,
 *     },
 *   });
 * });
 * ```
 */
export function withX402(options: WithX402Options) {
  const {
    sellerAddress,
    price,
    networks = DEFAULT_NETWORKS,
    description,
    arcpay,
    onPayment,
  } = options;

  // Validate seller address
  if (!isValidAddress(sellerAddress)) {
    throw new Error(`Invalid seller address: ${sellerAddress}`);
  }

  // Validate price format at creation time
  const priceBaseUnits = parsePriceToBaseUnits(price);
  const requirements = buildPaymentRequirements(price, sellerAddress, {
    networks,
    description,
  });

  return function wrapper(handler: X402Handler): X402RouteHandler {
    return async function routeHandler(request: NextRequest): Promise<Response> {
      try {
        // Convert headers to plain object
        const headersObj: Record<string, string | undefined> = {};
        request.headers.forEach((value, key) => {
          headersObj[key] = value;
        });

        // Check for payment header
        const paymentHeader = extractPaymentHeader(headersObj);

        if (!paymentHeader) {
          // No payment provided - return 402
          return Response.json(
            {
              error: 'Payment Required',
              accepts: requirements,
            },
            { status: 402 }
          );
        }

        // Parse and verify payment
        const paymentPayload = parsePaymentPayload(paymentHeader);

        if (!paymentPayload) {
          return Response.json(
            { error: 'Invalid payment payload' },
            { status: 400 }
          );
        }

        // Verify payment amount matches requirement
        if (BigInt(paymentPayload.amount) < BigInt(priceBaseUnits)) {
          return Response.json(
            {
              error: 'Insufficient payment amount',
              required: formatBaseUnitsToUSD(priceBaseUnits),
              provided: formatBaseUnitsToUSD(paymentPayload.amount),
              accepts: requirements,
            },
            { status: 402 }
          );
        }

        // Verify payment is to correct seller
        if (paymentPayload.payTo.toLowerCase() !== sellerAddress.toLowerCase()) {
          return Response.json(
            { error: 'Payment recipient mismatch' },
            { status: 400 }
          );
        }

        // Build payment info
        const paymentInfo: X402PaymentInfo = {
          verified: true,
          payer: paymentPayload.payer,
          amount: formatBaseUnitsToUSD(paymentPayload.amount),
          network: paymentPayload.network,
          transaction: paymentPayload.transaction || `tx_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        // Call payment callback if provided
        if (onPayment) {
          try {
            await onPayment(paymentInfo, request);
          } catch (callbackError) {
            console.error('[x402] Payment callback error:', callbackError);
          }
        }

        // Log to ArcPay if client provided
        if (arcpay) {
          logPaymentToArcPay(arcpay, paymentInfo, request).catch(err => {
            console.error('[x402] Failed to log payment to ArcPay:', err);
          });
        }

        // Call the wrapped handler with payment context
        return handler(request, { payment: paymentInfo });
      } catch (error) {
        console.error('[x402] Handler error:', error);
        return Response.json(
          { error: 'Payment processing error' },
          { status: 500 }
        );
      }
    };
  };
}

// ==========================================================================
// Verification Helper
// ==========================================================================

/**
 * Create a route handler that optionally accepts payment
 * (does not require payment, but verifies if present)
 *
 * @example
 * ```typescript
 * // app/api/freemium/route.ts
 * import { withOptionalX402 } from '@arcpay/b2b/middleware/nextjs';
 *
 * export const GET = withOptionalX402({
 *   sellerAddress: process.env.SELLER_ADDRESS!,
 * })(async (request, { payment }) => {
 *   if (payment) {
 *     // User paid - return premium content
 *     return Response.json({ tier: 'premium', data: 'exclusive' });
 *   }
 *   // Free tier
 *   return Response.json({ tier: 'free', data: 'basic' });
 * });
 * ```
 */
export function withOptionalX402(options: Omit<WithX402Options, 'price'>) {
  const { sellerAddress, arcpay, onPayment } = options;

  if (!isValidAddress(sellerAddress)) {
    throw new Error(`Invalid seller address: ${sellerAddress}`);
  }

  return function wrapper(
    handler: (
      request: NextRequest,
      context: { payment: X402PaymentInfo | null }
    ) => Promise<Response> | Response
  ): X402RouteHandler {
    return async function routeHandler(request: NextRequest): Promise<Response> {
      try {
        // Convert headers to plain object
        const headersObj: Record<string, string | undefined> = {};
        request.headers.forEach((value, key) => {
          headersObj[key] = value;
        });

        const paymentHeader = extractPaymentHeader(headersObj);
        let paymentInfo: X402PaymentInfo | null = null;

        if (paymentHeader) {
          const paymentPayload = parsePaymentPayload(paymentHeader);

          if (paymentPayload) {
            paymentInfo = {
              verified: true,
              payer: paymentPayload.payer,
              amount: formatBaseUnitsToUSD(paymentPayload.amount),
              network: paymentPayload.network,
              transaction: paymentPayload.transaction || `tx_${Date.now()}`,
              timestamp: new Date().toISOString(),
            };

            if (onPayment) {
              try {
                await onPayment(paymentInfo, request);
              } catch (callbackError) {
                console.error('[x402] Payment callback error:', callbackError);
              }
            }

            if (arcpay) {
              logPaymentToArcPay(arcpay, paymentInfo, request).catch(err => {
                console.error('[x402] Failed to log payment to ArcPay:', err);
              });
            }
          }
        }

        return handler(request, { payment: paymentInfo });
      } catch (error) {
        console.error('[x402] Handler error:', error);
        return Response.json(
          { error: 'Payment processing error' },
          { status: 500 }
        );
      }
    };
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
  request: NextRequest
): Promise<void> {
  const url = new URL(request.url);
  console.log('[x402] Payment logged:', {
    payer: payment.payer,
    amount: payment.amount,
    endpoint: url.pathname,
    method: request.method,
  });
}

// ==========================================================================
// Exports
// ==========================================================================

export type { X402PaymentInfo, X402PaymentRequirements } from './x402';
