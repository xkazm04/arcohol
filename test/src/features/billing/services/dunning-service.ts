import { createAdminClient } from '@/lib/supabase/admin';
import type { DunningConfig, DunningStage, DEFAULT_DUNNING_CONFIG } from '../types';

/**
 * Service for managing dunning (payment retry) logic
 */
export class DunningService {
  private config: DunningConfig;

  constructor(config?: Partial<DunningConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      maxAttempts: config?.maxAttempts ?? 4,
      intervals: config?.intervals ?? [3, 7, 14], // Days between retries
      sendNotifications: config?.sendNotifications ?? true,
      pauseOnMaxFailures: config?.pauseOnMaxFailures ?? true,
      cancelAfterDays: config?.cancelAfterDays ?? 30,
    };
  }

  /**
   * Calculate the next retry date based on failed attempt count
   * Returns null if max retries exceeded
   */
  calculateNextRetry(failedCount: number): Date | null {
    if (!this.config.enabled || failedCount >= this.config.maxAttempts) {
      return null;
    }

    // Get the interval for this retry stage
    const stageIndex = Math.min(failedCount - 1, this.config.intervals.length - 1);
    const daysUntilRetry = this.config.intervals[stageIndex];

    const nextRetry = new Date();
    nextRetry.setDate(nextRetry.getDate() + daysUntilRetry);

    return nextRetry;
  }

  /**
   * Get the dunning stage for a given failed count
   */
  getDunningStage(failedCount: number): DunningStage {
    if (failedCount <= 1) return 0;
    if (failedCount === 2) return 1;
    if (failedCount === 3) return 2;
    return 3;
  }

  /**
   * Check if subscription should be paused
   */
  shouldPauseSubscription(failedCount: number): boolean {
    return this.config.pauseOnMaxFailures && failedCount >= this.config.maxAttempts;
  }

  /**
   * Check if subscription should be canceled
   */
  shouldCancelSubscription(lastFailedAt: Date): boolean {
    if (!this.config.cancelAfterDays) return false;

    const daysSinceFailed = Math.floor(
      (Date.now() - lastFailedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceFailed >= this.config.cancelAfterDays;
  }

  /**
   * Process subscriptions in dunning state
   * Escalates or cancels based on time elapsed
   */
  async processDunningEscalations(): Promise<{
    paused: number;
    canceled: number;
    escalated: number;
  }> {
    const supabase = createAdminClient();
    let paused = 0;
    let canceled = 0;
    let escalated = 0;

    // Get subscriptions with failed payments
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, status, failed_payment_count, last_failed_at, last_failed_reason')
      .in('status', ['active', 'past_due'])
      .gt('failed_payment_count', 0)
      .not('last_failed_at', 'is', null);

    if (error) {
      console.error('Error fetching subscriptions for dunning:', error);
      return { paused, canceled, escalated };
    }

    for (const sub of subscriptions || []) {
      const lastFailedAt = new Date(sub.last_failed_at);
      const failedCount = sub.failed_payment_count;

      // Check for cancellation (30 days overdue)
      if (this.shouldCancelSubscription(lastFailedAt)) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            cancel_reason: 'Auto-canceled after payment failure threshold',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        await this.logEvent(supabase, sub.id, 'auto_canceled', {
          reason: 'Payment failed for 30+ days',
          lastFailedAt: sub.last_failed_at,
        });

        canceled++;
        continue;
      }

      // Check for pause (max retries reached)
      if (sub.status === 'active' && this.shouldPauseSubscription(failedCount)) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            paused_at: new Date().toISOString(),
            pause_reason: 'Payment failed after max retries',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        await this.logEvent(supabase, sub.id, 'dunning_paused', {
          failedCount,
          reason: sub.last_failed_reason,
        });

        paused++;
        continue;
      }

      // Check for escalation (dunning stage increase)
      const currentStage = this.getDunningStage(failedCount);
      const newStage = this.getDunningStage(failedCount);

      if (newStage > currentStage) {
        await this.logEvent(supabase, sub.id, 'dunning_escalated', {
          fromStage: currentStage,
          toStage: newStage,
          failedCount,
        });
        escalated++;
      }
    }

    return { paused, canceled, escalated };
  }

  /**
   * Send dunning notification (placeholder for email integration)
   */
  async sendDunningNotification(
    subscriptionId: string,
    stage: DunningStage,
    nextRetryAt: Date | null
  ): Promise<void> {
    if (!this.config.sendNotifications) return;

    // This will be implemented with Resend in Phase 3
    console.log(`[Dunning] Would send notification for subscription ${subscriptionId}:`, {
      stage,
      nextRetryAt: nextRetryAt?.toISOString(),
      message: this.getDunningMessage(stage),
    });
  }

  /**
   * Get dunning message based on stage
   */
  private getDunningMessage(stage: DunningStage): string {
    switch (stage) {
      case 0:
        return 'Your payment failed. We will retry in 3 days.';
      case 1:
        return 'Your payment failed again. Please update your payment method. We will retry in 4 days.';
      case 2:
        return 'Final notice: Your subscription is past due. Please update your payment method within 7 days to avoid service interruption.';
      case 3:
        return 'Your subscription has been paused due to payment failure. Please update your payment method to resume service.';
    }
  }

  /**
   * Log subscription event
   */
  private async logEvent(
    supabase: ReturnType<typeof createAdminClient>,
    subscriptionId: string,
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    await supabase.from('subscription_events').insert({
      subscription_id: subscriptionId,
      event_type: eventType,
      data,
    });
  }

  /**
   * Get summary of subscriptions in dunning
   */
  async getDunningSummary(): Promise<{
    total: number;
    byStage: Record<DunningStage, number>;
    recentFailures: number;
    atRiskOfCancellation: number;
  }> {
    const supabase = createAdminClient();

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, failed_payment_count, last_failed_at')
      .in('status', ['active', 'past_due'])
      .gt('failed_payment_count', 0);

    if (error || !subscriptions) {
      return {
        total: 0,
        byStage: { 0: 0, 1: 0, 2: 0, 3: 0 },
        recentFailures: 0,
        atRiskOfCancellation: 0,
      };
    }

    const byStage: Record<DunningStage, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let recentFailures = 0;
    let atRiskOfCancellation = 0;

    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const twentyFiveDaysAgo = now - 25 * 24 * 60 * 60 * 1000;

    for (const sub of subscriptions) {
      const stage = this.getDunningStage(sub.failed_payment_count);
      byStage[stage]++;

      const lastFailedAt = new Date(sub.last_failed_at).getTime();
      if (lastFailedAt > threeDaysAgo) {
        recentFailures++;
      }
      if (lastFailedAt < twentyFiveDaysAgo) {
        atRiskOfCancellation++;
      }
    }

    return {
      total: subscriptions.length,
      byStage,
      recentFailures,
      atRiskOfCancellation,
    };
  }
}

// Export singleton instance
export const dunningService = new DunningService();
