/**
 * Subscriptions resource
 *
 * Subscriptions represent recurring payments on a schedule.
 */

import { BaseResource } from './base';
import type {
  Subscription,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  ListSubscriptionsParams,
  CancelSubscriptionParams,
  PauseSubscriptionParams,
  SubscriptionInvoice,
  SubscriptionEvent,
  PaginatedList,
} from '../types';
import { validateAddress, validateMetadata, validatePositiveInteger } from '../utils/validation';

export class SubscriptionsResource extends BaseResource {
  /**
   * Create a new subscription
   *
   * Returns a subscription in 'incomplete' status.
   * The customer must approve the subscription via wallet signature.
   */
  async create(params: CreateSubscriptionParams): Promise<Subscription> {
    // Validate required fields
    if (!params.planId) {
      throw new Error('planId is required');
    }

    const customerWallet = validateAddress(params.customerWallet, 'customerWallet');
    const metadata = validateMetadata(params.metadata, 'metadata');

    // Validate optional fields
    if (params.trialDays !== undefined && params.trialDays < 0) {
      throw new Error('trialDays cannot be negative');
    }

    const body = this.transformRequest({
      planId: params.planId,
      customerWallet,
      customerId: params.customerId,
      skipTrial: params.skipTrial ?? false,
      trialDays: params.trialDays,
      metadata,
    });

    const response = await this.request<{ data: Subscription }>({
      method: 'POST',
      path: '/subscriptions',
      body,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * Retrieve a subscription by ID
   */
  async retrieve(subscriptionId: string): Promise<Subscription> {
    const response = await this.request<{ data: Subscription }>({
      method: 'GET',
      path: `/subscriptions/${subscriptionId}`,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * List subscriptions
   */
  async list(params?: ListSubscriptionsParams): Promise<PaginatedList<Subscription>> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (params) {
      if (params.limit) query.limit = params.limit;
      if (params.startingAfter) query.starting_after = params.startingAfter;
      if (params.customerId) query.customer_id = params.customerId;
      if (params.customerWallet) query.customer_wallet = params.customerWallet;
      if (params.planId) query.plan_id = params.planId;
      if (params.status) {
        query.status = Array.isArray(params.status)
          ? params.status.join(',')
          : params.status;
      }
    }

    const response = await this.request<PaginatedList<Subscription>>({
      method: 'GET',
      path: '/subscriptions',
      query,
    });

    return {
      ...response,
      data: response.data.map((sub) => this.transformResponse<Subscription>(sub)),
    };
  }

  /**
   * Update a subscription
   */
  async update(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription> {
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      planId: params.planId,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd,
      metadata,
    });

    const response = await this.request<{ data: Subscription }>({
      method: 'PATCH',
      path: `/subscriptions/${subscriptionId}`,
      body,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * Cancel a subscription
   *
   * By default, cancels at the end of the current period.
   * Use cancelAtPeriodEnd: false for immediate cancellation.
   */
  async cancel(
    subscriptionId: string,
    params?: CancelSubscriptionParams
  ): Promise<Subscription> {
    const body = this.transformRequest({
      cancelAtPeriodEnd: params?.cancelAtPeriodEnd ?? true,
      reason: params?.reason,
    });

    const response = await this.request<{ data: Subscription }>({
      method: 'POST',
      path: `/subscriptions/${subscriptionId}/cancel`,
      body,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * Pause a subscription
   *
   * Paused subscriptions stop billing until resumed.
   */
  async pause(
    subscriptionId: string,
    params?: PauseSubscriptionParams
  ): Promise<Subscription> {
    const body = this.transformRequest({
      resumesAt: params?.resumesAt,
      reason: params?.reason,
    });

    const response = await this.request<{ data: Subscription }>({
      method: 'POST',
      path: `/subscriptions/${subscriptionId}/pause`,
      body,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * Resume a paused subscription
   */
  async resume(subscriptionId: string): Promise<Subscription> {
    const response = await this.request<{ data: Subscription }>({
      method: 'POST',
      path: `/subscriptions/${subscriptionId}/resume`,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * Reactivate a canceled subscription
   *
   * Only works if cancelAtPeriodEnd was true and period hasn't ended.
   */
  async reactivate(subscriptionId: string): Promise<Subscription> {
    const response = await this.request<{ data: Subscription }>({
      method: 'POST',
      path: `/subscriptions/${subscriptionId}/reactivate`,
    });

    return this.transformResponse<Subscription>(response.data);
  }

  /**
   * List invoices for a subscription
   */
  async listInvoices(
    subscriptionId: string,
    params?: { limit?: number; startingAfter?: string }
  ): Promise<PaginatedList<SubscriptionInvoice>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;

    const response = await this.request<PaginatedList<SubscriptionInvoice>>({
      method: 'GET',
      path: `/subscriptions/${subscriptionId}/invoices`,
      query,
    });

    return {
      ...response,
      data: response.data.map((inv) => this.transformResponse<SubscriptionInvoice>(inv)),
    };
  }

  /**
   * List events/history for a subscription
   */
  async listEvents(
    subscriptionId: string,
    params?: { limit?: number; startingAfter?: string }
  ): Promise<PaginatedList<SubscriptionEvent>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;

    const response = await this.request<PaginatedList<SubscriptionEvent>>({
      method: 'GET',
      path: `/subscriptions/${subscriptionId}/events`,
      query,
    });

    return {
      ...response,
      data: response.data.map((evt) => this.transformResponse<SubscriptionEvent>(evt)),
    };
  }

  /**
   * Get upcoming invoice preview
   *
   * Returns what the next invoice will look like.
   */
  async getUpcomingInvoice(subscriptionId: string): Promise<SubscriptionInvoice> {
    const response = await this.request<{ data: SubscriptionInvoice }>({
      method: 'GET',
      path: `/subscriptions/${subscriptionId}/upcoming_invoice`,
    });

    return this.transformResponse<SubscriptionInvoice>(response.data);
  }
}
