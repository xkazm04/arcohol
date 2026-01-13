import { useState, useCallback } from 'react';
import type { UsdyTransaction, DepositParams, WithdrawParams, TransactionListParams } from '../types';

interface UseUsdyOperationsResult {
  // Deposit
  deposit: (params: DepositParams) => Promise<UsdyTransaction | null>;
  isDepositing: boolean;
  depositError: Error | null;

  // Withdraw
  withdraw: (params: WithdrawParams) => Promise<UsdyTransaction | null>;
  isWithdrawing: boolean;
  withdrawError: Error | null;

  // Transactions
  transactions: UsdyTransaction[];
  isLoadingTransactions: boolean;
  transactionsError: Error | null;
  fetchTransactions: (params?: TransactionListParams) => Promise<void>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useUsdyOperations(): UseUsdyOperationsResult {
  // Deposit state
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<Error | null>(null);

  // Withdraw state
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<Error | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<UsdyTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const deposit = useCallback(async (params: DepositParams): Promise<UsdyTransaction | null> => {
    try {
      setIsDepositing(true);
      setDepositError(null);

      const response = await fetch('/api/usdy/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deposit');
      }

      const data = await response.json();
      return data.transaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setDepositError(error);
      return null;
    } finally {
      setIsDepositing(false);
    }
  }, []);

  const withdraw = useCallback(async (params: WithdrawParams): Promise<UsdyTransaction | null> => {
    try {
      setIsWithdrawing(true);
      setWithdrawError(null);

      const response = await fetch('/api/usdy/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw');
      }

      const data = await response.json();
      return data.transaction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setWithdrawError(error);
      return null;
    } finally {
      setIsWithdrawing(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (params?: TransactionListParams): Promise<void> => {
    try {
      setIsLoadingTransactions(true);
      setTransactionsError(null);

      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.type) searchParams.set('type', params.type);

      const response = await fetch(`/api/usdy/transactions?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      setTransactionsError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  return {
    deposit,
    isDepositing,
    depositError,
    withdraw,
    isWithdrawing,
    withdrawError,
    transactions,
    isLoadingTransactions,
    transactionsError,
    fetchTransactions,
    pagination,
  };
}
