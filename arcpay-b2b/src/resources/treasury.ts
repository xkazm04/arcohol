/**
 * Treasury Resource
 * Direction 4: Corporate Treasury with Yield Optimization
 */

import { BaseResource } from './base';
import type {
  ArcPayB2BConfig,
  PaginatedList,
  TreasuryAccount,
  CreateTreasuryParams,
  UpdateTreasuryParams,
  TreasuryOverview,
  TreasuryTransaction,
  TreasuryPaymentParams,
  TreasuryPaymentResult,
  RebalanceRequest,
  RebalanceResult,
  RebalanceSchedule,
  TreasuryAlert,
  ListTreasuryTransactionsParams,
  TreasuryFundType,
} from '../types';
import {
  validateString,
  validateAmount,
  validateAddress,
  validateMetadata,
} from '../utils/validation';

export class TreasuryResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  // ==========================================================================
  // Treasury Account Operations
  // ==========================================================================

  /**
   * Create a new treasury account
   */
  async create(params: CreateTreasuryParams): Promise<TreasuryAccount> {
    validateString(params.organizationId, 'organizationId');
    validateString(params.name, 'name');

    // Validate strategy
    if (params.strategy.operating) {
      validateAmount(params.strategy.operating.target, 'strategy.operating.target', { min: 0 });
      validateAmount(params.strategy.operating.minimum, 'strategy.operating.minimum', { min: 0 });
    }

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<TreasuryAccount>({
      method: 'POST',
      path: '/treasuries',
      body: params,
    });
  }

  /**
   * Get a treasury account by ID
   */
  async get(treasuryId: string): Promise<TreasuryAccount> {
    validateString(treasuryId, 'treasuryId');

    return this.request<TreasuryAccount>({
      method: 'GET',
      path: `/treasuries/${treasuryId}`,
    });
  }

  /**
   * Update a treasury account
   */
  async update(
    treasuryId: string,
    params: UpdateTreasuryParams
  ): Promise<TreasuryAccount> {
    validateString(treasuryId, 'treasuryId');

    if (params.name) {
      validateString(params.name, 'name');
    }

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<TreasuryAccount>({
      method: 'PATCH',
      path: `/treasuries/${treasuryId}`,
      body: params,
    });
  }

  /**
   * List treasury accounts
   */
  async list(
    params?: { organizationId?: string; limit?: number; cursor?: string }
  ): Promise<PaginatedList<TreasuryAccount>> {
    return this.listRequest<TreasuryAccount>('/treasuries', params);
  }

  /**
   * Get treasury overview
   */
  async getOverview(treasuryId: string): Promise<TreasuryOverview> {
    validateString(treasuryId, 'treasuryId');

    return this.request<TreasuryOverview>({
      method: 'GET',
      path: `/treasuries/${treasuryId}/overview`,
    });
  }

  // ==========================================================================
  // Payment Operations
  // ==========================================================================

  /**
   * Execute a payment from treasury
   */
  async pay(
    treasuryId: string,
    params: TreasuryPaymentParams,
    idempotencyKey?: string
  ): Promise<TreasuryPaymentResult> {
    validateString(treasuryId, 'treasuryId');
    validateAddress(params.recipient, 'recipient');
    validateAmount(params.amount, 'amount', { min: 0.01 });

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<TreasuryPaymentResult>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/pay`,
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Deposit funds into treasury
   */
  async deposit(
    treasuryId: string,
    params: {
      amount: number;
      source?: string;
      fund?: TreasuryFundType;
      memo?: string;
    },
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    validateString(treasuryId, 'treasuryId');
    validateAmount(params.amount, 'amount', { min: 0.01 });

    return this.request<TreasuryTransaction>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/deposit`,
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Withdraw funds from treasury
   */
  async withdraw(
    treasuryId: string,
    params: {
      amount: number;
      destination: string;
      fund?: TreasuryFundType;
      memo?: string;
    },
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    validateString(treasuryId, 'treasuryId');
    validateAddress(params.destination, 'destination');
    validateAmount(params.amount, 'amount', { min: 0.01 });

    return this.request<TreasuryTransaction>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/withdraw`,
      body: params,
      idempotencyKey,
    });
  }

  // ==========================================================================
  // Fund Transfers
  // ==========================================================================

  /**
   * Transfer funds between treasury accounts
   */
  async transfer(
    treasuryId: string,
    params: {
      amount: number;
      from: TreasuryFundType;
      to: TreasuryFundType;
      memo?: string;
    },
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    validateString(treasuryId, 'treasuryId');
    validateAmount(params.amount, 'amount', { min: 0.01 });

    return this.request<TreasuryTransaction>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/transfer`,
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Transfer to reserve (USDY)
   */
  async transferToReserve(
    treasuryId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    return this.transfer(
      treasuryId,
      { amount, from: 'operating', to: 'reserve' },
      idempotencyKey
    );
  }

  /**
   * Transfer from reserve (USDY → USDC)
   */
  async transferFromReserve(
    treasuryId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    return this.transfer(
      treasuryId,
      { amount, from: 'reserve', to: 'operating' },
      idempotencyKey
    );
  }

  /**
   * Transfer to vault (locked USDY)
   */
  async transferToVault(
    treasuryId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    return this.transfer(
      treasuryId,
      { amount, from: 'operating', to: 'vault' },
      idempotencyKey
    );
  }

  // ==========================================================================
  // Rebalancing
  // ==========================================================================

  /**
   * Trigger a rebalance
   */
  async rebalance(
    treasuryId: string,
    params?: RebalanceRequest
  ): Promise<RebalanceResult> {
    validateString(treasuryId, 'treasuryId');

    return this.request<RebalanceResult>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/rebalance`,
      body: params,
    });
  }

  /**
   * Get rebalance schedule
   */
  async getRebalanceSchedule(treasuryId: string): Promise<RebalanceSchedule> {
    validateString(treasuryId, 'treasuryId');

    return this.request<RebalanceSchedule>({
      method: 'GET',
      path: `/treasuries/${treasuryId}/rebalance/schedule`,
    });
  }

  /**
   * Update rebalance schedule
   */
  async updateRebalanceSchedule(
    treasuryId: string,
    params: Partial<RebalanceSchedule>
  ): Promise<RebalanceSchedule> {
    validateString(treasuryId, 'treasuryId');

    return this.request<RebalanceSchedule>({
      method: 'PATCH',
      path: `/treasuries/${treasuryId}/rebalance/schedule`,
      body: params,
    });
  }

  // ==========================================================================
  // Transactions
  // ==========================================================================

  /**
   * List treasury transactions
   */
  async listTransactions(
    treasuryId: string,
    params?: ListTreasuryTransactionsParams
  ): Promise<PaginatedList<TreasuryTransaction>> {
    validateString(treasuryId, 'treasuryId');

    return this.listRequest<TreasuryTransaction>(
      `/treasuries/${treasuryId}/transactions`,
      params
    );
  }

  /**
   * Get a specific transaction
   */
  async getTransaction(
    treasuryId: string,
    transactionId: string
  ): Promise<TreasuryTransaction> {
    validateString(treasuryId, 'treasuryId');
    validateString(transactionId, 'transactionId');

    return this.request<TreasuryTransaction>({
      method: 'GET',
      path: `/treasuries/${treasuryId}/transactions/${transactionId}`,
    });
  }

  // ==========================================================================
  // Alerts
  // ==========================================================================

  /**
   * List treasury alerts
   */
  async listAlerts(
    treasuryId: string,
    params?: { acknowledged?: boolean; limit?: number; cursor?: string }
  ): Promise<PaginatedList<TreasuryAlert>> {
    validateString(treasuryId, 'treasuryId');

    return this.listRequest<TreasuryAlert>(
      `/treasuries/${treasuryId}/alerts`,
      params
    );
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    treasuryId: string,
    alertId: string
  ): Promise<TreasuryAlert> {
    validateString(treasuryId, 'treasuryId');
    validateString(alertId, 'alertId');

    return this.request<TreasuryAlert>({
      method: 'POST',
      path: `/treasuries/${treasuryId}/alerts/${alertId}/acknowledge`,
    });
  }
}

// ==========================================================================
// Treasury Helper Class
// ==========================================================================

/**
 * Helper class for treasury management
 */
export class Treasury {
  private readonly treasury: TreasuryResource;
  private readonly treasuryId: string;

  constructor(options: {
    treasury: TreasuryResource;
    treasuryId: string;
  }) {
    this.treasury = options.treasury;
    this.treasuryId = options.treasuryId;
  }

  /**
   * Get treasury overview
   */
  async getOverview(): Promise<TreasuryOverview> {
    return this.treasury.getOverview(this.treasuryId);
  }

  /**
   * Execute a payment
   */
  async pay(
    params: TreasuryPaymentParams,
    idempotencyKey?: string
  ): Promise<TreasuryPaymentResult> {
    return this.treasury.pay(this.treasuryId, params, idempotencyKey);
  }

  /**
   * Transfer to reserve for yield
   */
  async transferToReserve(
    amount: number,
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    return this.treasury.transferToReserve(this.treasuryId, amount, idempotencyKey);
  }

  /**
   * Transfer from reserve
   */
  async transferFromReserve(
    amount: number,
    idempotencyKey?: string
  ): Promise<TreasuryTransaction> {
    return this.treasury.transferFromReserve(this.treasuryId, amount, idempotencyKey);
  }

  /**
   * Trigger rebalance
   */
  async rebalance(params?: RebalanceRequest): Promise<RebalanceResult> {
    return this.treasury.rebalance(this.treasuryId, params);
  }

  /**
   * List transactions
   */
  async listTransactions(
    params?: ListTreasuryTransactionsParams
  ): Promise<PaginatedList<TreasuryTransaction>> {
    return this.treasury.listTransactions(this.treasuryId, params);
  }

  /**
   * List alerts
   */
  async listAlerts(
    params?: { acknowledged?: boolean; limit?: number; cursor?: string }
  ): Promise<PaginatedList<TreasuryAlert>> {
    return this.treasury.listAlerts(this.treasuryId, params);
  }
}
