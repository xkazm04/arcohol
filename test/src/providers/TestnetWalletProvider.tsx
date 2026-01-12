'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Arc Testnet Configuration
export const ARC_TESTNET = {
  chainId: 1244,
  chainIdHex: '0x4dc',
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  blockExplorer: 'https://testnet.arcscan.app',
  nativeCurrency: {
    name: 'ARC',
    symbol: 'ARC',
    decimals: 18,
  },
};

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

interface BalanceState {
  balance: string;
  isLoading: boolean;
}

interface Transaction {
  id: string;
  hash: string;
  type: 'OUTBOUND' | 'INBOUND';
  amounts: string[];
  createDate: string;
  status: string;
}

interface TransferResult {
  transaction: {
    hash: string;
    from: string;
    to: string;
    amount: string;
  };
}

interface TestnetWalletContextType {
  // Wallet
  wallet: { address: string } | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToArcTestnet: () => Promise<void>;

  // Balance
  balance: string;
  balanceLoading: boolean;
  refetch: () => Promise<void>;

  // Transfer
  isTransferring: boolean;
  lastTransaction: Transaction | null;
  transfer: (params: { to: string; amount: string; memo?: string }) => Promise<TransferResult>;

  // History
  transactions: Transaction[];
}

const TestnetWalletContext = createContext<TestnetWalletContextType | null>(null);

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export function TestnetWalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    isCorrectNetwork: false,
  });

  const [balanceState, setBalanceState] = useState<BalanceState>({
    balance: '0.00',
    isLoading: false,
  });

  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!window.ethereum) return '0.00';

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string;

      const balanceNum = parseInt(balance, 16) / 1e18;
      return balanceNum.toFixed(2);
    } catch {
      return '0.00';
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!walletState.address) return;
    setBalanceState(prev => ({ ...prev, isLoading: true }));
    const balance = await getBalance(walletState.address);
    setBalanceState({ balance, isLoading: false });
  }, [walletState.address, getBalance]);

  const switchToArcTestnet = useCallback(async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } catch (switchError: unknown) {
      if ((switchError as { code?: number })?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ARC_TESTNET.chainIdHex,
              chainName: ARC_TESTNET.name,
              nativeCurrency: ARC_TESTNET.nativeCurrency,
              rpcUrls: [ARC_TESTNET.rpcUrl],
              blockExplorerUrls: [ARC_TESTNET.blockExplorer],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    if (!window.ethereum?.isMetaMask) {
      alert('Please install MetaMask to use testnet mode');
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const chainId = parseInt(chainIdHex, 16);
      const isCorrectNetwork = chainId === ARC_TESTNET.chainId;
      const balance = await getBalance(address);

      setWalletState({
        address,
        isConnected: true,
        isConnecting: false,
        chainId,
        isCorrectNetwork,
      });
      setBalanceState({ balance, isLoading: false });

      if (!isCorrectNetwork) {
        try {
          await switchToArcTestnet();
        } catch {
          // User rejected
        }
      }
    } catch {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [getBalance, switchToArcTestnet]);

  const disconnect = useCallback((): void => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      isCorrectNetwork: false,
    });
    setBalanceState({ balance: '0.00', isLoading: false });
    setTransactions([]);
  }, []);

  const transfer = useCallback(async (params: { to: string; amount: string; memo?: string }): Promise<TransferResult> => {
    if (!window.ethereum || !walletState.address) {
      throw new Error('Wallet not connected');
    }

    setIsTransferring(true);

    try {
      // Convert amount to wei (simplified - in real app you'd use proper USDC transfer)
      const amountWei = `0x${(parseFloat(params.amount) * 1e18).toString(16)}`;

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: walletState.address,
            to: params.to.startsWith('0x') ? params.to : `0x${'0'.repeat(40)}`, // Use zero address for demo
            value: amountWei,
            data: params.memo ? `0x${Buffer.from(params.memo).toString('hex')}` : undefined,
          },
        ],
      }) as string;

      const tx: Transaction = {
        id: txHash,
        hash: txHash,
        type: 'OUTBOUND',
        amounts: [params.amount],
        createDate: new Date().toISOString(),
        status: 'COMPLETE',
      };

      setLastTransaction(tx);
      setTransactions(prev => [tx, ...prev]);
      await refetch();

      return {
        transaction: {
          hash: txHash,
          from: walletState.address,
          to: params.to,
          amount: params.amount,
        },
      };
    } finally {
      setIsTransferring(false);
    }
  }, [walletState.address, refetch]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnect();
      } else {
        const address = accountsArray[0];
        const balance = await getBalance(address);
        setWalletState(prev => ({ ...prev, address }));
        setBalanceState({ balance, isLoading: false });
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const chainId = parseInt(chainIdHex as string, 16);
      setWalletState(prev => ({
        ...prev,
        chainId,
        isCorrectNetwork: chainId === ARC_TESTNET.chainId,
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length > 0) {
        const address = accountsArray[0];
        const chainIdHex = await window.ethereum!.request({ method: 'eth_chainId' }) as string;
        const chainId = parseInt(chainIdHex, 16);
        const balance = await getBalance(address);

        setWalletState({
          address,
          isConnected: true,
          isConnecting: false,
          chainId,
          isCorrectNetwork: chainId === ARC_TESTNET.chainId,
        });
        setBalanceState({ balance, isLoading: false });
      }
    }).catch(() => {});

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, getBalance]);

  const contextValue: TestnetWalletContextType = {
    wallet: walletState.address ? { address: walletState.address } : null,
    address: walletState.address,
    isConnected: walletState.isConnected,
    isConnecting: walletState.isConnecting,
    chainId: walletState.chainId,
    isCorrectNetwork: walletState.isCorrectNetwork,
    connect,
    disconnect,
    switchToArcTestnet,
    balance: balanceState.balance,
    balanceLoading: balanceState.isLoading,
    refetch,
    isTransferring,
    lastTransaction,
    transfer,
    transactions,
  };

  return (
    <TestnetWalletContext.Provider value={contextValue}>
      {children}
    </TestnetWalletContext.Provider>
  );
}

// Hooks that match the mock provider interface
export function useTestnetWallet() {
  const context = useContext(TestnetWalletContext);
  if (!context) {
    throw new Error('useTestnetWallet must be used within TestnetWalletProvider');
  }
  return {
    wallet: context.wallet,
    address: context.address,
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    connect: context.connect,
    disconnect: context.disconnect,
    switchToArcTestnet: context.switchToArcTestnet,
    isCorrectNetwork: context.isCorrectNetwork,
  };
}

export function useTestnetBalance() {
  const context = useContext(TestnetWalletContext);
  if (!context) {
    throw new Error('useTestnetBalance must be used within TestnetWalletProvider');
  }
  return {
    balance: context.balance,
    isLoading: context.balanceLoading,
    refetch: context.refetch,
  };
}

export function useTestnetTransfer() {
  const context = useContext(TestnetWalletContext);
  if (!context) {
    throw new Error('useTestnetTransfer must be used within TestnetWalletProvider');
  }
  return {
    transfer: context.transfer,
    isTransferring: context.isTransferring,
    lastTransaction: context.lastTransaction,
  };
}

export function useTestnetTransactionHistory() {
  const context = useContext(TestnetWalletContext);
  if (!context) {
    throw new Error('useTestnetTransactionHistory must be used within TestnetWalletProvider');
  }
  return {
    transactions: context.transactions,
    isLoading: false,
    refresh: () => Promise.resolve(),
  };
}
