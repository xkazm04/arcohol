import type { Wallet, WalletBalance } from '../../types';
import type { WalletAdapter, WalletAdapterEvents, ExternalWalletConfig } from './types';

type EventCallback = WalletAdapterEvents[keyof WalletAdapterEvents];

interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

export class ExternalWalletAdapter implements WalletAdapter {
  readonly type = 'external' as const;
  readonly name = 'External Wallet';
  readonly icon?: string;

  private provider: EIP1193Provider | null = null;
  private config: ExternalWalletConfig;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private _address: string | null = null;
  private _isConnected = false;

  constructor(config: ExternalWalletConfig) {
    this.config = config;
    if (config.provider) {
      this.provider = config.provider as EIP1193Provider;
    }
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get address(): string | null {
    return this._address;
  }

  setProvider(provider: unknown): void {
    this.provider = provider as EIP1193Provider;
  }

  async connect(): Promise<Wallet> {
    if (!this.provider) {
      // Try to get injected provider (MetaMask, etc.)
      if (typeof window !== 'undefined') {
        const win = window as unknown as { ethereum?: EIP1193Provider };
        if (win.ethereum) {
          this.provider = win.ethereum;
        } else {
          throw new Error('No wallet provider found');
        }
      } else {
        throw new Error('No wallet provider found');
      }
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this._address = accounts[0];
      this._isConnected = true;

      const wallet: Wallet = {
        id: `ext-${this._address}`,
        address: this._address,
        type: 'external',
        status: 'active',
        createdAt: new Date(),
      };

      this.setupEventListeners();
      this.emit('connect', wallet);

      return wallet;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect');
      this.emit('error', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this._address = null;
    this._isConnected = false;
    this.removeEventListeners();
    this.emit('disconnect');
  }

  async getBalance(): Promise<WalletBalance> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [this._address, 'latest'],
      }) as string;

      return {
        available: this.hexToDecimal(balance),
        pending: '0',
        currency: 'ETH',
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return {
        available: '0',
        pending: '0',
        currency: 'ETH',
      };
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const signature = await this.provider.request({
      method: 'personal_sign',
      params: [message, this._address],
    }) as string;

    return signature;
  }

  async signTransaction(transaction: unknown): Promise<string> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const signature = await this.provider.request({
      method: 'eth_signTransaction',
      params: [transaction],
    }) as string;

    return signature;
  }

  async sendTransaction(transaction: unknown): Promise<string> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    }) as string;

    return txHash;
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (error) {
      // If chain is not added, we could add it here
      throw error;
    }
  }

  on<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as EventCallback);
  }

  off<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void {
    this.eventListeners.get(event)?.delete(callback as EventCallback);
  }

  private emit<K extends keyof WalletAdapterEvents>(
    event: K,
    ...args: Parameters<WalletAdapterEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        (callback as (...args: unknown[]) => void)(...args);
      });
    }
  }

  private accountsChangedHandler = (accounts: unknown): void => {
    const accts = accounts as string[];
    if (accts.length === 0) {
      this.disconnect();
    } else {
      this._address = accts[0];
      this.emit('accountChanged', accts[0]);
    }
  };

  private chainChangedHandler = (chainId: unknown): void => {
    this.emit('chainChanged', parseInt(chainId as string, 16));
  };

  private disconnectHandler = (): void => {
    this.disconnect();
  };

  private setupEventListeners(): void {
    if (!this.provider) return;

    this.provider.on('accountsChanged', this.accountsChangedHandler as (...args: unknown[]) => void);
    this.provider.on('chainChanged', this.chainChangedHandler as (...args: unknown[]) => void);
    this.provider.on('disconnect', this.disconnectHandler);
  }

  private removeEventListeners(): void {
    if (!this.provider) return;

    this.provider.removeListener('accountsChanged', this.accountsChangedHandler as (...args: unknown[]) => void);
    this.provider.removeListener('chainChanged', this.chainChangedHandler as (...args: unknown[]) => void);
    this.provider.removeListener('disconnect', this.disconnectHandler);
  }

  private hexToDecimal(hex: string): string {
    const wei = BigInt(hex);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  }
}

export function createExternalWalletAdapter(
  config?: ExternalWalletConfig
): ExternalWalletAdapter {
  return new ExternalWalletAdapter(config || { provider: null });
}

interface InjectedProviderFlags {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isRabby?: boolean;
}

export function detectInjectedWallet(): {
  name: string;
  provider: unknown;
} | null {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as { ethereum?: InjectedProviderFlags };
  const ethereum = win.ethereum;
  if (!ethereum) return null;

  if (ethereum.isMetaMask) {
    return { name: 'MetaMask', provider: ethereum };
  }

  if (ethereum.isCoinbaseWallet) {
    return { name: 'Coinbase Wallet', provider: ethereum };
  }

  if (ethereum.isBraveWallet) {
    return { name: 'Brave Wallet', provider: ethereum };
  }

  if (ethereum.isRabby) {
    return { name: 'Rabby', provider: ethereum };
  }

  return { name: 'Injected Wallet', provider: ethereum };
}
