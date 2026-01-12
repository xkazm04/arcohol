'use client';

import { useState, useCallback, useEffect } from 'react';

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
    decimals: 18, // MetaMask requires 18 decimals for native currency
  },
  faucet: 'https://faucet.circle.com',
};

// Standard USDC contract address (same across EVM chains)
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
}

export interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToArcTestnet: () => Promise<void>;
  formatAddress: (address: string) => string;
  refreshBalance: () => Promise<void>;
}

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

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    isCorrectNetwork: false,
    error: null,
  });

  const formatAddress = useCallback((address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!window.ethereum) return '0';

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }) as string;

      // Convert from wei (18 decimals)
      const balanceNum = parseInt(balance, 16) / 1e18;
      return balanceNum.toFixed(4);
    } catch {
      return '0';
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.address) return;
    const balance = await getBalance(state.address);
    setState(prev => ({ ...prev, balance }));
  }, [state.address, getBalance]);

  const switchToArcTestnet = useCallback(async (): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to Arc Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } catch (switchError: unknown) {
      // Chain not added yet, add it
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
      setState(prev => ({
        ...prev,
        error: 'Please install MetaMask to connect your wallet',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Get current chain ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const chainId = parseInt(chainIdHex, 16);

      // Check if on correct network
      const isCorrectNetwork = chainId === ARC_TESTNET.chainId;

      // Get balance
      const balance = await getBalance(address);

      setState({
        address,
        chainId,
        balance,
        isConnected: true,
        isConnecting: false,
        isCorrectNetwork,
        error: null,
      });

      // Auto-switch to Arc Testnet if not on it
      if (!isCorrectNetwork) {
        try {
          await switchToArcTestnet();
        } catch {
          // User rejected network switch, that's okay
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, [getBalance, switchToArcTestnet]);

  const disconnect = useCallback((): void => {
    setState({
      address: null,
      chainId: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      isCorrectNetwork: false,
      error: null,
    });
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnect();
      } else {
        const address = accountsArray[0];
        const balance = await getBalance(address);
        setState(prev => ({ ...prev, address, balance }));
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const chainId = parseInt(chainIdHex as string, 16);
      const isCorrectNetwork = chainId === ARC_TESTNET.chainId;
      setState(prev => ({ ...prev, chainId, isCorrectNetwork }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(async (accounts) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length > 0) {
          const address = accountsArray[0];
          const chainIdHex = await window.ethereum!.request({
            method: 'eth_chainId',
          }) as string;
          const chainId = parseInt(chainIdHex, 16);
          const balance = await getBalance(address);

          setState({
            address,
            chainId,
            balance,
            isConnected: true,
            isConnecting: false,
            isCorrectNetwork: chainId === ARC_TESTNET.chainId,
            error: null,
          });
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, getBalance]);

  return {
    ...state,
    connect,
    disconnect,
    switchToArcTestnet,
    formatAddress,
    refreshBalance,
  };
}
