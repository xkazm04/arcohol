// =====================================================
// Next.js Middleware for API Credits
// =====================================================

import { createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type {
  CreditsMiddlewareConfig,
  CreditsRequest,
  CreditPaymentInfo,
  DeductionInfo,
  InsufficientCreditsInfo,
} from '../types';
import {
  InsufficientCreditsError,
  AccountNotFoundError,
  AccountSuspendedError,
  InvalidApiKeyError,
  EndpointNotConfiguredError,
} from '../types';

/**
 * Context passed to the handler after credit check
 */
export interface CreditsContext {
  credits?: CreditPaymentInfo;
  requestId: string;
}

/**
 * Next.js handler type with credits context
 */
export type CreditsHandler = (
  request: NextRequest,
  context: CreditsContext
) => Promise<NextResponse> | NextResponse;

/**
 * Convert Next.js Request to generic CreditsRequest
 */
function toCreditsRequest(req: NextRequest): CreditsRequest {
  const headers: Record<string, string | string[] | undefined> = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const url = new URL(req.url);
  const query: Record<string, string | string[] | undefined> = {};
  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing) {
      query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      query[key] = value;
    }
  });

  return {
    method: req.method,
    path: url.pathname,
    url: req.url,
    headers,
    query,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined,
  };
}

/**
 * Default API key extraction from Authorization header or x-api-key
 */
function defaultGetApiKey(request: CreditsRequest): string | null {
  const authHeader = request.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const apiKeyHeader = request.headers['x-api-key'];
  if (typeof apiKeyHeader === 'string') {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Hash API key for database lookup
 */
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Create a Next.js API route handler with credit checking
 */
export function withCredits(config: CreditsMiddlewareConfig) {
  const {
    db,
    organizationId,
    getCustomerId,
    getApiKey = defaultGetApiKey,
    defaultPrice,
    skipIf,
    onDeduction,
    onInsufficientCredits,
    onError,
    autoCreateAccounts = true,
    logUsage = true,
    generateRequestId = randomUUID,
  } = config;

  return (handler: CreditsHandler) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const startTime = Date.now();
      const requestId = generateRequestId();
      const creditsRequest = toCreditsRequest(request);

      try {
        // Check if we should skip credit check
        if (skipIf) {
          const shouldSkip = await skipIf(creditsRequest);
          if (shouldSkip) {
            return handler(request, { requestId });
          }
        }

        // Get API key
        const apiKey = await getApiKey(creditsRequest);
        if (!apiKey) {
          throw new InvalidApiKeyError();
        }

        const keyHash = hashApiKey(apiKey);

        // Get API key with linked credit account
        const apiKeyData = await db.getApiKeyWithCredits(keyHash);
        if (!apiKeyData) {
          throw new InvalidApiKeyError();
        }

        // Determine customer ID
        let externalCustomerId: string | null = null;

        // First try custom getCustomerId function
        if (getCustomerId) {
          externalCustomerId = await getCustomerId(creditsRequest);
        }

        // Fall back to API key's linked customer
        if (!externalCustomerId && apiKeyData.externalCustomerId) {
          externalCustomerId = apiKeyData.externalCustomerId;
        }

        // If still no customer ID, extract from header
        if (!externalCustomerId) {
          const customerHeader = creditsRequest.headers['x-customer-id'];
          if (typeof customerHeader === 'string') {
            externalCustomerId = customerHeader;
          }
        }

        if (!externalCustomerId) {
          throw new AccountNotFoundError('No customer ID provided');
        }

        // Get or create credit account
        let account = apiKeyData.account;
        if (!account) {
          if (autoCreateAccounts) {
            account = await db.getOrCreateAccount(organizationId, externalCustomerId);
            // Link API key to account
            await db.linkApiKeyToAccount(apiKeyData.id, account.id, externalCustomerId);
          } else {
            account = await db.getAccount(organizationId, externalCustomerId);
          }
        }

        if (!account) {
          throw new AccountNotFoundError(externalCustomerId);
        }

        if (!account.active) {
          throw new AccountSuspendedError(account.id, account.suspendedReason);
        }

        // Get endpoint pricing
        const endpoint = await db.getEndpoint(organizationId, creditsRequest.path, creditsRequest.method);
        const price = endpoint?.pricePerCall ?? defaultPrice;

        if (price === undefined) {
          throw new EndpointNotConfiguredError(creditsRequest.path, creditsRequest.method);
        }

        // Skip if price is 0
        if (price === 0) {
          const context: CreditsContext = {
            credits: {
              accountId: account.id,
              externalCustomerId,
              transactionId: '',
              amount: 0,
              balanceBefore: account.balance,
              balanceAfter: account.balance,
              requestId,
            },
            requestId,
          };
          return handler(request, context);
        }

        // Check and deduct credits
        const deductResult = await db.deductCredits({
          accountId: account.id,
          amount: price,
          endpointId: endpoint?.id,
          requestId,
          apiKeyId: apiKeyData.id,
          description: `API call: ${creditsRequest.method} ${creditsRequest.path}`,
        });

        if (!deductResult.success) {
          const info: InsufficientCreditsInfo = {
            accountId: account.id,
            externalCustomerId,
            balance: account.balance,
            required: price,
            endpoint: creditsRequest.path,
            method: creditsRequest.method,
          };

          if (onInsufficientCredits) {
            await onInsufficientCredits(info);
          }

          throw new InsufficientCreditsError(
            account.balance,
            price,
            account.id,
            `/credits/add?account=${account.id}`
          );
        }

        // Create payment info
        const paymentInfo: CreditPaymentInfo = {
          accountId: account.id,
          externalCustomerId,
          transactionId: deductResult.transactionId!,
          amount: price,
          balanceBefore: deductResult.balanceBefore,
          balanceAfter: deductResult.balanceAfter,
          requestId,
        };

        // Call onDeduction callback
        if (onDeduction) {
          const deductionInfo: DeductionInfo = {
            ...paymentInfo,
            endpoint: creditsRequest.path,
            method: creditsRequest.method,
          };
          await onDeduction(deductionInfo);
        }

        // Call the handler
        const response = await handler(request, {
          credits: paymentInfo,
          requestId,
        });

        // Log usage after handler completes
        if (logUsage) {
          const responseTime = Date.now() - startTime;
          try {
            await db.logUsage({
              organizationId,
              accountId: account.id,
              externalCustomerId,
              endpointId: endpoint?.id,
              transactionId: deductResult.transactionId,
              apiKeyId: apiKeyData.id,
              path: creditsRequest.path,
              method: creditsRequest.method,
              requestId,
              priceCharged: price,
              responseStatus: response.status,
              responseTimeMs: responseTime,
              ipAddress: creditsRequest.ip,
              userAgent: typeof creditsRequest.headers['user-agent'] === 'string'
                ? creditsRequest.headers['user-agent']
                : undefined,
            });
          } catch (logError) {
            // Don't fail the request if logging fails
            console.error('Failed to log usage:', logError);
          }
        }

        return response;
      } catch (error) {
        if (onError) {
          await onError(error as Error, creditsRequest);
        }

        if (error instanceof InsufficientCreditsError) {
          return NextResponse.json(
            {
              error: 'Insufficient Credits',
              code: error.code,
              balance: error.balance,
              required: error.required,
              accountId: error.accountId,
              topUpUrl: error.topUpUrl,
              requestId,
            },
            { status: 402 }
          );
        }

        if (error instanceof AccountNotFoundError) {
          return NextResponse.json(
            {
              error: 'Account Not Found',
              code: error.code,
              message: error.message,
              requestId,
            },
            { status: 403 }
          );
        }

        if (error instanceof AccountSuspendedError) {
          return NextResponse.json(
            {
              error: 'Account Suspended',
              code: error.code,
              reason: error.reason,
              requestId,
            },
            { status: 403 }
          );
        }

        if (error instanceof InvalidApiKeyError) {
          return NextResponse.json(
            {
              error: 'Unauthorized',
              code: error.code,
              message: 'Invalid or missing API key',
              requestId,
            },
            { status: 401 }
          );
        }

        if (error instanceof EndpointNotConfiguredError) {
          return NextResponse.json(
            {
              error: 'Endpoint Not Found',
              code: error.code,
              message: `Endpoint not configured: ${error.method} ${error.path}`,
              requestId,
            },
            { status: 404 }
          );
        }

        // Unknown error
        console.error('Credits middleware error:', error);
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: 'An error occurred processing your request',
            requestId,
          },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Dynamic pricing helper for Next.js
 */
export function dynamicPrice(
  fn: (request: NextRequest) => number | Promise<number>
): (request: NextRequest) => Promise<number> {
  return async (request: NextRequest) => {
    return fn(request);
  };
}

export { withCredits as nextjsCreditsMiddleware };
