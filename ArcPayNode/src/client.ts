/**
 * ArcPay Server SDK Main Client
 *
 * The main entry point for interacting with the ArcPay API
 * from your Node.js backend.
 */

import type { ArcPayConfig } from './types';
import { PaymentsResource } from './resources/payments';
import { PaymentIntentsResource } from './resources/paymentIntents';
import { PaymentLinksResource } from './resources/paymentLinks';
import { PlansResource } from './resources/plans';
import { SubscriptionsResource } from './resources/subscriptions';
import { CustomersResource } from './resources/customers';
import { WebhooksResource } from './resources/webhooks';
import {
  runHealthCheck,
  formatHealthReport,
  type HealthCheckReport,
  type HealthCheckOptions,
} from './utils/healthCheck';

export class ArcPayServer {
  /**
   * Payments API
   *
   * Create and manage one-time payments.
   */
  readonly payments: PaymentsResource;

  /**
   * Payment Intents API
   *
   * Create payment intents for client-side completion.
   */
  readonly paymentIntents: PaymentIntentsResource;

  /**
   * Payment Links API
   *
   * Create shareable payment links.
   */
  readonly paymentLinks: PaymentLinksResource;

  /**
   * Plans API
   *
   * Create and manage subscription plans.
   */
  readonly plans: PlansResource;

  /**
   * Subscriptions API
   *
   * Create and manage recurring subscriptions.
   */
  readonly subscriptions: SubscriptionsResource;

  /**
   * Customers API
   *
   * Create and manage customer profiles.
   */
  readonly customers: CustomersResource;

  /**
   * Webhooks API
   *
   * Manage webhook endpoints.
   */
  readonly webhooks: WebhooksResource;

  /**
   * SDK version
   */
  static readonly VERSION = '0.1.0';

  /**
   * Internal configuration reference
   */
  private readonly _config: ArcPayConfig;

  /**
   * Create a new ArcPay Server client
   *
   * @param secretKey - Your ArcPay secret API key (starts with 'sk_')
   * @param config - Optional configuration options
   */
  constructor(secretKey: string, config?: Omit<ArcPayConfig, 'secretKey'>) {
    if (!secretKey) {
      throw new Error('Secret key is required');
    }

    if (!secretKey.startsWith('sk_')) {
      throw new Error('Invalid secret key format. Secret keys start with "sk_"');
    }

    const fullConfig: ArcPayConfig = {
      secretKey,
      ...config,
    };

    this._config = fullConfig;

    // Initialize resources
    this.payments = new PaymentsResource(fullConfig);
    this.paymentIntents = new PaymentIntentsResource(fullConfig);
    this.paymentLinks = new PaymentLinksResource(fullConfig);
    this.plans = new PlansResource(fullConfig);
    this.subscriptions = new SubscriptionsResource(fullConfig);
    this.customers = new CustomersResource(fullConfig);
    this.webhooks = new WebhooksResource(fullConfig);
  }

  /**
   * Run a health check on the SDK configuration and API connectivity
   *
   * @example
   * ```typescript
   * const arcpay = new ArcPay('sk_test_...');
   *
   * // Quick health check
   * const report = await arcpay.healthCheck();
   * console.log(report.overall); // 'healthy' | 'degraded' | 'unhealthy'
   *
   * // Verbose health check with webhook verification
   * const report = await arcpay.healthCheck({
   *   verbose: true,
   *   verifyWebhook: true,
   *   webhookSecret: 'whsec_...'
   * });
   *
   * // Print formatted report
   * console.log(arcpay.formatHealthReport(report));
   * ```
   *
   * @param options - Health check options
   * @returns Health check report with status and diagnostics
   */
  async healthCheck(options?: HealthCheckOptions): Promise<HealthCheckReport> {
    return runHealthCheck(this._config, options);
  }

  /**
   * Format a health check report for console output
   *
   * @param report - Health check report from healthCheck()
   * @returns Formatted string for console output
   */
  formatHealthReport(report: HealthCheckReport): string {
    return formatHealthReport(report);
  }
}

/**
 * Default export
 */
export default ArcPayServer;
