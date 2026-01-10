/**
 * Validation utilities for the B2B SDK
 */

import { z } from 'zod';
import { InvalidRequestError } from './errors';

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that a value is a non-empty string
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`, fieldName);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new InvalidRequestError(`${fieldName} cannot be empty`, fieldName);
  }

  if (options?.minLength && trimmed.length < options.minLength) {
    throw new InvalidRequestError(
      `${fieldName} must be at least ${options.minLength} characters`,
      fieldName
    );
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    throw new InvalidRequestError(
      `${fieldName} must be at most ${options.maxLength} characters`,
      fieldName
    );
  }

  return trimmed;
}

/**
 * Validate that a value is a positive number
 */
export function validateAmount(
  value: unknown,
  fieldName: string,
  options?: { min?: number; max?: number }
): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    throw new InvalidRequestError(`${fieldName} must be a number`, fieldName);
  }

  const min = options?.min ?? 0;
  if (num < min) {
    throw new InvalidRequestError(
      `${fieldName} must be at least ${min}`,
      fieldName
    );
  }

  if (options?.max && num > options.max) {
    throw new InvalidRequestError(
      `${fieldName} must be at most ${options.max}`,
      fieldName
    );
  }

  return num;
}

/**
 * Validate blockchain address
 */
export function validateAddress(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`, fieldName);
  }

  const address = value.trim().toLowerCase();

  // Basic Ethereum-style address validation
  if (!/^0x[a-f0-9]{40}$/i.test(address)) {
    throw new InvalidRequestError(
      `${fieldName} must be a valid blockchain address`,
      fieldName
    );
  }

  return address;
}

/**
 * Validate email address
 */
export function validateEmail(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`, fieldName);
  }

  const email = value.trim().toLowerCase();

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InvalidRequestError(
      `${fieldName} must be a valid email address`,
      fieldName
    );
  }

  return email;
}

/**
 * Validate URL
 */
export function validateUrl(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`, fieldName);
  }

  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
    return url.toString();
  } catch {
    throw new InvalidRequestError(
      `${fieldName} must be a valid URL`,
      fieldName
    );
  }
}

/**
 * Validate metadata object
 */
export function validateMetadata(
  value: unknown,
  fieldName: string
): Record<string, string | number | boolean> {
  if (value === undefined || value === null) {
    return {};
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidRequestError(
      `${fieldName} must be an object`,
      fieldName
    );
  }

  const metadata = value as Record<string, unknown>;
  const result: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(metadata)) {
    if (
      typeof val !== 'string' &&
      typeof val !== 'number' &&
      typeof val !== 'boolean'
    ) {
      throw new InvalidRequestError(
        `${fieldName}.${key} must be a string, number, or boolean`,
        `${fieldName}.${key}`
      );
    }
    result[key] = val;
  }

  return result;
}

/**
 * Validate optional field
 */
export function validateOptional<T>(
  value: unknown,
  validator: (val: unknown, field: string) => T,
  fieldName: string
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return validator(value, fieldName);
}

/**
 * Validate date
 */
export function validateDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new InvalidRequestError(`${fieldName} is not a valid date`, fieldName);
    }
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new InvalidRequestError(`${fieldName} is not a valid date`, fieldName);
    }
    return date;
  }

  throw new InvalidRequestError(`${fieldName} must be a valid date`, fieldName);
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`, fieldName);
  }

  if (!allowedValues.includes(value as T)) {
    throw new InvalidRequestError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName
    );
  }

  return value as T;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const moneySchema = z.object({
  amount: z.string(),
  currency: z.enum(['USDC', 'USDY', 'USD']),
});

export const blockchainAddressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chain: z.enum(['arc', 'ethereum', 'base', 'polygon', 'arbitrum', 'optimism']),
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  cursor: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const metadataSchema = z.record(
  z.union([z.string(), z.number(), z.boolean()])
);

// ============================================================================
// API Key Validation
// ============================================================================

/**
 * Validate secret key format
 */
export function validateSecretKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new InvalidRequestError('Secret key is required', 'secretKey');
  }

  if (!key.startsWith('sk_')) {
    throw new InvalidRequestError(
      'Invalid secret key format. Secret keys should start with "sk_"',
      'secretKey'
    );
  }
}

/**
 * Validate public key format
 */
export function validatePublicKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new InvalidRequestError('Public key is required', 'publicKey');
  }

  if (!key.startsWith('pk_')) {
    throw new InvalidRequestError(
      'Invalid public key format. Public keys should start with "pk_"',
      'publicKey'
    );
  }
}
