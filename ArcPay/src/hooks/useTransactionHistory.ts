import { useState, useEffect, useCallback } from 'react';
import { useArcPay } from '../providers/ArcPayProvider';
import { useWallet } from './useWallet';
import type { Transaction, TransactionFilters } from '../types';

export interface UseTransactionHistoryReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filter: (filters: TransactionFilters) => void;
}

export function useTransactionHistory(): UseTransactionHistoryReturn {
  const { circleClient } = useArcPay();
  const { wallet } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [pageToken, setPageToken] = useState<string | undefined>();

  const fetchTransactions = useCallback(
    async (append = false) => {
      if (!wallet?.id) {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await circleClient.listTransactions(wallet.id, {
          pageSize: 20,
          pageAfter: append ? pageToken : undefined,
        });

        let filteredTxs = result.transactions;

        if (filters.type) {
          filteredTxs = filteredTxs.filter((tx) => tx.type === filters.type);
        }
        if (filters.state) {
          filteredTxs = filteredTxs.filter((tx) => tx.state === filters.state);
        }
        if (filters.from) {
          filteredTxs = filteredTxs.filter(
            (tx) => new Date(tx.createDate) >= filters.from!
          );
        }
        if (filters.to) {
          filteredTxs = filteredTxs.filter(
            (tx) => new Date(tx.createDate) <= filters.to!
          );
        }

        if (append) {
          setTransactions((prev) => [...prev, ...filteredTxs]);
        } else {
          setTransactions(filteredTxs);
        }

        setHasMore(result.hasMore);
        if (result.transactions.length > 0) {
          setPageToken(result.transactions[result.transactions.length - 1].id);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch transactions');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [circleClient, wallet?.id, filters, pageToken]
  );

  useEffect(() => {
    fetchTransactions();
  }, [wallet?.id, filters]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchTransactions(true);
    }
  }, [fetchTransactions, isLoading, hasMore]);

  const refresh = useCallback(async () => {
    setPageToken(undefined);
    await fetchTransactions();
  }, [fetchTransactions]);

  const filter = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPageToken(undefined);
  }, []);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    filter,
  };
}
