import type { Wallet, WalletBalance } from '../../types';

export type WalletAdapterType = 'circle' | 'walletconnect' | 'external';

export interface WalletAdapterEvents {
  connect: (wallet: Wallet) => void;
  disconnect: () => void;
  accountChanged: (address: string) => void;
  chainChanged: (chainId: number) => void;
  error: (error: Error) => void;
}

export interface WalletAdapter {
  type: WalletAdapterType;
  name: string;
  icon?: string;
  isConnected: boolean;
  address: string | null;

  connect(): Promise<Wallet>;
  disconnect(): Promise<void>;
  getBalance(): Promise<WalletBalance>;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: unknown): Promise<string>;
  sendTransaction(transaction: unknown): Promise<string>;

  on<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void;
  off<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void;
}

export interface WalletConnectConfig {
  projectId: string;
  chains?: number[];
  metadata?: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  showQrModal?: boolean;
}

export interface ExternalWalletConfig {
  provider: unknown;
  chainId?: number;
}
