/**
 * Subscription Plans resource
 *
 * Plans define the pricing and billing intervals for subscriptions.
 */

import { BaseResource } from './base';
import type {
  SubscriptionPlan,
  CreatePlanParams,
  UpdatePlanParams,
  ListPlansParams,
  PaginatedList,
} from '../types';
import { validateAmount, validateMetadata } from '../utils/validation';

const VALID_INTERVALS = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export class PlansResource extends BaseResource {
  /**
   * Create a new subscription plan
   */
  async create(params: CreatePlanParams): Promise<SubscriptionPlan> {
    // Validate required fields
    if (!params.name || typeof params.name !== 'string') {
      throw new Error('Plan name is required');
    }

    const amount = validateAmount(params.amount, 'amount');

    if (!VALID_INTERVALS.includes(params.interval)) {
      throw new Error(`Invalid interval. Must be one of: ${VALID_INTERVALS.join(', ')}`);
    }

    // Validate optional fields
    const intervalCount = params.intervalCount ?? 1;
    if (intervalCount < 1) {
      throw new Error('intervalCount must be at least 1');
    }

    const trialDays = params.trialDays ?? 0;
    if (trialDays < 0) {
      throw new Error('trialDays cannot be negative');
    }

    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      name: params.name,
      description: params.description,
      amount,
      currency: params.currency || 'USDC',
      interval: params.interval,
      intervalCount,
      trialDays,
      metadata,
    });

    const response = await this.request<{ data: SubscriptionPlan }>({
      method: 'POST',
      path: '/plans',
      body,
    });

    return this.transformResponse<SubscriptionPlan>(response.data);
  }

  /**
   * Retrieve a plan by ID
   */
  async retrieve(planId: string): Promise<SubscriptionPlan> {
    const response = await this.request<{ data: SubscriptionPlan }>({
      method: 'GET',
      path: `/plans/${planId}`,
    });

    return this.transformResponse<SubscriptionPlan>(response.data);
  }

  /**
   * List subscription plans
   */
  async list(params?: ListPlansParams): Promise<PaginatedList<SubscriptionPlan>> {
    const response = await this.listRequest<SubscriptionPlan>('/plans', params);
    return {
      ...response,
      data: response.data.map((plan) => this.transformResponse<SubscriptionPlan>(plan)),
    };
  }

  /**
   * Update a plan
   *
   * Note: Amount, currency, and interval cannot be changed.
   * Create a new plan for price changes.
   */
  async update(planId: string, params: UpdatePlanParams): Promise<SubscriptionPlan> {
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      name: params.name,
      description: params.description,
      active: params.active,
      metadata,
    });

    const response = await this.request<{ data: SubscriptionPlan }>({
      method: 'PATCH',
      path: `/plans/${planId}`,
      body,
    });

    return this.transformResponse<SubscriptionPlan>(response.data);
  }

  /**
   * Archive a plan (deactivate)
   *
   * Archived plans cannot be used for new subscriptions
   * but existing subscriptions continue.
   */
  async archive(planId: string): Promise<SubscriptionPlan> {
    return this.update(planId, { active: false });
  }

  /**
   * Activate a plan
   */
  async activate(planId: string): Promise<SubscriptionPlan> {
    return this.update(planId, { active: true });
  }

  /**
   * Delete a plan
   *
   * Only plans with no active subscriptions can be deleted.
   */
  async delete(planId: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.request<{ deleted: boolean; id: string }>({
      method: 'DELETE',
      path: `/plans/${planId}`,
    });

    return response;
  }
}
