import React from 'react';
import { useTheme } from '../../../theme';
import type { OnRampProviderCardProps } from './types';

/**
 * Provider card for on-ramp selection
 */
export function OnRampProviderCard({
  provider,
  quote,
  isSelected,
  isLoading,
  onSelect,
}: OnRampProviderCardProps) {
  const { theme } = useTheme();

  const isBestValue = quote && !isLoading;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(provider.provider)}
      disabled={!provider.available || isLoading}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: isSelected
          ? `${theme.colors.primary}15`
          : theme.colors.surface,
        border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        borderRadius: theme.borderRadius.lg,
        cursor: provider.available && !isLoading ? 'pointer' : 'not-allowed',
        opacity: provider.available ? 1 : 0.5,
        transition: theme.transitions.fast,
        textAlign: 'left',
        width: '100%',
      }}
    >
      {/* Provider header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          {/* Provider logo placeholder */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.surfaceHover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: theme.fontSizes.sm,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            {provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: theme.fontSizes.md,
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              {provider.name}
            </div>
            <div
              style={{
                fontSize: theme.fontSizes.xs,
                color: theme.colors.textMuted,
              }}
            >
              {provider.feePercent}% fee
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Quote details */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            color: theme.colors.textMuted,
            fontSize: theme.fontSizes.sm,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: `2px solid ${theme.colors.border}`,
              borderTopColor: theme.colors.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          Fetching quote...
        </div>
      ) : quote ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: theme.spacing.xs,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <div>
            <span
              style={{
                fontSize: theme.fontSizes.lg,
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              ${quote.fiatAmount.toFixed(2)}
            </span>
            <span
              style={{
                fontSize: theme.fontSizes.sm,
                color: theme.colors.textMuted,
                marginLeft: theme.spacing.xs,
              }}
            >
              {quote.fiatCurrency}
            </span>
          </div>
          <div
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
            }}
          >
            for {quote.cryptoAmount} {quote.cryptoCurrency}
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textMuted,
          }}
        >
          Quote unavailable
        </div>
      )}

      {/* Payment methods */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.xs,
          flexWrap: 'wrap',
        }}
      >
        {provider.supportedPaymentMethods.map((method) => (
          <span
            key={method}
            style={{
              fontSize: theme.fontSizes.xs,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              backgroundColor: theme.colors.surfaceHover,
              borderRadius: theme.borderRadius.sm,
              color: theme.colors.textSecondary,
              textTransform: 'capitalize',
            }}
          >
            {method.replace('_', ' ')}
          </span>
        ))}
      </div>
    </button>
  );
}
