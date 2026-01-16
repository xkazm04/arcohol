/**
 * Billing Resource
 * Manages recurring subscription billing operations
 */

import { BaseResource } from './base';
import type { ArcPayB2BConfig, PaginatedList } from '../types';
import { validateString } from '../utils/validation';

// Billing Types
export type BillingJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

export type DunningStage = 0 | 1 | 2 | 3;

export interface BillingJob {
  id: string;
  organizationId: string;
  subscriptionId: string;
  subscriptionInvoiceId?: string;
  status: BillingJobStatus;
  attemptNumber: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  amount: number;
  customerWallet: string;
  merchantWallet: string;
  chain: string;
  allowanceSufficient?: boolean;
  txHash?: string;
  txConfirmedAt?: string;
  dunningStage: DunningStage;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingCycleResult {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  jobs: BillingJobSummary[];
}

export interface BillingJobSummary {
  jobId: string;
  subscriptionId: string;
  status: BillingJobStatus;
  amount: number;
  txHash?: string;
  errorMessage?: string;
}

export interface ListBillingJobsParams {
  status?: BillingJobStatus;
  subscriptionId?: string;
  limit?: number;
  offset?: number;
}

export interface RunBillingParams {
  subscriptionIds?: string[];
  dryRun?: boolean;
}

export interface DunningSummary {
  total: number;
  byStage: Record<DunningStage, number>;
  recentFailures: number;
  atRiskOfCancellation: number;
}

export class BillingResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  /**
   * Run a billing cycle to process due subscriptions
   */
  async runBillingCycle(params?: RunBillingParams): Promise<BillingCycleResult> {
    return this.request<BillingCycleResult>({
      method: 'POST',
      path: '/billing/run',
      body: params,
    });
  }

  /**
   * Get a billing job by ID
   */
  async getBillingJob(jobId: string): Promise<BillingJob> {
    validateString(jobId, 'jobId');

    return this.request<BillingJob>({
      method: 'GET',
      path: `/billing/jobs/${jobId}`,
    });
  }

  /**
   * List billing jobs
   */
  async listBillingJobs(
    params?: ListBillingJobsParams
  ): Promise<PaginatedList<BillingJob>> {
    return this.listRequest<BillingJob>('/billing/jobs', params);
  }

  /**
   * Retry a failed billing job
   */
  async retryBillingJob(jobId: string): Promise<BillingJobSummary> {
    validateString(jobId, 'jobId');

    return this.request<BillingJobSummary>({
      method: 'POST',
      path: `/billing/retry/${jobId}`,
    });
  }

  /**
   * Get dunning summary for failed payments
   */
  async getDunningSummary(): Promise<DunningSummary> {
    return this.request<DunningSummary>({
      method: 'GET',
      path: '/billing/dunning/summary',
    });
  }

  /**
   * Process dunning escalations (pauses/cancels overdue subscriptions)
   */
  async processDunningEscalations(): Promise<{
    paused: number;
    canceled: number;
    escalated: number;
  }> {
    return this.request({
      method: 'POST',
      path: '/billing/dunning/process',
    });
  }
}
