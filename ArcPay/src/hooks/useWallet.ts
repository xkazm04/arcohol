import { useWalletContext } from '../providers/WalletProvider';
import type { Wallet, CreateWalletOptions } from '../types';

export interface UseWalletReturn {
  wallet: Wallet | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  createWallet: (options?: CreateWalletOptions) => Promise<Wallet>;
  copyAddress: () => Promise<void>;
  getQRCode: () => string;
}

export function useWallet(): UseWalletReturn {
  const context = useWalletContext();

  const getQRCode = (): string => {
    if (!context.wallet?.address) return '';
    return `ethereum:${context.wallet.address}`;
  };

  return {
    wallet: context.wallet,
    address: context.wallet?.address || null,
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    error: context.error,
    connect: context.connect,
    disconnect: context.disconnect,
    createWallet: context.createWallet,
    copyAddress: context.copyAddress,
    getQRCode,
  };
}
