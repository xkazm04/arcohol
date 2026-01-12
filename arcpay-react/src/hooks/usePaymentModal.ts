import { useState, useCallback } from 'react';
import type { SupportedChain, SupportedCurrency } from '../theme/types';
import type { PaymentResult, CheckoutError } from '../components/payment/Checkout/types';

/**
 * Payment modal configuration
 */
export interface PaymentModalConfig {
  amount: number;
  currency?: SupportedCurrency;
  recipient?: string;
  description?: string;
  chain?: SupportedChain;
  metadata?: Record<string, unknown>;
}

/**
 * Payment modal return type
 */
export interface UsePaymentModalReturn {
  // State
  isOpen: boolean;
  config: PaymentModalConfig | null;

  // Payment state
  status: 'idle' | 'processing' | 'success' | 'error';
  payment: PaymentResult | null;
  error: CheckoutError | null;

  // Actions
  open: (config: PaymentModalConfig) => void;
  close: () => void;
  reset: () => void;
  setPayment: (payment: PaymentResult) => void;
  setError: (error: CheckoutError) => void;
}

/**
 * Payment modal hook for managing modal state
 */
export function usePaymentModal(): UsePaymentModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PaymentModalConfig | null>(null);
  const [status, setStatus] = useState<UsePaymentModalReturn['status']>('idle');
  const [payment, setPaymentState] = useState<PaymentResult | null>(null);
  const [error, setErrorState] = useState<CheckoutError | null>(null);

  // Open modal with config
  const open = useCallback((newConfig: PaymentModalConfig) => {
    setConfig(newConfig);
    setStatus('idle');
    setPaymentState(null);
    setErrorState(null);
    setIsOpen(true);
  }, []);

  // Close modal
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle');
    setPaymentState(null);
    setErrorState(null);
    setConfig(null);
    setIsOpen(false);
  }, []);

  // Set payment result
  const setPayment = useCallback((result: PaymentResult) => {
    setPaymentState(result);
    setStatus('success');
  }, []);

  // Set error
  const setError = useCallback((err: CheckoutError) => {
    setErrorState(err);
    setStatus('error');
  }, []);

  return {
    isOpen,
    config,
    status,
    payment,
    error,
    open,
    close,
    reset,
    setPayment,
    setError,
  };
}

/**
 * Quick pay hook for one-click payments
 */
export interface UseQuickPayOptions {
  recipient: string;
  currency?: SupportedCurrency;
  chain?: SupportedChain;
  onSuccess?: (payment: PaymentResult) => void;
  onError?: (error: CheckoutError) => void;
}

export interface UseQuickPayReturn {
  pay: (amount: number, description?: string) => Promise<PaymentResult | null>;
  isProcessing: boolean;
  lastPayment: PaymentResult | null;
  error: CheckoutError | null;
}

export function useQuickPay(options: UseQuickPayOptions): UseQuickPayReturn {
  const { recipient, currency = 'USDC', chain = 'base', onSuccess, onError } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<CheckoutError | null>(null);

  const pay = useCallback(
    async (amount: number, description?: string): Promise<PaymentResult | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Simulate payment
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const payment: PaymentResult = {
          id: `pay_${Math.random().toString(36).slice(2)}`,
          status: 'confirmed',
          amount: { amount: amount.toFixed(2), currency },
          chain,
          txHash: `0x${Math.random().toString(16).slice(2)}`,
          recipient,
          createdAt: new Date(),
          confirmedAt: new Date(),
        };

        setLastPayment(payment);
        setIsProcessing(false);
        onSuccess?.(payment);
        return payment;
      } catch (err) {
        const checkoutError: CheckoutError = {
          code: 'PAYMENT_FAILED',
          message: err instanceof Error ? err.message : 'Payment failed',
        };
        setError(checkoutError);
        setIsProcessing(false);
        onError?.(checkoutError);
        return null;
      }
    },
    [recipient, currency, chain, onSuccess, onError]
  );

  return {
    pay,
    isProcessing,
    lastPayment,
    error,
  };
}
