import React, { useEffect } from 'react';
import { useTheme } from '../../../theme';
import { Card } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { OnRampProviderCard } from './OnRampProviderCard';
import { useOnRamp, useBalanceCheck } from '../../../hooks/useOnRamp';
import type { FiatOnRampProps, OnRampProvider } from './types';

/**
 * Fiat On-Ramp widget for purchasing crypto with fiat
 * Supports multiple providers: MoonPay, Transak, Coinbase, Circle
 */
export function FiatOnRamp({
  amount,
  currency,
  chain,
  walletAddress,
  fiatCurrency = 'USD',
  preferredProvider,
  allowedProviders,
  onSuccess,
  onError,
  onCancel,
  showProviderSelection = true,
  className,
  style,
}: FiatOnRampProps) {
  const { theme } = useTheme();

  const {
    status,
    selectedProvider,
    availableProviders,
    quotes,
    selectedQuote,
    transaction,
    error,
    isLoadingQuotes,
    isProcessing,
    bestQuote,
    cheapestProvider,
    selectProvider,
    fetchQuotes,
    startPurchase,
    cancelPurchase,
    reset,
  } = useOnRamp({
    amount,
    currency,
    chain,
    walletAddress,
    fiatCurrency,
    allowedProviders,
    onSuccess,
    onError,
    autoFetchQuotes: true,
  });

  // Auto-select preferred provider if specified
  useEffect(() => {
    if (preferredProvider && availableProviders.some(p => p.provider === preferredProvider)) {
      selectProvider(preferredProvider);
    }
  }, [preferredProvider, availableProviders, selectProvider]);

  // Auto-select cheapest provider if only one or no selection
  useEffect(() => {
    if (!selectedProvider && cheapestProvider && !showProviderSelection) {
      selectProvider(cheapestProvider);
    }
  }, [selectedProvider, cheapestProvider, showProviderSelection, selectProvider]);

  // Success state
  if (status === 'completed' && transaction) {
    return (
      <Card className={className} style={style} padding="lg">
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '50%',
              backgroundColor: theme.colors.successLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes['2xl'],
              color: theme.colors.text,
            }}
          >
            Purchase Complete!
          </h2>
          <p
            style={{
              margin: `${theme.spacing.sm} 0`,
              color: theme.colors.textSecondary,
            }}
          >
            You've purchased {transaction.cryptoAmount} {transaction.cryptoCurrency}
          </p>
          <div
            style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceHover,
              borderRadius: theme.borderRadius.md,
              marginTop: theme.spacing.md,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
              <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>Amount Paid</span>
              <span style={{ color: theme.colors.text, fontWeight: 600 }}>
                ${transaction.fiatAmount.toFixed(2)} {transaction.fiatCurrency}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
              <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>Provider</span>
              <span style={{ color: theme.colors.text }}>{transaction.provider}</span>
            </div>
            {transaction.txHash && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>TX Hash</span>
                <span style={{ color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontFamily: theme.fonts.mono }}>
                  {transaction.txHash.slice(0, 8)}...{transaction.txHash.slice(-6)}
                </span>
              </div>
            )}
          </div>
          <Button onClick={reset} variant="outline" style={{ marginTop: theme.spacing.lg }}>
            Done
          </Button>
        </div>
      </Card>
    );
  }

  // Processing state
  if (isProcessing) {
    return (
      <Card className={className} style={style} padding="lg">
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto',
              marginBottom: theme.spacing.md,
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={theme.colors.border}
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke={theme.colors.primary}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes.xl,
              color: theme.colors.text,
            }}
          >
            {status === 'awaiting_payment' ? 'Awaiting Payment' : 'Processing Purchase'}
          </h2>
          <p
            style={{
              margin: `${theme.spacing.sm} 0`,
              color: theme.colors.textSecondary,
            }}
          >
            {status === 'awaiting_payment'
              ? 'Complete the payment in the provider window'
              : 'Your transaction is being processed...'}
          </p>
          <Button onClick={cancelPurchase} variant="ghost" style={{ marginTop: theme.spacing.md }}>
            Cancel
          </Button>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Card>
    );
  }

  // Error state
  if (status === 'failed' && error) {
    return (
      <Card className={className} style={style} padding="lg">
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto',
              borderRadius: '50%',
              backgroundColor: theme.colors.errorLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.colors.error} strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes.xl,
              color: theme.colors.text,
            }}
          >
            Purchase Failed
          </h2>
          <p
            style={{
              margin: `${theme.spacing.sm} 0`,
              color: theme.colors.textSecondary,
            }}
          >
            {error.message}
          </p>
          {error.recoverable && (
            <Button onClick={reset} variant="outline" style={{ marginTop: theme.spacing.md }}>
              Try Again
            </Button>
          )}
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" style={{ marginTop: theme.spacing.sm }}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} style={style} padding="lg">
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h2
          style={{
            margin: 0,
            fontSize: theme.fontSizes.xl,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Buy {currency}
        </h2>
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm,
          }}
        >
          Purchase {amount} {currency} on {chain.charAt(0).toUpperCase() + chain.slice(1)}
        </p>
      </div>

      {/* Amount display */}
      <div
        style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>You'll receive</div>
            <div style={{ fontSize: theme.fontSizes['2xl'], fontWeight: 700, color: theme.colors.text }}>
              {amount} {currency}
            </div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: theme.fontSizes.lg,
              fontWeight: 700,
            }}
          >
            {currency.slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Provider selection */}
      {showProviderSelection && (
        <>
          <div
            style={{
              fontSize: theme.fontSizes.sm,
              fontWeight: 600,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
            }}
          >
            Select Provider
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.lg,
            }}
          >
            {availableProviders.length === 0 ? (
              <div
                style={{
                  padding: theme.spacing.lg,
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                {isLoadingQuotes ? 'Loading providers...' : 'No providers available for this configuration'}
              </div>
            ) : (
              availableProviders.map((provider) => (
                <OnRampProviderCard
                  key={provider.provider}
                  provider={provider}
                  quote={quotes[provider.provider] || undefined}
                  isSelected={selectedProvider === provider.provider}
                  isLoading={isLoadingQuotes}
                  onSelect={selectProvider}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Best deal indicator */}
      {bestQuote && selectedProvider && selectedProvider === cheapestProvider && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: theme.spacing.sm,
            backgroundColor: `${theme.colors.success}15`,
            borderRadius: theme.borderRadius.sm,
            marginBottom: theme.spacing.md,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.success }}>
            Best price available
          </span>
        </div>
      )}

      {/* Quote summary */}
      {selectedQuote && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
            <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>Provider Fee</span>
            <span style={{ color: theme.colors.text }}>${selectedQuote.providerFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
            <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>Network Fee</span>
            <span style={{ color: theme.colors.text }}>${selectedQuote.networkFee.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: theme.spacing.sm,
              borderTop: `1px solid ${theme.colors.border}`,
              marginTop: theme.spacing.sm,
            }}
          >
            <span style={{ color: theme.colors.text, fontWeight: 600 }}>Total</span>
            <span style={{ color: theme.colors.text, fontWeight: 700, fontSize: theme.fontSizes.lg }}>
              ${selectedQuote.fiatAmount.toFixed(2)} {selectedQuote.fiatCurrency}
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <Button
        onClick={startPurchase}
        disabled={!selectedProvider || isLoadingQuotes || !selectedQuote}
        fullWidth
        size="lg"
      >
        {isLoadingQuotes
          ? 'Loading Quotes...'
          : selectedQuote
          ? `Pay $${selectedQuote.fiatAmount.toFixed(2)} ${fiatCurrency}`
          : 'Select a Provider'}
      </Button>

      {onCancel && (
        <Button onClick={onCancel} variant="ghost" fullWidth style={{ marginTop: theme.spacing.sm }}>
          Cancel
        </Button>
      )}

      {/* Destination info */}
      <div
        style={{
          marginTop: theme.spacing.md,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: theme.borderRadius.sm,
        }}
      >
        <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4 }}>
          Destination wallet
        </div>
        <div style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text, fontFamily: theme.fonts.mono }}>
          {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
        </div>
      </div>
    </Card>
  );
}

export default FiatOnRamp;
