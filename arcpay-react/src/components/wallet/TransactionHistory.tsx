import React, { useState } from 'react';
import { useTheme } from '../../theme';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Spinner } from '../primitives/Spinner';
import { Select } from '../primitives/Select';
import {
  useTransactionHistory,
  type Transaction,
  type TransactionFilter,
} from '../../hooks/useTransactionHistory';
import { CHAIN_INFO, ChainIcon } from '../payment/Checkout/ChainSelector';
import type { SupportedChain, Money, PaymentStatus } from '../../theme/types';

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format money for display
 */
function formatMoney(money: Money): string {
  const amount = parseFloat(money.amount);
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${money.currency}`;
}

/**
 * Truncate hash
 */
function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * Get status variant
 */
function getStatusVariant(status: PaymentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
    case 'processing':
    case 'confirming':
      return 'warning';
    case 'failed':
    case 'expired':
      return 'error';
    case 'refunded':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Get type icon
 */
function getTypeIcon(type: Transaction['type']): string {
  switch (type) {
    case 'payment':
      return '↗';
    case 'receive':
      return '↙';
    case 'bridge':
      return '⇄';
    case 'swap':
      return '⟳';
    default:
      return '•';
  }
}

/**
 * Transaction row component
 */
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { theme } = useTheme();
  const isOutgoing = transaction.type === 'payment' || transaction.type === 'swap';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${theme.spacing.md} 0`,
        borderBottom: `1px solid ${theme.colors.border}`,
        gap: theme.spacing.md,
      }}
    >
      {/* Type icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: theme.fontSizes.xl,
          color: isOutgoing ? theme.colors.error : theme.colors.success,
          flexShrink: 0,
        }}
      >
        {getTypeIcon(transaction.type)}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}
        >
          <span
            style={{
              fontSize: theme.fontSizes.sm,
              fontWeight: 500,
              color: theme.colors.text,
              textTransform: 'capitalize',
            }}
          >
            {transaction.type}
          </span>
          <Badge variant={getStatusVariant(transaction.status)} size="sm">
            {transaction.status}
          </Badge>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          <ChainIcon chain={transaction.chain} size={14} />
          <a
            href={`https://etherscan.io/tx/${transaction.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.mono,
              textDecoration: 'none',
            }}
          >
            {truncateHash(transaction.txHash)}
          </a>
          <span
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
            }}
          >
            {formatDate(transaction.createdAt)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            fontWeight: 600,
            fontFamily: theme.fonts.mono,
            color: isOutgoing ? theme.colors.text : theme.colors.success,
          }}
        >
          {isOutgoing ? '-' : '+'}
          {formatMoney(transaction.amount)}
        </span>
      </div>
    </div>
  );
}

/**
 * Transaction history component props
 */
export interface TransactionHistoryProps {
  /** Wallet address */
  address?: string;

  /** Chains to show */
  chains?: SupportedChain[];

  /** Initial limit */
  limit?: number;

  /** Show filters */
  showFilters?: boolean;

  /** Show load more button */
  showLoadMore?: boolean;

  /** Additional CSS class */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Transaction history component
 */
export function TransactionHistory({
  address,
  chains,
  limit = 10,
  showFilters = true,
  showLoadMore = true,
  className,
  style,
}: TransactionHistoryProps) {
  const { theme } = useTheme();

  const {
    filteredTransactions,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    filter,
    setFilter,
    clearFilter,
    loadMore,
    refresh,
  } = useTransactionHistory({
    address,
    chains,
    limit,
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  return (
    <Card className={`arcpay-transaction-history ${className || ''}`} style={style} padding="lg">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Transaction History
        </h3>
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              Filter
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : '↻'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && showFilterPanel && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}
        >
          <Select
            label="Type"
            selectSize="sm"
            options={[
              { value: '', label: 'All types' },
              { value: 'payment', label: 'Payment' },
              { value: 'receive', label: 'Receive' },
              { value: 'bridge', label: 'Bridge' },
              { value: 'swap', label: 'Swap' },
            ]}
            value={(filter.type as string) || ''}
            onChange={(e) =>
              setFilter({
                ...filter,
                type: e.target.value as Transaction['type'] || undefined,
              })
            }
          />
          <Select
            label="Status"
            selectSize="sm"
            options={[
              { value: '', label: 'All statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ]}
            value={(filter.status as string) || ''}
            onChange={(e) =>
              setFilter({
                ...filter,
                status: e.target.value as PaymentStatus || undefined,
              })
            }
          />
          <Select
            label="Network"
            selectSize="sm"
            options={[
              { value: '', label: 'All networks' },
              { value: 'ethereum', label: 'Ethereum' },
              { value: 'base', label: 'Base' },
              { value: 'arbitrum', label: 'Arbitrum' },
              { value: 'polygon', label: 'Polygon' },
            ]}
            value={(filter.chain as string) || ''}
            onChange={(e) =>
              setFilter({
                ...filter,
                chain: e.target.value as SupportedChain || undefined,
              })
            }
          />
          <div style={{ gridColumn: 'span 3', textAlign: 'right' }}>
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.errorLight,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.error,
            }}
          >
            {error.message}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && filteredTransactions.length === 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}
        >
          <Spinner size="lg" />
        </div>
      )}

      {/* Transactions */}
      {filteredTransactions.length > 0 && (
        <div>
          {filteredTransactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredTransactions.length === 0 && !error && (
        <p
          style={{
            textAlign: 'center',
            color: theme.colors.textMuted,
            fontSize: theme.fontSizes.sm,
            padding: theme.spacing.xl,
          }}
        >
          {address ? 'No transactions found' : 'Connect wallet to view history'}
        </p>
      )}

      {/* Load more */}
      {showLoadMore && hasMore && filteredTransactions.length > 0 && (
        <div
          style={{
            marginTop: theme.spacing.lg,
            textAlign: 'center',
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            isLoading={isLoadingMore}
          >
            Load more
          </Button>
        </div>
      )}
    </Card>
  );
}

export default TransactionHistory;
