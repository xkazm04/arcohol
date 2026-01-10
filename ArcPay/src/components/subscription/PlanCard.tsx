/**
 * Plan Card Component
 *
 * Displays a subscription plan with pricing and features.
 */

import React from 'react';
import type { SubscriptionPlan } from '../../types/subscription';
import { Button } from '../ui/Button';
import { useTheme } from '../../providers/ThemeProvider';
import { formatCurrency } from '../../utils/formatting';

export interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  isPopular?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
  disabled?: boolean;
  features?: string[];
  className?: string;
}

const intervalLabels: Record<string, string> = {
  daily: '/day',
  weekly: '/week',
  monthly: '/month',
  yearly: '/year',
};

export function PlanCard({
  plan,
  isSelected = false,
  isPopular = false,
  onSelect,
  disabled = false,
  features = [],
  className = '',
}: PlanCardProps) {
  const { theme } = useTheme();

  const intervalLabel = plan.intervalCount > 1
    ? `every ${plan.intervalCount} ${plan.interval.replace('ly', '')}s`
    : intervalLabels[plan.interval] || `/${plan.interval}`;

  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 transition-all
        ${isSelected
          ? 'border-primary-500 shadow-lg scale-[1.02]'
          : 'border-gray-200 hover:border-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => !disabled && onSelect?.(plan)}
      style={{
        backgroundColor: theme?.colors?.background || '#ffffff',
        borderColor: isSelected ? theme?.colors?.primary || '#3b82f6' : undefined,
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: theme?.colors?.primary || '#3b82f6' }}
        >
          Most Popular
        </div>
      )}

      {/* Plan Name */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: theme?.colors?.text || '#1f2937' }}
      >
        {plan.name}
      </h3>

      {/* Description */}
      {plan.description && (
        <p
          className="text-sm mb-4"
          style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
        >
          {plan.description}
        </p>
      )}

      {/* Price */}
      <div className="mb-4">
        <span
          className="text-3xl font-bold"
          style={{ color: theme?.colors?.text || '#1f2937' }}
        >
          {formatCurrency(plan.amount, plan.currency)}
        </span>
        <span
          className="text-sm ml-1"
          style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
        >
          {intervalLabel}
        </span>
      </div>

      {/* Trial Badge */}
      {plan.trialDays > 0 && (
        <div
          className="inline-block px-2 py-1 rounded text-xs font-medium mb-4"
          style={{
            backgroundColor: `${theme?.colors?.success || '#10b981'}20`,
            color: theme?.colors?.success || '#10b981',
          }}
        >
          {plan.trialDays}-day free trial
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center text-sm"
              style={{ color: theme?.colors?.text || '#1f2937' }}
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                style={{ color: theme?.colors?.success || '#10b981' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Select Button */}
      <Button
        variant={isSelected ? 'primary' : 'outline'}
        fullWidth
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(plan);
        }}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </Button>
    </div>
  );
}

export default PlanCard;
