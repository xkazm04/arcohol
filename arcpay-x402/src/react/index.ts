'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  UseX402FetchConfig,
  UseX402FetchReturn,
  X402PaymentRequirement,
  X402Wallet,
  X402PaymentInfo,
} from '../types';
import {
  parsePaymentRequirement,
  encodePaymentSignature,
  isExpired,
} from '../utils';

/**
 * React hook for making x402-enabled fetch requests
 *
 * @example
 * ```tsx
 * import { useFetchWithPayment } from '@arcpay/x402/react';
 *
 * function DataFetcher() {
 *   const { fetch, isPaymentPending, pendingPayment, approvePayment } = useFetchWithPayment({
 *     wallet: connectedWallet,
 *     autoApprove: { maxAmount: 1 }
 *   });
 *
 *   const getData = async () => {
 *     const response = await fetch('https://api.example.com/premium');
 *     return response.json();
 *   };
 * }
 * ```
 */
export function useFetchWithPayment(config: UseX402FetchConfig = {}): UseX402FetchReturn {
  const { wallet, autoApprove, budget, showPaymentUI = true } = config;

  // State
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<X402PaymentRequirement | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [dailySpending, setDailySpending] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Refs for pending request resolution
  const pendingResolve = useRef<((value: Response) => void) | null>(null);
  const pendingReject = useRef<((reason: Error) => void) | null>(null);
  const pendingRequest = useRef<{ url: string; init?: RequestInit } | null>(null);

  // Daily spending tracking
  const lastResetDate = useRef(new Date().toISOString().split('T')[0]);

  // Check daily reset
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (today !== lastResetDate.current) {
      setDailySpending(0);
      lastResetDate.current = today;
    }
  }, []);

  // Fetch balance on wallet change
  useEffect(() => {
    if (wallet?.getBalance) {
      wallet.getBalance('USDC').then(setBalance);
    }
  }, [wallet]);

  /**
   * Check if payment should be auto-approved
   */
  const shouldAutoApprove = useCallback(
    (amount: number, url: string): boolean => {
      if (!autoApprove) return false;
      if (amount > autoApprove.maxAmount) return false;

      if (autoApprove.allowedEndpoints) {
        const hostname = new URL(url).hostname;
        return autoApprove.allowedEndpoints.some(
          (e) => hostname === e || hostname.endsWith(`.${e}`)
        );
      }

      return true;
    },
    [autoApprove]
  );

  /**
   * Check budget limits
   */
  const checkBudget = useCallback(
    (amount: number): { allowed: boolean; reason?: string } => {
      if (!budget) return { allowed: true };

      if (budget.perRequest && amount > budget.perRequest) {
        return { allowed: false, reason: `Exceeds per-request limit of $${budget.perRequest}` };
      }

      if (budget.daily && dailySpending + amount > budget.daily) {
        return { allowed: false, reason: `Would exceed daily limit of $${budget.daily}` };
      }

      return { allowed: true };
    },
    [budget, dailySpending]
  );

  /**
   * Create payment signature
   */
  const createPaymentSignature = useCallback(
    async (requirement: X402PaymentRequirement) => {
      if (!wallet) throw new Error('Wallet not connected');

      const message = JSON.stringify({
        paymentId: requirement.paymentId,
        amount: requirement.amount,
        recipient: requirement.recipient,
        timestamp: Date.now(),
      });

      const proof = await wallet.signMessage(message);

      return {
        paymentId: requirement.paymentId,
        chain: wallet.chain,
        payer: wallet.address,
        proof,
        proofType: 'permit' as const,
        timestamp: Date.now(),
      };
    },
    [wallet]
  );

  /**
   * Enhanced fetch with x402 support
   */
  const x402Fetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      setError(null);

      try {
        // Make initial request
        const response = await fetch(url, init);

        // If not 402, return as-is
        if (response.status !== 402) {
          return response;
        }

        // Parse payment requirement
        const paymentHeader = response.headers.get('x-payment-required');
        if (!paymentHeader) {
          throw new Error('402 response missing payment requirement');
        }

        const requirement = parsePaymentRequirement(paymentHeader);

        // Check expiration
        if (isExpired(requirement.expiresAt)) {
          throw new Error('Payment requirement expired');
        }

        const amount = parseFloat(requirement.amount);

        // Check budget
        const budgetCheck = checkBudget(amount);
        if (!budgetCheck.allowed) {
          throw new Error(budgetCheck.reason);
        }

        // Check auto-approve
        if (shouldAutoApprove(amount, url) && wallet) {
          // Auto-approve: sign and retry immediately
          const signature = await createPaymentSignature(requirement);

          const retryResponse = await fetch(url, {
            ...init,
            headers: {
              ...init?.headers,
              'X-Payment-Signature': encodePaymentSignature(signature),
            },
          });

          if (retryResponse.ok) {
            setDailySpending((prev) => prev + amount);
          }

          return retryResponse;
        }

        // Need user approval
        if (!wallet) {
          throw new Error('Wallet not connected');
        }

        // Store pending request and show payment UI
        return new Promise((resolve, reject) => {
          pendingResolve.current = resolve;
          pendingReject.current = reject;
          pendingRequest.current = { url, init };
          setPendingPayment(requirement);
          setIsPaymentPending(true);
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [wallet, checkBudget, shouldAutoApprove, createPaymentSignature]
  );

  /**
   * Approve pending payment
   */
  const approvePayment = useCallback(async () => {
    if (!pendingPayment || !wallet || !pendingRequest.current) {
      throw new Error('No pending payment');
    }

    try {
      const signature = await createPaymentSignature(pendingPayment);
      const { url, init } = pendingRequest.current;

      const response = await fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          'X-Payment-Signature': encodePaymentSignature(signature),
        },
      });

      if (response.ok) {
        const amount = parseFloat(pendingPayment.amount);
        setDailySpending((prev) => prev + amount);
      }

      // Resolve the pending promise
      pendingResolve.current?.(response);

      // Clean up
      setPendingPayment(null);
      setIsPaymentPending(false);
      pendingResolve.current = null;
      pendingReject.current = null;
      pendingRequest.current = null;
    } catch (err) {
      pendingReject.current?.(err as Error);
      setError(err as Error);
      throw err;
    }
  }, [pendingPayment, wallet, createPaymentSignature]);

  /**
   * Reject pending payment
   */
  const rejectPayment = useCallback(() => {
    if (pendingReject.current) {
      pendingReject.current(new Error('Payment rejected by user'));
    }

    setPendingPayment(null);
    setIsPaymentPending(false);
    pendingResolve.current = null;
    pendingReject.current = null;
    pendingRequest.current = null;
  }, []);

  return {
    fetch: x402Fetch,
    isPaymentPending,
    pendingPayment,
    approvePayment,
    rejectPayment,
    balance,
    dailySpending,
    isConnected: !!wallet,
    error,
  };
}

/**
 * Payment approval modal component
 */
export interface PaymentModalProps {
  payment: X402PaymentRequirement | null;
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  balance?: string | null;
  isProcessing?: boolean;
}

/**
 * Default payment modal (can be replaced with custom UI)
 */
export function PaymentModal({
  payment,
  isOpen,
  onApprove,
  onReject,
  balance,
  isProcessing,
}: PaymentModalProps) {
  if (!isOpen || !payment) return null;

  const hasEnoughBalance = balance
    ? parseFloat(balance) >= parseFloat(payment.amount)
    : true;

  return (
    <div className="x402-modal-overlay">
      <div className="x402-modal">
        <h2>Payment Required</h2>
        <div className="x402-payment-details">
          <p>
            <strong>Amount:</strong> {payment.amount} {payment.currency}
          </p>
          <p>
            <strong>Recipient:</strong> {payment.recipient.slice(0, 10)}...
          </p>
          {balance && (
            <p>
              <strong>Your Balance:</strong> {balance} {payment.currency}
            </p>
          )}
        </div>

        {!hasEnoughBalance && (
          <p className="x402-warning">Insufficient balance</p>
        )}

        <div className="x402-modal-actions">
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="x402-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing || !hasEnoughBalance}
            className="x402-btn-primary"
          >
            {isProcessing ? 'Processing...' : 'Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default useFetchWithPayment;
