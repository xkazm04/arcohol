export type WalletType = 'circle' | 'external' | 'walletconnect';
export type WalletStatus = 'active' | 'frozen' | 'pending';

export interface Wallet {
  id: string;
  address: string;
  walletSetId?: string;
  blockchain?: string;
  accountType?: 'SCA' | 'EOA';
  state?: 'LIVE' | 'FROZEN';
  createDate?: string;
  updateDate?: string;
  // Extended fields for SDK usage
  type?: WalletType;
  status?: WalletStatus;
  createdAt?: Date;
}

export interface CreateWalletOptions {
  userId?: string;
  accountType?: 'SCA' | 'EOA';
}

export interface WalletState {
  wallet: Wallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

export interface WalletBalance {
  // Circle API format
  token?: string;
  amount?: string;
  amountRaw?: bigint;
  updateDate?: string;
  // SDK extended format
  available?: string;
  pending?: string;
  currency?: string;
}
