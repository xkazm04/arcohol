import { useState, useCallback, useEffect, useMemo } from 'react';
import type { SupportedChain, SupportedCurrency, Money, PaymentStatus } from '../theme/types';

/**
 * Transaction record
 */
export interface Transaction {
  id: string;
  type: 'payment' | 'receive' | 'bridge' | 'swap';
  status: PaymentStatus;
  amount: Money;
  chain: SupportedChain;
  txHash: string;
  from: string;
  to: string;
  description?: string;
  createdAt: Date;
  confirmedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Filter criteria
 */
export interface TransactionFilter {
  type?: Transaction['type'] | Transaction['type'][];
  status?: PaymentStatus | PaymentStatus[];
  chain?: SupportedChain | SupportedChain[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/**
 * Transaction history options
 */
export interface UseTransactionHistoryOptions {
  address?: string;
  chains?: SupportedChain[];
  limit?: number;
  initialFilter?: TransactionFilter;
}

/**
 * Transaction history return type
 */
export interface UseTransactionHistoryReturn {
  // Data
  transactions: Transaction[];
  filteredTransactions: Transaction[];

  // Pagination
  hasMore: boolean;
  totalCount: number;

  // State
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;

  // Filter
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  clearFilter: () => void;

  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Transaction history hook
 */
export function useTransactionHistory(
  options: UseTransactionHistoryOptions = {}
): UseTransactionHistoryReturn {
  const {
    address,
    chains = ['base', 'ethereum', 'arbitrum', 'polygon'],
    limit = 20,
    initialFilter = {},
  } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);

  // Generate mock transactions
  const generateMockTransactions = useCallback(
    (count: number, offset: number = 0): Transaction[] => {
      const types: Transaction['type'][] = ['payment', 'receive', 'bridge', 'swap'];
      const statuses: PaymentStatus[] = ['confirmed', 'pending', 'failed'];

      return Array.from({ length: count }, (_, i) => {
        const chain = chains[Math.floor(Math.random() * chains.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        date.setDate(date.getDate() - offset - i);

        return {
          id: `tx_${offset + i}_${Math.random().toString(36).slice(2)}`,
          type,
          status,
          amount: {
            amount: (Math.random() * 1000).toFixed(2),
            currency: 'USDC' as SupportedCurrency,
          },
          chain,
          txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
          from: `0x${Math.random().toString(16).slice(2, 42)}`,
          to: `0x${Math.random().toString(16).slice(2, 42)}`,
          description: type === 'payment' ? 'Payment to merchant' : undefined,
          createdAt: date,
          confirmedAt: status === 'confirmed' ? date : undefined,
        };
      });
    },
    [chains]
  );

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      result = result.filter((tx) => types.includes(tx.type));
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      result = result.filter((tx) => statuses.includes(tx.status));
    }

    if (filter.chain) {
      const chains = Array.isArray(filter.chain) ? filter.chain : [filter.chain];
      result = result.filter((tx) => chains.includes(tx.chain));
    }

    if (filter.minAmount !== undefined) {
      result = result.filter(
        (tx) => parseFloat(tx.amount.amount) >= filter.minAmount!
      );
    }

    if (filter.maxAmount !== undefined) {
      result = result.filter(
        (tx) => parseFloat(tx.amount.amount) <= filter.maxAmount!
      );
    }

    if (filter.startDate) {
      result = result.filter((tx) => tx.createdAt >= filter.startDate!);
    }

    if (filter.endDate) {
      result = result.filter((tx) => tx.createdAt <= filter.endDate!);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.txHash.toLowerCase().includes(search) ||
          tx.from.toLowerCase().includes(search) ||
          tx.to.toLowerCase().includes(search) ||
          tx.description?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [transactions, filter]);

  // Initial fetch
  const refresh = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockTxs = generateMockTransactions(limit);
      setTransactions(mockTxs);
      setTotalCount(100); // Mock total
      setHasMore(mockTxs.length < 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load transactions'));
    } finally {
      setIsLoading(false);
    }
  }, [address, limit, generateMockTransactions]);

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const moreTxs = generateMockTransactions(limit, transactions.length);
      setTransactions((prev) => [...prev, ...moreTxs]);
      setHasMore(transactions.length + moreTxs.length < totalCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more transactions'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, limit, transactions.length, totalCount, generateMockTransactions]);

  // Clear filter
  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    transactions,
    filteredTransactions,
    hasMore,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    filter,
    setFilter,
    clearFilter,
    loadMore,
    refresh,
  };
}
