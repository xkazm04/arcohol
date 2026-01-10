import { z } from 'zod';
import type { ValidationResult } from '../types';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateRecipient(recipient: string): ValidationResult {
  const trimmed = recipient.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Recipient is required' };
  }

  if (isValidAddress(trimmed)) {
    return { isValid: true, normalizedValue: trimmed.toLowerCase() };
  }

  if (isValidEmail(trimmed)) {
    return { isValid: true, normalizedValue: trimmed.toLowerCase() };
  }

  return {
    isValid: false,
    error: 'Invalid recipient. Please enter a valid address or email.',
  };
}

export function validateAmount(
  amount: string | number,
  options?: {
    min?: number;
    max?: number;
    balance?: string;
  }
): ValidationResult {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (numericAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (options?.min && numericAmount < options.min) {
    return { isValid: false, error: `Minimum amount is $${options.min}` };
  }

  if (options?.max && numericAmount > options.max) {
    return { isValid: false, error: `Maximum amount is $${options.max}` };
  }

  if (options?.balance) {
    const balanceNum = parseFloat(options.balance);
    if (numericAmount > balanceNum) {
      return { isValid: false, error: 'Insufficient balance' };
    }
  }

  return {
    isValid: true,
    normalizedValue: numericAmount.toFixed(2),
  };
}

export const transferParamsSchema = z.object({
  to: z.string().min(1, 'Recipient is required'),
  amount: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    },
    { message: 'Amount must be a positive number' }
  ),
  memo: z.string().max(256, 'Memo must be less than 256 characters').optional(),
  idempotencyKey: z.string().optional(),
});

export const paymentRequestSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  recipient: z.string().min(1, 'Recipient is required'),
  description: z.string().max(500).optional(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});
