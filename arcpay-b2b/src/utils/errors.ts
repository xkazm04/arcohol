/**
 * Error classes for the B2B SDK
 */

/**
 * Base error class for all ArcPay B2B errors
 */
export class ArcPayB2BError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
    this.name = 'ArcPayB2BError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Authentication error (invalid or missing API key)
 */
export class AuthenticationError extends ArcPayB2BError {
  constructor(message = 'Invalid API key provided', requestId?: string) {
    super(message, 'authentication_error', 401, undefined, requestId);
    this.name = 'AuthenticationError';
  }
}

/**
 * Invalid request error (validation failures)
 */
export class InvalidRequestError extends ArcPayB2BError {
  readonly field?: string;

  constructor(
    message: string,
    field?: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message, 'invalid_request_error', 400, details, requestId);
    this.name = 'InvalidRequestError';
    this.field = field;
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ArcPayB2BError {
  readonly resourceType: string;
  readonly resourceId: string;

  constructor(
    resourceType: string,
    resourceId: string,
    requestId?: string
  ) {
    super(
      `${resourceType} with ID '${resourceId}' not found`,
      'not_found_error',
      404,
      { resourceType, resourceId },
      requestId
    );
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ArcPayB2BError {
  readonly retryAfter?: number;

  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    requestId?: string
  ) {
    super(message, 'rate_limit_error', 429, { retryAfter }, requestId);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Network error (connection failures)
 */
export class NetworkError extends ArcPayB2BError {
  readonly originalError?: Error;

  constructor(message = 'Network error occurred', cause?: Error) {
    super(message, 'network_error', undefined, { cause: cause?.message });
    this.name = 'NetworkError';
    this.originalError = cause;
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ArcPayB2BError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number, requestId?: string) {
    super(
      `Request timed out after ${timeoutMs}ms`,
      'timeout_error',
      undefined,
      { timeoutMs },
      requestId
    );
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Webhook signature verification error
 */
export class WebhookSignatureError extends ArcPayB2BError {
  constructor(message = 'Webhook signature verification failed') {
    super(message, 'webhook_signature_error', 400);
    this.name = 'WebhookSignatureError';
  }
}

/**
 * Insufficient credits error
 */
export class InsufficientCreditsError extends ArcPayB2BError {
  readonly accountId: string;
  readonly required: number;
  readonly available: number;

  constructor(
    accountId: string,
    required: number,
    available: number,
    requestId?: string
  ) {
    super(
      `Insufficient credits: required ${required}, available ${available}`,
      'insufficient_credits_error',
      402,
      { accountId, required, available },
      requestId
    );
    this.name = 'InsufficientCreditsError';
    this.accountId = accountId;
    this.required = required;
    this.available = available;
  }
}

/**
 * Dispute error
 */
export class DisputeError extends ArcPayB2BError {
  readonly disputeId?: string;

  constructor(
    message: string,
    disputeId?: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message, 'dispute_error', 400, { ...details, disputeId }, requestId);
    this.name = 'DisputeError';
    this.disputeId = disputeId;
  }
}

/**
 * Treasury error
 */
export class TreasuryError extends ArcPayB2BError {
  readonly treasuryId?: string;

  constructor(
    message: string,
    treasuryId?: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message, 'treasury_error', 400, { ...details, treasuryId }, requestId);
    this.name = 'TreasuryError';
    this.treasuryId = treasuryId;
  }
}

/**
 * Settlement error
 */
export class SettlementError extends ArcPayB2BError {
  readonly settlementId?: string;
  readonly txHash?: string;

  constructor(
    message: string,
    settlementId?: string,
    txHash?: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(
      message,
      'settlement_error',
      400,
      { ...details, settlementId, txHash },
      requestId
    );
    this.name = 'SettlementError';
    this.settlementId = settlementId;
    this.txHash = txHash;
  }
}

/**
 * Create appropriate error from API response
 */
export function createErrorFromResponse(
  statusCode: number,
  body: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  },
  requestId?: string
): ArcPayB2BError {
  const message = body.message || 'An error occurred';

  switch (statusCode) {
    case 401:
      return new AuthenticationError(message, requestId);
    case 404:
      return new NotFoundError(
        body.details?.resourceType as string || 'Resource',
        body.details?.resourceId as string || 'unknown',
        requestId
      );
    case 429:
      return new RateLimitError(
        message,
        body.details?.retryAfter as number,
        requestId
      );
    case 400:
      return new InvalidRequestError(
        message,
        body.details?.field as string,
        body.details,
        requestId
      );
    case 402:
      return new InsufficientCreditsError(
        body.details?.accountId as string || 'unknown',
        body.details?.required as number || 0,
        body.details?.available as number || 0,
        requestId
      );
    default:
      return new ArcPayB2BError(
        message,
        body.code || 'api_error',
        statusCode,
        body.details,
        requestId
      );
  }
}
