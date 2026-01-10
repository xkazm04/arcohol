/**
 * Credits Resource
 * Direction 1: B2B Credit & Billing System
 */

import { BaseResource } from './base';
import type {
  ArcPayB2BConfig,
  PaginatedList,
  CreditAccount,
  CreateCreditAccountParams,
  UpdateCreditAccountParams,
  ListCreditAccountsParams,
  DepositParams,
  Deposit,
  BalanceSnapshot,
  TransferToYieldParams,
  TransferFromYieldParams,
  RateCard,
  UsageRecord,
  RecordUsageParams,
  UsageSummary,
  ListUsageParams,
} from '../types';
import {
  validateString,
  validateAmount,
  validateOptional,
  validateMetadata,
} from '../utils/validation';

export class CreditsResource extends BaseResource {
  constructor(config: ArcPayB2BConfig) {
    super(config);
  }

  // ==========================================================================
  // Credit Account Operations
  // ==========================================================================

  /**
   * Create a new credit account
   */
  async createAccount(params: CreateCreditAccountParams): Promise<CreditAccount> {
    validateString(params.organizationId, 'organizationId');
    validateString(params.name, 'name');

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<CreditAccount>({
      method: 'POST',
      path: '/credit-accounts',
      body: params,
    });
  }

  /**
   * Retrieve a credit account
   */
  async getAccount(accountId: string): Promise<CreditAccount> {
    validateString(accountId, 'accountId');

    return this.request<CreditAccount>({
      method: 'GET',
      path: `/credit-accounts/${accountId}`,
    });
  }

  /**
   * Update a credit account
   */
  async updateAccount(
    accountId: string,
    params: UpdateCreditAccountParams
  ): Promise<CreditAccount> {
    validateString(accountId, 'accountId');

    if (params.name) {
      validateString(params.name, 'name');
    }

    if (params.metadata) {
      validateMetadata(params.metadata, 'metadata');
    }

    return this.request<CreditAccount>({
      method: 'PATCH',
      path: `/credit-accounts/${accountId}`,
      body: params,
    });
  }

  /**
   * List credit accounts
   */
  async listAccounts(
    params?: ListCreditAccountsParams
  ): Promise<PaginatedList<CreditAccount>> {
    return this.listRequest<CreditAccount>('/credit-accounts', params);
  }

  // ==========================================================================
  // Balance Operations
  // ==========================================================================

  /**
   * Get account balance snapshot
   */
  async getBalance(accountId: string): Promise<BalanceSnapshot> {
    validateString(accountId, 'accountId');

    return this.request<BalanceSnapshot>({
      method: 'GET',
      path: `/credit-accounts/${accountId}/balance`,
    });
  }

  /**
   * Deposit funds into account
   */
  async deposit(
    accountId: string,
    params: DepositParams,
    idempotencyKey?: string
  ): Promise<Deposit> {
    validateString(accountId, 'accountId');
    validateAmount(params.amount, 'amount', { min: 1 });

    return this.request<Deposit>({
      method: 'POST',
      path: `/credit-accounts/${accountId}/deposits`,
      body: params,
      idempotencyKey,
    });
  }

  /**
   * List deposits for an account
   */
  async listDeposits(
    accountId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<PaginatedList<Deposit>> {
    validateString(accountId, 'accountId');

    return this.listRequest<Deposit>(
      `/credit-accounts/${accountId}/deposits`,
      params
    );
  }

  /**
   * Transfer funds to yield vault
   */
  async transferToYield(
    accountId: string,
    params: TransferToYieldParams,
    idempotencyKey?: string
  ): Promise<BalanceSnapshot> {
    validateString(accountId, 'accountId');
    validateAmount(params.amount, 'amount', { min: 1 });

    return this.request<BalanceSnapshot>({
      method: 'POST',
      path: `/credit-accounts/${accountId}/transfer-to-yield`,
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Transfer funds from yield vault
   */
  async transferFromYield(
    accountId: string,
    params: TransferFromYieldParams,
    idempotencyKey?: string
  ): Promise<BalanceSnapshot> {
    validateString(accountId, 'accountId');
    validateAmount(params.amount, 'amount', { min: 1 });

    return this.request<BalanceSnapshot>({
      method: 'POST',
      path: `/credit-accounts/${accountId}/transfer-from-yield`,
      body: params,
      idempotencyKey,
    });
  }

  // ==========================================================================
  // Usage Metering
  // ==========================================================================

  /**
   * Record usage event
   */
  async recordUsage(
    accountId: string,
    params: RecordUsageParams,
    idempotencyKey?: string
  ): Promise<UsageRecord> {
    validateString(accountId, 'accountId');
    validateString(params.meter, 'meter');

    if (params.count !== undefined) {
      validateAmount(params.count, 'count', { min: 1 });
    }

    return this.request<UsageRecord>({
      method: 'POST',
      path: `/credit-accounts/${accountId}/usage`,
      body: {
        ...params,
        count: params.count ?? 1,
      },
      idempotencyKey: idempotencyKey || params.idempotencyKey,
    });
  }

  /**
   * Get usage summary for current period
   */
  async getUsageSummary(
    accountId: string,
    period?: string
  ): Promise<UsageSummary> {
    validateString(accountId, 'accountId');

    return this.request<UsageSummary>({
      method: 'GET',
      path: `/credit-accounts/${accountId}/usage/summary`,
      query: period ? { period } : undefined,
    });
  }

  /**
   * List usage records
   */
  async listUsage(params: ListUsageParams): Promise<PaginatedList<UsageRecord>> {
    validateString(params.accountId, 'accountId');

    return this.listRequest<UsageRecord>(
      `/credit-accounts/${params.accountId}/usage`,
      params
    );
  }

  // ==========================================================================
  // Rate Cards
  // ==========================================================================

  /**
   * Get rate card for an account
   */
  async getRateCard(accountId: string): Promise<RateCard> {
    validateString(accountId, 'accountId');

    return this.request<RateCard>({
      method: 'GET',
      path: `/credit-accounts/${accountId}/rate-card`,
    });
  }

  /**
   * Update rate card for an account
   */
  async updateRateCard(
    accountId: string,
    rates: Record<string, { pricePerUnit: number; unitName: string }>
  ): Promise<RateCard> {
    validateString(accountId, 'accountId');

    return this.request<RateCard>({
      method: 'PUT',
      path: `/credit-accounts/${accountId}/rate-card`,
      body: { rates },
    });
  }
}

// ==========================================================================
// Usage Meter Helper Class
// ==========================================================================

/**
 * Helper class for easy usage metering in application code
 */
export class UsageMeter {
  private readonly credits: CreditsResource;
  private readonly accountId: string;
  private readonly rateCard: Record<
    string,
    { pricePerUnit: number; unitName: string }
  >;

  constructor(options: {
    credits: CreditsResource;
    accountId: string;
    rateCard: Record<string, number | { pricePerUnit: number; unitName?: string }>;
  }) {
    this.credits = options.credits;
    this.accountId = options.accountId;

    // Normalize rate card
    this.rateCard = {};
    for (const [meter, rate] of Object.entries(options.rateCard)) {
      if (typeof rate === 'number') {
        this.rateCard[meter] = { pricePerUnit: rate, unitName: 'unit' };
      } else {
        this.rateCard[meter] = {
          pricePerUnit: rate.pricePerUnit,
          unitName: rate.unitName || 'unit',
        };
      }
    }
  }

  /**
   * Record a usage event
   */
  async record(
    meter: string,
    options?: {
      count?: number;
      metadata?: Record<string, string | number | boolean>;
      idempotencyKey?: string;
    }
  ): Promise<UsageRecord> {
    return this.credits.recordUsage(
      this.accountId,
      {
        meter,
        count: options?.count ?? 1,
        metadata: options?.metadata,
        idempotencyKey: options?.idempotencyKey,
      },
      options?.idempotencyKey
    );
  }

  /**
   * Get usage summary for current period
   */
  async getSummary(period?: string): Promise<UsageSummary> {
    return this.credits.getUsageSummary(this.accountId, period);
  }

  /**
   * Get current balance
   */
  async getBalance(): Promise<BalanceSnapshot> {
    return this.credits.getBalance(this.accountId);
  }
}
