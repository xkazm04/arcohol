import { useState, useCallback, useRef, useEffect } from 'react';
import type { OnrampOptions, OnrampResult } from '../types';
import { CoinbaseOnramp, createCoinbaseOnramp, OnrampSuccessEvent, OnrampExitEvent } from '../core/CoinbaseOnramp';
import { useWallet } from './useWallet';

export interface UseOnrampConfig {
  provider?: 'coinbase' | 'transak';
  coinbaseAppId?: string;
  network?: 'ethereum' | 'polygon' | 'base' | 'arbitrum';
  environment?: 'production' | 'sandbox';
}

export interface UseOnrampReturn {
  isOpen: boolean;
  isPending: boolean;
  openOnramp: (options?: OnrampOptions) => void;
  closeOnramp: () => void;
  onSuccess: (callback: (result: OnrampResult) => void) => void;
  onError: (callback: (error: Error) => void) => void;
  embedWidget: (container: HTMLElement, options?: OnrampOptions) => void;
  destroyWidget: () => void;
}

const DEFAULT_COINBASE_APP_ID = 'your-coinbase-app-id';

export function useOnramp(config?: UseOnrampConfig): UseOnrampReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { wallet } = useWallet();

  const successCallbackRef = useRef<((result: OnrampResult) => void) | null>(null);
  const errorCallbackRef = useRef<((error: Error) => void) | null>(null);
  const coinbaseRef = useRef<CoinbaseOnramp | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (config?.provider === 'coinbase' || !config?.provider) {
      coinbaseRef.current = createCoinbaseOnramp({
        appId: config?.coinbaseAppId || DEFAULT_COINBASE_APP_ID,
        network: config?.network || 'base',
        environment: config?.environment || 'production',
      });
    }

    return () => {
      if (coinbaseRef.current) {
        coinbaseRef.current.destroyWidget();
      }
    };
  }, [config?.provider, config?.coinbaseAppId, config?.network, config?.environment]);

  const handleSuccess = useCallback((event: OnrampSuccessEvent) => {
    const result: OnrampResult = {
      success: true,
      amount: parseFloat(event.data.amount),
      currency: event.data.asset,
      provider: 'coinbase',
      transactionId: event.data.chargeId,
      transactionHash: event.data.transactionHash,
    };

    setIsPending(false);
    setIsOpen(false);
    successCallbackRef.current?.(result);
  }, []);

  const handleExit = useCallback((event: OnrampExitEvent) => {
    setIsPending(false);
    setIsOpen(false);

    if (event.data.error) {
      errorCallbackRef.current?.(new Error(event.data.error));
    }
  }, []);

  const openOnramp = useCallback(
    (options?: OnrampOptions) => {
      if (!wallet?.address) {
        errorCallbackRef.current?.(new Error('Wallet not connected'));
        return;
      }

      setIsOpen(true);
      setIsPending(true);

      const provider = options?.provider || config?.provider || 'coinbase';

      if (provider === 'coinbase' && coinbaseRef.current) {
        popupRef.current = coinbaseRef.current.openPopup({
          address: wallet.address,
          presetFiatAmount: options?.amount,
          fiatCurrency: options?.currency || 'USD',
          asset: 'USDC',
        });

        if (popupRef.current) {
          const pollTimer = setInterval(() => {
            if (popupRef.current?.closed) {
              clearInterval(pollTimer);
              setIsPending(false);
              setIsOpen(false);
            }
          }, 500);
        }
      } else if (provider === 'transak') {
        console.warn('Transak onramp not yet implemented - use Coinbase');
        setIsPending(false);
        setIsOpen(false);
        errorCallbackRef.current?.(new Error('Transak onramp not supported'));
      }
    },
    [wallet, config?.provider]
  );

  const closeOnramp = useCallback(() => {
    setIsOpen(false);
    setIsPending(false);

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }

    if (coinbaseRef.current) {
      coinbaseRef.current.destroyWidget();
    }
  }, []);

  const embedWidget = useCallback(
    (container: HTMLElement, options?: OnrampOptions) => {
      if (!wallet?.address) {
        errorCallbackRef.current?.(new Error('Wallet not connected'));
        return;
      }

      if (!coinbaseRef.current) {
        errorCallbackRef.current?.(new Error('Coinbase onramp not initialized'));
        return;
      }

      setIsOpen(true);
      setIsPending(true);

      coinbaseRef.current.createEmbeddedWidget(
        container,
        {
          address: wallet.address,
          presetFiatAmount: options?.amount,
          fiatCurrency: options?.currency || 'USD',
          asset: 'USDC',
        },
        {
          onSuccess: handleSuccess,
          onExit: handleExit,
        }
      );
    },
    [wallet, handleSuccess, handleExit]
  );

  const destroyWidget = useCallback(() => {
    if (coinbaseRef.current) {
      coinbaseRef.current.destroyWidget();
    }
    setIsOpen(false);
    setIsPending(false);
  }, []);

  const onSuccess = useCallback((callback: (result: OnrampResult) => void) => {
    successCallbackRef.current = callback;
  }, []);

  const onError = useCallback((callback: (error: Error) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  return {
    isOpen,
    isPending,
    openOnramp,
    closeOnramp,
    onSuccess,
    onError,
    embedWidget,
    destroyWidget,
  };
}
