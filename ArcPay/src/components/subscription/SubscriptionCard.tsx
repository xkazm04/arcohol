/**
 * Subscription Card Component
 *
 * Displays a user's subscription with status and actions.
 */

import React, { useState } from 'react';
import type { Subscription, SubscriptionAction, SubscriptionCardProps } from '../../types/subscription';
import { Button } from '../ui/Button';
import { useTheme } from '../../providers/ThemeProvider';
import { formatCurrency, formatDate } from '../../utils/formatting';

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#10b98120', text: '#10b981' },
  trialing: { bg: '#3b82f620', text: '#3b82f6' },
  past_due: { bg: '#f59e0b20', text: '#f59e0b' },
  paused: { bg: '#6b728020', text: '#6b7280' },
  canceled: { bg: '#ef444420', text: '#ef4444' },
  incomplete: { bg: '#8b5cf620', text: '#8b5cf6' },
  unpaid: { bg: '#ef444420', text: '#ef4444' },
  expired: { bg: '#6b728020', text: '#6b7280' },
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past Due',
  paused: 'Paused',
  canceled: 'Canceled',
  incomplete: 'Pending',
  unpaid: 'Unpaid',
  expired: 'Expired',
};

export function SubscriptionCard({
  subscription,
  onManage,
  showActions = true,
  className = '',
}: SubscriptionCardProps) {
  const { theme } = useTheme();
  const [showActionMenu, setShowActionMenu] = useState(false);

  const plan = subscription.plan;
  const status = statusColors[subscription.status] || statusColors.active;

  const isActive = ['active', 'trialing'].includes(subscription.status);
  const isPaused = subscription.status === 'paused';
  const isCanceled = subscription.status === 'canceled';
  const canReactivate = isCanceled && subscription.cancelAtPeriodEnd && new Date() < new Date(subscription.currentPeriodEnd);

  const availableActions: { action: SubscriptionAction; label: string }[] = [];

  if (isActive) {
    availableActions.push({ action: 'pause', label: 'Pause' });
    availableActions.push({ action: 'cancel', label: 'Cancel' });
  }
  if (isPaused) {
    availableActions.push({ action: 'resume', label: 'Resume' });
    availableActions.push({ action: 'cancel', label: 'Cancel' });
  }
  if (canReactivate) {
    availableActions.push({ action: 'reactivate', label: 'Reactivate' });
  }

  return (
    <div
      className={`rounded-lg border p-6 ${className}`}
      style={{
        backgroundColor: theme?.colors?.background || '#ffffff',
        borderColor: theme?.colors?.border || '#e5e7eb',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            {plan?.name || 'Subscription'}
          </h3>
          {plan?.description && (
            <p
              className="text-sm mt-1"
              style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
            >
              {plan.description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          {statusLabels[subscription.status]}
        </span>
      </div>

      {/* Price & Billing */}
      {plan && (
        <div className="mb-4">
          <span
            className="text-2xl font-bold"
            style={{ color: theme?.colors?.text || '#1f2937' }}
          >
            {formatCurrency(plan.amount, plan.currency)}
          </span>
          <span
            className="text-sm ml-1"
            style={{ color: theme?.colors?.textSecondary || '#6b7280' }}
          >
            /{plan.interval}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 text-sm">
        {/* Current Period */}
        <div className="flex justify-between">
          <span style={{ color: theme?.colors?.textSecondary || '#6b7280' }}>
            Current period
          </span>
          <span style={{ color: theme?.colors?.text || '#1f2937' }}>
            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {/* Next Payment / Renewal */}
        {subscription.nextPaymentAt && isActive && (
          <div className="flex justify-between">
            <span style={{ color: theme?.colors?.textSecondary || '#6b7280' }}>
              Next payment
            </span>
            <span style={{ color: theme?.colors?.text || '#1f2937' }}>
              {formatDate(subscription.nextPaymentAt)}
            </span>
          </div>
        )}

        {/* Trial End */}
        {subscription.trialEnd && subscription.status === 'trialing' && (
          <div className="flex justify-between">
            <span style={{ color: theme?.colors?.textSecondary || '#6b7280' }}>
              Trial ends
            </span>
            <span style={{ color: theme?.colors?.text || '#1f2937' }}>
              {formatDate(subscription.trialEnd)}
            </span>
          </div>
        )}

        {/* Cancel at period end notice */}
        {subscription.cancelAtPeriodEnd && (
          <div
            className="mt-3 p-2 rounded text-sm"
            style={{ backgroundColor: '#fef3c720', color: '#f59e0b' }}
          >
            Cancels on {formatDate(subscription.currentPeriodEnd)}
          </div>
        )}

        {/* Paused notice */}
        {isPaused && subscription.resumesAt && (
          <div
            className="mt-3 p-2 rounded text-sm"
            style={{ backgroundColor: '#6b728020', color: '#6b7280' }}
          >
            Resumes on {formatDate(subscription.resumesAt)}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && availableActions.length > 0 && (
        <div className="mt-6 relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActionMenu(!showActionMenu)}
          >
            Manage Subscription
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${showActionMenu ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>

          {showActionMenu && (
            <div
              className="absolute left-0 top-full mt-2 py-1 rounded-lg shadow-lg border min-w-[160px] z-10"
              style={{
                backgroundColor: theme?.colors?.background || '#ffffff',
                borderColor: theme?.colors?.border || '#e5e7eb',
              }}
            >
              {availableActions.map(({ action, label }) => (
                <button
                  key={action}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                  style={{ color: theme?.colors?.text || '#1f2937' }}
                  onClick={() => {
                    setShowActionMenu(false);
                    onManage?.(action);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubscriptionCard;
