/**
 * Validation utilities
 */

import { InvalidRequestError } from './errors';

/**
 * Validate that a value is a non-empty string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidRequestError(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Validate that a value is a positive number or numeric string
 */
export function validateAmount(value: unknown, fieldName: string): string {
  if (typeof value === 'number') {
    if (value <= 0 || !Number.isFinite(value)) {
      throw new InvalidRequestError(`${fieldName} must be a positive number`);
    }
    return value.toFixed(6);
  }

  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      throw new InvalidRequestError(`${fieldName} must be a positive number`);
    }
    return num.toFixed(6);
  }

  throw new InvalidRequestError(`${fieldName} must be a number or numeric string`);
}

/**
 * Validate Ethereum address
 */
export function validateAddress(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`);
  }

  const address = value.trim();

  // Basic Ethereum address validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new InvalidRequestError(`${fieldName} must be a valid Ethereum address`);
  }

  return address;
}

/**
 * Validate email address
 */
export function validateEmail(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`);
  }

  const email = value.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new InvalidRequestError(`${fieldName} must be a valid email address`);
  }

  return email;
}

/**
 * Validate URL
 */
export function validateUrl(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new InvalidRequestError(`${fieldName} must be a string`);
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
    return value;
  } catch {
    throw new InvalidRequestError(`${fieldName} must be a valid URL`);
  }
}

/**
 * Validate that a value is one of allowed values
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new InvalidRequestError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }
  return value as T;
}

/**
 * Validate optional field
 */
export function validateOptional<T>(
  value: unknown,
  validator: (v: unknown, f: string) => T,
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
      throw new InvalidRequestError(`${fieldName} must be a valid date`);
    }
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new InvalidRequestError(`${fieldName} must be a valid date`);
    }
    return date;
  }

  throw new InvalidRequestError(`${fieldName} must be a date`);
}

/**
 * Validate positive integer
 */
export function validatePositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new InvalidRequestError(`${fieldName} must be a positive integer`);
  }
  return value;
}

/**
 * Validate metadata object
 */
export function validateMetadata(
  value: unknown,
  fieldName: string
): Record<string, string | number | boolean | null> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidRequestError(`${fieldName} must be an object`);
  }

  const metadata: Record<string, string | number | boolean | null> = {};

  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof key !== 'string' || key.length > 40) {
      throw new InvalidRequestError(
        `${fieldName} keys must be strings with max 40 characters`
      );
    }

    if (
      val !== null &&
      typeof val !== 'string' &&
      typeof val !== 'number' &&
      typeof val !== 'boolean'
    ) {
      throw new InvalidRequestError(
        `${fieldName} values must be strings, numbers, booleans, or null`
      );
    }

    if (typeof val === 'string' && val.length > 500) {
      throw new InvalidRequestError(
        `${fieldName} string values must be max 500 characters`
      );
    }

    metadata[key] = val as string | number | boolean | null;
  }

  return metadata;
}
