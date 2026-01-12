import React, { useState } from 'react';
import { useTheme } from '../../theme';
import { PlanCard } from './PlanCard';
import type { PlanSelectorProps } from './types';

/**
 * Billing cycle toggle
 */
function BillingCycleToggle({
  value,
  onChange,
  annualDiscountPercent,
}: {
  value: 'monthly' | 'yearly';
  onChange: (value: 'monthly' | 'yearly') => void;
  annualDiscountPercent?: number;
}) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.xs,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.full,
      }}
    >
      <button
        type="button"
        onClick={() => onChange('monthly')}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          backgroundColor: value === 'monthly' ? theme.colors.background : 'transparent',
          border: 'none',
          borderRadius: theme.borderRadius.full,
          cursor: 'pointer',
          fontSize: theme.fontSizes.sm,
          fontWeight: value === 'monthly' ? 600 : 400,
          color: value === 'monthly' ? theme.colors.text : theme.colors.textSecondary,
          boxShadow: value === 'monthly' ? theme.shadows.sm : 'none',
          transition: theme.transitions.fast,
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('yearly')}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          backgroundColor: value === 'yearly' ? theme.colors.background : 'transparent',
          border: 'none',
          borderRadius: theme.borderRadius.full,
          cursor: 'pointer',
          fontSize: theme.fontSizes.sm,
          fontWeight: value === 'yearly' ? 600 : 400,
          color: value === 'yearly' ? theme.colors.text : theme.colors.textSecondary,
          boxShadow: value === 'yearly' ? theme.shadows.sm : 'none',
          transition: theme.transitions.fast,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
        }}
      >
        Yearly
        {annualDiscountPercent && annualDiscountPercent > 0 && (
          <span
            style={{
              padding: `2px ${theme.spacing.xs}`,
              backgroundColor: theme.colors.success,
              color: theme.colors.textInverse,
              borderRadius: theme.borderRadius.full,
              fontSize: theme.fontSizes.xs,
              fontWeight: 600,
            }}
          >
            -{annualDiscountPercent}%
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * Plan selector component
 */
export function PlanSelector({
  plans,
  selected,
  onChange,
  showAnnualDiscount = true,
  annualDiscountPercent = 20,
  billingCycle: externalBillingCycle,
  onBillingCycleChange,
  layout = 'grid',
  highlightPopular = true,
  currentPlan,
}: PlanSelectorProps) {
  const { theme } = useTheme();
  const [internalBillingCycle, setInternalBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const billingCycle = externalBillingCycle ?? internalBillingCycle;
  const handleBillingCycleChange = onBillingCycleChange ?? setInternalBillingCycle;

  // Sort plans to put popular first if highlighting
  const sortedPlans = highlightPopular
    ? [...plans].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    : plans;

  return (
    <div className="arcpay-plan-selector">
      {/* Billing cycle toggle */}
      {showAnnualDiscount && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: theme.spacing.xl,
          }}
        >
          <BillingCycleToggle
            value={billingCycle}
            onChange={handleBillingCycleChange}
            annualDiscountPercent={annualDiscountPercent}
          />
        </div>
      )}

      {/* Plans grid/list */}
      <div
        style={{
          display: layout === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns:
            layout === 'grid'
              ? `repeat(${Math.min(plans.length, 3)}, 1fr)`
              : undefined,
          flexDirection: layout === 'list' ? 'column' : undefined,
          gap: theme.spacing.lg,
        }}
      >
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selected === plan.id}
            isCurrent={currentPlan === plan.id}
            billingCycle={billingCycle}
            annualDiscountPercent={annualDiscountPercent}
            onClick={() => onChange(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default PlanSelector;
