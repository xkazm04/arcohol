/**
 * Test fixtures and data factories for @arcpay/react
 *
 * Create realistic test data for unit and integration tests.
 *
 * @example
 * ```typescript
 * import { createWallet, createTransaction } from '@arcpay/react/testing';
 *
 * const wallet = createWallet({ address: '0x1234...' });
 * const tx = createTransaction({ status: 'completed' });
 * ```
 */

import type { Wallet, Transaction, PaymentRequest } from '../types';
import type {
  WalletFixtureOptions,
  TransactionFixtureOptions,
} from './types';

// Seeded random number generator for reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  string(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      chars[Math.floor(this.next() * chars.length)]
    ).join('');
  }

  hex(length: number = 40): string {
    return Array.from({ length }, () =>
      Math.floor(this.next() * 16).toString(16)
    ).join('');
  }
}

let globalRandom = new SeededRandom();

/**
 * Set seed for reproducible test data
 */
export function setSeed(seed: number): void {
  globalRandom = new SeededRandom(seed);
}

/**
 * Reset to random seed
 */
export function resetSeed(): void {
  globalRandom = new SeededRandom();
}

// ID generators
const generateId = () => globalRandom.string(24);
const generateAddress = () => `0x${globalRandom.hex(40)}`;
const generateTxHash = () => `0x${globalRandom.hex(64)}`;

/**
 * Create a mock Wallet
 */
export function createWallet(options?: WalletFixtureOptions): Wallet {
  const id = options?.id || generateId();
  const address = options?.address || generateAddress();
  const now = new Date();

  return {
    id,
    address,
    type: options?.type || 'circle',
    createdAt: now,
  };
}

/**
 * Create a mock Transaction
 */
export function createTransaction(options?: TransactionFixtureOptions): Transaction {
  const id = generateId();
  const now = new Date().toISOString();

  return {
    id,
    type: options?.type || 'transfer',
    state: options?.state || 'COMPLETE',
    amounts: [options?.amount || '100.00'],
    tokenId: 'usdc-token-id',
    walletId: generateId(),
    sourceAddress: options?.sourceAddress || generateAddress(),
    destinationAddress: options?.destinationAddress || generateAddress(),
    transactionType: options?.type === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
    hash: options?.state === 'COMPLETE' ? generateTxHash() : undefined,
    createDate: now,
    updateDate: now,
  };
}

/**
 * Create multiple mock Transactions
 */
export function createTransactions(count: number, options?: TransactionFixtureOptions): Transaction[] {
  return Array.from({ length: count }, () => createTransaction(options));
}

/**
 * Create a mock PaymentRequest
 */
export function createPaymentRequest(overrides?: Partial<PaymentRequest>): PaymentRequest {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

  return {
    id,
    amount: '50.00',
    recipient: generateAddress(),
    description: 'Test payment request',
    status: 'pending',
    expiresAt,
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create a mock wallet balance
 */
export function createBalance(amount: string = '1000.00'): {
  balance: string;
  balanceRaw: bigint;
} {
  const parsed = parseFloat(amount);
  return {
    balance: parsed.toFixed(2),
    balanceRaw: BigInt(Math.floor(parsed * 1e6)),
  };
}

/**
 * Mock addresses for testing
 */
export const mockAddresses = {
  alice: '0x1234567890123456789012345678901234567890',
  bob: '0x0987654321098765432109876543210987654321',
  charlie: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  merchant: '0x1111111111111111111111111111111111111111',
  usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
} as const;

/**
 * Mock transaction hashes
 */
export const mockTxHashes = {
  success: '0x' + '1'.repeat(64),
  pending: '0x' + '2'.repeat(64),
  failed: '0x' + '3'.repeat(64),
} as const;
