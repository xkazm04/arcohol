/**
 * Testing utilities for @arcpay/react
 *
 * @example
 * ```tsx
 * import { renderWithArcPay, simulateConnect, waitForTransaction } from '@arcpay/react/testing';
 *
 * test('sends payment', async () => {
 *   const { simulateConnect } = renderWithArcPay(<PaymentForm />);
 *   simulateConnect({ balance: '100.00' });
 *   // Test your component
 * });
 * ```
 */

import React from 'react';
import { MockArcPayProvider, useMockContext } from './MockProviders';
import { createWallet, createTransaction } from './fixtures';
import type { MockProviderConfig, RenderOptions, RenderResult } from './types';
import type { Wallet, Transaction } from '../types';

/**
 * Wraps a component with MockArcPayProvider for testing
 *
 * @example
 * ```tsx
 * const { rerender } = render(
 *   <TestWrapper mockConfig={{ isConnected: true }}>
 *     <WalletWidget />
 *   </TestWrapper>
 * );
 * ```
 */
export function TestWrapper({
  children,
  mockConfig,
}: {
  children: React.ReactNode;
  mockConfig?: MockProviderConfig;
}): React.ReactElement {
  return (
    <MockArcPayProvider mockConfig={mockConfig}>{children}</MockArcPayProvider>
  );
}

/**
 * Create a test wrapper factory for @testing-library/react
 *
 * @example
 * ```tsx
 * import { render } from '@testing-library/react';
 * import { createTestWrapper } from '@arcpay/react/testing';
 *
 * const wrapper = createTestWrapper({ isConnected: true, balance: '100.00' });
 * render(<WalletWidget />, { wrapper });
 * ```
 */
export function createTestWrapper(
  mockConfig?: MockProviderConfig
): React.ComponentType<{ children: React.ReactNode }> {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockArcPayProvider mockConfig={mockConfig}>{children}</MockArcPayProvider>
    );
  };
}

/**
 * Create mock functions for hook return values
 */
export function createMockFunctions() {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    createWallet: jest.fn().mockResolvedValue(createWallet()),
    copyAddress: jest.fn().mockResolvedValue(undefined),
    transfer: jest.fn().mockResolvedValue({
      success: true,
      txHash: '0x' + '1'.repeat(64),
      transaction: createTransaction({ state: 'COMPLETE' }),
    }),
    refetch: jest.fn().mockResolvedValue(undefined),
    loadMore: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Wait for a simulated transaction to complete
 */
export async function waitForTransaction(delay: number = 100): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Simulate a wallet connection
 */
export function simulateWalletConnect(
  updateConfig: (config: Partial<MockProviderConfig>) => void,
  walletOptions?: { id?: string; address?: string; type?: 'circle' | 'external' | 'walletconnect' }
): void {
  const wallet = createWallet(walletOptions);
  updateConfig({
    wallet,
    isConnected: true,
    isConnecting: false,
    balance: '100.00',
  });
}

/**
 * Simulate a wallet disconnection
 */
export function simulateWalletDisconnect(
  updateConfig: (config: Partial<MockProviderConfig>) => void
): void {
  updateConfig({
    wallet: null,
    isConnected: false,
    balance: '0.00',
  });
}

/**
 * Simulate a transaction
 */
export function simulateTransactionEvent(
  updateConfig: (config: Partial<MockProviderConfig>) => void,
  currentTransactions: Transaction[],
  txOptions?: { type?: 'INBOUND' | 'OUTBOUND' | 'transfer'; state?: 'COMPLETE' | 'FAILED'; amount?: string }
): Transaction {
  const tx = createTransaction(txOptions);
  updateConfig({
    transactions: [tx, ...currentTransactions],
  });
  return tx;
}

/**
 * Simulate a balance update
 */
export function simulateBalanceChange(
  updateConfig: (config: Partial<MockProviderConfig>) => void,
  newBalance: string
): void {
  updateConfig({ balance: newBalance });
}

/**
 * Simulate an error
 */
export function simulateErrorState(
  updateConfig: (config: Partial<MockProviderConfig>) => void,
  error: Error
): void {
  updateConfig({ error });
}

/**
 * Hook for test components to interact with mock state
 *
 * @example
 * ```tsx
 * function TestHelper() {
 *   const { simulateConnect, simulateTransaction } = useTestActions();
 *   return (
 *     <button onClick={() => simulateConnect()}>Connect</button>
 *   );
 * }
 * ```
 */
export function useTestActions() {
  const { config, updateConfig } = useMockContext();

  return {
    simulateConnect: (walletOptions?: { id?: string; address?: string; type?: 'circle' | 'external' | 'walletconnect' }) => {
      simulateWalletConnect(updateConfig, walletOptions);
    },
    simulateDisconnect: () => {
      simulateWalletDisconnect(updateConfig);
    },
    simulateTransaction: (txOptions?: { type?: 'INBOUND' | 'OUTBOUND' | 'transfer'; state?: 'COMPLETE' | 'FAILED'; amount?: string }) => {
      return simulateTransactionEvent(updateConfig, config.transactions, txOptions);
    },
    simulateBalanceUpdate: (balance: string) => {
      simulateBalanceChange(updateConfig, balance);
    },
    simulateError: (error: Error) => {
      simulateErrorState(updateConfig, error);
    },
    clearError: () => {
      updateConfig({ error: null });
    },
    setDelay: (delay: number) => {
      updateConfig({ delay });
    },
    setShouldFail: (shouldFail: boolean) => {
      updateConfig({ shouldFail });
    },
    getMockState: () => config,
  };
}

/**
 * Assertions for ArcPay testing
 */
export const assertions = {
  /**
   * Assert wallet is connected
   */
  expectConnected: (mockState: MockProviderConfig) => {
    expect(mockState.isConnected).toBe(true);
    expect(mockState.wallet).not.toBeNull();
  },

  /**
   * Assert wallet is disconnected
   */
  expectDisconnected: (mockState: MockProviderConfig) => {
    expect(mockState.isConnected).toBe(false);
    expect(mockState.wallet).toBeNull();
  },

  /**
   * Assert balance equals expected value
   */
  expectBalance: (mockState: MockProviderConfig, expected: string) => {
    expect(mockState.balance).toBe(expected);
  },

  /**
   * Assert transaction count
   */
  expectTransactionCount: (mockState: MockProviderConfig, count: number) => {
    expect(mockState.transactions).toHaveLength(count);
  },

  /**
   * Assert has error
   */
  expectError: (mockState: MockProviderConfig, message?: string) => {
    expect(mockState.error).not.toBeNull();
    if (message) {
      expect(mockState.error?.message).toContain(message);
    }
  },
};
