import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type {
  X402MiddlewareConfig,
  X402Price,
  X402PaymentRequirement,
  X402Chain,
} from '../types';
import {
  generatePaymentId,
  encodePaymentRequirement,
  parsePaymentSignature,
  createExpiration,
  validatePrice,
  validateSignatureMatchesRequirement,
} from '../utils';
import { X402Facilitator } from './facilitator';

// Store pending payments (in production, use Redis/KV)
const pendingPayments = new Map<string, X402PaymentRequirement>();

/**
 * Configuration for Next.js x402 middleware
 */
export interface X402NextConfig extends Omit<X402MiddlewareConfig, 'skipIf'> {
  /** Skip payment for certain requests */
  skipIf?: (request: NextRequest) => boolean | Promise<boolean>;
}

/**
 * Create x402 handler for Next.js API routes
 *
 * @example
 * ```typescript
 * // app/api/premium/route.ts
 * import { withX402 } from '@arcpay/x402/middleware/nextjs';
 *
 * const handler = withX402({
 *   price: { amount: '0.01', currency: 'USDC' },
 *   recipient: '0x...',
 *   facilitator: 'https://x402.arcpay.io'
 * });
 *
 * export const GET = handler(async (request, { payment }) => {
 *   // Payment verified, return data
 *   return NextResponse.json({ data: 'premium content' });
 * });
 * ```
 */
export function withX402(config: X402NextConfig) {
  const {
    price,
    recipient,
    facilitator: facilitatorConfig,
    chains = ['base', 'ethereum', 'arbitrum', 'polygon', 'optimism'],
    skipIf,
    paymentTtl = 300,
    onPayment,
    onError,
  } = config;

  const facilitator = new X402Facilitator(facilitatorConfig);

  return function createHandler(
    handler: (
      request: NextRequest,
      context: { payment?: X402PaymentInfo }
    ) => Promise<NextResponse> | NextResponse
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // Check if payment should be skipped
        if (skipIf) {
          const shouldSkip = await skipIf(request);
          if (shouldSkip) {
            return handler(request, {});
          }
        }

        // Check for payment signature header
        const paymentSignatureHeader = request.headers.get('x-payment-signature');

        if (!paymentSignatureHeader) {
          // No payment - return 402 with payment requirement
          const resolvedPrice = await resolvePrice(price, request);
          validatePrice(resolvedPrice);

          const requirement = createPaymentRequirement(
            resolvedPrice,
            recipient,
            chains,
            facilitatorConfig,
            paymentTtl
          );

          // Store for verification
          pendingPayments.set(requirement.paymentId, requirement);

          // Clean up after expiration
          setTimeout(() => {
            pendingPayments.delete(requirement.paymentId);
          }, paymentTtl * 1000);

          return NextResponse.json(
            {
              error: 'Payment Required',
              payment: requirement,
            },
            {
              status: 402,
              headers: {
                'X-Payment-Required': encodePaymentRequirement(requirement),
              },
            }
          );
        }

        // Verify payment signature
        const signature = parsePaymentSignature(paymentSignatureHeader);
        const requirement = pendingPayments.get(signature.paymentId);

        if (!requirement) {
          return NextResponse.json(
            { error: 'Invalid or expired payment ID' },
            { status: 400 }
          );
        }

        // Validate signature matches requirement
        const matchResult = validateSignatureMatchesRequirement(signature, requirement);
        if (!matchResult.valid) {
          return NextResponse.json(
            { error: matchResult.error },
            { status: 400 }
          );
        }

        // Verify with facilitator
        const verification = await facilitator.verifyPayment(signature, requirement);

        if (!verification.valid) {
          return NextResponse.json(
            {
              error: 'Payment verification failed',
              reason: verification.error,
            },
            { status: 402 }
          );
        }

        // Payment verified - clean up and proceed
        pendingPayments.delete(signature.paymentId);

        // Call payment callback
        if (onPayment) {
          await onPayment(verification);
        }

        // Call handler with payment info
        return handler(request, {
          payment: {
            paymentId: verification.paymentId,
            amount: verification.amount,
            currency: verification.currency,
            payer: verification.payer,
            chain: verification.chain,
            txHash: verification.txHash,
          },
        });
      } catch (error) {
        if (onError) {
          await onError(error as Error, request);
        }

        console.error('[x402] Handler error:', error);
        return NextResponse.json(
          { error: 'Payment processing error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Payment info passed to handler
 */
export interface X402PaymentInfo {
  paymentId: string;
  amount: string;
  currency: string;
  payer: string;
  chain: string;
  txHash?: string;
}

/**
 * Resolve price (static or dynamic)
 */
async function resolvePrice(
  price: X402Price | ((req: NextRequest) => X402Price | Promise<X402Price>),
  request: NextRequest
): Promise<X402Price> {
  if (typeof price === 'function') {
    return price(request);
  }
  return price;
}

/**
 * Create payment requirement object
 */
function createPaymentRequirement(
  price: X402Price,
  recipient: string,
  chains: X402Chain[],
  facilitator: X402MiddlewareConfig['facilitator'],
  ttl: number
): X402PaymentRequirement {
  return {
    version: '1.0',
    paymentId: generatePaymentId(),
    amount: price.amount,
    currency: price.currency || 'USDC',
    recipient,
    chains: price.chains || chains,
    facilitator: typeof facilitator === 'string' ? facilitator : facilitator.url,
    expiresAt: createExpiration(ttl),
  };
}

/**
 * Dynamic pricing helper for Next.js
 *
 * @example
 * ```typescript
 * const handler = withX402({
 *   price: dynamicPrice(async (request) => {
 *     const tokens = estimateTokens(await request.json());
 *     return { amount: (tokens * 0.00001).toString() };
 *   }),
 *   // ...
 * });
 * ```
 */
export function dynamicPrice(
  fn: (request: NextRequest) => X402Price | Promise<X402Price>
): (request: NextRequest) => Promise<X402Price> {
  return fn;
}

export default withX402;
