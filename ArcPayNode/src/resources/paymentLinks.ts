/**
 * Payment Links resource
 *
 * Payment links are shareable URLs that allow anyone to make a payment.
 * They can be used for:
 * - Invoices
 * - Product purchases
 * - Donations
 * - One-time payments
 */

import { BaseResource } from './base';
import type {
  PaymentLink,
  CreatePaymentLinkParams,
  UpdatePaymentLinkParams,
  ListPaymentLinksParams,
  PaginatedList,
} from '../types';
import {
  validateAmount,
  validateOptional,
  validateUrl,
  validateDate,
  validateMetadata,
  validatePositiveInteger,
} from '../utils/validation';

export class PaymentLinksResource extends BaseResource {
  /**
   * Create a new payment link
   */
  async create(params: CreatePaymentLinkParams): Promise<PaymentLink> {
    // Validate required fields
    const amount = validateAmount(params.amount, 'amount');

    // Validate optional fields
    const successUrl = validateOptional(params.successUrl, validateUrl, 'successUrl');
    const cancelUrl = validateOptional(params.cancelUrl, validateUrl, 'cancelUrl');
    const expiresAt = validateOptional(params.expiresAt, validateDate, 'expiresAt');
    const maxCompletions = validateOptional(
      params.maxCompletions,
      validatePositiveInteger,
      'maxCompletions'
    );
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      amount,
      currency: params.currency || 'USDC',
      description: params.description,
      successUrl,
      cancelUrl,
      expiresAt,
      collectEmail: params.collectEmail ?? false,
      collectName: params.collectName ?? false,
      allowPromotionCodes: params.allowPromotionCodes ?? false,
      maxCompletions,
      metadata,
    });

    const response = await this.request<{ data: PaymentLink }>({
      method: 'POST',
      path: '/payment_links',
      body,
    });

    return this.transformResponse<PaymentLink>(response.data);
  }

  /**
   * Retrieve a payment link by ID
   */
  async retrieve(linkId: string): Promise<PaymentLink> {
    const response = await this.request<{ data: PaymentLink }>({
      method: 'GET',
      path: `/payment_links/${linkId}`,
    });

    return this.transformResponse<PaymentLink>(response.data);
  }

  /**
   * List payment links
   */
  async list(params?: ListPaymentLinksParams): Promise<PaginatedList<PaymentLink>> {
    const response = await this.listRequest<PaymentLink>('/payment_links', params);
    return {
      ...response,
      data: response.data.map((pl) => this.transformResponse<PaymentLink>(pl)),
    };
  }

  /**
   * Update a payment link
   */
  async update(linkId: string, params: UpdatePaymentLinkParams): Promise<PaymentLink> {
    const successUrl = validateOptional(params.successUrl, validateUrl, 'successUrl');
    const cancelUrl = validateOptional(params.cancelUrl, validateUrl, 'cancelUrl');
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      active: params.active,
      description: params.description,
      successUrl,
      cancelUrl,
      metadata,
    });

    const response = await this.request<{ data: PaymentLink }>({
      method: 'PATCH',
      path: `/payment_links/${linkId}`,
      body,
    });

    return this.transformResponse<PaymentLink>(response.data);
  }

  /**
   * Deactivate a payment link
   *
   * Convenience method for update({ active: false })
   */
  async deactivate(linkId: string): Promise<PaymentLink> {
    return this.update(linkId, { active: false });
  }

  /**
   * Activate a payment link
   *
   * Convenience method for update({ active: true })
   */
  async activate(linkId: string): Promise<PaymentLink> {
    return this.update(linkId, { active: true });
  }

  /**
   * Get line items / payment history for a link
   */
  async listLineItems(
    linkId: string,
    params?: { limit?: number; startingAfter?: string }
  ): Promise<PaginatedList<PaymentLinkLineItem>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;

    const response = await this.request<PaginatedList<PaymentLinkLineItem>>({
      method: 'GET',
      path: `/payment_links/${linkId}/line_items`,
      query,
    });

    return {
      ...response,
      data: response.data.map((item) => this.transformResponse<PaymentLinkLineItem>(item)),
    };
  }
}

// Additional type for line items
interface PaymentLinkLineItem {
  id: string;
  paymentLinkId: string;
  paymentId: string;
  amount: string;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  customerWallet: string;
  createdAt: Date;
}
