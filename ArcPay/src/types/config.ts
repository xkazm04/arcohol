import type { ThemeConfig } from './theme';
import type { Wallet } from './wallet';
import type { Transaction } from './transaction';

export type NetworkType =
  | 'arc-mainnet'
  | 'arc-testnet'
  | 'base-mainnet'
  | 'base-sepolia';

export type WalletType = 'embedded' | 'external';

export type LocaleType = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh';

export type CurrencyType = 'USD' | 'EUR' | 'GBP';

export interface ArcPayConfig {
  apiKey: string;
  network?: NetworkType;
  theme?: 'default' | 'dark' | 'minimal' | ThemeConfig;
  enableOnramp?: boolean;
  enableOfframp?: boolean;
  enableContacts?: boolean;
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  onTransaction?: (tx: Transaction) => void;
  onError?: (error: ArcPayError) => void;
  walletType?: WalletType;
  locale?: LocaleType;
  currency?: CurrencyType;
}

export class ArcPayError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ArcPayError';
    this.code = code;
    this.details = details;
  }
}

export interface CircleClientConfig {
  apiKey: string;
  entitySecret?: string;
}

export interface ArcClientConfig {
  network: 'mainnet' | 'testnet';
  rpcUrl?: string;
}
