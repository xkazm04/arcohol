/**
 * Headless Pay Button Hook
 *
 * Provides all payment logic without any UI.
 * Use this to build completely custom payment buttons.
 */

import { useState, useCallback } from 'react';
import { useWallet, useTransfer } from '../hooks';
import type { Transaction } from '../types';
import type { PayButtonRenderProps } from './types';

export interface UsePayButtonHeadlessOptions {
  /** Amount to pay */
  amount: number | string;
  /** Recipient address or email */
  recipient: string;
  /** Payment description/memo */
  description?: string;
  /** Called on successful payment */
  onSuccess?: (transaction: Transaction) => void;
  /** Called on payment error */
  onError?: (error: Error) => void;
}

/**
 * Hook providing pay button functionality without UI
 *
 * @example
 * ```tsx
 * function CustomPayButton() {
 *   const {
 *     isConnected,
 *     isProcessing,
 *     isConfirmOpen,
 *     formattedAmount,
 *     initiatePayment,
 *     confirmPayment,
 *     cancelPayment,
 *   } = usePayButtonHeadless({
 *     amount: 99.99,
 *     recipient: 'merchant@store.com',
 *     onSuccess: (tx) => console.log('Paid!', tx),
 *   });
 *
 *   if (isConfirmOpen) {
 *     return (
 *       <div>
 *         <p>Confirm payment of {formattedAmount}?</p>
 *         <button onClick={confirmPayment}>Confirm</button>
 *         <button onClick={cancelPayment}>Cancel</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <button onClick={initiatePayment} disabled={isProcessing}>
 *       {isProcessing ? 'Processing...' : `Pay ${formattedAmount}`}
 *     </button>
 *   );
 * }
 * ```
 */
export function usePayButtonHeadless(
  options: UsePayButtonHeadlessOptions
): PayButtonRenderProps {
  const { amount, recipient, description, onSuccess, onError } = options;

  const { isConnected, connect: walletConnect } = useWallet();
  const { transfer, isTransferring } = useTransfer();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const formattedAmount =
    typeof amount === 'number' ? `$${amount.toFixed(2)}` : `$${amount}`;

  const connect = useCallback(async () => {
    await walletConnect();
  }, [walletConnect]);

  const initiatePayment = useCallback(async () => {
    setError(null);

    if (!isConnected) {
      await connect();
      return;
    }

    setIsConfirmOpen(true);
  }, [isConnected, connect]);

  const confirmPayment = useCallback(async () => {
    setError(null);

    try {
      const result = await transfer({
        to: recipient,
        amount: String(amount),
        memo: description,
      });

      setLastTransaction(result.transaction);
      setIsConfirmOpen(false);
      onSuccess?.(result.transaction);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    }
  }, [transfer, recipient, amount, description, onSuccess, onError]);

  const cancelPayment = useCallback(() => {
    setIsConfirmOpen(false);
    setError(null);
  }, []);

  return {
    isConnected,
    isProcessing: isTransferring,
    isConfirmOpen,
    formattedAmount,
    recipient,
    description,
    initiatePayment,
    confirmPayment,
    cancelPayment,
    connect,
    error,
    lastTransaction,
  };
}
