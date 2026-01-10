/**
 * Subscription Checkout Component
 *
 * Handles the subscription approval flow.
 */

import React, { useState } from 'react';
import type { SubscriptionCheckoutProps, Subscription } from '../../types/subscription';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useTheme } from '../../providers/ThemeProvider';
import { useWallet } from '../../hooks/useWallet';
import { useSubscription } from '../../hooks/useSubscription';
import { formatCurrency } from '../../utils/formatting';

type CheckoutStep = 'review' | 'approve' | 'confirming' | 'success' | 'error';

export function SubscriptionCheckout({
  plan,
  onSuccess,
  onError,
  onCancel,
  className = '',
}: SubscriptionCheckoutProps) {
  const { theme } = useTheme();
  const { address, isConnected } = useWallet();
  const { createSubscriptionIntent, approveSubscription } = useSubscription();

  const [step, setStep] = useState<CheckoutStep>('review');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const intervalLabel = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year',
  }[plan.interval] || plan.interval;

  const handleSubscribe = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('approve');

    try {
      // Create subscription intent
      const intent = await createSubscriptionIntent(plan.id);

      if (!intent) {
        throw new Error('Failed to create subscription');
      }

      setStep('confirming');

      // Approve the subscription (wallet interaction)
      const result = await approveSubscription(intent.id);

      if (result.success && result.subscription) {
        setSubscription(result.subscription);
        setStep('success');
        onSuccess?.(result.subscription);
      } else {
        throw new Error(result.error || 'Failed to approve subscription');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setStep('error');
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep('review');
  };

  return (
    <div
      className={`rounded-lg border p-6 max-w-md mx-auto ${className}`}
      style={{
        backgroundColor: theme?.colors?.background || '#ffffff',
        borderColor: theme?.colors?.border || '#e5e7eb',
      }}
    >
      {/* Review Step */}
      {step === 'review' && (
        <>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            Subscribe to {plan.name}
          </h2>

          <div className="mb-6">
            <div className="text-3xl font-bold" style={{ color: theme?.colors?.text || '#1f2937' }}>
              {formatCurrency(plan.amount, plan.currency)}
              <span className="text-base font-normal" style={{ color: theme?.colors?.textSecondary || '#6b7280' }}>
                /{intervalLabel}
              </span>
            </div>

            {plan.trialDays > 0 && (
              <p
                className="mt-2 text-sm"
                style={{ color: theme?.colors?.success || '#10b981' }}
              >
                Includes {plan.trialDays}-day free trial
              </p>
            )}
          </div>

          {plan.description && (
            <p
              className="mb-6 text-sm"
              style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
            >
              {plan.description}
            </p>
          )}

          <div
            className="p-4 rounded-lg mb-6"
            style={{ backgroundColor: `${theme?.colors?.primary || '#3b82f6'}10` }}
          >
            <h4 className="font-medium mb-2" style={{ color: theme?.colors?.text || '#1f2937' }}>
              What happens next:
            </h4>
            <ol
              className="list-decimal list-inside text-sm space-y-1"
              style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
            >
              <li>You'll approve a token spending limit</li>
              <li>We'll charge your wallet each {intervalLabel}</li>
              <li>Cancel anytime from your dashboard</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={handleSubscribe}>
              {plan.trialDays > 0 ? 'Start Free Trial' : 'Subscribe Now'}
            </Button>
            {onCancel && (
              <Button variant="ghost" fullWidth onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}

      {/* Approve Step */}
      {step === 'approve' && (
        <div className="text-center py-8">
          <Spinner size="lg" />
          <h3
            className="mt-4 text-lg font-medium"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            Approve in Wallet
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
          >
            Please approve the transaction in your wallet
          </p>
        </div>
      )}

      {/* Confirming Step */}
      {step === 'confirming' && (
        <div className="text-center py-8">
          <Spinner size="lg" />
          <h3
            className="mt-4 text-lg font-medium"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            Confirming Subscription
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
          >
            Waiting for blockchain confirmation...
          </p>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${theme?.colors?.success || '#10b981'}20` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: theme?.colors?.success || '#10b981' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3
            className="text-lg font-medium"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            {subscription?.status === 'trialing' ? 'Trial Started!' : 'Subscription Active!'}
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
          >
            {subscription?.status === 'trialing'
              ? `Your ${plan.trialDays}-day free trial has started`
              : `You're now subscribed to ${plan.name}`
            }
          </p>
        </div>
      )}

      {/* Error Step */}
      {step === 'error' && (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${theme?.colors?.error || '#ef4444'}20` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: theme?.colors?.error || '#ef4444' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3
            className="text-lg font-medium"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            Subscription Failed
          </h3>
          <p
            className="mt-2 text-sm"
            style={{ color: theme?.colors?.error || '#ef4444' }}
          >
            {error}
          </p>
          <div className="mt-6 space-y-3">
            <Button variant="primary" fullWidth onClick={handleRetry}>
              Try Again
            </Button>
            {onCancel && (
              <Button variant="ghost" fullWidth onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionCheckout;
