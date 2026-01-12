import { useState, useCallback, useEffect, useMemo } from 'react';
import type { SupportedChain, SupportedCurrency } from '../theme/types';
import type {
  OnRampProvider,
  OnRampProviderConfig,
  OnRampQuote,
  OnRampTransaction,
  OnRampError,
  OnRampStatus,
  FiatCurrency,
  FiatPaymentMethod,
  BalanceCheckResult,
} from '../components/payment/OnRamp/types';

/**
 * Provider configurations
 */
const PROVIDER_CONFIGS: Record<OnRampProvider, OnRampProviderConfig> = {
  moonpay: {
    provider: 'moonpay',
    name: 'MoonPay',
    logo: '/providers/moonpay.svg',
    supportedFiatCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    supportedCryptoCurrencies: ['USDC', 'USDT', 'DAI'],
    supportedChains: ['arc', 'ethereum', 'polygon', 'arbitrum'],
    supportedPaymentMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
    minAmount: 20,
    maxAmount: 10000,
    feePercent: 4.5,
    available: true,
  },
  transak: {
    provider: 'transak',
    name: 'Transak',
    logo: '/providers/transak.svg',
    supportedFiatCurrencies: ['USD', 'EUR', 'GBP'],
    supportedCryptoCurrencies: ['USDC', 'USDT'],
    supportedChains: ['arc', 'ethereum', 'polygon'],
    supportedPaymentMethods: ['card', 'bank_transfer'],
    minAmount: 15,
    maxAmount: 5000,
    feePercent: 3.5,
    available: true,
  },
  coinbase: {
    provider: 'coinbase',
    name: 'Coinbase Pay',
    logo: '/providers/coinbase.svg',
    supportedFiatCurrencies: ['USD'],
    supportedCryptoCurrencies: ['USDC'],
    supportedChains: ['arc', 'ethereum', 'polygon', 'arbitrum'],
    supportedPaymentMethods: ['card', 'bank_transfer'],
    minAmount: 1,
    maxAmount: 25000,
    feePercent: 2.5,
    available: true,
  },
  circle: {
    provider: 'circle',
    name: 'Circle',
    logo: '/providers/circle.svg',
    supportedFiatCurrencies: ['USD', 'EUR'],
    supportedCryptoCurrencies: ['USDC', 'EURC'],
    supportedChains: ['arc', 'ethereum', 'polygon', 'arbitrum', 'avalanche'],
    supportedPaymentMethods: ['card', 'bank_transfer'],
    minAmount: 10,
    maxAmount: 50000,
    feePercent: 1.5,
    available: true,
  },
};

/**
 * Options for useOnRamp hook
 */
export interface UseOnRampOptions {
  /** Amount of crypto needed */
  amount: string;
  /** Crypto currency to purchase */
  currency: SupportedCurrency;
  /** Target chain */
  chain: SupportedChain;
  /** Destination wallet address */
  walletAddress: string;
  /** Preferred fiat currency */
  fiatCurrency?: FiatCurrency;
  /** Allowed providers */
  allowedProviders?: OnRampProvider[];
  /** Called when purchase completes */
  onSuccess?: (transaction: OnRampTransaction) => void;
  /** Called on error */
  onError?: (error: OnRampError) => void;
  /** Auto-fetch quotes on mount */
  autoFetchQuotes?: boolean;
}

/**
 * Return type for useOnRamp hook
 */
export interface UseOnRampReturn {
  // State
  status: OnRampStatus;
  selectedProvider: OnRampProvider | null;
  availableProviders: OnRampProviderConfig[];
  quotes: Record<OnRampProvider, OnRampQuote | null>;
  selectedQuote: OnRampQuote | null;
  transaction: OnRampTransaction | null;
  error: OnRampError | null;

  // Loading states
  isLoadingQuotes: boolean;
  isProcessing: boolean;

  // Computed
  bestQuote: OnRampQuote | null;
  cheapestProvider: OnRampProvider | null;
  fiatAmount: number;

  // Actions
  selectProvider: (provider: OnRampProvider) => void;
  fetchQuotes: () => Promise<void>;
  refreshQuote: (provider: OnRampProvider) => Promise<void>;
  startPurchase: () => Promise<void>;
  cancelPurchase: () => void;
  reset: () => void;

  // Helpers
  getProviderConfig: (provider: OnRampProvider) => OnRampProviderConfig;
  isProviderAvailable: (provider: OnRampProvider) => boolean;
}

/**
 * Hook for managing fiat on-ramp purchases
 */
export function useOnRamp(options: UseOnRampOptions): UseOnRampReturn {
  const {
    amount,
    currency,
    chain,
    walletAddress,
    fiatCurrency = 'USD',
    allowedProviders,
    onSuccess,
    onError,
    autoFetchQuotes = true,
  } = options;

  // State
  const [status, setStatus] = useState<OnRampStatus>('idle');
  const [selectedProvider, setSelectedProvider] = useState<OnRampProvider | null>(null);
  const [quotes, setQuotes] = useState<Record<OnRampProvider, OnRampQuote | null>>({
    moonpay: null,
    transak: null,
    coinbase: null,
    circle: null,
  });
  const [transaction, setTransaction] = useState<OnRampTransaction | null>(null);
  const [error, setError] = useState<OnRampError | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Get available providers based on currency and chain
  const availableProviders = useMemo(() => {
    return Object.values(PROVIDER_CONFIGS).filter((config) => {
      // Check if provider supports the currency and chain
      const supportsCurrency = config.supportedCryptoCurrencies.includes(currency);
      const supportsChain = config.supportedChains.includes(chain);
      const supportsFiat = config.supportedFiatCurrencies.includes(fiatCurrency);
      const isAllowed = !allowedProviders || allowedProviders.includes(config.provider);

      return config.available && supportsCurrency && supportsChain && supportsFiat && isAllowed;
    });
  }, [currency, chain, fiatCurrency, allowedProviders]);

  // Get provider config
  const getProviderConfig = useCallback((provider: OnRampProvider) => {
    return PROVIDER_CONFIGS[provider];
  }, []);

  // Check if provider is available
  const isProviderAvailable = useCallback((provider: OnRampProvider) => {
    return availableProviders.some((p) => p.provider === provider);
  }, [availableProviders]);

  // Fetch quote from a provider (mock implementation)
  const fetchQuoteFromProvider = useCallback(async (
    provider: OnRampProvider
  ): Promise<OnRampQuote | null> => {
    const config = PROVIDER_CONFIGS[provider];

    if (!config.available) {
      return null;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Mock quote generation
    const cryptoAmount = parseFloat(amount);
    const exchangeRate = 1.0; // 1:1 for stablecoins
    const fiatAmount = cryptoAmount / exchangeRate;
    const providerFee = fiatAmount * (config.feePercent / 100);
    const networkFee = 0.50; // Flat network fee
    const totalFees = providerFee + networkFee;

    return {
      quoteId: `${provider}_${Date.now()}`,
      provider,
      fiatAmount: fiatAmount + totalFees,
      fiatCurrency,
      cryptoAmount: amount,
      cryptoCurrency: currency,
      chain,
      networkFee,
      providerFee,
      totalFees,
      exchangeRate,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isValid: true,
    };
  }, [amount, currency, chain, fiatCurrency]);

  // Fetch all quotes
  const fetchQuotes = useCallback(async () => {
    setIsLoadingQuotes(true);
    setError(null);
    setStatus('fetching_quote');

    try {
      const quotePromises = availableProviders.map(async (config) => {
        const quote = await fetchQuoteFromProvider(config.provider);
        return { provider: config.provider, quote };
      });

      const results = await Promise.all(quotePromises);

      const newQuotes: Record<OnRampProvider, OnRampQuote | null> = {
        moonpay: null,
        transak: null,
        coinbase: null,
        circle: null,
      };

      results.forEach(({ provider, quote }) => {
        newQuotes[provider] = quote;
      });

      setQuotes(newQuotes);
      setStatus('selecting_provider');
    } catch (err) {
      const onRampError: OnRampError = {
        code: 'network_error',
        message: 'Failed to fetch quotes. Please try again.',
        recoverable: true,
      };
      setError(onRampError);
      onError?.(onRampError);
      setStatus('failed');
    } finally {
      setIsLoadingQuotes(false);
    }
  }, [availableProviders, fetchQuoteFromProvider, onError]);

  // Refresh a specific quote
  const refreshQuote = useCallback(async (provider: OnRampProvider) => {
    const quote = await fetchQuoteFromProvider(provider);
    setQuotes((prev) => ({ ...prev, [provider]: quote }));
  }, [fetchQuoteFromProvider]);

  // Select provider
  const selectProvider = useCallback((provider: OnRampProvider) => {
    setSelectedProvider(provider);
    setError(null);
  }, []);

  // Start purchase
  const startPurchase = useCallback(async () => {
    if (!selectedProvider) {
      const err: OnRampError = {
        code: 'provider_unavailable',
        message: 'Please select a provider first.',
        recoverable: true,
      };
      setError(err);
      return;
    }

    const quote = quotes[selectedProvider];
    if (!quote || !quote.isValid) {
      const err: OnRampError = {
        code: 'quote_expired',
        message: 'Quote has expired. Please refresh and try again.',
        recoverable: true,
      };
      setError(err);
      onError?.(err);
      return;
    }

    setStatus('awaiting_payment');
    setError(null);

    // Simulate opening provider widget and processing payment
    try {
      // In real implementation, this would:
      // 1. Open provider's widget/iframe
      // 2. Wait for payment completion webhook
      // 3. Return transaction result

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus('processing');

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock successful transaction
      const txn: OnRampTransaction = {
        id: `txn_${Date.now()}`,
        provider: selectedProvider,
        status: 'completed',
        fiatAmount: quote.fiatAmount,
        fiatCurrency: quote.fiatCurrency,
        cryptoAmount: quote.cryptoAmount,
        cryptoCurrency: quote.cryptoCurrency,
        chain: quote.chain,
        walletAddress,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setTransaction(txn);
      setStatus('completed');
      onSuccess?.(txn);
    } catch (err) {
      const onRampError: OnRampError = {
        code: 'payment_failed',
        message: 'Payment failed. Please try again.',
        provider: selectedProvider,
        recoverable: true,
      };
      setError(onRampError);
      setStatus('failed');
      onError?.(onRampError);
    }
  }, [selectedProvider, quotes, walletAddress, onSuccess, onError]);

  // Cancel purchase
  const cancelPurchase = useCallback(() => {
    setStatus('cancelled');
    setSelectedProvider(null);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle');
    setSelectedProvider(null);
    setQuotes({
      moonpay: null,
      transak: null,
      coinbase: null,
      circle: null,
    });
    setTransaction(null);
    setError(null);
  }, []);

  // Get selected quote
  const selectedQuote = selectedProvider ? quotes[selectedProvider] : null;

  // Find best (cheapest) quote
  const bestQuote = useMemo(() => {
    const validQuotes = Object.values(quotes).filter(
      (q): q is OnRampQuote => q !== null && q.isValid
    );

    if (validQuotes.length === 0) return null;

    return validQuotes.reduce((best, current) =>
      current.fiatAmount < best.fiatAmount ? current : best
    );
  }, [quotes]);

  // Cheapest provider
  const cheapestProvider = bestQuote?.provider || null;

  // Fiat amount (from selected quote or best quote)
  const fiatAmount = selectedQuote?.fiatAmount || bestQuote?.fiatAmount || 0;

  // Auto-fetch quotes on mount
  useEffect(() => {
    if (autoFetchQuotes && availableProviders.length > 0 && status === 'idle') {
      fetchQuotes();
    }
  }, [autoFetchQuotes, availableProviders.length, status, fetchQuotes]);

  return {
    // State
    status,
    selectedProvider,
    availableProviders,
    quotes,
    selectedQuote,
    transaction,
    error,

    // Loading states
    isLoadingQuotes,
    isProcessing: status === 'awaiting_payment' || status === 'processing',

    // Computed
    bestQuote,
    cheapestProvider,
    fiatAmount,

    // Actions
    selectProvider,
    fetchQuotes,
    refreshQuote,
    startPurchase,
    cancelPurchase,
    reset,

    // Helpers
    getProviderConfig,
    isProviderAvailable,
  };
}

/**
 * Hook to check balance and determine if on-ramp is needed
 */
export function useBalanceCheck(options: {
  walletAddress: string;
  chain: SupportedChain;
  currency: SupportedCurrency;
  amountNeeded: string;
}): BalanceCheckResult & { isLoading: boolean } {
  const { walletAddress, chain, currency, amountNeeded } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    // Mock balance check
    const checkBalance = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock: random balance between 0 and 100
      const mockBalance = (Math.random() * 100).toFixed(2);
      setBalance(mockBalance);
      setIsLoading(false);
    };

    checkBalance();
  }, [walletAddress, chain, currency]);

  const needed = parseFloat(amountNeeded);
  const current = parseFloat(balance);
  const shortfallAmount = needed - current;
  const isSufficient = current >= needed;

  // Add 10% buffer to recommended amount
  const recommendedAmount = isSufficient ? '0' : (shortfallAmount * 1.1).toFixed(2);

  return {
    balance: { amount: balance, currency },
    amountNeeded: { amount: amountNeeded, currency },
    shortfall: isSufficient ? null : { amount: shortfallAmount.toFixed(2), currency },
    isSufficient,
    recommendedOnRampAmount: recommendedAmount,
    isLoading,
  };
}

export { PROVIDER_CONFIGS };
