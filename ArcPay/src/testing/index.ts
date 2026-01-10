/**
 * @arcpay/react/testing - Testing utilities for ArcPay React SDK
 *
 * This module provides tools for testing your ArcPay React integration
 * without making real API calls or blockchain transactions.
 *
 * @example
 * ```tsx
 * import {
 *   MockArcPayProvider,
 *   createWallet,
 *   createTransaction,
 *   createTestWrapper,
 *   assertions,
 * } from '@arcpay/react/testing';
 *
 * // Wrap components for testing
 * render(
 *   <MockArcPayProvider mockConfig={{ isConnected: true, balance: '100.00' }}>
 *     <WalletWidget />
 *   </MockArcPayProvider>
 * );
 *
 * // Or use with @testing-library/react wrapper pattern
 * const wrapper = createTestWrapper({ isConnected: true });
 * render(<PayButton />, { wrapper });
 *
 * // Create test fixtures
 * const wallet = createWallet();
 * const tx = createTransaction({ status: 'completed' });
 * ```
 *
 * @packageDocumentation
 */

// Mock providers
export {
  MockArcPayProvider,
  useMockContext,
  createMockHooks,
} from './MockProviders';

// Fixtures
export {
  // Seed management
  setSeed,
  resetSeed,
  // Entity factories
  createWallet,
  createTransaction,
  createTransactions,
  createPaymentRequest,
  createBalance,
  // Mock data
  mockAddresses,
  mockTxHashes,
} from './fixtures';

// Test utilities
export {
  TestWrapper,
  createTestWrapper,
  createMockFunctions,
  waitForTransaction,
  simulateWalletConnect,
  simulateWalletDisconnect,
  simulateTransactionEvent,
  simulateBalanceChange,
  simulateErrorState,
  useTestActions,
  assertions,
} from './utils';

// Types
export type {
  MockProviderConfig,
  MockHookState,
  RenderResult,
  RenderOptions,
  WalletFixtureOptions,
  TransactionFixtureOptions,
} from './types';
