/**
 * Headless Component Types for ArcPay React SDK
 *
 * These types define the render prop and slot patterns
 * for completely customizable components.
 */

import type { ReactNode, ComponentType, CSSProperties } from 'react';
import type { Transaction, Wallet } from '../types';

// =============================================================================
// Common Types
// =============================================================================

/**
 * Base props that all headless components accept
 * Generic T is the render props type for the render function pattern
 */
export interface HeadlessBaseProps<T = unknown> {
  /** Render as a different element or component */
  as?: keyof JSX.IntrinsicElements | ComponentType<Record<string, unknown>>;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Children or render function */
  children?: ReactNode | ((props: T) => ReactNode);
}

/**
 * Slot component type for compound components
 */
export type SlotComponent<P = object> = ComponentType<P> & {
  displayName?: string;
};

// =============================================================================
// Wallet Button Headless Types
// =============================================================================

export interface WalletButtonRenderProps {
  /** Current wallet object */
  wallet: Wallet | null;
  /** Wallet address */
  address: string | null;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Connect wallet function */
  connect: () => Promise<void>;
  /** Disconnect wallet function */
  disconnect: () => void;
  /** Formatted address (truncated) */
  formattedAddress: string | null;
}

export interface WalletButtonHeadlessProps extends HeadlessBaseProps<WalletButtonRenderProps> {
  /** Called after successful connection */
  onConnect?: () => void;
  /** Called after disconnection */
  onDisconnect?: () => void;
}

// =============================================================================
// Pay Button Headless Types
// =============================================================================

export interface PayButtonRenderProps {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether payment is processing */
  isProcessing: boolean;
  /** Whether confirmation modal is open */
  isConfirmOpen: boolean;
  /** Formatted amount string */
  formattedAmount: string;
  /** Recipient address/email */
  recipient: string;
  /** Payment description */
  description?: string;
  /** Initiate payment flow */
  initiatePayment: () => Promise<void>;
  /** Confirm and execute payment */
  confirmPayment: () => Promise<void>;
  /** Cancel payment */
  cancelPayment: () => void;
  /** Connect wallet (if not connected) */
  connect: () => Promise<void>;
  /** Last error if any */
  error: Error | null;
  /** Last successful transaction */
  lastTransaction: Transaction | null;
}

export interface PayButtonHeadlessProps extends HeadlessBaseProps<PayButtonRenderProps> {
  /** Amount to pay */
  amount: number | string;
  /** Recipient address or email */
  recipient: string;
  /** Payment description/memo */
  description?: string;
  /** Called on successful payment */
  onSuccess?: (transaction: Transaction) => void;
  /** Called on payment error */
  onError?: (error: Error) => void;
}

// =============================================================================
// Wallet Widget Headless Types
// =============================================================================

export interface WalletWidgetRenderProps {
  /** Current wallet */
  wallet: Wallet | null;
  /** Wallet address */
  address: string | null;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Current balance */
  balance: string;
  /** Whether balance is loading */
  isBalanceLoading: boolean;
  /** Formatted address */
  formattedAddress: string | null;
  /** Connect wallet */
  connect: () => Promise<void>;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Refresh balance */
  refreshBalance: () => Promise<void>;
  /** Open send modal */
  openSend: () => void;
  /** Open receive modal */
  openReceive: () => void;
  /** Open fund modal */
  openFund: () => void;
  /** Open cash out modal */
  openCashOut: () => void;
  /** Close all modals */
  closeModals: () => void;
  /** Currently active modal */
  activeModal: 'send' | 'receive' | 'fund' | 'cashout' | null;
}

export interface WalletWidgetSlots {
  /** Custom balance display */
  balance?: SlotComponent<{ balance: string; isLoading: boolean }>;
  /** Custom address display */
  address?: SlotComponent<{ address: string; formatted: string }>;
  /** Custom action buttons */
  actions?: SlotComponent<{
    onSend: () => void;
    onReceive: () => void;
    onFund: () => void;
    onCashOut: () => void;
  }>;
  /** Custom disconnected state */
  disconnected?: SlotComponent<{ onConnect: () => void; isConnecting: boolean }>;
  /** Custom send modal content */
  sendModal?: SlotComponent<{ onClose: () => void; onSuccess: () => void }>;
  /** Custom receive modal content */
  receiveModal?: SlotComponent<{ address: string; onClose: () => void }>;
}

export interface WalletWidgetHeadlessProps extends HeadlessBaseProps<WalletWidgetRenderProps> {
  /** Show balance section */
  showBalance?: boolean;
  /** Show address section */
  showAddress?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom slot components */
  slots?: WalletWidgetSlots;
  /** Callbacks */
  onSend?: () => void;
  onReceive?: () => void;
  onFund?: () => void;
}

// =============================================================================
// Transaction List Headless Types
// =============================================================================

export interface TransactionListRenderProps {
  /** List of transactions */
  transactions: Transaction[];
  /** Whether loading */
  isLoading: boolean;
  /** Whether there are more to load */
  hasMore: boolean;
  /** Load more transactions */
  loadMore: () => Promise<void>;
  /** Refresh list */
  refresh: () => Promise<void>;
  /** Whether list is empty */
  isEmpty: boolean;
}

export interface TransactionListSlots {
  /** Custom transaction item */
  item?: SlotComponent<{ transaction: Transaction; index: number }>;
  /** Custom empty state */
  empty?: SlotComponent<object>;
  /** Custom loading state */
  loading?: SlotComponent<object>;
  /** Custom load more button */
  loadMore?: SlotComponent<{ onClick: () => void; isLoading: boolean }>;
}

export interface TransactionListHeadlessProps extends HeadlessBaseProps<TransactionListRenderProps> {
  /** Custom slot components */
  slots?: TransactionListSlots;
}

// =============================================================================
// Balance Display Headless Types
// =============================================================================

export interface BalanceDisplayRenderProps {
  /** Balance amount */
  balance: string;
  /** Raw balance in smallest unit */
  balanceRaw: bigint;
  /** Whether loading */
  isLoading: boolean;
  /** Refresh balance */
  refresh: () => Promise<void>;
  /** Formatted balance with currency */
  formattedBalance: string;
  /** Any error */
  error: Error | null;
}

export interface BalanceDisplayHeadlessProps extends HeadlessBaseProps<BalanceDisplayRenderProps> {
  /** Currency symbol to display */
  currency?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Show refresh button */
  showRefresh?: boolean;
}
