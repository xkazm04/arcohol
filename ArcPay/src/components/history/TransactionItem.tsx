import React from 'react';
import type { Transaction } from '../../types';
import { formatAmount, formatRelativeTime, formatAddress } from '../../utils/formatting';

export interface TransactionItemProps {
  transaction: Transaction;
  onClick?: (tx: Transaction) => void;
  className?: string;
}

export function TransactionItem({
  transaction,
  onClick,
  className = '',
}: TransactionItemProps) {
  const isInbound = transaction.type === 'INBOUND';
  const amount = transaction.amounts[0] || '0';

  const statusColors: Record<string, string> = {
    COMPLETE: 'success',
    CONFIRMED: 'success',
    PENDING_RISK_SCREENING: 'warning',
    QUEUED: 'warning',
    SENT: 'warning',
    INITIATED: 'warning',
    FAILED: 'error',
    DENIED: 'error',
    CANCELLED: 'error',
  };

  const statusColor = statusColors[transaction.state] || 'default';

  return (
    <button
      className={`arcpay-transaction-item ${className}`}
      onClick={() => onClick?.(transaction)}
      type="button"
    >
      <div className="arcpay-transaction-item__icon">
        {isInbound ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7 7 7-7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
        )}
      </div>

      <div className="arcpay-transaction-item__details">
        <span className="arcpay-transaction-item__type">
          {isInbound ? 'Received' : 'Sent'}
        </span>
        <span className="arcpay-transaction-item__address">
          {isInbound
            ? `From: ${formatAddress(transaction.sourceAddress)}`
            : `To: ${formatAddress(transaction.destinationAddress)}`}
        </span>
      </div>

      <div className="arcpay-transaction-item__right">
        <span
          className={`arcpay-transaction-item__amount arcpay-transaction-item__amount--${
            isInbound ? 'inbound' : 'outbound'
          }`}
        >
          {isInbound ? '+' : '-'}${formatAmount(amount, 6, 2)}
        </span>
        <span className={`arcpay-transaction-item__status arcpay-transaction-item__status--${statusColor}`}>
          {transaction.state.toLowerCase().replace(/_/g, ' ')}
        </span>
        <span className="arcpay-transaction-item__date">
          {formatRelativeTime(transaction.createDate)}
        </span>
      </div>
    </button>
  );
}
