import type {
  X402ClientConfig,
  X402PaymentRequirement,
  X402PaymentSignature,
  X402PaymentInfo,
  X402BudgetWarning,
  X402Wallet,
  X402Chain,
} from '../types';
import {
  parsePaymentRequirement,
  encodePaymentSignature,
  isExpired,
} from '../utils';

/**
 * Headless x402 client for making payments (for AI agents or server-side)
 *
 * @example
 * ```typescript
 * import { X402Client } from '@arcpay/x402/client';
 *
 * const client = new X402Client({
 *   wallet: agentWallet,
 *   budget: { daily: 100, perRequest: 1 }
 * });
 *
 * const response = await client.fetch('https://api.example.com/data');
 * ```
 */
export class X402Client {
  private wallet: X402Wallet;
  private budget: X402ClientConfig['budget'];
  private autoApprove: X402ClientConfig['autoApprove'];
  private facilitator?: string;
  private onPayment?: (payment: X402PaymentInfo) => void;
  private onBudgetWarning?: (warning: X402BudgetWarning) => void;

  // Budget tracking
  private dailySpending: number = 0;
  private lastResetDate: string = new Date().toISOString().split('T')[0];
  private endpointSpending: Map<string, number> = new Map();

  constructor(config: X402ClientConfig) {
    this.wallet = config.wallet;
    this.budget = config.budget;
    this.autoApprove = config.autoApprove;
    this.facilitator = config.facilitator;
    this.onPayment = config.onPayment;
    this.onBudgetWarning = config.onBudgetWarning;
  }

  /**
   * Fetch with automatic x402 payment handling
   */
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    // Reset daily budget if new day
    this.checkDailyReset();

    // Make initial request
    const response = await fetch(url, init);

    // If not 402, return as-is
    if (response.status !== 402) {
      return response;
    }

    // Parse payment requirement
    const paymentHeader = response.headers.get('x-payment-required');
    if (!paymentHeader) {
      throw new X402Error('402 response missing payment requirement header');
    }

    const requirement = parsePaymentRequirement(paymentHeader);

    // Check if expired
    if (isExpired(requirement.expiresAt)) {
      throw new X402Error('Payment requirement expired');
    }

    // Check budget
    const amount = parseFloat(requirement.amount);
    await this.checkBudget(amount, new URL(url).hostname);

    // Check auto-approve
    if (!this.shouldAutoApprove(amount, url)) {
      throw new X402PaymentRequiredError(requirement);
    }

    // Create and sign payment
    const signature = await this.createPaymentSignature(requirement);

    // Retry with payment
    const retryResponse = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        'X-Payment-Signature': encodePaymentSignature(signature),
      },
    });

    if (retryResponse.ok) {
      // Track spending
      this.trackSpending(amount, new URL(url).hostname);

      // Call callback
      if (this.onPayment) {
        this.onPayment({
          paymentId: requirement.paymentId,
          amount: requirement.amount,
          currency: requirement.currency,
          recipient: requirement.recipient,
          chain: this.wallet.chain,
          endpoint: url,
          timestamp: Date.now(),
        });
      }
    }

    return retryResponse;
  }

  /**
   * Check and reset daily budget if new day
   */
  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastResetDate) {
      this.dailySpending = 0;
      this.endpointSpending.clear();
      this.lastResetDate = today;
    }
  }

  /**
   * Check if payment is within budget
   */
  private async checkBudget(amount: number, endpoint: string): Promise<void> {
    if (!this.budget) return;

    // Check per-request limit
    if (this.budget.perRequest && amount > this.budget.perRequest) {
      throw new X402BudgetError(`Amount ${amount} exceeds per-request limit ${this.budget.perRequest}`);
    }

    // Check daily limit
    if (this.budget.daily) {
      const projectedDaily = this.dailySpending + amount;
      if (projectedDaily > this.budget.daily) {
        throw new X402BudgetError(`Payment would exceed daily limit of ${this.budget.daily}`);
      }

      // Warn at 80%
      if (projectedDaily > this.budget.daily * 0.8) {
        this.onBudgetWarning?.({
          type: 'daily_limit_approaching',
          current: projectedDaily,
          limit: this.budget.daily,
        });
      }
    }

    // Check per-endpoint limit
    if (this.budget.perEndpoint?.[endpoint]) {
      const endpointLimit = this.budget.perEndpoint[endpoint];
      const endpointSpent = this.endpointSpending.get(endpoint) || 0;
      if (endpointSpent + amount > endpointLimit) {
        throw new X402BudgetError(`Payment would exceed endpoint limit for ${endpoint}`);
      }
    }
  }

  /**
   * Check if payment should be auto-approved
   */
  private shouldAutoApprove(amount: number, url: string): boolean {
    if (!this.autoApprove) return false;

    // Check amount
    if (amount > this.autoApprove.maxAmount) return false;

    // Check allowed endpoints
    if (this.autoApprove.allowedEndpoints) {
      const hostname = new URL(url).hostname;
      const isAllowed = this.autoApprove.allowedEndpoints.some(
        (e) => hostname === e || hostname.endsWith(`.${e}`)
      );
      if (!isAllowed) return false;
    }

    return true;
  }

  /**
   * Track spending for budget
   */
  private trackSpending(amount: number, endpoint: string): void {
    this.dailySpending += amount;
    const current = this.endpointSpending.get(endpoint) || 0;
    this.endpointSpending.set(endpoint, current + amount);
  }

  /**
   * Create payment signature
   */
  private async createPaymentSignature(
    requirement: X402PaymentRequirement
  ): Promise<X402PaymentSignature> {
    // For now, use EIP-712 permit signing
    // In production, this would create an actual permit or authorization
    const message = JSON.stringify({
      paymentId: requirement.paymentId,
      amount: requirement.amount,
      recipient: requirement.recipient,
      timestamp: Date.now(),
    });

    const proof = await this.wallet.signMessage(message);

    return {
      paymentId: requirement.paymentId,
      chain: this.wallet.chain,
      payer: this.wallet.address,
      proof,
      proofType: 'permit',
      timestamp: Date.now(),
    };
  }

  /**
   * Get current spending stats
   */
  getSpendingStats(): {
    daily: number;
    byEndpoint: Record<string, number>;
    limits: X402ClientConfig['budget'];
  } {
    return {
      daily: this.dailySpending,
      byEndpoint: Object.fromEntries(this.endpointSpending),
      limits: this.budget,
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(currency: 'USDC' | 'USDT' | 'DAI' = 'USDC'): Promise<string | null> {
    if (this.wallet.getBalance) {
      return this.wallet.getBalance(currency);
    }
    return null;
  }
}

/**
 * Base x402 error
 */
export class X402Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'X402Error';
  }
}

/**
 * Error thrown when payment is required but not auto-approved
 */
export class X402PaymentRequiredError extends X402Error {
  public requirement: X402PaymentRequirement;

  constructor(requirement: X402PaymentRequirement) {
    super(`Payment of ${requirement.amount} ${requirement.currency} required`);
    this.name = 'X402PaymentRequiredError';
    this.requirement = requirement;
  }
}

/**
 * Error thrown when budget is exceeded
 */
export class X402BudgetError extends X402Error {
  constructor(message: string) {
    super(message);
    this.name = 'X402BudgetError';
  }
}

/**
 * Create a simple wallet from private key (for agents)
 */
export function createAgentWallet(config: {
  privateKey: string;
  chain: X402Chain;
  rpcUrl: string;
}): X402Wallet {
  // This is a simplified implementation
  // In production, use viem or ethers for proper signing
  return {
    address: '0x...', // Would derive from private key
    chain: config.chain,
    signMessage: async (message: string) => {
      // Would sign with private key
      return `0x${Buffer.from(message).toString('hex')}`;
    },
    signTypedData: async (data: unknown) => {
      return '0x...';
    },
  };
}

export default X402Client;
