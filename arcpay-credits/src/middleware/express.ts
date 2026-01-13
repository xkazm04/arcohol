// =====================================================
// Express Middleware for API Credits
// =====================================================

import { createHash, randomUUID } from 'crypto';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
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

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      credits?: CreditPaymentInfo;
      creditsRequestId?: string;
    }
  }
}

/**
 * Convert Express Request to generic CreditsRequest
 */
function toCreditsRequest(req: Request): CreditsRequest {
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key.toLowerCase()] = value;
  }

  return {
    method: req.method,
    path: req.path,
    url: req.originalUrl || req.url,
    headers,
    query: req.query as Record<string, string | string[] | undefined>,
    body: req.body,
    ip: req.ip || req.socket?.remoteAddress,
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
 * Express middleware for credit-based API monetization
 */
export function creditsMiddleware(config: CreditsMiddlewareConfig): RequestHandler {
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

  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    req.creditsRequestId = requestId;

    const creditsRequest = toCreditsRequest(req);

    try {
      // Check if we should skip credit check
      if (skipIf) {
        const shouldSkip = await skipIf(creditsRequest);
        if (shouldSkip) {
          return next();
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
        req.credits = {
          accountId: account.id,
          externalCustomerId,
          transactionId: '',
          amount: 0,
          balanceBefore: account.balance,
          balanceAfter: account.balance,
          requestId,
        };
        return next();
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

      // Attach payment info to request
      const paymentInfo: CreditPaymentInfo = {
        accountId: account.id,
        externalCustomerId,
        transactionId: deductResult.transactionId!,
        amount: price,
        balanceBefore: deductResult.balanceBefore,
        balanceAfter: deductResult.balanceAfter,
        requestId,
      };
      req.credits = paymentInfo;

      // Call onDeduction callback
      if (onDeduction) {
        const deductionInfo: DeductionInfo = {
          ...paymentInfo,
          endpoint: creditsRequest.path,
          method: creditsRequest.method,
        };
        await onDeduction(deductionInfo);
      }

      // Log usage after response (using res.on('finish'))
      if (logUsage) {
        res.on('finish', async () => {
          const responseTime = Date.now() - startTime;
          try {
            await db.logUsage({
              organizationId,
              accountId: account!.id,
              externalCustomerId: externalCustomerId!,
              endpointId: endpoint?.id,
              transactionId: deductResult.transactionId,
              apiKeyId: apiKeyData.id,
              path: creditsRequest.path,
              method: creditsRequest.method,
              requestId,
              priceCharged: price,
              responseStatus: res.statusCode,
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
        });
      }

      next();
    } catch (error) {
      if (onError) {
        await onError(error as Error, creditsRequest);
      }

      if (error instanceof InsufficientCreditsError) {
        return res.status(402).json({
          error: 'Insufficient Credits',
          code: error.code,
          balance: error.balance,
          required: error.required,
          accountId: error.accountId,
          topUpUrl: error.topUpUrl,
          requestId,
        });
      }

      if (error instanceof AccountNotFoundError) {
        return res.status(403).json({
          error: 'Account Not Found',
          code: error.code,
          message: error.message,
          requestId,
        });
      }

      if (error instanceof AccountSuspendedError) {
        return res.status(403).json({
          error: 'Account Suspended',
          code: error.code,
          reason: error.reason,
          requestId,
        });
      }

      if (error instanceof InvalidApiKeyError) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: error.code,
          message: 'Invalid or missing API key',
          requestId,
        });
      }

      if (error instanceof EndpointNotConfiguredError) {
        // If no default price, endpoint must be configured
        return res.status(404).json({
          error: 'Endpoint Not Found',
          code: error.code,
          message: `Endpoint not configured: ${error.method} ${error.path}`,
          requestId,
        });
      }

      // Unknown error
      console.error('Credits middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred processing your request',
        requestId,
      });
    }
  };
}

/**
 * Utility middleware to set customer ID from a specific source
 */
export function setCustomerId(
  getCustomerId: (req: Request) => string | null | Promise<string | null>
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const customerId = await getCustomerId(req);
    if (customerId) {
      req.headers['x-customer-id'] = customerId;
    }
    next();
  };
}

export { creditsMiddleware as expressCreditsMiddleware };
