import React, { useState } from 'react';
import { useTransactionHistory } from '../../hooks';
import { TransactionItem } from './TransactionItem';
import { TransactionDetail } from './TransactionDetail';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import type { Transaction, TransactionType } from '../../types';

export interface TransactionListProps {
  limit?: number;
  filter?: 'all' | 'sent' | 'received';
  onTransactionClick?: (tx: Transaction) => void;
  emptyMessage?: string;
  className?: string;
}

export function TransactionList({
  limit,
  filter = 'all',
  onTransactionClick,
  emptyMessage = 'No transactions yet',
  className = '',
}: TransactionListProps) {
  const {
    transactions,
    isLoading,
    hasMore,
    loadMore,
    filter: setFilter,
  } = useTransactionHistory();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  React.useEffect(() => {
    if (filter !== 'all') {
      const txType: TransactionType = filter === 'sent' ? 'OUTBOUND' : 'INBOUND';
      setFilter({ type: txType });
    } else {
      setFilter({});
    }
  }, [filter, setFilter]);

  const displayedTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  const handleTransactionClick = (tx: Transaction) => {
    if (onTransactionClick) {
      onTransactionClick(tx);
    } else {
      setSelectedTx(tx);
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className={`arcpay-transaction-list arcpay-transaction-list--loading ${className}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={`arcpay-transaction-list arcpay-transaction-list--empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`arcpay-transaction-list ${className}`}>
      <div className="arcpay-transaction-list__items">
        {displayedTransactions.map((tx) => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            onClick={handleTransactionClick}
          />
        ))}
      </div>

      {!limit && hasMore && (
        <div className="arcpay-transaction-list__load-more">
          <Button
            variant="outline"
            onClick={loadMore}
            isLoading={isLoading}
          >
            Load More
          </Button>
        </div>
      )}

      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
      >
        {selectedTx && (
          <TransactionDetail
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
          />
        )}
      </Modal>
    </div>
  );
}
