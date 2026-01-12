import React from 'react';
import { useTheme } from '../../../theme';
import type { SupportedChain, SupportedCurrency } from '../../../theme/types';
import { CHAIN_INFO, ChainIcon } from './ChainSelector';

interface PaymentSummaryProps {
  subtotal: number;
  estimatedFee: number;
  total: number;
  currency: SupportedCurrency;
  selectedChain: SupportedChain;
  showFees?: boolean;
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} ${currency}`;
}

/**
 * Payment summary showing totals and fees
 */
export function PaymentSummary({
  subtotal,
  estimatedFee,
  total,
  currency,
  selectedChain,
  showFees = true,
}: PaymentSummaryProps) {
  const { theme } = useTheme();
  const chainInfo = CHAIN_INFO[selectedChain];

  return (
    <div
      className="arcpay-payment-summary"
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
      }}
    >
      {/* Network info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <ChainIcon chain={selectedChain} size={20} />
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          Paying on {chainInfo.name}
        </span>
      </div>

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
            Subtotal
          </span>
          <span style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>
            {formatAmount(subtotal, currency)}
          </span>
        </div>

        {showFees && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
            >
              Network Fee
              <span
                title="Estimated gas fee for the transaction"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.surfaceHover,
                  fontSize: '10px',
                  color: theme.colors.textMuted,
                  cursor: 'help',
                }}
              >
                ?
              </span>
            </span>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
              ~{formatAmount(estimatedFee, currency)}
            </span>
          </div>
        )}

        {/* Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <span
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
              fontWeight: 600,
            }}
          >
            Total
          </span>
          <span
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.xl,
              fontWeight: 700,
            }}
          >
            {formatAmount(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal payment amount display
 */
export function PaymentAmount({
  amount,
  currency,
  label = 'Amount Due',
}: {
  amount: number;
  currency: SupportedCurrency;
  label?: string;
}) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        textAlign: 'center',
        padding: theme.spacing.lg,
      }}
    >
      <p
        style={{
          margin: 0,
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes.sm,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: `${theme.spacing.xs} 0 0`,
          color: theme.colors.text,
          fontSize: theme.fontSizes['3xl'],
          fontWeight: 700,
        }}
      >
        {formatAmount(amount, currency)}
      </p>
    </div>
  );
}
