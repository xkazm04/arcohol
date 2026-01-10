/**
 * Mock providers for testing ArcPay React components
 *
 * @example
 * ```tsx
 * import { MockArcPayProvider } from '@arcpay/react/testing';
 *
 * test('renders wallet button', () => {
 *   render(
 *     <MockArcPayProvider mockConfig={{ isConnected: true, balance: '100.00' }}>
 *       <WalletWidget />
 *     </MockArcPayProvider>
 *   );
 * });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Wallet, Transaction, TransactionResult } from '../types';
import type { MockProviderConfig } from './types';
import { createWallet, createTransaction, createBalance } from './fixtures';

// Default mock configuration
const defaultConfig: Required<MockProviderConfig> = {
  wallet: null,
  balance: '0.00',
  isConnected: false,
  isConnecting: false,
  error: null,
  transactions: [],
  shouldFail: false,
  delay: 0,
  theme: 'light',
  network: 'testnet',
};

// Mock context value type
interface MockContextValue {
  config: Required<MockProviderConfig>;
  updateConfig: (updates: Partial<MockProviderConfig>) => void;
  // Wallet methods
  connect: () => Promise<void>;
  disconnect: () => void;
  createWalletMethod: () => Promise<Wallet>;
  copyAddress: () => Promise<void>;
  // Transfer methods
  transfer: (params: { to: string; amount: string; memo?: string }) => Promise<TransactionResult>;
  // Balance
  refetchBalance: () => Promise<void>;
  // Payment
  createPaymentRequest: (params: { amount: string; recipient: string; description?: string }) => { id: string; amount: string; recipient: string };
}

const MockContext = createContext<MockContextValue | null>(null);

/**
 * Hook to access mock context (for internal use in testing)
 */
export function useMockContext(): MockContextValue {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMockContext must be used within MockArcPayProvider');
  }
  return context;
}

interface MockArcPayProviderProps {
  children: React.ReactNode;
  mockConfig?: MockProviderConfig;
}

/**
 * Mock provider for testing ArcPay components
 *
 * Provides a complete mock environment that simulates the ArcPay SDK
 * without making real API calls or blockchain transactions.
 */
export function MockArcPayProvider({
  children,
  mockConfig = {},
}: MockArcPayProviderProps): React.ReactElement {
  const [config, setConfig] = useState<Required<MockProviderConfig>>(() => ({
    ...defaultConfig,
    ...mockConfig,
  }));

  const delay = useCallback(async () => {
    if (config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }
  }, [config.delay]);

  const updateConfig = useCallback((updates: Partial<MockProviderConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(async () => {
    updateConfig({ isConnecting: true, error: null });
    await delay();

    if (config.shouldFail) {
      updateConfig({
        isConnecting: false,
        error: new Error('Connection failed (mock)'),
      });
      throw new Error('Connection failed (mock)');
    }

    const wallet = createWallet();
    updateConfig({
      wallet,
      isConnected: true,
      isConnecting: false,
      balance: '100.00',
    });
  }, [config.shouldFail, delay, updateConfig]);

  const disconnect = useCallback(() => {
    updateConfig({
      wallet: null,
      isConnected: false,
      balance: '0.00',
    });
  }, [updateConfig]);

  const createWalletMethod = useCallback(async (): Promise<Wallet> => {
    await delay();

    if (config.shouldFail) {
      throw new Error('Wallet creation failed (mock)');
    }

    const wallet = createWallet();
    updateConfig({
      wallet,
      isConnected: true,
      balance: '0.00',
    });
    return wallet;
  }, [config.shouldFail, delay, updateConfig]);

  const copyAddress = useCallback(async () => {
    if (config.wallet?.address) {
      await navigator.clipboard?.writeText(config.wallet.address);
    }
  }, [config.wallet?.address]);

  const transfer = useCallback(
    async (params: { to: string; amount: string; memo?: string }): Promise<TransactionResult> => {
      await delay();

      const tx = createTransaction({
        type: 'transfer',
        state: config.shouldFail ? 'FAILED' : 'COMPLETE',
        amount: params.amount,
        sourceAddress: config.wallet?.address,
        destinationAddress: params.to,
      });

      if (config.shouldFail) {
        return {
          success: false,
          transaction: tx,
        };
      }

      // Update balance
      const currentBalance = parseFloat(config.balance);
      const transferAmount = parseFloat(params.amount);
      const newBalance = Math.max(0, currentBalance - transferAmount).toFixed(2);

      updateConfig({
        balance: newBalance,
        transactions: [tx, ...config.transactions],
      });

      return {
        success: true,
        hash: tx.hash,
        transaction: tx,
      };
    },
    [config.shouldFail, config.wallet?.address, config.balance, config.transactions, delay, updateConfig]
  );

  const refetchBalance = useCallback(async () => {
    await delay();
    // In mock, balance stays the same unless manually updated
  }, [delay]);

  const createPaymentRequest = useCallback(
    (params: { amount: string; recipient: string; description?: string }) => {
      return {
        id: `pr_${Date.now()}`,
        amount: params.amount,
        recipient: params.recipient,
        description: params.description,
      };
    },
    []
  );

  const value = useMemo<MockContextValue>(
    () => ({
      config,
      updateConfig,
      connect,
      disconnect,
      createWalletMethod,
      copyAddress,
      transfer,
      refetchBalance,
      createPaymentRequest,
    }),
    [
      config,
      updateConfig,
      connect,
      disconnect,
      createWalletMethod,
      copyAddress,
      transfer,
      refetchBalance,
      createPaymentRequest,
    ]
  );

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>;
}

/**
 * Hook implementations that use mock context
 */
export function createMockHooks() {
  return {
    useWallet: () => {
      const { config, connect, disconnect, createWalletMethod, copyAddress } = useMockContext();
      return {
        wallet: config.wallet as Wallet | null,
        address: config.wallet?.address || null,
        isConnected: config.isConnected,
        isConnecting: config.isConnecting,
        error: config.error,
        connect,
        disconnect,
        createWallet: createWalletMethod,
        copyAddress,
        getQRCode: () => config.wallet?.address ? `ethereum:${config.wallet.address}` : '',
      };
    },

    useBalance: () => {
      const { config, refetchBalance } = useMockContext();
      const { balance, balanceRaw } = createBalance(config.balance);
      return {
        balance,
        balanceRaw,
        isLoading: false,
        error: config.error,
        refetch: refetchBalance,
      };
    },

    useTransfer: () => {
      const { transfer } = useMockContext();
      return {
        transfer,
        isTransferring: false,
        error: null,
      };
    },

    useTransactionHistory: () => {
      const { config } = useMockContext();
      return {
        transactions: config.transactions,
        isLoading: false,
        error: null,
        hasMore: false,
        loadMore: async () => {},
        refetch: async () => {},
      };
    },

    usePayment: () => {
      const { createPaymentRequest, transfer } = useMockContext();
      return {
        createPaymentRequest: (params: { amount: string | number; recipient: string; description?: string }) => ({
          id: `pr_${Date.now()}`,
          amount: typeof params.amount === 'number' ? params.amount.toFixed(2) : params.amount,
          recipient: params.recipient,
          description: params.description,
          status: 'pending' as const,
          createdAt: new Date(),
        }),
        payRequest: async (request: { recipient: string; amount: string; description?: string }) =>
          transfer({ to: request.recipient, amount: request.amount, memo: request.description }),
        getPaymentQR: (request: { id: string; amount: string; recipient: string }) =>
          `arcpay:${btoa(JSON.stringify({ type: 'arcpay', ...request }))}`,
        parsePaymentRequest: (data: string) => {
          try {
            if (!data.startsWith('arcpay:')) return null;
            return JSON.parse(atob(data.slice(7)));
          } catch {
            return null;
          }
        },
      };
    },
  };
}
