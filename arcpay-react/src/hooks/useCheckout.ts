import { useState, useCallback, useMemo } from 'react';
import type { SupportedChain, SupportedCurrency, Money } from '../theme/types';
import type { CartItem, PaymentResult, CheckoutError } from '../components/payment/Checkout/types';

/**
 * Checkout options
 */
export interface UseCheckoutOptions {
  items?: CartItem[];
  recipient: string;
  currency?: SupportedCurrency;
  chains?: SupportedChain[];
  defaultChain?: SupportedChain;
  onSuccess?: (payment: PaymentResult) => void;
  onError?: (error: CheckoutError) => void;
}

/**
 * Checkout return type
 */
export interface UseCheckoutReturn {
  // Cart management
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Totals
  subtotal: number;
  estimatedFee: number;
  total: number;

  // Chain selection
  supportedChains: SupportedChain[];
  selectedChain: SupportedChain;
  setChain: (chain: SupportedChain) => void;

  // Currency
  currency: SupportedCurrency;

  // Payment state
  status: 'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error';
  isProcessing: boolean;
  error: CheckoutError | null;
  payment: PaymentResult | null;

  // Actions
  initiatePayment: () => Promise<PaymentResult | null>;
  reset: () => void;
}

// Estimated fees by chain
const CHAIN_FEES: Record<SupportedChain, number> = {
  ethereum: 5.00,
  base: 0.01,
  arbitrum: 0.10,
  polygon: 0.02,
  optimism: 0.05,
  avalanche: 0.10,
  solana: 0.001,
};

const DEFAULT_CHAINS: SupportedChain[] = ['base', 'ethereum', 'arbitrum', 'polygon'];

/**
 * Headless checkout hook
 */
export function useCheckout(options: UseCheckoutOptions): UseCheckoutReturn {
  const {
    items: initialItems = [],
    recipient,
    currency = 'USDC',
    chains = DEFAULT_CHAINS,
    defaultChain = 'base',
    onSuccess,
    onError,
  } = options;

  // State
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(defaultChain);
  const [status, setStatus] = useState<UseCheckoutReturn['status']>('idle');
  const [error, setError] = useState<CheckoutError | null>(null);
  const [payment, setPayment] = useState<PaymentResult | null>(null);

  // Calculate totals
  const { subtotal, estimatedFee, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = CHAIN_FEES[selectedChain] || 0.01;
    return {
      subtotal: sub,
      estimatedFee: fee,
      total: sub + fee,
    };
  }, [items, selectedChain]);

  // Cart management
  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id || i.name === item.name
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      return [...prev, { ...item, id: item.id || `item_${Date.now()}` }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Chain selection
  const setChain = useCallback((chain: SupportedChain) => {
    if (chains.includes(chain)) {
      setSelectedChain(chain);
    }
  }, [chains]);

  // Payment
  const initiatePayment = useCallback(async (): Promise<PaymentResult | null> => {
    if (items.length === 0) {
      const err: CheckoutError = {
        code: 'EMPTY_CART',
        message: 'Cart is empty',
      };
      setError(err);
      onError?.(err);
      return null;
    }

    setStatus('processing');
    setError(null);

    try {
      // In real implementation, this would:
      // 1. Connect wallet if not connected
      // 2. Request transaction signature
      // 3. Wait for confirmation

      // Simulate payment for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockPayment: PaymentResult = {
        id: `pay_${Math.random().toString(36).slice(2)}`,
        status: 'confirmed',
        amount: { amount: total.toFixed(2), currency },
        chain: selectedChain,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        recipient,
        createdAt: new Date(),
        confirmedAt: new Date(),
      };

      setStatus('success');
      setPayment(mockPayment);
      onSuccess?.(mockPayment);
      return mockPayment;
    } catch (err) {
      const checkoutError: CheckoutError = {
        code: 'PAYMENT_FAILED',
        message: err instanceof Error ? err.message : 'Payment failed',
      };
      setStatus('error');
      setError(checkoutError);
      onError?.(checkoutError);
      return null;
    }
  }, [items, total, currency, selectedChain, recipient, onSuccess, onError]);

  // Reset
  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setPayment(null);
  }, []);

  return {
    // Cart
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    // Totals
    subtotal,
    estimatedFee,
    total,

    // Chain
    supportedChains: chains,
    selectedChain,
    setChain,

    // Currency
    currency,

    // State
    status,
    isProcessing: status === 'processing',
    error,
    payment,

    // Actions
    initiatePayment,
    reset,
  };
}
