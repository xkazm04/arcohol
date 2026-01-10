import { useState, useCallback, useMemo } from 'react';
import { useArcPay } from '../providers/ArcPayProvider';
import { useWallet } from './useWallet';
import { PaymentProcessor } from '../core/PaymentProcessor';
import { validateRecipient } from '../utils/validation';
import type { TransferParams, TransactionResult, Transaction, ValidationResult } from '../types';
import { ArcPayError } from '../types/config';

export interface UseTransferReturn {
  isTransferring: boolean;
  lastTransaction: Transaction | null;
  error: Error | null;
  transfer: (params: TransferParams) => Promise<TransactionResult>;
  estimateFee: (params: TransferParams) => Promise<string>;
  validateRecipient: (recipient: string) => ValidationResult;
}

export function useTransfer(): UseTransferReturn {
  const { circleClient, arcClient, config } = useArcPay();
  const { wallet } = useWallet();

  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const paymentProcessor = useMemo(() => {
    if (!wallet?.id) return null;
    return new PaymentProcessor({
      circleClient,
      arcClient,
      walletId: wallet.id,
    });
  }, [circleClient, arcClient, wallet?.id]);

  const transfer = useCallback(
    async (params: TransferParams): Promise<TransactionResult> => {
      if (!paymentProcessor) {
        throw new ArcPayError('Wallet not connected', 'WALLET_NOT_CONNECTED');
      }

      setIsTransferring(true);
      setError(null);

      try {
        const result = await paymentProcessor.transfer(params);
        setLastTransaction(result.transaction);
        config.onTransaction?.(result.transaction);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transfer failed');
        setError(error);
        config.onError?.(
          err instanceof ArcPayError
            ? err
            : new ArcPayError(error.message, 'TRANSFER_FAILED')
        );
        throw error;
      } finally {
        setIsTransferring(false);
      }
    },
    [paymentProcessor, config]
  );

  const estimateFee = useCallback(
    async (params: TransferParams): Promise<string> => {
      if (!paymentProcessor) {
        return '0.00';
      }
      return paymentProcessor.estimateFee(params);
    },
    [paymentProcessor]
  );

  return {
    isTransferring,
    lastTransaction,
    error,
    transfer,
    estimateFee,
    validateRecipient,
  };
}
