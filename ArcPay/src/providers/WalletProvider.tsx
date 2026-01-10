import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { create } from 'zustand';
import type { Wallet, WalletState, CreateWalletOptions } from '../types';
import { CircleClient } from '../core/CircleClient';
import {
  getStoredWallet,
  setStoredWallet,
  removeStoredWallet,
} from '../utils/storage';

interface WalletStore extends WalletState {
  setWallet: (wallet: Wallet | null) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: Error | null) => void;
}

const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  setWallet: (wallet) =>
    set({ wallet, isConnected: !!wallet, error: null }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error, isConnecting: false }),
}));

interface WalletContextValue {
  wallet: Wallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  createWallet: (options?: CreateWalletOptions) => Promise<Wallet>;
  copyAddress: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

interface WalletProviderProps {
  circleClient: CircleClient;
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
}

export function WalletProvider({
  children,
  circleClient,
  onConnect,
  onDisconnect,
}: PropsWithChildren<WalletProviderProps>) {
  const {
    wallet,
    isConnected,
    isConnecting,
    error,
    setWallet,
    setConnecting,
    setError,
  } = useWalletStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = getStoredWallet();
    if (stored) {
      circleClient
        .getWallet(stored.id)
        .then((w) => {
          setWallet(w);
          onConnect?.(w);
        })
        .catch(() => {
          removeStoredWallet();
        })
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, [circleClient, onConnect, setWallet]);

  const createWallet = useCallback(
    async (options?: CreateWalletOptions): Promise<Wallet> => {
      setConnecting(true);
      try {
        const newWallet = await circleClient.createWallet(options);
        setWallet(newWallet);
        setStoredWallet({
          id: newWallet.id,
          address: newWallet.address,
          walletSetId: newWallet.walletSetId,
        });
        onConnect?.(newWallet);
        return newWallet;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create wallet');
        setError(error);
        throw error;
      }
    },
    [circleClient, onConnect, setConnecting, setError, setWallet]
  );

  const connect = useCallback(async () => {
    const stored = getStoredWallet();
    if (stored) {
      setConnecting(true);
      try {
        const w = await circleClient.getWallet(stored.id);
        setWallet(w);
        onConnect?.(w);
      } catch (err) {
        removeStoredWallet();
        await createWallet();
      }
    } else {
      await createWallet();
    }
  }, [circleClient, createWallet, onConnect, setConnecting, setWallet]);

  const disconnect = useCallback(() => {
    setWallet(null);
    removeStoredWallet();
    onDisconnect?.();
  }, [onDisconnect, setWallet]);

  const copyAddress = useCallback(async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
    }
  }, [wallet?.address]);

  if (!isInitialized) {
    return null;
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        createWallet,
        copyAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
}

export { useWalletStore };
