/**
 * Payments resource
 */

import { BaseResource } from './base';
import type {
  Payment,
  CreatePaymentParams,
  ListPaymentsParams,
  PaginatedList,
} from '../types';
import { validateAmount, validateAddress, validateOptional, validateMetadata } from '../utils/validation';

export class PaymentsResource extends BaseResource {
  /**
   * Create a new payment
   */
  async create(params: CreatePaymentParams): Promise<Payment> {
    // Validate required fields
    const amount = validateAmount(params.amount, 'amount');
    const recipient = validateAddress(params.recipient, 'recipient');

    // Validate optional fields
    const sender = validateOptional(params.sender, validateAddress, 'sender');
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      amount,
      currency: params.currency || 'USDC',
      recipient,
      sender,
      description: params.description,
      metadata,
    });

    const response = await this.request<{ data: Payment }>({
      method: 'POST',
      path: '/payments',
      body,
      idempotencyKey: params.idempotencyKey,
    });

    return this.transformResponse<Payment>(response.data);
  }

  /**
   * Retrieve a payment by ID
   */
  async retrieve(paymentId: string): Promise<Payment> {
    const response = await this.request<{ data: Payment }>({
      method: 'GET',
      path: `/payments/${paymentId}`,
    });

    return this.transformResponse<Payment>(response.data);
  }

  /**
   * List payments with optional filters
   */
  async list(params?: ListPaymentsParams): Promise<PaginatedList<Payment>> {
    const response = await this.listRequest<Payment>('/payments', params);
    return {
      ...response,
      data: response.data.map((p) => this.transformResponse<Payment>(p)),
    };
  }

  /**
   * Cancel a pending payment
   */
  async cancel(paymentId: string): Promise<Payment> {
    const response = await this.request<{ data: Payment }>({
      method: 'POST',
      path: `/payments/${paymentId}/cancel`,
    });

    return this.transformResponse<Payment>(response.data);
  }

  /**
   * Refund a completed payment
   */
  async refund(
    paymentId: string,
    params?: { amount?: string; reason?: string }
  ): Promise<Payment> {
    const body: Record<string, unknown> = {};

    if (params?.amount) {
      body.amount = validateAmount(params.amount, 'amount');
    }
    if (params?.reason) {
      body.reason = params.reason;
    }

    const response = await this.request<{ data: Payment }>({
      method: 'POST',
      path: `/payments/${paymentId}/refund`,
      body: Object.keys(body).length > 0 ? body : undefined,
    });

    return this.transformResponse<Payment>(response.data);
  }
}
