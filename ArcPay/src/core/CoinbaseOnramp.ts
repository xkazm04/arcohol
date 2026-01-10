export interface CoinbaseOnrampConfig {
  appId: string;
  network?: 'ethereum' | 'polygon' | 'base' | 'arbitrum';
  environment?: 'production' | 'sandbox';
}

export interface InitiateOnrampParams {
  address: string;
  amount?: number;
  asset?: string;
  presetFiatAmount?: number;
  fiatCurrency?: string;
  experience?: 'send' | 'buy';
}

export interface OnrampSuccessEvent {
  eventName: 'success';
  data: {
    chargeId: string;
    amount: string;
    asset: string;
    network: string;
    transactionHash?: string;
  };
}

export interface OnrampExitEvent {
  eventName: 'exit';
  data: {
    error?: string;
  };
}

export type OnrampEvent = OnrampSuccessEvent | OnrampExitEvent;

export class CoinbaseOnramp {
  private config: CoinbaseOnrampConfig;
  private widgetContainer: HTMLElement | null = null;
  private iframeElement: HTMLIFrameElement | null = null;

  constructor(config: CoinbaseOnrampConfig) {
    this.config = {
      ...config,
      environment: config.environment || 'production',
      network: config.network || 'base',
    };
  }

  generateOnrampURL(params: InitiateOnrampParams): string {
    const baseUrl =
      this.config.environment === 'sandbox'
        ? 'https://pay.coinbase.com/buy/select-asset'
        : 'https://pay.coinbase.com/buy/select-asset';

    const urlParams = new URLSearchParams({
      appId: this.config.appId,
      addresses: JSON.stringify({
        [params.address]: [this.getNetworkId()],
      }),
      assets: JSON.stringify([params.asset || 'USDC']),
    });

    if (params.presetFiatAmount) {
      urlParams.set('presetFiatAmount', params.presetFiatAmount.toString());
    }

    if (params.fiatCurrency) {
      urlParams.set('fiatCurrency', params.fiatCurrency);
    }

    return `${baseUrl}?${urlParams.toString()}`;
  }

  private getNetworkId(): string {
    const networkIds: Record<string, string> = {
      ethereum: 'ethereum',
      polygon: 'polygon',
      base: 'base',
      arbitrum: 'arbitrum',
    };
    return networkIds[this.config.network || 'base'];
  }

  openPopup(params: InitiateOnrampParams): Window | null {
    const url = this.generateOnrampURL(params);
    const width = 460;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    return window.open(
      url,
      'coinbase-onramp',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  createEmbeddedWidget(
    container: HTMLElement,
    params: InitiateOnrampParams,
    callbacks?: {
      onSuccess?: (event: OnrampSuccessEvent) => void;
      onExit?: (event: OnrampExitEvent) => void;
    }
  ): void {
    this.widgetContainer = container;
    const url = this.generateOnrampURL(params);

    this.iframeElement = document.createElement('iframe');
    this.iframeElement.src = url;
    this.iframeElement.width = '100%';
    this.iframeElement.height = '100%';
    this.iframeElement.style.border = 'none';
    this.iframeElement.style.borderRadius = '12px';
    this.iframeElement.allow = 'payment; camera';

    container.appendChild(this.iframeElement);

    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://pay.coinbase.com') return;

      const data = event.data as OnrampEvent;
      if (data.eventName === 'success') {
        callbacks?.onSuccess?.(data);
      } else if (data.eventName === 'exit') {
        callbacks?.onExit?.(data);
      }
    });
  }

  destroyWidget(): void {
    if (this.iframeElement && this.widgetContainer) {
      this.widgetContainer.removeChild(this.iframeElement);
      this.iframeElement = null;
    }
    this.widgetContainer = null;
  }
}

export function createCoinbaseOnramp(config: CoinbaseOnrampConfig): CoinbaseOnramp {
  return new CoinbaseOnramp(config);
}
