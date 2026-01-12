import { useState, useCallback, useEffect } from 'react';
import type { SupportedChain } from '../theme/types';

/**
 * Wallet connection state
 */
export interface WalletConnectionState {
  /** Whether a wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Connected wallet address */
  address: string | null;
  /** Current chain the wallet is connected to */
  chain: SupportedChain | null;
  /** Error if connection failed */
  error: Error | null;
}

/**
 * Options for useWalletConnection hook
 */
export interface UseWalletConnectionOptions {
  /** Supported chains for connection */
  supportedChains?: SupportedChain[];
  /** Auto-connect on mount if previously connected */
  autoConnect?: boolean;
  /** Callback when wallet connects */
  onConnect?: (address: string, chain: SupportedChain) => void;
  /** Callback when wallet disconnects */
  onDisconnect?: () => void;
  /** Callback when chain changes */
  onChainChange?: (chain: SupportedChain) => void;
  /** Callback on connection error */
  onError?: (error: Error) => void;
}

/**
 * Return type for useWalletConnection hook
 */
export interface UseWalletConnectionReturn extends WalletConnectionState {
  /** Initiate wallet connection */
  connect: () => Promise<void>;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Switch to a different chain */
  switchChain: (chain: SupportedChain) => Promise<void>;
  /** Check if a chain is supported */
  isChainSupported: (chain: SupportedChain) => boolean;
}

/**
 * Hook for managing wallet connection state
 *
 * Provides wallet connection, disconnection, and chain switching functionality.
 * Auto-detects the connected network and provides the current chain.
 *
 * @example
 * ```tsx
 * const { isConnected, address, chain, connect, disconnect } = useWalletConnection({
 *   supportedChains: ['arc', 'ethereum', 'polygon'],
 *   onConnect: (address, chain) => console.log(`Connected to ${chain}`),
 * });
 *
 * if (!isConnected) {
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 *
 * return <p>Connected: {address} on {chain}</p>;
 * ```
 */
export function useWalletConnection(
  options: UseWalletConnectionOptions = {}
): UseWalletConnectionReturn {
  const {
    supportedChains = ['arc', 'ethereum', 'polygon'],
    autoConnect = true,
    onConnect,
    onDisconnect,
    onChainChange,
    onError,
  } = options;

  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    chain: null,
    error: null,
  });

  // Check if chain is supported
  const isChainSupported = useCallback(
    (chain: SupportedChain) => supportedChains.includes(chain),
    [supportedChains]
  );

  // Connect wallet
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Check if ethereum provider exists (MetaMask, etc.)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;

        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        const address = accounts[0];

        // Get current chain ID
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const chain = mapChainIdToChain(chainId);

        if (chain && !isChainSupported(chain)) {
          throw new Error(`Chain ${chain} is not supported`);
        }

        setState({
          isConnected: true,
          isConnecting: false,
          address,
          chain: chain || supportedChains[0],
          error: null,
        });

        // Store connection state
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('arcpay_wallet_connected', 'true');
        }

        onConnect?.(address, chain || supportedChains[0]);
      } else {
        throw new Error('No wallet provider found. Please install MetaMask or another wallet.');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Connection failed');
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err,
      }));
      onError?.(err);
    }
  }, [supportedChains, isChainSupported, onConnect, onError]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      chain: null,
      error: null,
    });

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('arcpay_wallet_connected');
    }

    onDisconnect?.();
  }, [onDisconnect]);

  // Switch chain
  const switchChain = useCallback(
    async (targetChain: SupportedChain) => {
      if (!isChainSupported(targetChain)) {
        throw new Error(`Chain ${targetChain} is not supported`);
      }

      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        const chainId = mapChainToChainId(targetChain);

        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });

          setState((prev) => ({ ...prev, chain: targetChain }));
          onChainChange?.(targetChain);
        } catch (error: any) {
          // Chain not added to wallet, try to add it
          if (error.code === 4902) {
            // Would need chain config to add - for now just throw
            throw new Error(`Please add ${targetChain} network to your wallet`);
          }
          throw error;
        }
      }
    },
    [isChainSupported, onChainChange]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && typeof localStorage !== 'undefined') {
      const wasConnected = localStorage.getItem('arcpay_wallet_connected');
      if (wasConnected === 'true') {
        connect();
      }
    }
  }, [autoConnect, connect]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setState((prev) => ({ ...prev, address: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        const chain = mapChainIdToChain(chainId);
        if (chain) {
          setState((prev) => ({ ...prev, chain }));
          onChainChange?.(chain);
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnect, onChainChange]);

  return {
    ...state,
    connect,
    disconnect,
    switchChain,
    isChainSupported,
  };
}

/**
 * Map chain ID to SupportedChain
 */
function mapChainIdToChain(chainId: string): SupportedChain | null {
  const chainMap: Record<string, SupportedChain> = {
    '0x1': 'ethereum',      // Ethereum Mainnet
    '0x89': 'polygon',      // Polygon Mainnet
    '0x13881': 'polygon',   // Polygon Mumbai (testnet)
    '0xa4b1': 'arbitrum',   // Arbitrum One
    '0xa': 'optimism',      // Optimism
    '0xa86a': 'avalanche',  // Avalanche C-Chain
    // Arc chain ID - placeholder, update with actual chain ID
    '0xarc': 'arc',
  };

  return chainMap[chainId] || null;
}

/**
 * Map SupportedChain to chain ID
 */
function mapChainToChainId(chain: SupportedChain): string {
  const chainIdMap: Record<SupportedChain, string> = {
    arc: '0xarc',           // Placeholder - update with actual chain ID
    ethereum: '0x1',
    polygon: '0x89',
    arbitrum: '0xa4b1',
    optimism: '0xa',
    avalanche: '0xa86a',
    solana: '0x0',          // Solana doesn't use EVM chain IDs
  };

  return chainIdMap[chain];
}
