import type { Wallet, WalletBalance } from '../../types';
import type { WalletAdapter, WalletAdapterEvents, WalletConnectConfig } from './types';

type EventCallback = WalletAdapterEvents[keyof WalletAdapterEvents];

export class WalletConnectAdapter implements WalletAdapter {
  readonly type = 'walletconnect' as const;
  readonly name = 'WalletConnect';
  readonly icon = 'https://walletconnect.com/favicon.ico';

  private config: WalletConnectConfig;
  private provider: unknown = null;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private _address: string | null = null;
  private _isConnected = false;

  constructor(config: WalletConnectConfig) {
    this.config = config;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get address(): string | null {
    return this._address;
  }

  async connect(): Promise<Wallet> {
    try {
      // In a real implementation, this would initialize WalletConnect
      // and handle the connection flow
      const { EthereumProvider } = await this.loadWalletConnectSDK();

      this.provider = await EthereumProvider.init({
        projectId: this.config.projectId,
        chains: this.config.chains || [1],
        showQrModal: this.config.showQrModal ?? true,
        metadata: this.config.metadata,
      });

      // Enable the session
      const accounts = await (this.provider as { enable: () => Promise<string[]> }).enable();

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this._address = accounts[0];
      this._isConnected = true;

      const wallet: Wallet = {
        id: `wc-${this._address}`,
        address: this._address,
        type: 'walletconnect',
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
    try {
      if (this.provider && typeof (this.provider as { disconnect?: () => Promise<void> }).disconnect === 'function') {
        await (this.provider as { disconnect: () => Promise<void> }).disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    } finally {
      this._address = null;
      this._isConnected = false;
      this.provider = null;
      this.emit('disconnect');
    }
  }

  async getBalance(): Promise<WalletBalance> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get native balance
      const nativeBalance = await this.request<string>({
        method: 'eth_getBalance',
        params: [this._address, 'latest'],
      });

      // For USDC, we'd need to call the token contract
      // This is a simplified version
      return {
        available: this.hexToDecimal(nativeBalance),
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

    const signature = await this.request<string>({
      method: 'personal_sign',
      params: [message, this._address],
    });

    return signature;
  }

  async signTransaction(transaction: unknown): Promise<string> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const signature = await this.request<string>({
      method: 'eth_signTransaction',
      params: [transaction],
    });

    return signature;
  }

  async sendTransaction(transaction: unknown): Promise<string> {
    if (!this._address || !this.provider) {
      throw new Error('Wallet not connected');
    }

    const txHash = await this.request<string>({
      method: 'eth_sendTransaction',
      params: [transaction],
    });

    return txHash;
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

  private async loadWalletConnectSDK(): Promise<typeof import('@walletconnect/ethereum-provider')> {
    // Dynamic import to avoid bundling if not used
    try {
      const module = await import('@walletconnect/ethereum-provider');
      return module;
    } catch {
      // Return a mock for environments where WalletConnect isn't installed
      throw new Error(
        '@walletconnect/ethereum-provider is not installed. ' +
          'Please install it with: npm install @walletconnect/ethereum-provider'
      );
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return;

    const providerEvents = this.provider as {
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
    };

    if (typeof providerEvents.on !== 'function') return;

    providerEvents.on('accountsChanged', ((accounts: unknown) => {
      const accts = accounts as string[];
      if (accts.length === 0) {
        this.disconnect();
      } else {
        this._address = accts[0];
        this.emit('accountChanged', accts[0]);
      }
    }) as (...args: unknown[]) => void);

    providerEvents.on('chainChanged', ((chainId: unknown) => {
      this.emit('chainChanged', parseInt(chainId as string, 16));
    }) as (...args: unknown[]) => void);

    providerEvents.on('disconnect', () => {
      this.disconnect();
    });
  }

  private async request<T>(params: { method: string; params?: unknown[] }): Promise<T> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const providerRequest = this.provider as {
      request: (params: { method: string; params?: unknown[] }) => Promise<T>;
    };

    return providerRequest.request(params);
  }

  private hexToDecimal(hex: string): string {
    const wei = BigInt(hex);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  }
}

export function createWalletConnectAdapter(
  config: WalletConnectConfig
): WalletConnectAdapter {
  return new WalletConnectAdapter(config);
}
