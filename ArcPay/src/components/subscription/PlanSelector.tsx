/**
 * Plan Selector Component
 *
 * Displays multiple subscription plans for selection.
 */

import React, { useState } from 'react';
import type { SubscriptionPlan, PlanSelectorProps } from '../../types/subscription';
import { PlanCard } from './PlanCard';
import { useTheme } from '../../providers/ThemeProvider';

interface PlanFeatures {
  [planId: string]: string[];
}

export interface ExtendedPlanSelectorProps extends PlanSelectorProps {
  popularPlanId?: string;
  planFeatures?: PlanFeatures;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onSelect,
  showTrialBadge = true,
  layout = 'grid',
  popularPlanId,
  planFeatures = {},
  className = '',
}: ExtendedPlanSelectorProps) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string | undefined>(selectedPlanId);

  const handleSelect = (plan: SubscriptionPlan) => {
    setSelected(plan.id);
    onSelect(plan);
  };

  // Sort plans by price (ascending)
  const sortedPlans = [...plans].sort((a, b) => {
    return parseFloat(a.amount) - parseFloat(b.amount);
  });

  return (
    <div className={className}>
      <div
        className={`
          ${layout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        `}
      >
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selected === plan.id}
            isPopular={popularPlanId === plan.id}
            onSelect={handleSelect}
            features={planFeatures[plan.id] || []}
            disabled={!plan.active}
          />
        ))}
      </div>

      {plans.length === 0 && (
        <div
          className="text-center py-12"
          style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
        >
          <p>No subscription plans available</p>
        </div>
      )}
    </div>
  );
}

export default PlanSelector;
