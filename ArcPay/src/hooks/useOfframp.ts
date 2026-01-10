import { useState, useCallback, useRef, useEffect } from 'react';
import type { OfframpOptions, OfframpResult } from '../types';
import {
  TransakOfframp,
  createTransakOfframp,
  OfframpSuccessEvent,
  OfframpFailedEvent,
  OfframpClosedEvent,
} from '../core/TransakOfframp';
import { useWallet } from './useWallet';

export interface UseOfframpConfig {
  provider?: 'transak';
  transakApiKey?: string;
  environment?: 'STAGING' | 'PRODUCTION';
  themeColor?: string;
  network?: string;
}

export interface UseOfframpReturn {
  isOpen: boolean;
  isPending: boolean;
  openOfframp: (options?: OfframpOptions) => void;
  closeOfframp: () => void;
  onSuccess: (callback: (result: OfframpResult) => void) => void;
  onError: (callback: (error: Error) => void) => void;
  embedWidget: (container: HTMLElement, options?: OfframpOptions) => void;
  destroyWidget: () => void;
}

const DEFAULT_TRANSAK_API_KEY = 'your-transak-api-key';

export function useOfframp(config?: UseOfframpConfig): UseOfframpReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { wallet } = useWallet();

  const successCallbackRef = useRef<((result: OfframpResult) => void) | null>(null);
  const errorCallbackRef = useRef<((error: Error) => void) | null>(null);
  const transakRef = useRef<TransakOfframp | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    transakRef.current = createTransakOfframp({
      apiKey: config?.transakApiKey || DEFAULT_TRANSAK_API_KEY,
      environment: config?.environment || 'PRODUCTION',
      themeColor: config?.themeColor,
      network: config?.network || 'base',
    });

    return () => {
      if (transakRef.current) {
        transakRef.current.destroyWidget();
      }
    };
  }, [config?.transakApiKey, config?.environment, config?.themeColor, config?.network]);

  const handleSuccess = useCallback((event: OfframpSuccessEvent) => {
    const result: OfframpResult = {
      success: true,
      amount: event.status.fiatAmount,
      currency: event.status.fiatCurrency,
      provider: 'transak',
      transactionId: event.status.id,
      transactionHash: event.status.transactionHash,
      cryptoAmount: event.status.cryptoAmount,
      cryptoCurrency: event.status.cryptoCurrency,
    };

    setIsPending(false);
    setIsOpen(false);
    successCallbackRef.current?.(result);
  }, []);

  const handleFailed = useCallback((event: OfframpFailedEvent) => {
    setIsPending(false);
    setIsOpen(false);
    errorCallbackRef.current?.(
      new Error(`Offramp failed: Order ${event.status.id} - ${event.status.status}`)
    );
  }, []);

  const handleClose = useCallback((_event: OfframpClosedEvent) => {
    setIsPending(false);
    setIsOpen(false);
  }, []);

  const openOfframp = useCallback(
    (options?: OfframpOptions) => {
      if (!wallet?.address) {
        errorCallbackRef.current?.(new Error('Wallet not connected'));
        return;
      }

      setIsOpen(true);
      setIsPending(true);

      if (transakRef.current) {
        popupRef.current = transakRef.current.openPopup({
          walletAddress: wallet.address,
          cryptoAmount: options?.amount,
          cryptoCurrency: options?.cryptoCurrency || 'USDC',
          fiatCurrency: options?.currency || 'USD',
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
      }
    },
    [wallet]
  );

  const closeOfframp = useCallback(() => {
    setIsOpen(false);
    setIsPending(false);

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }

    if (transakRef.current) {
      transakRef.current.destroyWidget();
    }
  }, []);

  const embedWidget = useCallback(
    (container: HTMLElement, options?: OfframpOptions) => {
      if (!wallet?.address) {
        errorCallbackRef.current?.(new Error('Wallet not connected'));
        return;
      }

      if (!transakRef.current) {
        errorCallbackRef.current?.(new Error('Transak offramp not initialized'));
        return;
      }

      setIsOpen(true);
      setIsPending(true);

      transakRef.current.createEmbeddedWidget(
        container,
        {
          walletAddress: wallet.address,
          cryptoAmount: options?.amount,
          cryptoCurrency: options?.cryptoCurrency || 'USDC',
          fiatCurrency: options?.currency || 'USD',
        },
        {
          onSuccess: handleSuccess,
          onFailed: handleFailed,
          onClose: handleClose,
        }
      );
    },
    [wallet, handleSuccess, handleFailed, handleClose]
  );

  const destroyWidget = useCallback(() => {
    if (transakRef.current) {
      transakRef.current.destroyWidget();
    }
    setIsOpen(false);
    setIsPending(false);
  }, []);

  const onSuccess = useCallback((callback: (result: OfframpResult) => void) => {
    successCallbackRef.current = callback;
  }, []);

  const onError = useCallback((callback: (error: Error) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  return {
    isOpen,
    isPending,
    openOfframp,
    closeOfframp,
    onSuccess,
    onError,
    embedWidget,
    destroyWidget,
  };
}
