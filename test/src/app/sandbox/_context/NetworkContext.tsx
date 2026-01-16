'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface NetworkConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  faucet?: string;
}

export const ARC_TESTNET: NetworkConfig = {
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
  faucet: 'https://faucet.circle.com',
};

export const ARC_MAINNET: NetworkConfig = {
  chainId: 1243,
  chainIdHex: '0x4db',
  name: 'Arc Mainnet',
  rpcUrl: 'https://rpc.arc.network',
  blockExplorer: 'https://arcscan.app',
  nativeCurrency: {
    name: 'ARC',
    symbol: 'ARC',
    decimals: 18,
  },
};

export type NetworkType = 'testnet' | 'mainnet';

interface NetworkContextValue {
  network: NetworkType;
  config: NetworkConfig;
  setNetwork: (network: NetworkType) => void;
  rpcCall: <T>(method: string, params?: unknown[]) => Promise<T>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkType>('testnet');

  const config = network === 'testnet' ? ARC_TESTNET : ARC_MAINNET;

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  }, []);

  const rpcCall = useCallback(async <T,>(method: string, params: unknown[] = []): Promise<T> => {
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'RPC call failed');
    }

    return data.result as T;
  }, [config.rpcUrl]);

  return (
    <NetworkContext.Provider value={{ network, config, setNetwork, rpcCall }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
