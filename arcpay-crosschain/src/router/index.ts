import type {
  SupportedChain,
  ChainBalance,
  CrossChainPaymentRequest,
  RouteOption,
  SelectedRoute,
  RouteStep,
  RoutingStrategy,
  Money,
} from '../types';
import { BridgeAggregator } from '../bridges';

/**
 * Cross-chain payment router
 *
 * Analyzes balances across chains and determines optimal payment routes
 */
export class PaymentRouter {
  private balances: Map<SupportedChain, ChainBalance> = new Map();
  private bridgeAggregator: BridgeAggregator;
  private strategy: RoutingStrategy;
  private preferredChain?: SupportedChain;

  constructor(config: {
    strategy?: RoutingStrategy;
    preferredChain?: SupportedChain;
    bridgeAggregator?: BridgeAggregator;
  } = {}) {
    this.strategy = config.strategy || 'optimize_cost';
    this.preferredChain = config.preferredChain;
    this.bridgeAggregator = config.bridgeAggregator || new BridgeAggregator();
  }

  /**
   * Update balance for a chain
   */
  updateBalance(chain: SupportedChain, balance: ChainBalance): void {
    this.balances.set(chain, balance);
  }

  /**
   * Get all route options for a payment
   */
  async getRouteOptions(request: CrossChainPaymentRequest): Promise<RouteOption[]> {
    const options: RouteOption[] = [];
    const destinationChain = request.recipientChain;

    for (const [sourceChain, balance] of this.balances) {
      const availableBalance = parseFloat(balance.balance.amount);

      if (availableBalance < request.amount) {
        continue; // Skip chains with insufficient balance
      }

      const option = await this.evaluateRoute(
        sourceChain,
        destinationChain,
        request.amount,
        balance
      );

      if (option) {
        options.push(option);
      }
    }

    // Sort by score (higher is better)
    options.sort((a, b) => b.score - a.score);

    return options;
  }

  /**
   * Get the best route for a payment
   */
  async getBestRoute(request: CrossChainPaymentRequest): Promise<SelectedRoute> {
    const options = await this.getRouteOptions(request);

    if (options.length === 0) {
      throw new RouterError('No valid routes found for payment');
    }

    // Check if preferred source is specified
    if (request.preferredSource) {
      const preferred = options.find((o) => o.sourceChain === request.preferredSource);
      if (preferred) {
        return this.buildSelectedRoute(preferred, request);
      }
    }

    // Return best option based on strategy
    const best = options[0];
    return this.buildSelectedRoute(best, request);
  }

  /**
   * Evaluate a single route
   */
  private async evaluateRoute(
    sourceChain: SupportedChain,
    destinationChain: SupportedChain,
    amount: number,
    sourceBalance: ChainBalance
  ): Promise<RouteOption | null> {
    const requiresBridge = sourceChain !== destinationChain;

    let estimatedFee: number;
    let estimatedTime: number;
    let bridgeProtocol: RouteOption['bridgeProtocol'];

    if (requiresBridge) {
      try {
        const quote = await this.bridgeAggregator.getBestQuote({
          sourceChain,
          destinationChain,
          amount: amount.toString(),
          currency: 'USDC',
          recipient: '0x', // Placeholder
        });

        estimatedFee = parseFloat(quote.fee.amount);
        estimatedTime = quote.estimatedTime;
        bridgeProtocol = quote.provider as RouteOption['bridgeProtocol'];
      } catch {
        // No bridge available
        return null;
      }
    } else {
      // Same-chain transfer
      estimatedFee = parseFloat(sourceBalance.estimatedTransferCost.amount);
      estimatedTime = 5; // ~5 seconds for on-chain transfer
    }

    // Calculate score based on strategy
    const score = this.calculateScore({
      fee: estimatedFee,
      time: estimatedTime,
      requiresBridge,
      sourceChain,
    });

    return {
      sourceChain,
      destinationChain,
      requiresBridge,
      bridgeProtocol,
      estimatedFee: { amount: estimatedFee.toFixed(4), currency: 'USDC' },
      estimatedTime,
      availableBalance: sourceBalance.balance,
      score,
    };
  }

  /**
   * Calculate route score based on strategy
   */
  private calculateScore(params: {
    fee: number;
    time: number;
    requiresBridge: boolean;
    sourceChain: SupportedChain;
  }): number {
    const { fee, time, requiresBridge, sourceChain } = params;

    // Base score (inversely related to fee and time)
    let score = 100 - fee * 10 - time * 0.1;

    // Adjust based on strategy
    switch (this.strategy) {
      case 'optimize_cost':
        // Heavily penalize high fees
        score -= fee * 20;
        break;

      case 'optimize_speed':
        // Heavily penalize slow routes
        score -= time * 2;
        // Bonus for same-chain
        if (!requiresBridge) score += 20;
        break;

      case 'prefer_chain':
        if (sourceChain === this.preferredChain) {
          score += 50;
        }
        break;

      case 'balanced':
        // Equal weighting (default behavior)
        break;
    }

    // Slight penalty for bridging (more complexity)
    if (requiresBridge) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Build selected route with steps
   */
  private buildSelectedRoute(
    option: RouteOption,
    request: CrossChainPaymentRequest
  ): SelectedRoute {
    const steps: RouteStep[] = [];

    if (option.requiresBridge) {
      // Step 1: Bridge
      steps.push({
        type: 'bridge',
        chain: option.sourceChain,
        action: `Bridge ${request.amount} USDC via ${option.bridgeProtocol || 'CCTP'}`,
        amount: { amount: request.amount.toString(), currency: 'USDC' },
        estimatedFee: option.estimatedFee,
        estimatedTime: option.estimatedTime,
      });

      // Step 2: Transfer on destination
      steps.push({
        type: 'transfer',
        chain: option.destinationChain,
        action: `Transfer to ${request.recipient}`,
        amount: { amount: request.amount.toString(), currency: 'USDC' },
        estimatedFee: { amount: '0.01', currency: 'USDC' },
        estimatedTime: 5,
      });
    } else {
      // Single step: Direct transfer
      steps.push({
        type: 'transfer',
        chain: option.sourceChain,
        action: `Transfer to ${request.recipient}`,
        amount: { amount: request.amount.toString(), currency: 'USDC' },
        estimatedFee: option.estimatedFee,
        estimatedTime: option.estimatedTime,
      });
    }

    return {
      ...option,
      steps,
      totalFee: option.estimatedFee,
      totalTime: option.estimatedTime + (option.requiresBridge ? 5 : 0),
    };
  }

  /**
   * Update routing strategy
   */
  setStrategy(strategy: RoutingStrategy, preferredChain?: SupportedChain): void {
    this.strategy = strategy;
    this.preferredChain = preferredChain;
  }
}

/**
 * Router error
 */
export class RouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouterError';
  }
}

export { PaymentRouter };
