declare module '@walletconnect/ethereum-provider' {
  export interface EthereumProviderOptions {
    projectId: string;
    chains?: number[];
    showQrModal?: boolean;
    metadata?: {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    };
  }

  export class EthereumProvider {
    static init(options: EthereumProviderOptions): Promise<EthereumProvider>;
    enable(): Promise<string[]>;
    disconnect(): Promise<void>;
    request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
    on(event: string, callback: (...args: unknown[]) => void): void;
    removeListener(event: string, callback: (...args: unknown[]) => void): void;
  }
}
