import React from 'react';
import { useTheme } from '../../theme';
import { Badge } from '../primitives/Badge';
import type { PlanCardProps } from './types';

/**
 * Format price for display
 */
function formatPrice(
  price: number,
  interval: string,
  currency: string = 'USDC'
): string {
  return `${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * Get interval label
 */
function getIntervalLabel(interval: string): string {
  switch (interval) {
    case 'monthly':
      return '/month';
    case 'yearly':
      return '/year';
    case 'weekly':
      return '/week';
    case 'daily':
      return '/day';
    default:
      return '';
  }
}

/**
 * Plan card component
 */
export function PlanCard({
  plan,
  isSelected,
  isCurrent,
  billingCycle = 'monthly',
  annualDiscountPercent = 0,
  onClick,
}: PlanCardProps) {
  const { theme } = useTheme();

  // Calculate price based on billing cycle
  const displayPrice =
    billingCycle === 'yearly' && annualDiscountPercent > 0
      ? plan.price * 12 * (1 - annualDiscountPercent / 100)
      : billingCycle === 'yearly'
      ? plan.price * 12
      : plan.price;

  const displayInterval =
    billingCycle === 'yearly' && plan.interval === 'monthly' ? 'yearly' : plan.interval;

  const isClickable = !!onClick && !plan.disabled && !isCurrent;

  return (
    <div
      className="arcpay-plan-card"
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        position: 'relative',
        padding: theme.spacing.lg,
        backgroundColor: isSelected
          ? theme.colors.primaryHover + '10'
          : theme.colors.surface,
        border: `2px solid ${
          isSelected ? theme.colors.primary : isCurrent ? theme.colors.success : theme.colors.border
        }`,
        borderRadius: theme.borderRadius.xl,
        cursor: isClickable ? 'pointer' : plan.disabled ? 'not-allowed' : 'default',
        opacity: plan.disabled ? 0.5 : 1,
        transition: theme.transitions.normal,
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Badge variant="primary" size="sm">
            {plan.badge || 'Most Popular'}
          </Badge>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: theme.spacing.md,
          }}
        >
          <Badge variant="success" size="sm">
            Current Plan
          </Badge>
        </div>
      )}

      {/* Plan name */}
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

      {/* Description */}
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

      {/* Price */}
      <div style={{ marginTop: theme.spacing.lg }}>
        <span
          style={{
            fontSize: theme.fontSizes['3xl'],
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {formatPrice(displayPrice, displayInterval, plan.currency)}
        </span>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {getIntervalLabel(displayInterval)}
        </span>
      </div>

      {/* Annual savings */}
      {billingCycle === 'yearly' && annualDiscountPercent > 0 && plan.interval === 'monthly' && (
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.success,
          }}
        >
          Save {annualDiscountPercent}% with annual billing
        </p>
      )}

      {/* Features */}
      <ul
        style={{
          margin: `${theme.spacing.lg} 0 0`,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {plan.features.map((feature, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: theme.spacing.sm,
              padding: `${theme.spacing.xs} 0`,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.text,
            }}
          >
            <span style={{ color: theme.colors.success, flexShrink: 0 }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Selection indicator */}
      {isSelected && !isCurrent && (
        <div
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center',
            color: theme.colors.textInverse,
            fontSize: theme.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          Selected
        </div>
      )}
    </div>
  );
}

export default PlanCard;
