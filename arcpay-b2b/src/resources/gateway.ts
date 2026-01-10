/**
 * Gateway Resource
 * Direction 3: Merchant Gateway with Instant Settlement
 */

import { BaseResource } from './base';
import type {
  ArcPayB2BConfig,
  PaginatedList,
  Invoice,
  CreateInvoiceParams,
  UpdateInvoiceParams,
  ListInvoicesParams,
  MerchantSettings,
  UpdateMerchantSettingsParams,
  BatchPayment,
  CreateBatchPaymentParams,
  ListBatchPaymentsParams,
  SettlementDetails,
  Chain,
} from '../types';
import {
  validateString,
  validateAmount,
  validateEmail,
  validateAddress,
  validateDate,
  validateMetadata,
} from '../utils/validation';

const SUPPORTED_CHAINS: Chain[] = [
  'arc',
  'ethereum',
  'base',
  'polygon',
  'arbitrum',
  'optimism',
];

export class GatewayResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  // ==========================================================================
  // Invoice Operations
  // ==========================================================================

  /**
   * Create a new invoice
   */
  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    validateAmount(params.amount, 'amount', { min: 0.01 });
    validateString(params.reference, 'reference');
    validateEmail(params.buyer.email, 'buyer.email');
    validateDate(params.dueDate, 'dueDate');

    // Validate line items
    if (!params.lineItems || params.lineItems.length === 0) {
      throw new Error('At least one line item is required');
    }

    for (let i = 0; i < params.lineItems.length; i++) {
      const item = params.lineItems[i];
      validateString(item.description, `lineItems[${i}].description`);
      validateAmount(item.quantity, `lineItems[${i}].quantity`, { min: 1 });
      validateAmount(item.unitPrice, `lineItems[${i}].unitPrice`, { min: 0 });
    }

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<Invoice>({
      method: 'POST',
      path: '/invoices',
      body: params,
    });
  }

  /**
   * Get an invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');

    return this.request<Invoice>({
      method: 'GET',
      path: `/invoices/${invoiceId}`,
    });
  }

  /**
   * Update an invoice (only drafts can be updated)
   */
  async updateInvoice(
    invoiceId: string,
    params: UpdateInvoiceParams
  ): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');

    if (params.buyer?.email) {
      validateEmail(params.buyer.email, 'buyer.email');
    }

    if (params.dueDate) {
      validateDate(params.dueDate, 'dueDate');
    }

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<Invoice>({
      method: 'PATCH',
      path: `/invoices/${invoiceId}`,
      body: params,
    });
  }

  /**
   * List invoices
   */
  async listInvoices(params?: ListInvoicesParams): Promise<PaginatedList<Invoice>> {
    return this.listRequest<Invoice>('/invoices', params);
  }

  /**
   * Send an invoice to the buyer
   */
  async sendInvoice(invoiceId: string): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');

    return this.request<Invoice>({
      method: 'POST',
      path: `/invoices/${invoiceId}/send`,
    });
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');

    return this.request<Invoice>({
      method: 'POST',
      path: `/invoices/${invoiceId}/cancel`,
      body: reason ? { reason } : undefined,
    });
  }

  /**
   * Mark invoice as paid (manual payment recording)
   */
  async markAsPaid(
    invoiceId: string,
    details: {
      txHash: string;
      chain: Chain;
      payerAddress: string;
    }
  ): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');
    validateString(details.txHash, 'txHash');
    validateAddress(details.payerAddress, 'payerAddress');

    return this.request<Invoice>({
      method: 'POST',
      path: `/invoices/${invoiceId}/mark-paid`,
      body: details,
    });
  }

  /**
   * Refund an invoice
   */
  async refundInvoice(
    invoiceId: string,
    params?: { amount?: number; reason?: string }
  ): Promise<Invoice> {
    validateString(invoiceId, 'invoiceId');

    if (params?.amount) {
      validateAmount(params.amount, 'amount', { min: 0.01 });
    }

    return this.request<Invoice>({
      method: 'POST',
      path: `/invoices/${invoiceId}/refund`,
      body: params,
    });
  }

  /**
   * Get settlement details for an invoice
   */
  async getSettlement(invoiceId: string): Promise<SettlementDetails | null> {
    validateString(invoiceId, 'invoiceId');

    try {
      return await this.request<SettlementDetails>({
        method: 'GET',
        path: `/invoices/${invoiceId}/settlement`,
      });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // ==========================================================================
  // Batch Payments
  // ==========================================================================

  /**
   * Create a batch payment
   */
  async createBatch(
    params: CreateBatchPaymentParams,
    idempotencyKey?: string
  ): Promise<BatchPayment> {
    validateString(params.reference, 'reference');

    if (!params.payments || params.payments.length === 0) {
      throw new Error('At least one payment is required');
    }

    for (let i = 0; i < params.payments.length; i++) {
      const payment = params.payments[i];
      validateAddress(payment.recipient, `payments[${i}].recipient`);
      validateAmount(payment.amount, `payments[${i}].amount`, { min: 0.01 });
    }

    return this.request<BatchPayment>({
      method: 'POST',
      path: '/batch-payments',
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Get a batch payment by ID
   */
  async getBatch(batchId: string): Promise<BatchPayment> {
    validateString(batchId, 'batchId');

    return this.request<BatchPayment>({
      method: 'GET',
      path: `/batch-payments/${batchId}`,
    });
  }

  /**
   * List batch payments
   */
  async listBatches(
    params?: ListBatchPaymentsParams
  ): Promise<PaginatedList<BatchPayment>> {
    return this.listRequest<BatchPayment>('/batch-payments', params);
  }

  /**
   * Cancel a pending batch payment
   */
  async cancelBatch(batchId: string): Promise<BatchPayment> {
    validateString(batchId, 'batchId');

    return this.request<BatchPayment>({
      method: 'POST',
      path: `/batch-payments/${batchId}/cancel`,
    });
  }

  // ==========================================================================
  // Merchant Settings
  // ==========================================================================

  /**
   * Get merchant settings
   */
  async getMerchantSettings(merchantId: string): Promise<MerchantSettings> {
    validateString(merchantId, 'merchantId');

    return this.request<MerchantSettings>({
      method: 'GET',
      path: `/merchants/${merchantId}/settings`,
    });
  }

  /**
   * Update merchant settings
   */
  async updateMerchantSettings(
    merchantId: string,
    params: UpdateMerchantSettingsParams
  ): Promise<MerchantSettings> {
    validateString(merchantId, 'merchantId');

    if (params.settlement?.destination) {
      validateAddress(
        params.settlement.destination.address,
        'settlement.destination.address'
      );
    }

    return this.request<MerchantSettings>({
      method: 'PATCH',
      path: `/merchants/${merchantId}/settings`,
      body: params,
    });
  }
}

// ==========================================================================
// Merchant Gateway Helper Class
// ==========================================================================

/**
 * Helper class for merchant gateway operations
 */
export class MerchantGateway {
  private readonly gateway: GatewayResource;
  private readonly merchantId: string;
  private settings: MerchantSettings | null = null;

  constructor(options: {
    gateway: GatewayResource;
    merchantId: string;
  }) {
    this.gateway = options.gateway;
    this.merchantId = options.merchantId;
  }

  /**
   * Get or fetch merchant settings
   */
  async getSettings(force = false): Promise<MerchantSettings> {
    if (!this.settings || force) {
      this.settings = await this.gateway.getMerchantSettings(this.merchantId);
    }
    return this.settings;
  }

  /**
   * Update merchant settings
   */
  async updateSettings(
    params: UpdateMerchantSettingsParams
  ): Promise<MerchantSettings> {
    this.settings = await this.gateway.updateMerchantSettings(
      this.merchantId,
      params
    );
    return this.settings;
  }

  /**
   * Create an invoice
   */
  async createInvoice(
    params: CreateInvoiceParams
  ): Promise<Invoice> {
    return this.gateway.createInvoice(params);
  }

  /**
   * Create a batch payment
   */
  async createBatch(
    params: CreateBatchPaymentParams,
    idempotencyKey?: string
  ): Promise<BatchPayment> {
    return this.gateway.createBatch(params, idempotencyKey);
  }

  /**
   * List invoices for this merchant
   */
  async listInvoices(
    params?: Omit<ListInvoicesParams, 'merchantId'>
  ): Promise<PaginatedList<Invoice>> {
    return this.gateway.listInvoices(params);
  }

  /**
   * Get settlement status for an invoice
   */
  async getSettlement(invoiceId: string): Promise<SettlementDetails | null> {
    return this.gateway.getSettlement(invoiceId);
  }
}
