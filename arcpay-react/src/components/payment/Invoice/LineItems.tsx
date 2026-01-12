import React from 'react';
import { useTheme } from '../../../theme';
import type { LineItemsProps, InvoiceLineItem } from './types';

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * Line items table component
 */
export function LineItems({ items, currency }: LineItemsProps) {
  const { theme } = useTheme();

  const hasQuantity = items.some((item) => item.quantity !== undefined);
  const hasUnitPrice = items.some((item) => item.unitPrice !== undefined);
  const hasTax = items.some((item) => item.taxRate !== undefined);

  return (
    <div
      className="arcpay-invoice-line-items"
      style={{ marginTop: theme.spacing.xl }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: theme.fontSizes.sm,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.surface,
                borderBottom: `2px solid ${theme.colors.border}`,
                color: theme.colors.textSecondary,
                fontWeight: 600,
                fontSize: theme.fontSizes.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Description
            </th>
            {hasQuantity && (
              <th
                style={{
                  textAlign: 'center',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.surface,
                  borderBottom: `2px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: theme.fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: 80,
                }}
              >
                Qty
              </th>
            )}
            {hasUnitPrice && (
              <th
                style={{
                  textAlign: 'right',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.surface,
                  borderBottom: `2px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: theme.fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: 120,
                }}
              >
                Unit Price
              </th>
            )}
            {hasTax && (
              <th
                style={{
                  textAlign: 'right',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.surface,
                  borderBottom: `2px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: theme.fontSizes.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: 80,
                }}
              >
                Tax
              </th>
            )}
            <th
              style={{
                textAlign: 'right',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.surface,
                borderBottom: `2px solid ${theme.colors.border}`,
                color: theme.colors.textSecondary,
                fontWeight: 600,
                fontSize: theme.fontSizes.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: 140,
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td
                style={{
                  padding: `${theme.spacing.md}`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                }}
              >
                {item.description}
              </td>
              {hasQuantity && (
                <td
                  style={{
                    textAlign: 'center',
                    padding: `${theme.spacing.md}`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {item.quantity ?? '-'}
                </td>
              )}
              {hasUnitPrice && (
                <td
                  style={{
                    textAlign: 'right',
                    padding: `${theme.spacing.md}`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {item.unitPrice !== undefined
                    ? formatAmount(item.unitPrice, currency)
                    : '-'}
                </td>
              )}
              {hasTax && (
                <td
                  style={{
                    textAlign: 'right',
                    padding: `${theme.spacing.md}`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {item.taxRate !== undefined ? `${item.taxRate}%` : '-'}
                </td>
              )}
              <td
                style={{
                  textAlign: 'right',
                  padding: `${theme.spacing.md}`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  fontWeight: 500,
                  fontFamily: theme.fonts.mono,
                }}
              >
                {formatAmount(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Invoice totals component
 */
export function InvoiceTotals({
  subtotal,
  taxAmount,
  total,
  currency,
  amountPaid,
}: {
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency: string;
  amountPaid?: number;
}) {
  const { theme } = useTheme();
  const amountDue = amountPaid !== undefined ? total - amountPaid : total;

  return (
    <div
      className="arcpay-invoice-totals"
      style={{
        marginTop: theme.spacing.lg,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div style={{ width: 280 }}>
        {/* Subtotal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${theme.spacing.sm} 0`,
          }}
        >
          <span style={{ color: theme.colors.textSecondary }}>Subtotal</span>
          <span style={{ color: theme.colors.text, fontFamily: theme.fonts.mono }}>
            {formatAmount(subtotal, currency)}
          </span>
        </div>

        {/* Tax */}
        {taxAmount !== undefined && taxAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: `${theme.spacing.sm} 0`,
            }}
          >
            <span style={{ color: theme.colors.textSecondary }}>Tax</span>
            <span style={{ color: theme.colors.text, fontFamily: theme.fonts.mono }}>
              {formatAmount(taxAmount, currency)}
            </span>
          </div>
        )}

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `${theme.spacing.md} 0`,
            borderTop: `2px solid ${theme.colors.border}`,
            marginTop: theme.spacing.sm,
          }}
        >
          <span
            style={{
              color: theme.colors.text,
              fontWeight: 600,
              fontSize: theme.fontSizes.lg,
            }}
          >
            Total
          </span>
          <span
            style={{
              color: theme.colors.text,
              fontWeight: 700,
              fontSize: theme.fontSizes.xl,
              fontFamily: theme.fonts.mono,
            }}
          >
            {formatAmount(total, currency)}
          </span>
        </div>

        {/* Amount paid */}
        {amountPaid !== undefined && amountPaid > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: `${theme.spacing.sm} 0`,
              }}
            >
              <span style={{ color: theme.colors.success }}>Amount Paid</span>
              <span
                style={{
                  color: theme.colors.success,
                  fontFamily: theme.fonts.mono,
                }}
              >
                -{formatAmount(amountPaid, currency)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: `${theme.spacing.md}`,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <span
                style={{
                  color: theme.colors.text,
                  fontWeight: 600,
                }}
              >
                Amount Due
              </span>
              <span
                style={{
                  color: amountDue > 0 ? theme.colors.primary : theme.colors.success,
                  fontWeight: 700,
                  fontSize: theme.fontSizes.lg,
                  fontFamily: theme.fonts.mono,
                }}
              >
                {formatAmount(amountDue, currency)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
