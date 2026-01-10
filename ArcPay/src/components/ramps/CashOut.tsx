import React, { useState, useRef, useEffect } from 'react';
import { useOfframp, useBalance, useWallet } from '../../hooks';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { OfframpResult } from '../../types';

export interface CashOutProps {
  defaultAmount?: number;
  mode?: 'popup' | 'embedded';
  transakApiKey?: string;
  themeColor?: string;
  onSuccess?: (result: OfframpResult) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function CashOut({
  defaultAmount,
  mode = 'popup',
  transakApiKey,
  themeColor,
  onSuccess,
  onError,
  className = '',
}: CashOutProps) {
  const { wallet } = useWallet();
  const { balance } = useBalance();
  const {
    openOfframp,
    isPending,
    onSuccess: setOnSuccess,
    onError: setOnError,
    embedWidget,
    destroyWidget,
  } = useOfframp({
    transakApiKey,
    themeColor,
  });

  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [showEmbedded, setShowEmbedded] = useState(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      destroyWidget();
    };
  }, [destroyWidget]);

  const handleCashOut = () => {
    if (!amount || !wallet) return;

    setOnSuccess((result) => {
      setShowEmbedded(false);
      onSuccess?.(result);
    });

    setOnError((error) => {
      setShowEmbedded(false);
      onError?.(error);
    });

    if (mode === 'embedded' && embedContainerRef.current) {
      setShowEmbedded(true);
      embedWidget(embedContainerRef.current, {
        amount: parseFloat(amount),
        currency: 'USD',
        cryptoCurrency: 'USDC',
      });
    } else {
      openOfframp({
        amount: parseFloat(amount),
        currency: 'USD',
        cryptoCurrency: 'USDC',
      });
    }
  };

  const handleCloseEmbedded = () => {
    destroyWidget();
    setShowEmbedded(false);
  };

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const amountNum = parseFloat(amount) || 0;
  const balanceNum = parseFloat(balance) || 0;
  const isOverBalance = amountNum > balanceNum;

  return (
    <div className={`arcpay-cash-out ${className}`}>
      {!showEmbedded ? (
        <>
          <p className="arcpay-cash-out__balance">
            Available balance: <strong>${balance}</strong>
          </p>

          <div className="arcpay-cash-out__input-wrapper">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              label="Amount to Cash Out"
              min="1"
              max={balanceNum}
              step="0.01"
              error={isOverBalance ? 'Amount exceeds balance' : undefined}
              leftIcon={<span>$</span>}
            />
            <button
              type="button"
              className="arcpay-cash-out__max"
              onClick={handleMaxClick}
            >
              Max
            </button>
          </div>

          <p className="arcpay-cash-out__info">
            Withdraw USDC to your bank account via Transak.
            Funds typically arrive in 1-3 business days.
          </p>

          <Button
            variant="primary"
            onClick={handleCashOut}
            disabled={!amount || isOverBalance || isPending || !wallet}
            isLoading={isPending}
            fullWidth
          >
            {!wallet ? 'Connect Wallet First' : `Cash Out $${amount || '0.00'}`}
          </Button>
        </>
      ) : (
        <div className="arcpay-cash-out__embedded">
          <div className="arcpay-cash-out__embedded-header">
            <span>Cash out via Transak</span>
            <button
              type="button"
              className="arcpay-cash-out__embedded-close"
              onClick={handleCloseEmbedded}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            ref={embedContainerRef}
            className="arcpay-cash-out__embedded-container"
            style={{ minHeight: '600px' }}
          />
        </div>
      )}
    </div>
  );
}
