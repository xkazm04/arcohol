import type { Request, Response, NextFunction, RequestHandler } from 'express';
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

// Store pending payments (in production, use Redis or similar)
const pendingPayments = new Map<string, X402PaymentRequirement>();

/**
 * Express middleware for x402 API monetization
 *
 * @example
 * ```typescript
 * import { x402Middleware } from '@arcpay/x402/middleware/express';
 *
 * app.use('/api/premium', x402Middleware({
 *   price: { amount: '0.01', currency: 'USDC' },
 *   recipient: '0x...',
 *   facilitator: 'https://x402.arcpay.io'
 * }));
 * ```
 */
export function x402Middleware(config: X402MiddlewareConfig): RequestHandler {
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

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if payment should be skipped
      if (skipIf) {
        const shouldSkip = await skipIf(req);
        if (shouldSkip) {
          return next();
        }
      }

      // Check for payment signature header
      const paymentSignatureHeader = req.headers['x-payment-signature'] as string | undefined;

      if (!paymentSignatureHeader) {
        // No payment - return 402 with payment requirement
        const resolvedPrice = await resolvePrice(price, req);
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

        res.status(402);
        res.setHeader('X-Payment-Required', encodePaymentRequirement(requirement));
        res.setHeader('Content-Type', 'application/json');
        return res.json({
          error: 'Payment Required',
          payment: requirement,
        });
      }

      // Verify payment signature
      const signature = parsePaymentSignature(paymentSignatureHeader);
      const requirement = pendingPayments.get(signature.paymentId);

      if (!requirement) {
        return res.status(400).json({
          error: 'Invalid or expired payment ID',
        });
      }

      // Validate signature matches requirement
      const matchResult = validateSignatureMatchesRequirement(signature, requirement);
      if (!matchResult.valid) {
        return res.status(400).json({
          error: matchResult.error,
        });
      }

      // Verify with facilitator
      const verification = await facilitator.verifyPayment(signature, requirement);

      if (!verification.valid) {
        return res.status(402).json({
          error: 'Payment verification failed',
          reason: verification.error,
        });
      }

      // Payment verified - clean up and proceed
      pendingPayments.delete(signature.paymentId);

      // Call payment callback
      if (onPayment) {
        await onPayment(verification);
      }

      // Attach payment info to request
      (req as Request & { x402Payment?: typeof verification }).x402Payment = verification;

      // Continue to route handler
      next();
    } catch (error) {
      if (onError) {
        await onError(error as Error, req);
      }

      console.error('[x402] Middleware error:', error);
      res.status(500).json({
        error: 'Payment processing error',
      });
    }
  };
}

/**
 * Resolve price (static or dynamic)
 */
async function resolvePrice(
  price: X402Price | ((req: Request) => X402Price | Promise<X402Price>),
  req: Request
): Promise<X402Price> {
  if (typeof price === 'function') {
    return price(req);
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
 * Type augmentation for Express Request
 */
declare global {
  namespace Express {
    interface Request {
      x402Payment?: {
        valid: boolean;
        paymentId: string;
        amount: string;
        currency: string;
        payer: string;
        chain: string;
        txHash?: string;
      };
    }
  }
}

export default x402Middleware;
