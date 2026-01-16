/**
 * USDY Resource
 * Handles USDY yield management operations
 */

import { BaseResource } from './base';
import type { PaginatedList } from '../types/common';
import type {
  UsdyStats,
  UsdyTransaction,
  DepositParams,
  WithdrawParams,
  ListUsdyTransactionsParams,
  AutomationRule,
  CreateAutomationRuleParams,
  UpdateAutomationRuleParams,
  AutomationLog,
  TriggerRuleParams,
  YieldAccrual,
  ApyHistoryEntry,
  ListYieldHistoryParams,
} from '../types/usdy';
import { validateAmount, validateString } from '../utils/validation';

/**
 * USDY Resource for yield management operations
 *
 * @example
 * ```typescript
 * const arcpay = new ArcPayB2B({ secretKey: 'sk_...' });
 *
 * // Get USDY stats
 * const stats = await arcpay.usdy.getStats();
 *
 * // Deposit to USDY
 * const deposit = await arcpay.usdy.deposit({ amount: 10000 });
 *
 * // Create automation rule
 * const rule = await arcpay.usdy.createAutomationRule({
 *   name: 'Revenue Split',
 *   type: 'percentage',
 *   config: { percentage: 30, sourceAccount: 'subscription_revenue' },
 * });
 * ```
 */
export class UsdyResource extends BaseResource {
  // ==========================================================================
  // Stats
  // ==========================================================================

  /**
   * Get USDY yield statistics
   */
  async getStats(): Promise<UsdyStats> {
    return this.request<UsdyStats>({
      method: 'GET',
      path: '/usdy/stats',
    });
  }

  // ==========================================================================
  // Deposit & Withdraw
  // ==========================================================================

  /**
   * Deposit USDC to USDY (earn yield)
   *
   * @example
   * ```typescript
   * const result = await arcpay.usdy.deposit({
   *   amount: 10000,
   *   source: 'operating_balance',
   * });
   * ```
   */
  async deposit(params: DepositParams): Promise<UsdyTransaction> {
    validateAmount(params.amount, 'amount', { min: 0.01 });

    return this.request<UsdyTransaction>({
      method: 'POST',
      path: '/usdy/deposit',
      body: params,
      idempotencyKey: params.idempotencyKey,
    });
  }

  /**
   * Withdraw USDY to USDC (exit yield)
   *
   * @example
   * ```typescript
   * const result = await arcpay.usdy.withdraw({
   *   amount: 5000,
   *   destination: 'operating_balance',
   * });
   * ```
   */
  async withdraw(params: WithdrawParams): Promise<UsdyTransaction> {
    validateAmount(params.amount, 'amount', { min: 0.01 });

    return this.request<UsdyTransaction>({
      method: 'POST',
      path: '/usdy/withdraw',
      body: params,
      idempotencyKey: params.idempotencyKey,
    });
  }

  // ==========================================================================
  // Transactions
  // ==========================================================================

  /**
   * List USDY transactions
   *
   * @example
   * ```typescript
   * const { data, hasMore } = await arcpay.usdy.listTransactions({
   *   type: 'deposit',
   *   limit: 20,
   * });
   * ```
   */
  async listTransactions(
    params?: ListUsdyTransactionsParams
  ): Promise<PaginatedList<UsdyTransaction>> {
    return this.request<PaginatedList<UsdyTransaction>>({
      method: 'GET',
      path: '/usdy/transactions',
      query: params as unknown as Record<string, unknown>,
    });
  }

  // ==========================================================================
  // Automation Rules
  // ==========================================================================

  /**
   * List automation rules
   *
   * @example
   * ```typescript
   * const { rules } = await arcpay.usdy.listAutomationRules();
   * ```
   */
  async listAutomationRules(): Promise<{ rules: AutomationRule[] }> {
    return this.request<{ rules: AutomationRule[] }>({
      method: 'GET',
      path: '/usdy/automation-rules',
    });
  }

  /**
   * Get a single automation rule
   */
  async getAutomationRule(id: string): Promise<{ rule: AutomationRule }> {
    validateString(id, 'id');

    return this.request<{ rule: AutomationRule }>({
      method: 'GET',
      path: `/usdy/automation-rules/${id}`,
    });
  }

  /**
   * Create an automation rule
   *
   * @example
   * ```typescript
   * // Percentage-based rule (deposit X% of subscription revenue)
   * const rule = await arcpay.usdy.createAutomationRule({
   *   name: 'Subscription Revenue Split',
   *   type: 'percentage',
   *   config: {
   *     percentage: 30,
   *     sourceAccount: 'subscription_revenue',
   *   },
   * });
   *
   * // Threshold-based rule (sweep when balance exceeds threshold)
   * const sweepRule = await arcpay.usdy.createAutomationRule({
   *   name: 'Balance Sweep',
   *   type: 'threshold',
   *   config: {
   *     threshold: 100000,
   *     targetBalance: 50000,
   *     sourceAccount: 'operating_balance',
   *   },
   * });
   *
   * // Scheduled rule
   * const scheduledRule = await arcpay.usdy.createAutomationRule({
   *   name: 'Weekly Deposit',
   *   type: 'scheduled',
   *   config: {
   *     schedule: '0 9 * * MON',
   *     percentage: 20,
   *   },
   * });
   * ```
   */
  async createAutomationRule(
    params: CreateAutomationRuleParams
  ): Promise<{ rule: AutomationRule }> {
    validateString(params.name, 'name');
    validateString(params.type, 'type');

    return this.request<{ rule: AutomationRule }>({
      method: 'POST',
      path: '/usdy/automation-rules',
      body: params,
    });
  }

  /**
   * Update an automation rule
   */
  async updateAutomationRule(
    id: string,
    params: UpdateAutomationRuleParams
  ): Promise<{ rule: AutomationRule }> {
    validateString(id, 'id');

    return this.request<{ rule: AutomationRule }>({
      method: 'PATCH',
      path: `/usdy/automation-rules/${id}`,
      body: params,
    });
  }

  /**
   * Delete an automation rule
   */
  async deleteAutomationRule(id: string): Promise<{ success: boolean }> {
    validateString(id, 'id');

    return this.request<{ success: boolean }>({
      method: 'DELETE',
      path: `/usdy/automation-rules/${id}`,
    });
  }

  /**
   * Toggle an automation rule on/off
   *
   * @example
   * ```typescript
   * // Disable a rule
   * await arcpay.usdy.toggleAutomationRule('rule_xxx', false);
   *
   * // Enable a rule
   * await arcpay.usdy.toggleAutomationRule('rule_xxx', true);
   * ```
   */
  async toggleAutomationRule(
    id: string,
    enabled: boolean
  ): Promise<{ rule: AutomationRule }> {
    return this.updateAutomationRule(id, { enabled });
  }

  /**
   * Manually trigger an automation rule
   *
   * @example
   * ```typescript
   * // Trigger with calculated amount
   * const log = await arcpay.usdy.triggerRule('rule_xxx');
   *
   * // Trigger with custom amount
   * const log = await arcpay.usdy.triggerRule('rule_xxx', { amount: 5000 });
   * ```
   */
  async triggerRule(
    id: string,
    params?: TriggerRuleParams
  ): Promise<{ success: boolean; log: AutomationLog; message: string }> {
    validateString(id, 'id');

    return this.request<{ success: boolean; log: AutomationLog; message: string }>({
      method: 'POST',
      path: `/usdy/automation-rules/${id}/trigger`,
      body: params || {},
    });
  }

  // ==========================================================================
  // Yield History
  // ==========================================================================

  /**
   * Get yield accrual history
   *
   * @example
   * ```typescript
   * const { data } = await arcpay.usdy.getYieldHistory({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   * });
   * ```
   */
  async getYieldHistory(
    params?: ListYieldHistoryParams
  ): Promise<PaginatedList<YieldAccrual>> {
    return this.request<PaginatedList<YieldAccrual>>({
      method: 'GET',
      path: '/usdy/yield-history',
      query: params as unknown as Record<string, unknown>,
    });
  }

  /**
   * Get APY history
   */
  async getApyHistory(
    params?: { startDate?: string; endDate?: string; chain?: string }
  ): Promise<{ data: ApyHistoryEntry[] }> {
    return this.request<{ data: ApyHistoryEntry[] }>({
      method: 'GET',
      path: '/usdy/apy-history',
      query: params as unknown as Record<string, unknown>,
    });
  }
}

// ==========================================================================
// Helper Class
// ==========================================================================

/**
 * USDY Helper for simplified yield management
 *
 * @example
 * ```typescript
 * const usdy = arcpay.createUsdy({ treasuryId: 'tres_xxx' });
 *
 * // Get stats
 * const stats = await usdy.getStats();
 *
 * // Quick deposit
 * await usdy.deposit(10000);
 *
 * // Create and trigger a rule
 * const rule = await usdy.createPercentageRule({
 *   name: 'Revenue Split',
 *   percentage: 30,
 * });
 * await usdy.trigger(rule.id);
 * ```
 */
export class Usdy {
  private readonly resource: UsdyResource;

  constructor(options: { usdy: UsdyResource; treasuryId: string }) {
    this.resource = options.usdy;
    // treasuryId reserved for future treasury-scoped operations
    void options.treasuryId;
  }

  /**
   * Get USDY stats
   */
  async getStats(): Promise<UsdyStats> {
    return this.resource.getStats();
  }

  /**
   * Deposit to USDY
   */
  async deposit(amount: number, source?: string): Promise<UsdyTransaction> {
    const result = await this.resource.deposit({ amount, source });
    return result;
  }

  /**
   * Withdraw from USDY
   */
  async withdraw(amount: number, destination?: string): Promise<UsdyTransaction> {
    const result = await this.resource.withdraw({ amount, destination });
    return result;
  }

  /**
   * Create a percentage-based automation rule
   */
  async createPercentageRule(options: {
    name: string;
    percentage: number;
    sourceAccount?: string;
    description?: string;
  }): Promise<AutomationRule> {
    const { rule } = await this.resource.createAutomationRule({
      name: options.name,
      description: options.description,
      type: 'percentage',
      config: {
        percentage: options.percentage,
        sourceAccount: options.sourceAccount,
      },
    });
    return rule;
  }

  /**
   * Create a threshold-based automation rule
   */
  async createThresholdRule(options: {
    name: string;
    threshold: number;
    targetBalance?: number;
    sourceAccount?: string;
    description?: string;
  }): Promise<AutomationRule> {
    const { rule } = await this.resource.createAutomationRule({
      name: options.name,
      description: options.description,
      type: 'threshold',
      config: {
        threshold: options.threshold,
        targetBalance: options.targetBalance,
        sourceAccount: options.sourceAccount,
      },
    });
    return rule;
  }

  /**
   * Manually trigger a rule
   */
  async trigger(ruleId: string, amount?: number): Promise<AutomationLog> {
    const result = await this.resource.triggerRule(ruleId, amount ? { amount } : undefined);
    return result.log;
  }

  /**
   * List all automation rules
   */
  async listRules(): Promise<AutomationRule[]> {
    const { rules } = await this.resource.listAutomationRules();
    return rules;
  }

  /**
   * Toggle a rule on/off
   */
  async toggle(ruleId: string, enabled: boolean): Promise<AutomationRule> {
    const { rule } = await this.resource.toggleAutomationRule(ruleId, enabled);
    return rule;
  }
}
