import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../theme';
import { Button } from '../primitives/Button';
import { Modal } from '../primitives/Modal';
import { CurrentPlan } from './CurrentPlan';
import { PlanSelector } from './PlanSelector';
import { UsageDisplay } from './UsageDisplay';
import { BillingHistory } from './BillingHistory';
import type { SubscriptionManagerProps, Plan } from './types';

/**
 * Subscription manager component
 */
export function SubscriptionManager({
  customerId,
  plans,
  currentPlan: currentPlanId,
  currentBillingCycle = 'monthly',
  subscription,
  usage = [],
  history = [],
  showUsage = true,
  showHistory = true,
  showBillingInfo = true,
  allowCancellation = true,
  showAnnualDiscount = true,
  annualDiscountPercent = 20,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onPaymentMethodUpdate,
  className,
  style,
}: SubscriptionManagerProps) {
  const { theme } = useTheme();

  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(currentBillingCycle);

  // Get current plan object
  const currentPlan = useMemo(
    () => plans.find((p) => p.id === currentPlanId),
    [plans, currentPlanId]
  );

  // Determine if upgrade or downgrade
  const getChangeType = useCallback(
    (newPlanId: string): 'upgrade' | 'downgrade' | 'same' => {
      if (newPlanId === currentPlanId) return 'same';

      const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
      const newIndex = plans.findIndex((p) => p.id === newPlanId);

      if (currentIndex === -1) return 'upgrade';
      if (newIndex === -1) return 'same';

      const currentPrice = plans[currentIndex]?.price ?? 0;
      const newPrice = plans[newIndex]?.price ?? 0;

      return newPrice > currentPrice ? 'upgrade' : 'downgrade';
    },
    [plans, currentPlanId]
  );

  // Handle plan change confirmation
  const handlePlanChange = useCallback(async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const changeType = getChangeType(selectedPlan);
      if (changeType === 'upgrade') {
        await onUpgrade?.(selectedPlan);
      } else if (changeType === 'downgrade') {
        await onDowngrade?.(selectedPlan);
      }
      setIsChangePlanOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, getChangeType, onUpgrade, onDowngrade]);

  // Handle cancel confirmation
  const handleCancelConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onCancel?.();
      setIsCancelOpen(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onCancel]);

  // Handle reactivation
  const handleReactivate = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onReactivate?.();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onReactivate]);

  // Selected plan for modal
  const selectedPlanObj = useMemo(
    () => plans.find((p) => p.id === selectedPlan),
    [plans, selectedPlan]
  );

  return (
    <div
      className={`arcpay-subscription-manager ${className || ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xl,
        ...style,
      }}
    >
      {/* Current plan */}
      {currentPlan && subscription && (
        <CurrentPlan
          plan={currentPlan}
          subscription={subscription}
          onCancel={allowCancellation ? () => setIsCancelOpen(true) : undefined}
          onReactivate={
            subscription.cancelAtPeriodEnd ? handleReactivate : undefined
          }
          showCancelButton={allowCancellation}
        />
      )}

      {/* Change plan button */}
      {currentPlan && (
        <div>
          <Button
            variant="outline"
            onClick={() => setIsChangePlanOpen(true)}
          >
            Change Plan
          </Button>
        </div>
      )}

      {/* No current plan - show selector inline */}
      {!currentPlan && (
        <div>
          <h2
            style={{
              margin: `0 0 ${theme.spacing.lg}`,
              fontSize: theme.fontSizes['2xl'],
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Choose a Plan
          </h2>
          <PlanSelector
            plans={plans}
            selected={selectedPlan || undefined}
            onChange={setSelectedPlan}
            showAnnualDiscount={showAnnualDiscount}
            annualDiscountPercent={annualDiscountPercent}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            currentPlan={currentPlanId}
          />
          {selectedPlan && (
            <div style={{ marginTop: theme.spacing.lg, textAlign: 'center' }}>
              <Button
                onClick={handlePlanChange}
                isLoading={isProcessing}
                size="lg"
              >
                Subscribe to {selectedPlanObj?.name}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Usage */}
      {showUsage && usage.length > 0 && <UsageDisplay usage={usage} />}

      {/* Billing history */}
      {showHistory && <BillingHistory records={history} />}

      {/* Change plan modal */}
      <Modal
        isOpen={isChangePlanOpen}
        onClose={() => {
          setIsChangePlanOpen(false);
          setSelectedPlan(null);
        }}
        title="Change Plan"
        size="lg"
      >
        <PlanSelector
          plans={plans}
          selected={selectedPlan || undefined}
          onChange={setSelectedPlan}
          showAnnualDiscount={showAnnualDiscount}
          annualDiscountPercent={annualDiscountPercent}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          currentPlan={currentPlanId}
        />
        {selectedPlan && selectedPlan !== currentPlanId && (
          <div
            style={{
              marginTop: theme.spacing.xl,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                {getChangeType(selectedPlan) === 'upgrade' ? 'Upgrading' : 'Downgrading'} to
              </p>
              <p
                style={{
                  margin: `${theme.spacing.xs} 0 0`,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: 600,
                  color: theme.colors.text,
                }}
              >
                {selectedPlanObj?.name}
              </p>
            </div>
            <Button
              onClick={handlePlanChange}
              isLoading={isProcessing}
              variant={getChangeType(selectedPlan) === 'upgrade' ? 'primary' : 'secondary'}
            >
              {getChangeType(selectedPlan) === 'upgrade' ? 'Upgrade' : 'Downgrade'}
            </Button>
          </div>
        )}
      </Modal>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Subscription"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCancelOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelConfirm}
              isLoading={isProcessing}
            >
              Cancel Subscription
            </Button>
          </>
        }
      >
        <p style={{ color: theme.colors.textSecondary }}>
          Are you sure you want to cancel your subscription? You'll continue to
          have access until the end of your current billing period.
        </p>
      </Modal>
    </div>
  );
}

export default SubscriptionManager;
