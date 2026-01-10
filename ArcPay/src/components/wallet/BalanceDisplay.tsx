import React from 'react';
import { useBalance } from '../../hooks';
import { formatCurrency } from '../../utils/formatting';
import { Spinner } from '../ui/Spinner';

export interface BalanceDisplayProps {
  balance?: string;
  currency?: string;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BalanceDisplay({
  balance: propBalance,
  currency = 'USD',
  showRefresh = false,
  size = 'md',
  className = '',
}: BalanceDisplayProps) {
  const { balance: hookBalance, isLoading, refetch } = useBalance();
  const balance = propBalance ?? hookBalance;

  return (
    <div className={`arcpay-balance arcpay-balance--${size} ${className}`}>
      <span className="arcpay-balance__label">Balance</span>
      <div className="arcpay-balance__value">
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <span>{formatCurrency(balance, currency)}</span>
        )}
        {showRefresh && !isLoading && (
          <button
            className="arcpay-balance__refresh"
            onClick={refetch}
            aria-label="Refresh balance"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
