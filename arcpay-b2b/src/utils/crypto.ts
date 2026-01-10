/**
 * Cryptographic utilities for webhook signature verification
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookSignatureError } from './errors';

const SIGNATURE_PREFIX = 'v1=';
const DEFAULT_TOLERANCE = 300; // 5 minutes in seconds

/**
 * Parse the signature header
 * Format: t=timestamp,v1=signature
 */
export function parseSignatureHeader(header: string): {
  timestamp: number;
  signatures: string[];
} {
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

  return { timestamp, signatures };
}

/**
 * Compute the expected signature
 */
export function computeSignature(
  timestamp: number,
  payload: string,
  secret: string
): string {
  const signedPayload = `${timestamp}.${payload}`;
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
  const payloadString =
    typeof payload === 'string' ? payload : payload.toString('utf8');

  // Parse the signature header
  const { timestamp, signatures } = parseSignatureHeader(signatureHeader);

  if (!timestamp || signatures.length === 0) {
    throw new WebhookSignatureError(
      'Invalid signature header format'
    );
  }

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    throw new WebhookSignatureError(
      `Webhook timestamp is outside tolerance window (${tolerance}s)`
    );
  }

  // Compute expected signature
  const expectedSignature = computeSignature(timestamp, payloadString, secret);

  // Check if any signature matches
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  for (const signature of signatures) {
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (signatureBuffer.length === expectedBuffer.length) {
      if (timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return true;
      }
    }
  }

  throw new WebhookSignatureError('Webhook signature verification failed');
}

/**
 * Generate a signature header for testing
 */
export function generateSignatureHeader(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signature = computeSignature(ts, payload, secret);
  return `t=${ts},${SIGNATURE_PREFIX}${signature}`;
}

/**
 * Generate a random webhook secret
 */
export function generateWebhookSecret(): string {
  const { randomBytes } = require('crypto');
  return `whsec_${randomBytes(24).toString('base64url')}`;
}
