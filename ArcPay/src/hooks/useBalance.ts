import { useState, useEffect, useCallback } from 'react';
import { useArcPay } from '../providers/ArcPayProvider';
import { useWallet } from './useWallet';
import { formatAmount } from '../utils/formatting';

export interface UseBalanceReturn {
  balance: string;
  balanceRaw: bigint;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBalance(): UseBalanceReturn {
  const { circleClient } = useArcPay();
  const { wallet } = useWallet();

  const [balance, setBalance] = useState<string>('0.00');
  const [balanceRaw, setBalanceRaw] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wallet?.id) {
      setBalance('0.00');
      setBalanceRaw(0n);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rawBalance = await circleClient.getUSDCBalance(wallet.id);
      const raw = BigInt(Math.floor(parseFloat(rawBalance) * 1e6));
      setBalanceRaw(raw);
      setBalance(formatAmount(raw, 6, 2));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch balance');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [circleClient, wallet?.id]);

  useEffect(() => {
    fetchBalance();

    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    balanceRaw,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
