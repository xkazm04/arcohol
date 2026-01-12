import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../../theme';
import { Card } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { Spinner } from '../../primitives/Spinner';
import { ChainSelector } from './ChainSelector';
import { CartSummary } from './CartSummary';
import { PaymentSummary, PaymentAmount } from './PaymentSummary';
import { FiatOnRamp } from '../OnRamp/FiatOnRamp';
import { useBalanceCheck } from '../../../hooks/useOnRamp';
import type { CheckoutProps, CheckoutState, PaymentResult, CheckoutError, CartItem } from './types';
import type { SupportedChain, SupportedCurrency } from '../../../theme/types';
import type { OnRampTransaction } from '../OnRamp/types';

// Default supported chains
const DEFAULT_CHAINS: SupportedChain[] = ['arc', 'ethereum', 'arbitrum', 'polygon'];

// Estimated fees by chain (in USD, for demo)
const CHAIN_FEES: Record<SupportedChain, number> = {
  arc: 0.005,
  ethereum: 5.00,
  arbitrum: 0.10,
  polygon: 0.02,
  optimism: 0.05,
  avalanche: 0.10,
  solana: 0.001,
};

/**
 * Main Checkout component with optional fiat on-ramp integration
 */
export function Checkout({
  items,
  recipient,
  currency = 'USDC',
  chains = DEFAULT_CHAINS,
  defaultChain = 'arc',
  branding,
  showSummary = true,
  showChainSelector = true,
  showFees = true,
  showQRCode = false,
  onSuccess,
  onError,
  onCancel,
  className,
  style,
  testMode = false,
  // On-Ramp props
  enableOnRamp = false,
  walletAddress,
  fiatCurrency = 'USD',
  preferredOnRampProvider,
  allowedOnRampProviders,
  onOnRampSuccess,
  onOnRampError,
}: CheckoutProps) {
  const { theme } = useTheme();

  // State
  const [state, setState] = useState<CheckoutState>({
    items,
    selectedChain: defaultChain,
    currency,
    subtotal: 0,
    estimatedFee: 0,
    total: 0,
    status: 'idle',
  });

  // On-ramp state
  const [showOnRamp, setShowOnRamp] = useState(false);

  // Calculate totals
  const { subtotal, estimatedFee, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = CHAIN_FEES[state.selectedChain] || 0.01;
    return {
      subtotal: sub,
      estimatedFee: fee,
      total: sub + fee,
    };
  }, [items, state.selectedChain]);

  // Handle chain change
  const handleChainChange = useCallback((chain: SupportedChain) => {
    setState((prev) => ({ ...prev, selectedChain: chain }));
  }, []);

  // Handle payment
  const handlePay = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'processing' }));

    try {
      // Simulate payment processing
      if (testMode) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockPayment: PaymentResult = {
          id: `pay_${Math.random().toString(36).slice(2)}`,
          status: 'confirmed',
          amount: { amount: total.toFixed(2), currency },
          chain: state.selectedChain,
          txHash: `0x${Math.random().toString(16).slice(2)}`,
          recipient,
          createdAt: new Date(),
          confirmedAt: new Date(),
        };

        setState((prev) => ({ ...prev, status: 'success', payment: mockPayment }));
        onSuccess?.(mockPayment);
        return;
      }

      // In real implementation, this would connect wallet and execute transaction
      throw new Error('Wallet connection required. Enable testMode for demo.');
    } catch (err) {
      const error: CheckoutError = {
        code: 'PAYMENT_FAILED',
        message: err instanceof Error ? err.message : 'Payment failed',
      };
      setState((prev) => ({ ...prev, status: 'error', error }));
      onError?.(error);
    }
  }, [total, currency, state.selectedChain, recipient, testMode, onSuccess, onError]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'idle', error: undefined }));
    onCancel?.();
  }, [onCancel]);

  // Handle showing on-ramp
  const handleShowOnRamp = useCallback(() => {
    setShowOnRamp(true);
  }, []);

  // Handle on-ramp success
  const handleOnRampSuccess = useCallback((transaction: OnRampTransaction) => {
    setShowOnRamp(false);
    onOnRampSuccess?.(transaction);
    // Optionally auto-proceed with payment after on-ramp
  }, [onOnRampSuccess]);

  // Handle on-ramp cancel
  const handleOnRampCancel = useCallback(() => {
    setShowOnRamp(false);
  }, []);

  // On-Ramp view
  if (showOnRamp && enableOnRamp && walletAddress) {
    return (
      <FiatOnRamp
        amount={total.toFixed(2)}
        currency={currency}
        chain={state.selectedChain}
        walletAddress={walletAddress}
        fiatCurrency={fiatCurrency}
        preferredProvider={preferredOnRampProvider}
        allowedProviders={allowedOnRampProviders}
        onSuccess={handleOnRampSuccess}
        onError={onOnRampError}
        onCancel={handleOnRampCancel}
        className={className}
        style={style}
      />
    );
  }

  // Success state
  if (state.status === 'success' && state.payment) {
    return (
      <Card
        className={className}
        style={style}
        padding="lg"
      >
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
            <span style={{ fontSize: '32px', color: theme.colors.success }}>✓</span>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes['2xl'],
              color: theme.colors.text,
            }}
          >
            Payment Successful!
          </h2>
          <p
            style={{
              margin: `${theme.spacing.sm} 0`,
              color: theme.colors.textSecondary,
            }}
          >
            Your payment of {state.payment.amount.amount} {state.payment.amount.currency} has been confirmed.
          </p>
          {state.payment.txHash && (
            <p
              style={{
                margin: 0,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.mono,
              }}
            >
              TX: {state.payment.txHash.slice(0, 10)}...{state.payment.txHash.slice(-8)}
            </p>
          )}
        </div>
      </Card>
    );
  }

  // Error state
  if (state.status === 'error' && state.error) {
    return (
      <Card
        className={className}
        style={style}
        padding="lg"
      >
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
            <span style={{ fontSize: '32px', color: theme.colors.error }}>✕</span>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes['2xl'],
              color: theme.colors.text,
            }}
          >
            Payment Failed
          </h2>
          <p
            style={{
              margin: `${theme.spacing.sm} 0`,
              color: theme.colors.textSecondary,
            }}
          >
            {state.error.message}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      style={style}
      padding="lg"
    >
      {/* Branding header */}
      {branding && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          {branding.logo && (
            <img
              src={branding.logo}
              alt={branding.logoAlt || branding.companyName}
              style={{ height: 32 }}
            />
          )}
          {branding.companyName && (
            <span
              style={{
                fontSize: theme.fontSizes.lg,
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              {branding.companyName}
            </span>
          )}
        </div>
      )}

      {/* Cart summary */}
      {showSummary && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <CartSummary items={items} currency={currency} />
        </div>
      )}

      {/* Chain selector */}
      {showChainSelector && chains.length > 1 && (
        <div style={{ marginBottom: theme.spacing.lg }}>
          <ChainSelector
            chains={chains}
            selected={state.selectedChain}
            onChange={handleChainChange}
            disabled={state.status === 'processing'}
          />
        </div>
      )}

      {/* Payment summary */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <PaymentSummary
          subtotal={subtotal}
          estimatedFee={estimatedFee}
          total={total}
          currency={currency}
          selectedChain={state.selectedChain}
          showFees={showFees}
        />
      </div>

      {/* Pay button */}
      <Button
        onClick={handlePay}
        isLoading={state.status === 'processing'}
        disabled={state.status === 'processing' || items.length === 0}
        fullWidth
        size="lg"
      >
        {state.status === 'processing' ? 'Processing...' : `Pay ${total.toFixed(2)} ${currency}`}
      </Button>

      {/* On-Ramp option */}
      {enableOnRamp && walletAddress && state.status !== 'processing' && (
        <Button
          onClick={handleShowOnRamp}
          variant="outline"
          fullWidth
          style={{ marginTop: theme.spacing.sm }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Need {currency}? Buy with card
          </span>
        </Button>
      )}

      {/* Cancel button */}
      {onCancel && state.status !== 'processing' && (
        <Button
          onClick={handleCancel}
          variant="ghost"
          fullWidth
          style={{ marginTop: theme.spacing.sm }}
        >
          Cancel
        </Button>
      )}

      {/* Test mode indicator */}
      {testMode && (
        <p
          style={{
            marginTop: theme.spacing.md,
            textAlign: 'center',
            fontSize: theme.fontSizes.xs,
            color: theme.colors.warning,
          }}
        >
          Test Mode - No real transactions
        </p>
      )}
    </Card>
  );
}

export default Checkout;
