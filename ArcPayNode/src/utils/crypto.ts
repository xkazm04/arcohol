/**
 * Cryptographic utilities for webhook signature verification
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookSignatureError } from './errors';

const SIGNATURE_HEADER = 'arcpay-signature';
const TIMESTAMP_HEADER = 'arcpay-timestamp';
const DEFAULT_TOLERANCE = 300; // 5 minutes

export interface SignatureHeader {
  timestamp: number;
  signatures: string[];
}

/**
 * Parse the signature header into its components
 */
export function parseSignatureHeader(header: string): SignatureHeader {
  const parts = header.split(',');
  let timestamp = 0;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = parseInt(value, 10);
    } else if (key === 'v1') {
      signatures.push(value);
    }
  }

  if (!timestamp || signatures.length === 0) {
    throw new WebhookSignatureError('Invalid signature header format');
  }

  return { timestamp, signatures };
}

/**
 * Compute the expected signature for a payload
 */
export function computeSignature(
  timestamp: number,
  payload: string | Buffer,
  secret: string
): string {
  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
  const signedPayload = `${timestamp}.${payloadString}`;

  return createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string | Buffer,
  signatureHeader: string,
  secret: string,
  tolerance: number = DEFAULT_TOLERANCE
): boolean {
  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    throw new WebhookSignatureError(
      `Webhook timestamp too old. Event timestamp: ${timestamp}, current time: ${now}`
    );
  }

  // Compute expected signature
  const expectedSignature = computeSignature(timestamp, payload, secret);

  // Compare signatures using timing-safe comparison
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  for (const signature of signatures) {
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return true;
    }
  }

  throw new WebhookSignatureError('Signature verification failed');
}

/**
 * Generate a signature for outgoing webhooks (for testing)
 */
export function generateSignature(payload: string, secret: string): {
  signature: string;
  timestamp: number;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = computeSignature(timestamp, payload, secret);

  return {
    signature: `t=${timestamp},v1=${signature}`,
    timestamp,
  };
}

/**
 * Generate a random webhook secret
 */
export function generateWebhookSecret(): string {
  const { randomBytes } = require('crypto');
  return `whsec_${randomBytes(32).toString('hex')}`;
}

export { SIGNATURE_HEADER, TIMESTAMP_HEADER, DEFAULT_TOLERANCE };

// Re-export WebhookSignatureError for convenience
export { WebhookSignatureError } from './errors';
