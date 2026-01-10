export interface TransakOfframpConfig {
  apiKey: string;
  environment?: 'STAGING' | 'PRODUCTION';
  themeColor?: string;
  network?: string;
}

export interface InitiateOfframpParams {
  walletAddress: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  fiatCurrency?: string;
  email?: string;
  partnerOrderId?: string;
  partnerCustomerId?: string;
}

export interface OfframpOrderStatus {
  id: string;
  status: 'AWAITING_PAYMENT_FROM_USER' | 'PAYMENT_DONE_MARKED_BY_USER' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  cryptoAmount: number;
  cryptoCurrency: string;
  fiatAmount: number;
  fiatCurrency: string;
  paymentOptionId: string;
  walletAddress: string;
  transactionHash?: string;
}

export interface OfframpSuccessEvent {
  eventName: 'TRANSAK_ORDER_SUCCESSFUL';
  status: OfframpOrderStatus;
}

export interface OfframpFailedEvent {
  eventName: 'TRANSAK_ORDER_FAILED';
  status: OfframpOrderStatus;
}

export interface OfframpCreatedEvent {
  eventName: 'TRANSAK_ORDER_CREATED';
  status: OfframpOrderStatus;
}

export interface OfframpClosedEvent {
  eventName: 'TRANSAK_WIDGET_CLOSE';
}

export type TransakEvent =
  | OfframpSuccessEvent
  | OfframpFailedEvent
  | OfframpCreatedEvent
  | OfframpClosedEvent;

export class TransakOfframp {
  private config: TransakOfframpConfig;
  private widgetContainer: HTMLElement | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor(config: TransakOfframpConfig) {
    this.config = {
      ...config,
      environment: config.environment || 'PRODUCTION',
      network: config.network || 'base',
    };
  }

  generateOfframpURL(params: InitiateOfframpParams): string {
    const baseUrl =
      this.config.environment === 'STAGING'
        ? 'https://global-stg.transak.com'
        : 'https://global.transak.com';

    const urlParams = new URLSearchParams({
      apiKey: this.config.apiKey,
      productsAvailed: 'SELL',
      cryptoCurrencyCode: params.cryptoCurrency || 'USDC',
      walletAddress: params.walletAddress,
      network: this.config.network || 'base',
      disableWalletAddressForm: 'true',
    });

    if (params.cryptoAmount) {
      urlParams.set('defaultCryptoAmount', params.cryptoAmount.toString());
    }

    if (params.fiatCurrency) {
      urlParams.set('fiatCurrency', params.fiatCurrency);
    }

    if (params.email) {
      urlParams.set('email', params.email);
    }

    if (params.partnerOrderId) {
      urlParams.set('partnerOrderId', params.partnerOrderId);
    }

    if (params.partnerCustomerId) {
      urlParams.set('partnerCustomerId', params.partnerCustomerId);
    }

    if (this.config.themeColor) {
      urlParams.set('themeColor', this.config.themeColor.replace('#', ''));
    }

    return `${baseUrl}?${urlParams.toString()}`;
  }

  openPopup(params: InitiateOfframpParams): Window | null {
    const url = this.generateOfframpURL(params);
    const width = 450;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    return window.open(
      url,
      'transak-offramp',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  createEmbeddedWidget(
    container: HTMLElement,
    params: InitiateOfframpParams,
    callbacks?: {
      onSuccess?: (event: OfframpSuccessEvent) => void;
      onFailed?: (event: OfframpFailedEvent) => void;
      onCreated?: (event: OfframpCreatedEvent) => void;
      onClose?: (event: OfframpClosedEvent) => void;
    }
  ): void {
    this.widgetContainer = container;
    const url = this.generateOfframpURL(params);

    this.iframeElement = document.createElement('iframe');
    this.iframeElement.id = 'transak-offramp-widget';
    this.iframeElement.src = url;
    this.iframeElement.width = '100%';
    this.iframeElement.height = '100%';
    this.iframeElement.style.border = 'none';
    this.iframeElement.style.borderRadius = '12px';
    this.iframeElement.style.minHeight = '600px';
    this.iframeElement.allow = 'camera;microphone;payment';

    container.appendChild(this.iframeElement);

    this.messageHandler = (event: MessageEvent) => {
      const allowedOrigins = [
        'https://global.transak.com',
        'https://global-stg.transak.com',
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        switch (data.event_id || data.eventName) {
          case 'TRANSAK_ORDER_SUCCESSFUL':
            callbacks?.onSuccess?.(data as OfframpSuccessEvent);
            break;
          case 'TRANSAK_ORDER_FAILED':
            callbacks?.onFailed?.(data as OfframpFailedEvent);
            break;
          case 'TRANSAK_ORDER_CREATED':
            callbacks?.onCreated?.(data as OfframpCreatedEvent);
            break;
          case 'TRANSAK_WIDGET_CLOSE':
            callbacks?.onClose?.(data as OfframpClosedEvent);
            break;
        }
      } catch {
        // Ignore parsing errors for non-Transak messages
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  destroyWidget(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    if (this.iframeElement && this.widgetContainer) {
      this.widgetContainer.removeChild(this.iframeElement);
      this.iframeElement = null;
    }
    this.widgetContainer = null;
  }
}

export function createTransakOfframp(config: TransakOfframpConfig): TransakOfframp {
  return new TransakOfframp(config);
}
