/**
 * Custom error classes for ArcPay SDK
 */

export class ArcPayError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ArcPayError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ArcPayError.prototype);
  }
}

export class AuthenticationError extends ArcPayError {
  constructor(message = 'Invalid API key provided') {
    super(message, 'authentication_error', 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class InvalidRequestError extends ArcPayError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'invalid_request_error', 400, details);
    this.name = 'InvalidRequestError';
    Object.setPrototypeOf(this, InvalidRequestError.prototype);
  }
}

export class NotFoundError extends ArcPayError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'not_found_error', 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends ArcPayError {
  readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'rate_limit_error', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class WebhookSignatureError extends ArcPayError {
  constructor(message = 'Invalid webhook signature') {
    super(message, 'webhook_signature_error', 400);
    this.name = 'WebhookSignatureError';
    Object.setPrototypeOf(this, WebhookSignatureError.prototype);
  }
}

export class PaymentError extends ArcPayError {
  readonly paymentId?: string;

  constructor(message: string, paymentId?: string, details?: Record<string, unknown>) {
    super(message, 'payment_error', 402, details);
    this.name = 'PaymentError';
    this.paymentId = paymentId;
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

export class SubscriptionError extends ArcPayError {
  readonly subscriptionId?: string;

  constructor(message: string, subscriptionId?: string, details?: Record<string, unknown>) {
    super(message, 'subscription_error', 400, details);
    this.name = 'SubscriptionError';
    this.subscriptionId = subscriptionId;
    Object.setPrototypeOf(this, SubscriptionError.prototype);
  }
}

export class NetworkError extends ArcPayError {
  constructor(message = 'Network error occurred') {
    super(message, 'network_error', 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends ArcPayError {
  constructor(message = 'Request timed out') {
    super(message, 'timeout_error', 0);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
