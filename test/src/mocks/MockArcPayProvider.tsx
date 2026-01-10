'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type PropsWithChildren,
} from 'react';

// Mock wallet type
interface MockWallet {
  id: string;
  address: string;
  walletSetId: string;
}

// Mock transaction
interface MockTransaction {
  id: string;
  hash: string;
  state: 'COMPLETE' | 'PENDING' | 'FAILED';
  type: 'INBOUND' | 'OUTBOUND';
  amounts: string[];
  destinationAddress: string;
  sourceAddress: string;
  createDate: string;
}

interface MockArcPayContextValue {
  // Wallet
  wallet: MockWallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  balanceLoading: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  transfer: (params: { to: string; amount: string; memo?: string }) => Promise<{ transaction: MockTransaction }>;

  // State
  transactions: MockTransaction[];
  isTransferring: boolean;
  lastTransaction: MockTransaction | null;
}

const MockArcPayContext = createContext<MockArcPayContextValue | null>(null);

// Simulated delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate random address
const randomAddress = () =>
  '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export function MockArcPayProvider({
  children,
  initialBalance = '1250.00',
}: PropsWithChildren<{ initialBalance?: string }>) {
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(initialBalance);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<MockTransaction | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    await delay(1500); // Simulate connection time

    const mockWallet: MockWallet = {
      id: 'mock-wallet-' + Date.now(),
      address: randomAddress(),
      walletSetId: 'mock-wallet-set-1',
    };

    setWallet(mockWallet);
    setIsConnecting(false);

    // Simulate loading balance
    setBalanceLoading(true);
    await delay(500);
    setBalanceLoading(false);
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setTransactions([]);
    setLastTransaction(null);
  }, []);

  const transfer = useCallback(
    async (params: { to: string; amount: string; memo?: string }) => {
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      setIsTransferring(true);

      // Simulate transaction processing
      await delay(2000);

      const currentBalance = parseFloat(balance);
      const transferAmount = parseFloat(params.amount);

      if (transferAmount > currentBalance) {
        setIsTransferring(false);
        throw new Error('Insufficient balance');
      }

      const transaction: MockTransaction = {
        id: 'tx-' + Date.now(),
        hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        state: 'COMPLETE',
        type: 'OUTBOUND',
        amounts: [params.amount],
        destinationAddress: params.to,
        sourceAddress: wallet.address,
        createDate: new Date().toISOString(),
      };

      // Update balance
      setBalance((currentBalance - transferAmount).toFixed(2));

      // Add to transactions
      setTransactions((prev) => [transaction, ...prev]);
      setLastTransaction(transaction);
      setIsTransferring(false);

      return { transaction };
    },
    [wallet, balance]
  );

  return (
    <MockArcPayContext.Provider
      value={{
        wallet,
        isConnected: !!wallet,
        isConnecting,
        balance,
        balanceLoading,
        connect,
        disconnect,
        transfer,
        transactions,
        isTransferring,
        lastTransaction,
      }}
    >
      {children}
    </MockArcPayContext.Provider>
  );
}

export function useMockArcPay(): MockArcPayContextValue {
  const context = useContext(MockArcPayContext);
  if (!context) {
    throw new Error('useMockArcPay must be used within MockArcPayProvider');
  }
  return context;
}

// Hook aliases to match SDK API
export function useWallet() {
  const ctx = useMockArcPay();
  return {
    wallet: ctx.wallet,
    address: ctx.wallet?.address || null,
    isConnected: ctx.isConnected,
    isConnecting: ctx.isConnecting,
    connect: ctx.connect,
    disconnect: ctx.disconnect,
  };
}

export function useBalance() {
  const ctx = useMockArcPay();
  return {
    balance: ctx.balance,
    balanceRaw: BigInt(Math.floor(parseFloat(ctx.balance) * 1e6)),
    isLoading: ctx.balanceLoading,
    refetch: async () => {},
  };
}

export function useTransfer() {
  const ctx = useMockArcPay();
  return {
    isTransferring: ctx.isTransferring,
    lastTransaction: ctx.lastTransaction,
    transfer: ctx.transfer,
    estimateFee: async () => '0.00',
  };
}

export function useTransactionHistory() {
  const ctx = useMockArcPay();
  return {
    transactions: ctx.transactions,
    isLoading: false,
    hasMore: false,
    loadMore: async () => {},
    refresh: async () => {},
  };
}
