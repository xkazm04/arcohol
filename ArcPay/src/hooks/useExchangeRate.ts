import { useState, useEffect, useCallback } from 'react';

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  [key: string]: number;
}

export interface UseExchangeRateReturn {
  rates: ExchangeRates;
  isLoading: boolean;
  error: Error | null;
  convert: (amount: number, from: string, to: string) => number;
  refetch: () => Promise<void>;
}

const DEFAULT_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function useExchangeRate(): UseExchangeRateReturn {
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would fetch from an exchange rate API
      // For now, we use default rates
      // const response = await fetch('https://api.exchangerate.host/latest?base=USD');
      // const data = await response.json();
      // setRates(data.rates);

      setRates(DEFAULT_RATES);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch exchange rates');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();

    // Refresh rates every hour
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number => {
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;

      // Convert to USD first, then to target currency
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    },
    [rates]
  );

  return {
    rates,
    isLoading,
    error,
    convert,
    refetch: fetchRates,
  };
}
