import { createAdminClient } from '@/lib/supabase/admin';
import { allowanceChecker } from './allowance-checker';
import { paymentCollector } from './payment-collector';
import { dunningService } from './dunning-service';
import type {
  BillingJob,
  BillingJobStatus,
  BillingCycleResult,
  BillingJobSummary,
  RunBillingParams,
  DunningStage,
} from '../types';

interface SubscriptionForBilling {
  id: string;
  organization_id: string;
  plan_id: string;
  customer_id: string;
  customer_wallet: string;
  merchant_wallet: string;
  status: string;
  next_payment_at: string;
  chain: string;
  failed_payment_count: number;
  plan: {
    amount: string;
    currency: string;
    interval: string;
    interval_count: number;
  };
}

/**
 * Core billing engine that orchestrates the billing cycle
 */
export class BillingEngine {
  private supabase = createAdminClient();

  /**
   * Run a complete billing cycle
   */
  async runBillingCycle(params?: RunBillingParams): Promise<BillingCycleResult> {
    const cycleId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    console.log(`Starting billing cycle: ${cycleId}`);

    const results: BillingJobSummary[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    try {
      // 1. Get subscriptions due for billing
      const subscriptions = await this.getSubscriptionsDue(params?.subscriptionIds);
      console.log(`Found ${subscriptions.length} subscriptions due for billing`);

      if (subscriptions.length === 0) {
        return {
          cycleId,
          startedAt,
          completedAt: new Date().toISOString(),
          totalProcessed: 0,
          successful: 0,
          failed: 0,
          skipped: 0,
          jobs: [],
        };
      }

      // 2. Batch check allowances
      const allowanceResults = await allowanceChecker.batchCheckAllowances(
        subscriptions.map((sub) => ({
          id: sub.id,
          customerWallet: sub.customer_wallet,
          merchantWallet: sub.merchant_wallet,
          amount: parseFloat(sub.plan.amount),
          chain: sub.chain,
        }))
      );

      // 3. Process each subscription
      for (const subscription of subscriptions) {
        const amount = parseFloat(subscription.plan.amount);
        const allowanceResult = allowanceResults.get(subscription.id);

        // Create billing job record
        const job = await this.createBillingJob({
          organizationId: subscription.organization_id,
          subscriptionId: subscription.id,
          amount,
          customerWallet: subscription.customer_wallet,
          merchantWallet: subscription.merchant_wallet,
          chain: subscription.chain,
          allowanceSufficient: allowanceResult?.sufficient ?? false,
        });

        // Skip if allowance insufficient
        if (!allowanceResult?.sufficient) {
          console.log(
            `Skipping subscription ${subscription.id}: insufficient allowance`
          );
          await this.updateBillingJobStatus(job.id, 'failed', {
            errorMessage: 'Insufficient allowance',
          });
          await this.handleFailedPayment(subscription, job, 'Insufficient allowance');
          skipped++;
          results.push({
            jobId: job.id,
            subscriptionId: subscription.id,
            status: 'failed',
            amount,
            errorMessage: 'Insufficient allowance',
          });
          continue;
        }

        // Skip if balance insufficient
        if (!allowanceResult?.balanceSufficient) {
          console.log(
            `Skipping subscription ${subscription.id}: insufficient balance`
          );
          await this.updateBillingJobStatus(job.id, 'failed', {
            errorMessage: 'Insufficient balance',
          });
          await this.handleFailedPayment(subscription, job, 'Insufficient balance');
          skipped++;
          results.push({
            jobId: job.id,
            subscriptionId: subscription.id,
            status: 'failed',
            amount,
            errorMessage: 'Insufficient balance',
          });
          continue;
        }

        // 4. Dry run if requested
        if (params?.dryRun) {
          console.log(`[DRY RUN] Would collect ${amount} USDC for subscription ${subscription.id}`);
          await this.updateBillingJobStatus(job.id, 'completed', {
            errorMessage: 'Dry run - no payment collected',
          });
          successful++;
          results.push({
            jobId: job.id,
            subscriptionId: subscription.id,
            status: 'completed',
            amount,
          });
          continue;
        }

        // 5. Execute payment
        await this.updateBillingJobStatus(job.id, 'processing');
        const paymentResult = await paymentCollector.collectPayment({
          ...job,
          status: 'processing',
          attemptNumber: 1,
          maxAttempts: 4,
          dunningStage: 0,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        });

        if (paymentResult.success) {
          console.log(
            `Payment successful for subscription ${subscription.id}: ${paymentResult.txHash}`
          );

          // Update job status
          await this.updateBillingJobStatus(job.id, 'completed', {
            txHash: paymentResult.txHash,
            txConfirmedAt: paymentResult.confirmedAt,
          });

          // Update subscription
          await this.handleSuccessfulPayment(subscription, paymentResult.txHash!);

          // Create subscription invoice
          await this.createSubscriptionInvoice(subscription, job.id, paymentResult.txHash!);

          successful++;
          results.push({
            jobId: job.id,
            subscriptionId: subscription.id,
            status: 'completed',
            amount,
            txHash: paymentResult.txHash,
          });
        } else {
          console.log(
            `Payment failed for subscription ${subscription.id}: ${paymentResult.error?.message}`
          );

          // Update job status
          await this.updateBillingJobStatus(job.id, 'failed', {
            errorMessage: paymentResult.error?.message,
          });

          // Handle failed payment (dunning logic)
          await this.handleFailedPayment(
            subscription,
            job,
            paymentResult.error?.message || 'Payment failed'
          );

          failed++;
          results.push({
            jobId: job.id,
            subscriptionId: subscription.id,
            status: 'failed',
            amount,
            errorMessage: paymentResult.error?.message,
          });
        }
      }
    } catch (error) {
      console.error('Billing cycle error:', error);
    }

    const completedAt = new Date().toISOString();
    console.log(
      `Billing cycle ${cycleId} completed: ${successful} successful, ${failed} failed, ${skipped} skipped`
    );

    return {
      cycleId,
      startedAt,
      completedAt,
      totalProcessed: results.length,
      successful,
      failed,
      skipped,
      jobs: results,
    };
  }

  /**
   * Get subscriptions due for billing
   */
  private async getSubscriptionsDue(
    subscriptionIds?: string[]
  ): Promise<SubscriptionForBilling[]> {
    const now = new Date().toISOString();

    let query = this.supabase
      .from('subscriptions')
      .select(
        `
        id,
        organization_id,
        plan_id,
        customer_id,
        customer_wallet,
        merchant_wallet,
        status,
        next_payment_at,
        chain,
        failed_payment_count,
        plan:subscription_plans(amount, currency, interval, interval_count)
      `
      )
      .eq('status', 'active')
      .lte('next_payment_at', now);

    if (subscriptionIds && subscriptionIds.length > 0) {
      query = query.in('id', subscriptionIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions due:', error);
      throw error;
    }

    // Filter out subscriptions without valid plans
    return (data || []).filter((sub) => sub.plan !== null) as SubscriptionForBilling[];
  }

  /**
   * Create a billing job record
   */
  private async createBillingJob(params: {
    organizationId: string;
    subscriptionId: string;
    amount: number;
    customerWallet: string;
    merchantWallet: string;
    chain: string;
    allowanceSufficient: boolean;
  }): Promise<BillingJob> {
    const { data, error } = await this.supabase
      .from('billing_jobs')
      .insert({
        organization_id: params.organizationId,
        subscription_id: params.subscriptionId,
        amount: params.amount,
        customer_wallet: params.customerWallet,
        merchant_wallet: params.merchantWallet,
        chain: params.chain,
        allowance_sufficient: params.allowanceSufficient,
        status: 'pending',
        attempt_number: 1,
        max_attempts: 4,
        dunning_stage: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating billing job:', error);
      throw error;
    }

    return this.mapBillingJob(data);
  }

  /**
   * Update billing job status
   */
  private async updateBillingJobStatus(
    jobId: string,
    status: BillingJobStatus,
    updates?: {
      txHash?: string;
      txConfirmedAt?: string;
      errorMessage?: string;
      dunningStage?: DunningStage;
      nextAttemptAt?: string;
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('billing_jobs')
      .update({
        status,
        tx_hash: updates?.txHash,
        tx_confirmed_at: updates?.txConfirmedAt,
        error_message: updates?.errorMessage,
        dunning_stage: updates?.dunningStage,
        next_attempt_at: updates?.nextAttemptAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating billing job:', error);
    }
  }

  /**
   * Handle successful payment - update subscription
   */
  private async handleSuccessfulPayment(
    subscription: SubscriptionForBilling,
    txHash: string
  ): Promise<void> {
    const now = new Date();
    const nextPaymentAt = this.calculateNextPaymentDate(
      now,
      subscription.plan.interval,
      subscription.plan.interval_count
    );

    const { error } = await this.supabase
      .from('subscriptions')
      .update({
        last_payment_at: now.toISOString(),
        last_payment_amount: subscription.plan.amount,
        last_payment_tx_hash: txHash,
        next_payment_at: nextPaymentAt.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: nextPaymentAt.toISOString(),
        failed_payment_count: 0,
        last_failed_at: null,
        last_failed_reason: null,
        updated_at: now.toISOString(),
      })
      .eq('id', subscription.id);

    if (error) {
      console.error('Error updating subscription after payment:', error);
    }

    // Increment total paid and invoice count
    await this.supabase.rpc('increment_subscription_totals', {
      sub_id: subscription.id,
      amount_paid: parseFloat(subscription.plan.amount),
    });
  }

  /**
   * Handle failed payment - update subscription and schedule retry
   */
  private async handleFailedPayment(
    subscription: SubscriptionForBilling,
    job: BillingJob,
    reason: string
  ): Promise<void> {
    const failedCount = subscription.failed_payment_count + 1;
    const nextRetry = dunningService.calculateNextRetry(failedCount);

    const updates: Record<string, unknown> = {
      failed_payment_count: failedCount,
      last_failed_at: new Date().toISOString(),
      last_failed_reason: reason,
      updated_at: new Date().toISOString(),
    };

    // If retry scheduled, update next_payment_at
    if (nextRetry) {
      updates.next_payment_at = nextRetry.toISOString();
    } else {
      // Max retries reached - pause the subscription
      updates.status = 'past_due';
      updates.paused_at = new Date().toISOString();
      updates.pause_reason = 'Payment failed after max retries';
    }

    const { error } = await this.supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscription.id);

    if (error) {
      console.error('Error updating subscription after failed payment:', error);
    }

    // Log event
    await this.supabase.from('subscription_events').insert({
      subscription_id: subscription.id,
      event_type: nextRetry ? 'payment_failed' : 'payment_failed_max_retries',
      data: {
        jobId: job.id,
        reason,
        failedCount,
        nextRetry: nextRetry?.toISOString(),
      },
    });
  }

  /**
   * Create subscription invoice record
   */
  private async createSubscriptionInvoice(
    subscription: SubscriptionForBilling,
    billingJobId: string,
    txHash: string
  ): Promise<void> {
    const now = new Date();
    const periodEnd = this.calculateNextPaymentDate(
      now,
      subscription.plan.interval,
      subscription.plan.interval_count
    );

    const { error } = await this.supabase.from('subscription_invoices').insert({
      subscription_id: subscription.id,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      amount: subscription.plan.amount,
      currency: subscription.plan.currency,
      status: 'paid',
      finalized_at: now.toISOString(),
      paid_at: now.toISOString(),
      payment_tx_hash: txHash,
      payment_attempts: 1,
    });

    if (error) {
      console.error('Error creating subscription invoice:', error);
    }

    // Update billing job with invoice reference
    const { data: invoice } = await this.supabase
      .from('subscription_invoices')
      .select('id')
      .eq('subscription_id', subscription.id)
      .eq('payment_tx_hash', txHash)
      .single();

    if (invoice) {
      await this.supabase
        .from('billing_jobs')
        .update({ subscription_invoice_id: invoice.id })
        .eq('id', billingJobId);
    }
  }

  /**
   * Retry a failed billing job
   */
  async retryBillingJob(jobId: string): Promise<BillingJobSummary> {
    const { data: job, error } = await this.supabase
      .from('billing_jobs')
      .select('*, subscription:subscriptions(*, plan:subscription_plans(*))')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new Error(`Billing job not found: ${jobId}`);
    }

    if (job.status !== 'failed') {
      throw new Error(`Cannot retry job with status: ${job.status}`);
    }

    // Update attempt count
    const attemptNumber = job.attempt_number + 1;
    const dunningStage = Math.min(job.dunning_stage + 1, 3) as DunningStage;

    await this.supabase
      .from('billing_jobs')
      .update({
        status: 'pending',
        attempt_number: attemptNumber,
        dunning_stage: dunningStage,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Run billing cycle for just this job
    const result = await this.runBillingCycle({
      subscriptionIds: [job.subscription_id],
    });

    return result.jobs[0] || {
      jobId,
      subscriptionId: job.subscription_id,
      status: 'failed',
      amount: parseFloat(job.amount),
      errorMessage: 'Retry failed',
    };
  }

  /**
   * Get billing job by ID
   */
  async getBillingJob(jobId: string): Promise<BillingJob | null> {
    const { data, error } = await this.supabase
      .from('billing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapBillingJob(data);
  }

  /**
   * List billing jobs with filters
   */
  async listBillingJobs(params?: {
    status?: BillingJobStatus;
    subscriptionId?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: BillingJob[]; total: number }> {
    let query = this.supabase
      .from('billing_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.subscriptionId) {
      query = query.eq('subscription_id', params.subscriptionId);
    }
    if (params?.organizationId) {
      query = query.eq('organization_id', params.organizationId);
    }

    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing billing jobs:', error);
      throw error;
    }

    return {
      jobs: (data || []).map(this.mapBillingJob),
      total: count || 0,
    };
  }

  private calculateNextPaymentDate(
    startDate: Date,
    interval: string,
    intervalCount: number
  ): Date {
    const result = new Date(startDate);
    switch (interval) {
      case 'daily':
        result.setDate(result.getDate() + intervalCount);
        break;
      case 'weekly':
        result.setDate(result.getDate() + 7 * intervalCount);
        break;
      case 'monthly':
        result.setMonth(result.getMonth() + intervalCount);
        break;
      case 'yearly':
        result.setFullYear(result.getFullYear() + intervalCount);
        break;
    }
    return result;
  }

  private mapBillingJob(data: Record<string, unknown>): BillingJob {
    return {
      id: data.id as string,
      organizationId: data.organization_id as string,
      subscriptionId: data.subscription_id as string,
      subscriptionInvoiceId: data.subscription_invoice_id as string | undefined,
      status: data.status as BillingJobStatus,
      attemptNumber: data.attempt_number as number,
      maxAttempts: data.max_attempts as number,
      nextAttemptAt: data.next_attempt_at as string | undefined,
      amount: parseFloat(data.amount as string),
      customerWallet: data.customer_wallet as string,
      merchantWallet: data.merchant_wallet as string,
      chain: data.chain as string,
      allowanceSufficient: data.allowance_sufficient as boolean | undefined,
      txHash: data.tx_hash as string | undefined,
      txConfirmedAt: data.tx_confirmed_at as string | undefined,
      dunningStage: data.dunning_stage as DunningStage,
      errorMessage: data.error_message as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

// Export singleton instance
export const billingEngine = new BillingEngine();
