/**
 * Types for @arcpay/react testing utilities
 */

import type { Wallet, Transaction, WalletBalance } from '../types';
import type { UseWalletReturn } from '../hooks/useWallet';
import type { UseBalanceReturn } from '../hooks/useBalance';
import type { UsePaymentReturn } from '../hooks/usePayment';
import type { UseTransferReturn } from '../hooks/useTransfer';
import type { UseTransactionHistoryReturn } from '../hooks/useTransactionHistory';

/**
 * Configuration for MockArcPayProvider
 */
export interface MockProviderConfig {
  /** Initial wallet state */
  wallet?: Partial<Wallet> | null;
  /** Initial balance (USDC amount as string) */
  balance?: string;
  /** Whether wallet is connected */
  isConnected?: boolean;
  /** Whether wallet is connecting */
  isConnecting?: boolean;
  /** Initial error state */
  error?: Error | null;
  /** Transaction history */
  transactions?: Transaction[];
  /** Whether operations should fail */
  shouldFail?: boolean;
  /** Simulated network delay in ms */
  delay?: number;
  /** Custom theme config */
  theme?: 'light' | 'dark' | 'minimal';
  /** Network type */
  network?: 'mainnet' | 'testnet';
}

/**
 * Mock hook state that can be updated
 */
export interface MockHookState {
  wallet: UseWalletReturn;
  balance: UseBalanceReturn;
  payment: UsePaymentReturn;
  transfer: UseTransferReturn;
  history: UseTransactionHistoryReturn;
}

/**
 * Result from renderWithArcPay
 */
export interface RenderResult {
  /** Update the mock state */
  updateMockState: (updates: Partial<MockProviderConfig>) => void;
  /** Simulate a transaction completion */
  simulateTransaction: (tx: Transaction) => void;
  /** Simulate wallet connection */
  simulateConnect: (wallet?: Partial<Wallet>) => void;
  /** Simulate wallet disconnection */
  simulateDisconnect: () => void;
  /** Simulate balance update */
  simulateBalanceUpdate: (balance: string) => void;
  /** Simulate error */
  simulateError: (error: Error) => void;
  /** Get current mock state */
  getMockState: () => MockProviderConfig;
}

/**
 * Options for renderWithArcPay
 */
export interface RenderOptions {
  /** Initial mock provider config */
  mockConfig?: MockProviderConfig;
  /** Additional providers to wrap */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Wallet fixture options
 */
export interface WalletFixtureOptions {
  id?: string;
  address?: string;
  type?: 'circle' | 'external' | 'walletconnect';
}

/**
 * Transaction fixture options
 */
export interface TransactionFixtureOptions {
  type?: 'INBOUND' | 'OUTBOUND' | 'transfer';
  state?: 'INITIATED' | 'PENDING_RISK_SCREENING' | 'CONFIRMED' | 'COMPLETE' | 'FAILED';
  amount?: string;
  sourceAddress?: string;
  destinationAddress?: string;
}
