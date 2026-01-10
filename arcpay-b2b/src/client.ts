/**
 * ArcPay B2B Client
 * Main entry point for the B2B SDK
 */

import type { ArcPayB2BConfig } from './types';
import { validateSecretKey } from './utils/validation';
import {
  CreditsResource,
  DisputesResource,
  GatewayResource,
  TreasuryResource,
  WebhooksResource,
  UsageMeter,
  DisputeProtection,
  MerchantGateway,
  Treasury,
} from './resources';

/**
 * Main ArcPay B2B SDK client
 *
 * @example
 * ```typescript
 * import { ArcPayB2B } from '@arcpay/b2b';
 *
 * const arcpay = new ArcPayB2B({
 *   secretKey: 'sk_live_...',
 * });
 *
 * // Create a credit account
 * const account = await arcpay.credits.createAccount({
 *   organizationId: 'org_xxx',
 *   name: 'Main Account',
 * });
 *
 * // Create an invoice
 * const invoice = await arcpay.gateway.createInvoice({
 *   amount: 10000,
 *   reference: 'INV-001',
 *   buyer: { email: 'buyer@example.com' },
 *   lineItems: [{ description: 'Annual License', quantity: 1, unitPrice: 10000 }],
 *   dueDate: new Date('2024-02-01'),
 * });
 * ```
 */
export class ArcPayB2B {
  /**
   * Credits resource for credit account and usage metering operations
   */
  readonly credits: CreditsResource;

  /**
   * Disputes resource for dispute resolution operations
   */
  readonly disputes: DisputesResource;

  /**
   * Gateway resource for invoice and batch payment operations
   */
  readonly gateway: GatewayResource;

  /**
   * Treasury resource for treasury management operations
   */
  readonly treasury: TreasuryResource;

  /**
   * Webhooks resource for webhook management and verification
   */
  readonly webhooks: WebhooksResource;

  /**
   * SDK configuration
   */
  private readonly config: ArcPayB2BConfig;

  constructor(config: ArcPayB2BConfig) {
    // Validate secret key
    validateSecretKey(config.secretKey);

    this.config = config;

    // Initialize resources
    this.credits = new CreditsResource(config);
    this.disputes = new DisputesResource(config);
    this.gateway = new GatewayResource(config);
    this.treasury = new TreasuryResource(config);
    this.webhooks = new WebhooksResource(config);
  }

  // ==========================================================================
  // Helper Factory Methods
  // ==========================================================================

  /**
   * Create a usage meter for an account
   *
   * @example
   * ```typescript
   * const meter = arcpay.createUsageMeter({
   *   accountId: 'acc_xxx',
   *   rateCard: {
   *     api_call: 0.01,
   *     data_export: 0.50,
   *   },
   * });
   *
   * await meter.record('api_call', { count: 100 });
   * ```
   */
  createUsageMeter(options: {
    accountId: string;
    rateCard: Record<string, number | { pricePerUnit: number; unitName?: string }>;
  }): UsageMeter {
    return new UsageMeter({
      credits: this.credits,
      accountId: options.accountId,
      rateCard: options.rateCard,
    });
  }

  /**
   * Create a dispute protection helper for a merchant
   *
   * @example
   * ```typescript
   * const protection = arcpay.createDisputeProtection({
   *   merchantId: 'merch_xxx',
   * });
   *
   * await protection.registerDelivery({
   *   transactionId: 'txn_xxx',
   *   type: 'digital_delivery',
   *   proof: { confirmed: true },
   * });
   * ```
   */
  createDisputeProtection(options: { merchantId: string }): DisputeProtection {
    return new DisputeProtection({
      disputes: this.disputes,
      merchantId: options.merchantId,
    });
  }

  /**
   * Create a merchant gateway helper
   *
   * @example
   * ```typescript
   * const merchantGateway = arcpay.createMerchantGateway({
   *   merchantId: 'merch_xxx',
   * });
   *
   * const invoice = await merchantGateway.createInvoice({
   *   amount: 5000,
   *   reference: 'INV-002',
   *   buyer: { email: 'buyer@example.com' },
   *   lineItems: [{ description: 'Service', quantity: 1, unitPrice: 5000 }],
   *   dueDate: new Date('2024-02-15'),
   * });
   * ```
   */
  createMerchantGateway(options: { merchantId: string }): MerchantGateway {
    return new MerchantGateway({
      gateway: this.gateway,
      merchantId: options.merchantId,
    });
  }

  /**
   * Create a treasury helper
   *
   * @example
   * ```typescript
   * const treasury = arcpay.createTreasury({
   *   treasuryId: 'tres_xxx',
   * });
   *
   * const overview = await treasury.getOverview();
   * await treasury.pay({
   *   recipient: '0x...',
   *   amount: 5000,
   *   memo: 'Vendor payment',
   * });
   * ```
   */
  createTreasury(options: { treasuryId: string }): Treasury {
    return new Treasury({
      treasury: this.treasury,
      treasuryId: options.treasuryId,
    });
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Perform a health check on the SDK configuration
   */
  async healthCheck(): Promise<{
    ok: boolean;
    checks: {
      name: string;
      status: 'pass' | 'fail';
      message?: string;
    }[];
  }> {
    const checks: { name: string; status: 'pass' | 'fail'; message?: string }[] = [];

    // Check API key format
    checks.push({
      name: 'api_key_format',
      status: this.config.secretKey.startsWith('sk_') ? 'pass' : 'fail',
      message: this.config.secretKey.startsWith('sk_')
        ? undefined
        : 'Secret key should start with "sk_"',
    });

    // Check API connectivity
    try {
      await this.credits.listAccounts({ limit: 1 });
      checks.push({
        name: 'api_connectivity',
        status: 'pass',
      });
    } catch (error) {
      checks.push({
        name: 'api_connectivity',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const ok = checks.every((check) => check.status === 'pass');

    return { ok, checks };
  }
}

// Default export
export default ArcPayB2B;
