/**
 * Customers resource
 *
 * Customers represent wallet holders who make payments
 * and can have subscriptions.
 */

import { BaseResource } from './base';
import type {
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
  ListCustomersParams,
  CustomerPortalSession,
  CreatePortalSessionParams,
  Payment,
  Subscription,
  PaginatedList,
} from '../types';
import {
  validateAddress,
  validateOptional,
  validateEmail,
  validateMetadata,
  validateUrl,
} from '../utils/validation';

export class CustomersResource extends BaseResource {
  /**
   * Create a new customer
   */
  async create(params: CreateCustomerParams): Promise<Customer> {
    const walletAddress = validateAddress(params.walletAddress, 'walletAddress');
    const email = validateOptional(params.email, validateEmail, 'email');
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      walletAddress,
      email,
      name: params.name,
      phone: params.phone,
      description: params.description,
      metadata,
    });

    const response = await this.request<{ data: Customer }>({
      method: 'POST',
      path: '/customers',
      body,
    });

    return this.transformResponse<Customer>(response.data);
  }

  /**
   * Retrieve a customer by ID
   */
  async retrieve(customerId: string): Promise<Customer> {
    const response = await this.request<{ data: Customer }>({
      method: 'GET',
      path: `/customers/${customerId}`,
    });

    return this.transformResponse<Customer>(response.data);
  }

  /**
   * Retrieve a customer by wallet address
   */
  async retrieveByWallet(walletAddress: string): Promise<Customer> {
    const address = validateAddress(walletAddress, 'walletAddress');

    const response = await this.request<{ data: Customer }>({
      method: 'GET',
      path: `/customers/wallet/${address}`,
    });

    return this.transformResponse<Customer>(response.data);
  }

  /**
   * List customers
   */
  async list(params?: ListCustomersParams): Promise<PaginatedList<Customer>> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (params) {
      if (params.limit) query.limit = params.limit;
      if (params.startingAfter) query.starting_after = params.startingAfter;
      if (params.email) query.email = params.email;
      if (params.walletAddress) query.wallet_address = params.walletAddress;
      if (params.createdAfter) query.created_after = params.createdAfter.toISOString();
      if (params.createdBefore) query.created_before = params.createdBefore.toISOString();
    }

    const response = await this.request<PaginatedList<Customer>>({
      method: 'GET',
      path: '/customers',
      query,
    });

    return {
      ...response,
      data: response.data.map((cust) => this.transformResponse<Customer>(cust)),
    };
  }

  /**
   * Update a customer
   */
  async update(customerId: string, params: UpdateCustomerParams): Promise<Customer> {
    const email = validateOptional(params.email, validateEmail, 'email');
    const metadata = validateMetadata(params.metadata, 'metadata');

    const body = this.transformRequest({
      email,
      name: params.name,
      phone: params.phone,
      description: params.description,
      metadata,
    });

    const response = await this.request<{ data: Customer }>({
      method: 'PATCH',
      path: `/customers/${customerId}`,
      body,
    });

    return this.transformResponse<Customer>(response.data);
  }

  /**
   * Delete a customer
   *
   * Only customers with no active subscriptions can be deleted.
   */
  async delete(customerId: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.request<{ deleted: boolean; id: string }>({
      method: 'DELETE',
      path: `/customers/${customerId}`,
    });

    return response;
  }

  /**
   * List payments for a customer
   */
  async listPayments(
    customerId: string,
    params?: { limit?: number; startingAfter?: string }
  ): Promise<PaginatedList<Payment>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;

    const response = await this.request<PaginatedList<Payment>>({
      method: 'GET',
      path: `/customers/${customerId}/payments`,
      query,
    });

    return {
      ...response,
      data: response.data.map((p) => this.transformResponse<Payment>(p)),
    };
  }

  /**
   * List subscriptions for a customer
   */
  async listSubscriptions(
    customerId: string,
    params?: { limit?: number; startingAfter?: string; status?: string }
  ): Promise<PaginatedList<Subscription>> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startingAfter) query.starting_after = params.startingAfter;
    if (params?.status) query.status = params.status;

    const response = await this.request<PaginatedList<Subscription>>({
      method: 'GET',
      path: `/customers/${customerId}/subscriptions`,
      query,
    });

    return {
      ...response,
      data: response.data.map((sub) => this.transformResponse<Subscription>(sub)),
    };
  }

  /**
   * Create a customer portal session
   *
   * Returns a URL where the customer can manage their
   * subscriptions and payment methods.
   */
  async createPortalSession(
    params: CreatePortalSessionParams
  ): Promise<CustomerPortalSession> {
    const returnUrl = validateUrl(params.returnUrl, 'returnUrl');

    const body = this.transformRequest({
      customerId: params.customerId,
      returnUrl,
    });

    const response = await this.request<{ data: CustomerPortalSession }>({
      method: 'POST',
      path: '/billing_portal/sessions',
      body,
    });

    return this.transformResponse<CustomerPortalSession>(response.data);
  }

  /**
   * Get or create a customer by wallet address
   *
   * Convenience method that returns existing customer
   * or creates a new one.
   */
  async getOrCreate(
    walletAddress: string,
    defaults?: Omit<CreateCustomerParams, 'walletAddress'>
  ): Promise<Customer> {
    try {
      return await this.retrieveByWallet(walletAddress);
    } catch (error) {
      // If not found, create
      if ((error as { code?: string }).code === 'not_found') {
        return this.create({ walletAddress, ...defaults });
      }
      throw error;
    }
  }
}
