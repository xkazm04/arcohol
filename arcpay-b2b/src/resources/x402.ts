/**
 * x402 Resource
 *
 * Resource for Circle Gateway x402 integration supporting gasless
 * micropayments and cross-chain treasury operations.
 *
 * @example
 * ```typescript
 * import { ArcPayB2B } from '@arcpay/b2b';
 *
 * const arcpay = new ArcPayB2B({ secretKey: 'sk_...' });
 *
 * // Get Gateway balance
 * const balance = await arcpay.x402.getBalance('0x...');
 *
 * // Cross-chain withdrawal
 * const withdrawal = await arcpay.x402.crossChainWithdraw({
 *   amount: '1000.00',
 *   sourceChain: 'arc',
 *   destinationChain: 'base',
 *   recipient: '0x...',
 * });
 *
 * // Verify a payment
 * const result = await arcpay.x402.verifyPayment(payload, requirements);
 * ```
 */

import { BaseResource } from './base';
import type {
  GatewayBalance,
  CombinedBalances,
  SupportedNetwork,
  PaymentRequirements,
  PaymentPayload,
  VerifyResult,
  SettleResult,
  CrossChainWithdrawParams,
  CrossChainWithdrawResult,
  GatewaySellerConfig,
  UpsertSellerConfigParams,
  GatewayPayment,
  ListGatewayPaymentsParams,
} from '../types/x402';
import type { PaginatedList, Chain } from '../types';

// ==========================================================================
// Constants
// ==========================================================================

/**
 * Supported networks for x402 Gateway
 */
export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  // Testnets with batching
  {
    chainId: 5042002,
    network: 'eip155:5042002',
    name: 'Arc Testnet',
    batchingEnabled: true,
    usdcAddress: '0x...',
    gatewayAddress: '0x...',
  },
  // Testnets for deposits/withdrawals
  {
    chainId: 84532,
    network: 'eip155:84532',
    name: 'Base Sepolia',
    batchingEnabled: false,
    usdcAddress: '0x...',
  },
  {
    chainId: 11155111,
    network: 'eip155:11155111',
    name: 'Ethereum Sepolia',
    batchingEnabled: false,
    usdcAddress: '0x...',
  },
  // Mainnets
  {
    chainId: 8453,
    network: 'eip155:8453',
    name: 'Base',
    batchingEnabled: false,
    usdcAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  },
  {
    chainId: 42161,
    network: 'eip155:42161',
    name: 'Arbitrum One',
    batchingEnabled: false,
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  {
    chainId: 137,
    network: 'eip155:137',
    name: 'Polygon PoS',
    batchingEnabled: false,
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  {
    chainId: 10,
    network: 'eip155:10',
    name: 'Optimism',
    batchingEnabled: false,
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
];

// ==========================================================================
// X402Resource
// ==========================================================================

export class X402Resource extends BaseResource {
  // ========================================================================
  // Balance Operations
  // ========================================================================

  /**
   * Get Gateway balance for an address
   *
   * @param address - Wallet address to check balance for
   * @returns Gateway balance breakdown
   *
   * @example
   * ```typescript
   * const balance = await arcpay.x402.getBalance('0x...');
   * console.log(`Available: ${balance.formatted.available}`);
   * ```
   */
  async getBalance(address: string): Promise<GatewayBalance> {
    return this.request<GatewayBalance>({
      method: 'GET',
      path: `/x402/balances/${address}`,
    });
  }

  /**
   * Get combined wallet and Gateway balances
   *
   * @param address - Wallet address to check
   * @param chain - Chain to check wallet balance on
   * @returns Combined balances
   */
  async getCombinedBalances(address: string, chain: Chain): Promise<CombinedBalances> {
    return this.request<CombinedBalances>({
      method: 'GET',
      path: `/x402/balances/${address}/combined`,
      query: { chain },
    });
  }

  // ========================================================================
  // Network Support
  // ========================================================================

  /**
   * Get supported networks for deposits and withdrawals
   *
   * @returns List of supported networks
   */
  async getSupportedNetworks(): Promise<SupportedNetwork[]> {
    // Return static list for now, could be API-driven in future
    return SUPPORTED_NETWORKS;
  }

  /**
   * Get networks that support gasless batching
   *
   * @returns List of batching-enabled networks
   */
  async getBatchingNetworks(): Promise<SupportedNetwork[]> {
    return SUPPORTED_NETWORKS.filter(n => n.batchingEnabled);
  }

  // ========================================================================
  // Payment Verification & Settlement
  // ========================================================================

  /**
   * Verify a payment signature
   *
   * @param payload - Payment payload from buyer
   * @param requirements - Payment requirements
   * @returns Verification result
   *
   * @example
   * ```typescript
   * const result = await arcpay.x402.verifyPayment(payload, requirements);
   * if (result.isValid) {
   *   console.log(`Payment from ${result.payer} is valid`);
   * }
   * ```
   */
  async verifyPayment(
    payload: PaymentPayload,
    requirements: PaymentRequirements
  ): Promise<VerifyResult> {
    return this.request<VerifyResult>({
      method: 'POST',
      path: '/x402/verify',
      body: { payload, requirements },
    });
  }

  /**
   * Settle a payment
   *
   * @param payload - Payment payload from buyer
   * @param requirements - Payment requirements
   * @returns Settlement result
   *
   * @example
   * ```typescript
   * const result = await arcpay.x402.settlePayment(payload, requirements);
   * if (result.success) {
   *   console.log(`Settled: ${result.transaction}`);
   * }
   * ```
   */
  async settlePayment(
    payload: PaymentPayload,
    requirements: PaymentRequirements
  ): Promise<SettleResult> {
    return this.request<SettleResult>({
      method: 'POST',
      path: '/x402/settle',
      body: { payload, requirements },
    });
  }

  // ========================================================================
  // Cross-Chain Withdrawal
  // ========================================================================

  /**
   * Initiate a cross-chain withdrawal
   *
   * Withdraws USDC from Gateway on source chain and mints on destination chain.
   * The recipient will receive USDC on the destination chain.
   *
   * @param params - Withdrawal parameters
   * @param idempotencyKey - Optional idempotency key
   * @returns Withdrawal result
   *
   * @example
   * ```typescript
   * const withdrawal = await arcpay.x402.crossChainWithdraw({
   *   amount: '1000.00',
   *   sourceChain: 'arc',
   *   destinationChain: 'base',
   *   recipient: '0x...',
   * });
   *
   * console.log(`Withdrawal ${withdrawal.id}: ${withdrawal.status}`);
   * ```
   */
  async crossChainWithdraw(
    params: CrossChainWithdrawParams,
    idempotencyKey?: string
  ): Promise<CrossChainWithdrawResult> {
    return this.request<CrossChainWithdrawResult>({
      method: 'POST',
      path: '/x402/withdrawals/cross-chain',
      body: params,
      idempotencyKey,
    });
  }

  /**
   * Get cross-chain withdrawal status
   *
   * @param withdrawalId - Withdrawal ID
   * @returns Withdrawal status
   */
  async getWithdrawalStatus(withdrawalId: string): Promise<CrossChainWithdrawResult> {
    return this.request<CrossChainWithdrawResult>({
      method: 'GET',
      path: `/x402/withdrawals/${withdrawalId}`,
    });
  }

  /**
   * List cross-chain withdrawals
   *
   * @param params - Filter parameters
   * @returns Paginated list of withdrawals
   */
  async listWithdrawals(params?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    sourceChain?: Chain;
    destinationChain?: Chain;
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedList<CrossChainWithdrawResult>> {
    return this.listRequest<CrossChainWithdrawResult>('/x402/withdrawals', params);
  }

  // ========================================================================
  // Seller Configuration
  // ========================================================================

  /**
   * Get Gateway seller configuration for organization
   *
   * @param organizationId - Organization ID
   * @returns Seller configuration
   */
  async getSellerConfig(organizationId: string): Promise<GatewaySellerConfig | null> {
    try {
      return await this.request<GatewaySellerConfig>({
        method: 'GET',
        path: `/x402/config/${organizationId}`,
      });
    } catch (error) {
      // Return null if not found
      if ((error as { statusCode?: number }).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create or update Gateway seller configuration
   *
   * @param organizationId - Organization ID
   * @param params - Configuration parameters
   * @returns Updated configuration
   */
  async upsertSellerConfig(
    organizationId: string,
    params: UpsertSellerConfigParams
  ): Promise<GatewaySellerConfig> {
    return this.request<GatewaySellerConfig>({
      method: 'PUT',
      path: `/x402/config/${organizationId}`,
      body: params,
    });
  }

  // ========================================================================
  // Payment History
  // ========================================================================

  /**
   * List Gateway payments received
   *
   * @param organizationId - Organization ID
   * @param params - Filter parameters
   * @returns Paginated list of payments
   */
  async listPayments(
    organizationId: string,
    params?: ListGatewayPaymentsParams
  ): Promise<PaginatedList<GatewayPayment>> {
    return this.listRequest<GatewayPayment>(
      `/x402/payments/${organizationId}`,
      params
    );
  }

  /**
   * Get a specific Gateway payment
   *
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<GatewayPayment> {
    return this.request<GatewayPayment>({
      method: 'GET',
      path: `/x402/payments/detail/${paymentId}`,
    });
  }
}

// ==========================================================================
// X402Gateway Helper Class
// ==========================================================================

/**
 * Helper class for organization-scoped x402 operations
 *
 * @example
 * ```typescript
 * const gateway = arcpay.createX402Gateway({
 *   organizationId: 'org_xxx',
 *   sellerAddress: '0x...',
 * });
 *
 * // Get configuration
 * const config = await gateway.getConfig();
 *
 * // List payments
 * const payments = await gateway.listPayments({ limit: 10 });
 *
 * // Cross-chain withdraw
 * const withdrawal = await gateway.withdraw({
 *   amount: '500.00',
 *   destinationChain: 'base',
 * });
 * ```
 */
export class X402Gateway {
  private readonly x402: X402Resource;
  private readonly organizationId: string;
  private readonly sellerAddress: string;

  constructor(options: {
    x402: X402Resource;
    organizationId: string;
    sellerAddress: string;
  }) {
    this.x402 = options.x402;
    this.organizationId = options.organizationId;
    this.sellerAddress = options.sellerAddress;
  }

  /**
   * Get seller configuration
   */
  async getConfig(): Promise<GatewaySellerConfig | null> {
    return this.x402.getSellerConfig(this.organizationId);
  }

  /**
   * Update seller configuration
   */
  async updateConfig(params: Omit<UpsertSellerConfigParams, 'sellerAddress'>): Promise<GatewaySellerConfig> {
    return this.x402.upsertSellerConfig(this.organizationId, {
      ...params,
      sellerAddress: this.sellerAddress,
    });
  }

  /**
   * Get current Gateway balance
   */
  async getBalance(): Promise<GatewayBalance> {
    return this.x402.getBalance(this.sellerAddress);
  }

  /**
   * List received payments
   */
  async listPayments(params?: Omit<ListGatewayPaymentsParams, 'organizationId'>): Promise<PaginatedList<GatewayPayment>> {
    return this.x402.listPayments(this.organizationId, params);
  }

  /**
   * Withdraw to another chain
   */
  async withdraw(params: {
    amount: string;
    destinationChain: Chain;
    recipient?: string;
  }): Promise<CrossChainWithdrawResult> {
    return this.x402.crossChainWithdraw({
      amount: params.amount,
      sourceChain: 'arc', // Default source
      destinationChain: params.destinationChain,
      recipient: params.recipient || this.sellerAddress,
    });
  }
}
