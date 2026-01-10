import React from 'react';
import type { Transaction } from '../../types';
import { formatAmount, formatDate, formatAddress } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { useArcPay } from '../../providers/ArcPayProvider';

export interface TransactionDetailProps {
  transaction: Transaction;
  onClose?: () => void;
  className?: string;
}

export function TransactionDetail({
  transaction,
  onClose,
  className = '',
}: TransactionDetailProps) {
  const { arcClient } = useArcPay();
  const isInbound = transaction.type === 'INBOUND';
  const amount = transaction.amounts[0] || '0';

  const openExplorer = () => {
    if (transaction.hash) {
      window.open(arcClient.getExplorerUrl(transaction.hash), '_blank');
    }
  };

  return (
    <div className={`arcpay-transaction-detail ${className}`}>
      <div className="arcpay-transaction-detail__header">
        <div className="arcpay-transaction-detail__icon">
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
        <h3 className="arcpay-transaction-detail__title">
          {isInbound ? 'Received' : 'Sent'} USDC
        </h3>
      </div>

      <div className="arcpay-transaction-detail__amount">
        <span className={isInbound ? 'arcpay-text-success' : 'arcpay-text-error'}>
          {isInbound ? '+' : '-'}${formatAmount(amount, 6, 2)}
        </span>
      </div>

      <dl className="arcpay-transaction-detail__info">
        <div className="arcpay-transaction-detail__row">
          <dt>Status</dt>
          <dd className={`arcpay-transaction-detail__status--${transaction.state.toLowerCase()}`}>
            {transaction.state.replace(/_/g, ' ')}
          </dd>
        </div>

        <div className="arcpay-transaction-detail__row">
          <dt>Date</dt>
          <dd>{formatDate(transaction.createDate)}</dd>
        </div>

        <div className="arcpay-transaction-detail__row">
          <dt>{isInbound ? 'From' : 'To'}</dt>
          <dd>
            {formatAddress(
              isInbound ? transaction.sourceAddress : transaction.destinationAddress
            )}
          </dd>
        </div>

        {transaction.hash && (
          <div className="arcpay-transaction-detail__row">
            <dt>Transaction Hash</dt>
            <dd>{formatAddress(transaction.hash, 10, 8)}</dd>
          </div>
        )}

        {transaction.networkFee && (
          <div className="arcpay-transaction-detail__row">
            <dt>Network Fee</dt>
            <dd>${transaction.networkFee}</dd>
          </div>
        )}

        {transaction.errorReason && (
          <div className="arcpay-transaction-detail__row arcpay-transaction-detail__row--error">
            <dt>Error</dt>
            <dd>{transaction.errorReason}</dd>
          </div>
        )}
      </dl>

      <div className="arcpay-transaction-detail__actions">
        {transaction.hash && (
          <Button variant="outline" onClick={openExplorer}>
            View on Explorer
          </Button>
        )}
        {onClose && (
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
