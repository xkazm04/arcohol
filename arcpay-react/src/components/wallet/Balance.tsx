import React from 'react';
import { useTheme } from '../../theme';
import { Card } from '../primitives/Card';
import { Spinner } from '../primitives/Spinner';
import { useBalance, type ChainBalance } from '../../hooks/useBalance';
import { CHAIN_INFO, ChainIcon } from '../payment/Checkout/ChainSelector';
import type { SupportedChain, SupportedCurrency, Money } from '../../theme/types';

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
 * Single chain balance row
 */
function ChainBalanceRow({ balance }: { balance: ChainBalance }) {
  const { theme } = useTheme();
  const chainInfo = CHAIN_INFO[balance.chain];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${theme.spacing.sm} 0`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <ChainIcon chain={balance.chain} size={24} />
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.text,
          }}
        >
          {chainInfo.name}
        </span>
      </div>
      <span
        style={{
          fontSize: theme.fontSizes.sm,
          fontWeight: 500,
          fontFamily: theme.fonts.mono,
          color: theme.colors.text,
        }}
      >
        {formatMoney(balance.balance)}
      </span>
    </div>
  );
}

/**
 * Balance component props
 */
export interface BalanceProps {
  /** Wallet address */
  address?: string;

  /** Chains to show */
  chains?: SupportedChain[];

  /** Currency to display */
  currency?: SupportedCurrency;

  /** Show total balance */
  showTotal?: boolean;

  /** Show breakdown by chain */
  showBreakdown?: boolean;

  /** Auto refresh */
  autoRefresh?: boolean;

  /** Refresh interval in ms */
  refreshInterval?: number;

  /** Compact mode */
  compact?: boolean;

  /** Additional CSS class */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Balance display component
 */
export function Balance({
  address,
  chains,
  currency = 'USDC',
  showTotal = true,
  showBreakdown = true,
  autoRefresh = false,
  refreshInterval,
  compact = false,
  className,
  style,
}: BalanceProps) {
  const { theme } = useTheme();
  const { balances, totalBalance, isLoading, error, refresh } = useBalance({
    address,
    chains,
    currency,
    autoRefresh,
    refreshInterval,
  });

  const chainBalances = Object.values(balances);

  // Compact mode - just show total
  if (compact) {
    return (
      <div
        className={`arcpay-balance arcpay-balance--compact ${className || ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          ...style,
        }}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <span
              style={{
                fontSize: theme.fontSizes.lg,
                fontWeight: 600,
                fontFamily: theme.fonts.mono,
                color: theme.colors.text,
              }}
            >
              {formatMoney(totalBalance)}
            </span>
            <button
              type="button"
              onClick={refresh}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: theme.spacing.xs,
                color: theme.colors.textMuted,
                fontSize: theme.fontSizes.sm,
              }}
              title="Refresh balance"
            >
              ↻
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={`arcpay-balance ${className || ''}`} style={style} padding="lg">
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
          Balance
        </h3>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'default' : 'pointer',
            padding: theme.spacing.xs,
            color: theme.colors.textMuted,
            fontSize: theme.fontSizes.md,
          }}
          title="Refresh balance"
        >
          {isLoading ? <Spinner size="sm" /> : '↻'}
        </button>
      </div>

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

      {/* Total */}
      {showTotal && (
        <div
          style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            textAlign: 'center',
            marginBottom: showBreakdown ? theme.spacing.lg : 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Total Balance
          </p>
          <p
            style={{
              margin: `${theme.spacing.sm} 0 0`,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: 700,
              fontFamily: theme.fonts.mono,
              color: theme.colors.text,
            }}
          >
            {isLoading ? '...' : formatMoney(totalBalance)}
          </p>
        </div>
      )}

      {/* Breakdown */}
      {showBreakdown && chainBalances.length > 0 && (
        <div>
          <p
            style={{
              margin: `0 0 ${theme.spacing.sm}`,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            By Network
          </p>
          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            {chainBalances.map((balance) => (
              <ChainBalanceRow key={balance.chain} balance={balance} />
            ))}
          </div>
        </div>
      )}

      {/* No balances */}
      {!isLoading && chainBalances.length === 0 && !error && (
        <p
          style={{
            textAlign: 'center',
            color: theme.colors.textMuted,
            fontSize: theme.fontSizes.sm,
          }}
        >
          {address ? 'No balances found' : 'Connect wallet to view balance'}
        </p>
      )}
    </Card>
  );
}

export default Balance;
