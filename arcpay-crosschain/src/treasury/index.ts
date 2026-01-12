import type {
  SupportedChain,
  ChainConfig,
  ChainBalance,
  MultiChainTreasuryConfig,
  TreasuryOverview,
  CrossChainPaymentRequest,
  CrossChainPayment,
  RebalancePlan,
  RebalanceMove,
  RebalanceResult,
  TreasuryCallbacks,
  TreasuryAlert,
  AllocationComparison,
  Money,
} from '../types';
import { PaymentRouter, RouterError } from '../router';
import { BridgeAggregator } from '../bridges';

/**
 * Multi-Chain Treasury Manager
 *
 * Manages treasury across multiple chains with automatic routing and rebalancing
 *
 * @example
 * ```typescript
 * import { MultiChainTreasury } from '@arcpay/crosschain';
 *
 * const treasury = new MultiChainTreasury({
 *   organizationId: 'org_xxx',
 *   chains: {
 *     ethereum: { wallet: '0x...', rpc: process.env.ETH_RPC },
 *     base: { wallet: '0x...', rpc: process.env.BASE_RPC },
 *     solana: { wallet: '...', rpc: process.env.SOL_RPC },
 *   },
 *   routing: { strategy: 'optimize_cost' },
 *   rebalancing: {
 *     enabled: true,
 *     targets: { ethereum: 0.2, base: 0.3, solana: 0.5 },
 *     threshold: 0.1,
 *   },
 * });
 *
 * // Make cross-chain payment
 * const payment = await treasury.pay({
 *   recipient: '0x...',
 *   recipientChain: 'arbitrum',
 *   amount: 10000,
 * });
 * ```
 */
export class MultiChainTreasury {
  private config: MultiChainTreasuryConfig;
  private balances: Map<SupportedChain, ChainBalance> = new Map();
  private router: PaymentRouter;
  private bridgeAggregator: BridgeAggregator;
  private callbacks: TreasuryCallbacks = {};
  private payments: CrossChainPayment[] = [];
  private rebalanceHistory: RebalanceResult[] = [];
  private lastBalanceUpdate: Date = new Date(0);

  constructor(config: MultiChainTreasuryConfig) {
    this.config = config;
    this.bridgeAggregator = new BridgeAggregator();
    this.router = new PaymentRouter({
      strategy: config.routing?.strategy || 'optimize_cost',
      preferredChain: config.routing?.preferredChain,
      bridgeAggregator: this.bridgeAggregator,
    });
  }

  // ===========================================================================
  // Balance Management
  // ===========================================================================

  /**
   * Refresh balances for all configured chains
   */
  async refreshBalances(): Promise<void> {
    const chains = Object.keys(this.config.chains) as SupportedChain[];

    for (const chain of chains) {
      const chainConfig = this.config.chains[chain];
      if (!chainConfig?.enabled === false) continue;

      try {
        const balance = await this.fetchChainBalance(chain, chainConfig);
        this.balances.set(chain, balance);
        this.router.updateBalance(chain, balance);

        // Check for low balance alert
        if (this.config.alerts?.lowBalanceThreshold) {
          const balanceAmount = parseFloat(balance.balance.amount);
          if (balanceAmount < this.config.alerts.lowBalanceThreshold) {
            this.emitAlert({
              type: 'low_balance',
              severity: 'warning',
              message: `Low balance on ${chain}: ${balanceAmount} USDC`,
              chain,
              metadata: { balance: balanceAmount },
              timestamp: new Date(),
            });
          }
        }

        // Callback
        this.callbacks.onBalanceChange?.(chain, balance);
      } catch (error) {
        console.error(`Failed to fetch balance for ${chain}:`, error);
      }
    }

    this.lastBalanceUpdate = new Date();
  }

  /**
   * Fetch balance for a single chain
   */
  private async fetchChainBalance(
    chain: SupportedChain,
    config: ChainConfig
  ): Promise<ChainBalance> {
    // In production, this would query the actual blockchain
    // Simulating balance fetch
    await delay(100);

    // Mock balances for demonstration
    const mockBalances: Record<SupportedChain, number> = {
      ethereum: 50000,
      base: 30000,
      arbitrum: 40000,
      polygon: 20000,
      optimism: 15000,
      avalanche: 10000,
      solana: 80000,
    };

    const gasPrices: Record<SupportedChain, string> = {
      ethereum: '25 gwei',
      base: '0.001 gwei',
      arbitrum: '0.1 gwei',
      polygon: '30 gwei',
      optimism: '0.001 gwei',
      avalanche: '25 nAVAX',
      solana: '0.00025 SOL',
    };

    const yieldRates: Record<SupportedChain, number> = {
      ethereum: 0,
      base: 0,
      arbitrum: 0,
      polygon: 0,
      optimism: 0,
      avalanche: 0,
      solana: 5.2, // Solana USDY available
    };

    return {
      chain,
      balance: { amount: mockBalances[chain].toFixed(2), currency: 'USDC' },
      yieldBalance: yieldRates[chain] > 0
        ? { amount: (mockBalances[chain] * 0.3).toFixed(2), currency: 'USDY' }
        : undefined,
      yieldRate: yieldRates[chain] || undefined,
      gasPrice: gasPrices[chain],
      estimatedTransferCost: {
        amount: this.estimateTransferCost(chain).toFixed(4),
        currency: 'USDC',
      },
    };
  }

  /**
   * Estimate transfer cost for a chain
   */
  private estimateTransferCost(chain: SupportedChain): number {
    const costs: Record<SupportedChain, number> = {
      ethereum: 2.5,
      base: 0.005,
      arbitrum: 0.05,
      polygon: 0.02,
      optimism: 0.01,
      avalanche: 0.05,
      solana: 0.001,
    };
    return costs[chain];
  }

  // ===========================================================================
  // Overview
  // ===========================================================================

  /**
   * Get unified treasury overview
   */
  async getOverview(): Promise<TreasuryOverview> {
    // Refresh if stale (> 30 seconds)
    if (Date.now() - this.lastBalanceUpdate.getTime() > 30000) {
      await this.refreshBalances();
    }

    let total = 0;
    let yieldEarning = 0;
    let projectedYield = 0;

    const byChain: Record<SupportedChain, ChainBalance> = {} as Record<SupportedChain, ChainBalance>;

    for (const [chain, balance] of this.balances) {
      byChain[chain] = balance;
      total += parseFloat(balance.balance.amount);

      if (balance.yieldBalance) {
        const yieldAmount = parseFloat(balance.yieldBalance.amount);
        yieldEarning += yieldAmount;
        projectedYield += yieldAmount * (balance.yieldRate || 0) / 100;
      }
    }

    // Calculate allocation comparison
    const allocationVsTarget = this.calculateAllocationComparison(total);

    return {
      total: { amount: total.toFixed(2), currency: 'USDC' },
      byChain,
      yieldEarning: { amount: yieldEarning.toFixed(2), currency: 'USDY' },
      projectedAnnualYield: { amount: projectedYield.toFixed(2), currency: 'USDY' },
      yieldEarnedYTD: { amount: (projectedYield * 0.8).toFixed(2), currency: 'USDY' }, // Mock YTD
      allocationVsTarget,
      updatedAt: this.lastBalanceUpdate,
    };
  }

  /**
   * Calculate allocation comparison with targets
   */
  private calculateAllocationComparison(total: number): AllocationComparison[] {
    if (!this.config.rebalancing?.targets || total === 0) {
      return [];
    }

    const comparisons: AllocationComparison[] = [];

    for (const [chain, balance] of this.balances) {
      const targetPercent = this.config.rebalancing.targets[chain] || 0;
      const currentPercent = parseFloat(balance.balance.amount) / total;
      const deviation = currentPercent - targetPercent;
      const threshold = this.config.rebalancing.threshold || 0.1;

      comparisons.push({
        chain,
        currentPercent: currentPercent * 100,
        targetPercent: targetPercent * 100,
        deviation: deviation * 100,
        needsRebalance: Math.abs(deviation) > threshold,
      });
    }

    return comparisons;
  }

  // ===========================================================================
  // Payments
  // ===========================================================================

  /**
   * Make a cross-chain payment
   */
  async pay(request: CrossChainPaymentRequest): Promise<CrossChainPayment> {
    // Refresh balances first
    await this.refreshBalances();

    // Get best route
    const route = await this.router.getBestRoute(request);

    // Check if fee is acceptable
    if (request.maxFee && parseFloat(route.totalFee.amount) > request.maxFee) {
      throw new TreasuryError(
        `Route fee ${route.totalFee.amount} exceeds max fee ${request.maxFee}`
      );
    }

    // Execute payment
    const payment: CrossChainPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      request,
      route,
      status: 'pending',
    };

    try {
      // Execute each step
      for (const step of route.steps) {
        payment.status = step.type === 'bridge' ? 'bridging' : 'confirming';

        if (step.type === 'bridge') {
          // Execute bridge
          const quote = await this.bridgeAggregator.getBestQuote({
            sourceChain: route.sourceChain,
            destinationChain: route.destinationChain,
            amount: request.amount.toString(),
            currency: 'USDC',
            recipient: request.recipient,
          });

          const execution = await this.bridgeAggregator.executeBridge(quote);
          payment.bridgeTxHash = execution.sourceTxHash;

          // Wait for bridge completion
          await this.waitForBridgeCompletion(quote.provider, execution.id);
        } else {
          // Execute transfer
          await delay(500);
          payment.destinationTxHash = `0x${randomHex(64)}`;
        }
      }

      payment.status = 'completed';
      payment.actualFee = route.totalFee;
      payment.completedAt = new Date();

      // Update balances
      const sourceBalance = this.balances.get(route.sourceChain);
      if (sourceBalance) {
        sourceBalance.balance = {
          amount: (parseFloat(sourceBalance.balance.amount) - request.amount).toFixed(2),
          currency: 'USDC',
        };
      }

      // Callback
      this.callbacks.onPaymentComplete?.(payment);
    } catch (error) {
      payment.status = 'failed';
      payment.error = (error as Error).message;

      this.emitAlert({
        type: 'failed_transaction',
        severity: 'critical',
        message: `Payment failed: ${payment.error}`,
        metadata: { paymentId: payment.id },
        timestamp: new Date(),
      });

      throw new TreasuryError(`Payment failed: ${payment.error}`);
    }

    this.payments.push(payment);
    return payment;
  }

  /**
   * Wait for bridge completion
   */
  private async waitForBridgeCompletion(provider: string, executionId: string): Promise<void> {
    // In production, poll the bridge status
    // Simulating completion
    await delay(2000);
  }

  // ===========================================================================
  // Rebalancing
  // ===========================================================================

  /**
   * Create a rebalance plan
   */
  async createRebalancePlan(): Promise<RebalancePlan | null> {
    if (!this.config.rebalancing?.enabled) {
      return null;
    }

    await this.refreshBalances();
    const overview = await this.getOverview();
    const total = parseFloat(overview.total.amount);

    if (total === 0) return null;

    const moves: RebalanceMove[] = [];

    // Find chains that are over-allocated
    const overAllocated: { chain: SupportedChain; excess: number }[] = [];
    const underAllocated: { chain: SupportedChain; deficit: number }[] = [];

    for (const comparison of overview.allocationVsTarget) {
      if (!comparison.needsRebalance) continue;

      const balance = this.balances.get(comparison.chain);
      if (!balance) continue;

      const currentAmount = parseFloat(balance.balance.amount);
      const targetAmount = (comparison.targetPercent / 100) * total;
      const difference = currentAmount - targetAmount;

      if (difference > 0) {
        overAllocated.push({ chain: comparison.chain, excess: difference });
      } else {
        underAllocated.push({ chain: comparison.chain, deficit: -difference });
      }
    }

    // Create moves from over-allocated to under-allocated
    for (const over of overAllocated) {
      for (const under of underAllocated) {
        if (over.excess <= 0 || under.deficit <= 0) continue;

        const moveAmount = Math.min(over.excess, under.deficit);

        // Skip small moves
        if (this.config.rebalancing.minimumMove && moveAmount < this.config.rebalancing.minimumMove) {
          continue;
        }

        try {
          const quote = await this.bridgeAggregator.getBestQuote({
            sourceChain: over.chain,
            destinationChain: under.chain,
            amount: moveAmount.toString(),
            currency: 'USDC',
            recipient: this.config.chains[under.chain]?.wallet || '',
          });

          moves.push({
            fromChain: over.chain,
            toChain: under.chain,
            amount: { amount: moveAmount.toFixed(2), currency: 'USDC' },
            estimatedFee: quote.fee,
            estimatedTime: quote.estimatedTime,
            reason: 'above_target',
          });

          over.excess -= moveAmount;
          under.deficit -= moveAmount;
        } catch {
          // Skip if no bridge available
          continue;
        }
      }
    }

    if (moves.length === 0) {
      return null;
    }

    const totalCost = moves.reduce((sum, m) => sum + parseFloat(m.estimatedFee.amount), 0);
    const totalTime = Math.max(...moves.map((m) => m.estimatedTime));

    return {
      id: `rebal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      moves,
      totalCost: { amount: totalCost.toFixed(4), currency: 'USDC' },
      estimatedTime: totalTime,
      createdAt: new Date(),
    };
  }

  /**
   * Execute a rebalance plan
   */
  async executeRebalance(plan: RebalancePlan): Promise<RebalanceResult> {
    const result: RebalanceResult = {
      plan,
      status: 'completed',
      executedMoves: 0,
      totalMoves: plan.moves.length,
      actualCost: { amount: '0', currency: 'USDC' },
      errors: [],
    };

    let totalCost = 0;

    for (const move of plan.moves) {
      try {
        await this.pay({
          recipient: this.config.chains[move.toChain]?.wallet || '',
          recipientChain: move.toChain,
          amount: parseFloat(move.amount.amount),
          memo: `Rebalance from ${move.fromChain}`,
          preferredSource: move.fromChain,
        });

        result.executedMoves++;
        totalCost += parseFloat(move.estimatedFee.amount);
      } catch (error) {
        result.errors?.push(`Failed to move from ${move.fromChain} to ${move.toChain}: ${(error as Error).message}`);
      }
    }

    result.actualCost = { amount: totalCost.toFixed(4), currency: 'USDC' };

    if (result.executedMoves === 0) {
      result.status = 'failed';
    } else if (result.executedMoves < result.totalMoves) {
      result.status = 'partial';
    }

    this.rebalanceHistory.push(result);
    this.callbacks.onRebalanceComplete?.(result);

    return result;
  }

  /**
   * Enable auto-rebalancing
   */
  enableAutoRebalance(intervalMinutes: number = 60): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const plan = await this.createRebalancePlan();
        if (plan && plan.moves.length > 0) {
          await this.executeRebalance(plan);
        }
      } catch (error) {
        console.error('Auto-rebalance failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // ===========================================================================
  // Callbacks & Alerts
  // ===========================================================================

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: TreasuryCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Emit an alert
   */
  private emitAlert(alert: TreasuryAlert): void {
    this.callbacks.onAlert?.(alert);

    // Send to webhook if configured
    if (this.config.alerts?.webhookUrl) {
      fetch(this.config.alerts.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      }).catch(console.error);
    }
  }

  // ===========================================================================
  // History
  // ===========================================================================

  /**
   * Get payment history
   */
  getPaymentHistory(limit: number = 100): CrossChainPayment[] {
    return this.payments.slice(-limit);
  }

  /**
   * Get rebalance history
   */
  getRebalanceHistory(): RebalanceResult[] {
    return this.rebalanceHistory;
  }
}

/**
 * Treasury error
 */
export class TreasuryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreasuryError';
  }
}

// =============================================================================
// Helpers
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export { MultiChainTreasury };
