/**
 * Payment Intents resource
 *
 * Payment intents represent a payment that will be completed client-side.
 * They are useful for:
 * - Creating server-side payment records before client confirms
 * - Tracking payment lifecycle
 * - Supporting client-side wallet connections
 */

import { BaseResource } from './base';
import type {
  PaymentIntent,
  CreatePaymentIntentParams,
  PaginatedList,
  PaginationParams,
} from '../types';
import { validateAmount, validateOptional, validateAddress, validateMetadata } from '../utils/validation';

export class PaymentIntentsResource extends BaseResource {
  /**
   * Create a new payment intent
   *
   * Returns a clientSecret that should be passed to the frontend
   * for completing the payment with the React SDK.
   */
  async create(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    // Validate required fields
    const amount = validateAmount(params.amount, 'amount');

    // Validate optional fields
    const recipient = validateOptional(params.recipient, validateAddress, 'recipient');
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      amount,
      currency: params.currency || 'USDC',
      recipient,
      description: params.description,
      metadata,
      expiresIn: params.expiresIn || 3600, // Default 1 hour
    });

    const response = await this.request<{ data: PaymentIntent }>({
      method: 'POST',
      path: '/payment_intents',
      body,
    });

    return this.transformResponse<PaymentIntent>(response.data);
  }

  /**
   * Retrieve a payment intent by ID
   */
  async retrieve(intentId: string): Promise<PaymentIntent> {
    const response = await this.request<{ data: PaymentIntent }>({
      method: 'GET',
      path: `/payment_intents/${intentId}`,
    });

    return this.transformResponse<PaymentIntent>(response.data);
  }

  /**
   * List payment intents
   */
  async list(params?: PaginationParams): Promise<PaginatedList<PaymentIntent>> {
    const response = await this.listRequest<PaymentIntent>('/payment_intents', params);
    return {
      ...response,
      data: response.data.map((pi) => this.transformResponse<PaymentIntent>(pi)),
    };
  }

  /**
   * Update a payment intent
   */
  async update(
    intentId: string,
    params: { metadata?: Record<string, string | number | boolean | null> }
  ): Promise<PaymentIntent> {
    const metadata = validateMetadata(params.metadata, 'metadata');

    const response = await this.request<{ data: PaymentIntent }>({
      method: 'PATCH',
      path: `/payment_intents/${intentId}`,
      body: this.transformRequest({ metadata }),
    });

    return this.transformResponse<PaymentIntent>(response.data);
  }

  /**
   * Cancel a payment intent
   */
  async cancel(intentId: string): Promise<PaymentIntent> {
    const response = await this.request<{ data: PaymentIntent }>({
      method: 'POST',
      path: `/payment_intents/${intentId}/cancel`,
    });

    return this.transformResponse<PaymentIntent>(response.data);
  }

  /**
   * Confirm a payment intent (server-side confirmation)
   *
   * Usually done client-side, but can be done server-side
   * if you have the wallet details.
   */
  async confirm(
    intentId: string,
    params?: { walletAddress?: string }
  ): Promise<PaymentIntent> {
    const body = params?.walletAddress
      ? this.transformRequest({ walletAddress: params.walletAddress })
      : undefined;

    const response = await this.request<{ data: PaymentIntent }>({
      method: 'POST',
      path: `/payment_intents/${intentId}/confirm`,
      body,
    });

    return this.transformResponse<PaymentIntent>(response.data);
  }
}
