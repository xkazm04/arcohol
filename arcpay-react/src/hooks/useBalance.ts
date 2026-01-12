import { useState, useCallback, useEffect, useMemo } from 'react';
import type { SupportedChain, SupportedCurrency, Money } from '../theme/types';

/**
 * Chain balance
 */
export interface ChainBalance {
  chain: SupportedChain;
  balance: Money;
  nativeBalance?: Money;
  lastUpdated: Date;
}

/**
 * Balance options
 */
export interface UseBalanceOptions {
  address?: string;
  chains?: SupportedChain[];
  currency?: SupportedCurrency;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Balance return type
 */
export interface UseBalanceReturn {
  // Balances
  balances: Record<SupportedChain, ChainBalance>;
  totalBalance: Money;

  // State
  isLoading: boolean;
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;
  getBalance: (chain: SupportedChain) => ChainBalance | undefined;
}

const DEFAULT_CHAINS: SupportedChain[] = ['base', 'ethereum', 'arbitrum', 'polygon'];

/**
 * Balance hook for multi-chain balance tracking
 */
export function useBalance(options: UseBalanceOptions = {}): UseBalanceReturn {
  const {
    address,
    chains = DEFAULT_CHAINS,
    currency = 'USDC',
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [balances, setBalances] = useState<Record<SupportedChain, ChainBalance>>(
    {} as Record<SupportedChain, ChainBalance>
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate total balance
  const totalBalance = useMemo((): Money => {
    const total = Object.values(balances).reduce(
      (sum, b) => sum + parseFloat(b.balance.amount),
      0
    );
    return {
      amount: total.toFixed(2),
      currency,
    };
  }, [balances, currency]);

  // Fetch balances
  const refresh = useCallback(async () => {
    if (!address) {
      setBalances({} as Record<SupportedChain, ChainBalance>);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In real implementation, fetch from blockchain or API
      // For demo, generate mock balances
      const mockBalances: Record<SupportedChain, ChainBalance> = {} as Record<
        SupportedChain,
        ChainBalance
      >;

      for (const chain of chains) {
        const randomBalance = (Math.random() * 10000).toFixed(2);
        mockBalances[chain] = {
          chain,
          balance: { amount: randomBalance, currency },
          lastUpdated: new Date(),
        };
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBalances(mockBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balances'));
    } finally {
      setIsLoading(false);
    }
  }, [address, chains, currency]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !address) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh, address]);

  // Get balance for specific chain
  const getBalance = useCallback(
    (chain: SupportedChain): ChainBalance | undefined => {
      return balances[chain];
    },
    [balances]
  );

  return {
    balances,
    totalBalance,
    isLoading,
    error,
    refresh,
    getBalance,
  };
}

/**
 * Single chain balance hook
 */
export function useChainBalance(
  chain: SupportedChain,
  address?: string,
  currency: SupportedCurrency = 'USDC'
) {
  const { balances, isLoading, error, refresh } = useBalance({
    address,
    chains: [chain],
    currency,
  });

  return {
    balance: balances[chain]?.balance || { amount: '0', currency },
    isLoading,
    error,
    refresh,
  };
}
