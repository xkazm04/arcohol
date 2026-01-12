import React from 'react';
import { useTheme } from '../../theme';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import type { CurrentPlanProps, SubscriptionStatus } from './types';

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get status variant
 */
function getStatusVariant(status: SubscriptionStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'info';
    case 'past_due':
    case 'paused':
      return 'warning';
    case 'cancelled':
    case 'unpaid':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get status label
 */
function getStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'paused':
      return 'Paused';
    case 'cancelled':
      return 'Cancelled';
    case 'unpaid':
      return 'Unpaid';
    default:
      return status;
  }
}

/**
 * Current plan component
 */
export function CurrentPlan({
  plan,
  subscription,
  onCancel,
  onReactivate,
  showCancelButton = true,
}: CurrentPlanProps) {
  const { theme } = useTheme();

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const willCancel = subscription.cancelAtPeriodEnd;

  return (
    <Card className="arcpay-current-plan" variant="outlined" padding="lg">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: theme.fontSizes.xl,
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              {plan.name}
            </h3>
            <Badge variant={getStatusVariant(subscription.status)} size="sm">
              {getStatusLabel(subscription.status)}
            </Badge>
          </div>
          {plan.description && (
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.textSecondary,
              }}
            >
              {plan.description}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes['2xl'],
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {plan.price.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{' '}
            {plan.currency || 'USDC'}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.textSecondary,
            }}
          >
            per {plan.interval.replace('ly', '')}
          </p>
        </div>
      </div>

      {/* Billing period */}
      <div
        style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: theme.spacing.md,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Current Period Start
          </p>
          <p
            style={{
              margin: `${theme.spacing.xs} 0 0`,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.text,
            }}
          >
            {formatDate(subscription.currentPeriodStart)}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {willCancel ? 'Cancels On' : 'Next Billing Date'}
          </p>
          <p
            style={{
              margin: `${theme.spacing.xs} 0 0`,
              fontSize: theme.fontSizes.sm,
              color: willCancel ? theme.colors.warning : theme.colors.text,
            }}
          >
            {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>
      </div>

      {/* Cancellation notice */}
      {willCancel && (
        <div
          style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.warningLight,
            borderRadius: theme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.warning,
            }}
          >
            Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
          </p>
          {onReactivate && (
            <Button variant="outline" size="sm" onClick={onReactivate}>
              Reactivate
            </Button>
          )}
        </div>
      )}

      {/* Cancel button */}
      {showCancelButton && isActive && !willCancel && onCancel && (
        <div
          style={{
            marginTop: theme.spacing.lg,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel Subscription
          </Button>
        </div>
      )}

      {/* Features list */}
      {plan.features.length > 0 && (
        <div style={{ marginTop: theme.spacing.lg }}>
          <p
            style={{
              margin: `0 0 ${theme.spacing.sm}`,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Plan Features
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: theme.spacing.xs,
            }}
          >
            {plan.features.map((feature, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.text,
                }}
              >
                <span style={{ color: theme.colors.success }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default CurrentPlan;
