import React from 'react';
import { useTheme } from '../../theme';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import type { BillingHistoryProps, BillingRecord } from './types';

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status variant
 */
function getStatusVariant(status: BillingRecord['status']): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'refunded':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Billing record row
 */
function BillingRecordRow({ record }: { record: BillingRecord }) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${theme.spacing.md} 0`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Date */}
      <div style={{ width: 100, flexShrink: 0 }}>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {formatDate(record.date)}
        </span>
      </div>

      {/* Description */}
      <div style={{ flex: 1, paddingRight: theme.spacing.md }}>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text,
          }}
        >
          {record.description}
        </span>
      </div>

      {/* Status */}
      <div style={{ width: 80, flexShrink: 0 }}>
        <Badge variant={getStatusVariant(record.status)} size="sm">
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
      </div>

      {/* Amount */}
      <div
        style={{
          width: 100,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            fontWeight: 500,
            color: record.status === 'refunded' ? theme.colors.textMuted : theme.colors.text,
            textDecoration: record.status === 'refunded' ? 'line-through' : 'none',
          }}
        >
          {record.amount.amount} {record.amount.currency}
        </span>
      </div>

      {/* Invoice link */}
      <div style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>
        {record.invoiceUrl && (
          <a
            href={record.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: theme.fontSizes.sm,
              color: theme.colors.primary,
              textDecoration: 'none',
            }}
          >
            Invoice
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Billing history component
 */
export function BillingHistory({
  records,
  limit = 5,
  showViewAll = true,
  onViewAll,
}: BillingHistoryProps) {
  const { theme } = useTheme();

  const displayRecords = limit ? records.slice(0, limit) : records;
  const hasMore = records.length > displayRecords.length;

  if (records.length === 0) {
    return (
      <Card className="arcpay-billing-history" variant="outlined" padding="lg">
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Billing History
        </h3>
        <p
          style={{
            margin: `${theme.spacing.lg} 0 0`,
            textAlign: 'center',
            color: theme.colors.textMuted,
            fontSize: theme.fontSizes.sm,
          }}
        >
          No billing history yet
        </p>
      </Card>
    );
  }

  return (
    <Card className="arcpay-billing-history" variant="outlined" padding="lg">
      <h3
        style={{
          margin: `0 0 ${theme.spacing.md}`,
          fontSize: theme.fontSizes.lg,
          fontWeight: 600,
          color: theme.colors.text,
        }}
      >
        Billing History
      </h3>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${theme.spacing.sm} 0`,
          borderBottom: `2px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ width: 100, flexShrink: 0 }}>
          <span
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Date
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Description
          </span>
        </div>
        <div style={{ width: 80, flexShrink: 0 }}>
          <span
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Status
          </span>
        </div>
        <div style={{ width: 100, textAlign: 'right', flexShrink: 0 }}>
          <span
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Amount
          </span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Records */}
      <div>
        {displayRecords.map((record) => (
          <BillingRecordRow key={record.id} record={record} />
        ))}
      </div>

      {/* View all button */}
      {showViewAll && hasMore && onViewAll && (
        <div
          style={{
            marginTop: theme.spacing.md,
            textAlign: 'center',
          }}
        >
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all ({records.length} records)
          </Button>
        </div>
      )}
    </Card>
  );
}

export default BillingHistory;
