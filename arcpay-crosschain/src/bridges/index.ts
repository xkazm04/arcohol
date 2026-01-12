import type {
  BridgeProvider,
  BridgeQuoteParams,
  BridgeQuote,
  BridgeExecution,
  BridgeStatus,
  SupportedChain,
  Money,
} from '../types';

// =============================================================================
// Circle CCTP V2 Bridge Provider
// =============================================================================

/**
 * Circle CCTP V2 Bridge Provider
 *
 * Implements Circle's Cross-Chain Transfer Protocol V2 for fast USDC transfers
 *
 * Features:
 * - Fast transfers (seconds vs 13-19 minutes in V1)
 * - Burn and mint mechanism (no liquidity pools)
 * - 15+ supported chains
 * - Zero additional fees (just gas)
 */
export class CCTPBridgeProvider implements BridgeProvider {
  readonly name = 'cctp_v2';

  readonly supportedChains: SupportedChain[] = [
    'ethereum',
    'base',
    'arbitrum',
    'polygon',
    'optimism',
    'avalanche',
    'solana',
  ];

  private attestationService: string;

  constructor(config?: { attestationService?: string }) {
    this.attestationService = config?.attestationService || 'https://iris-api.circle.com';
  }

  /**
   * Get quote for CCTP bridge
   */
  async getQuote(params: BridgeQuoteParams): Promise<BridgeQuote> {
    // Validate chains are supported
    if (!this.supportedChains.includes(params.sourceChain)) {
      throw new Error(`Source chain ${params.sourceChain} not supported by CCTP`);
    }
    if (!this.supportedChains.includes(params.destinationChain)) {
      throw new Error(`Destination chain ${params.destinationChain} not supported by CCTP`);
    }

    // Calculate fee (CCTP has no protocol fee, just gas)
    const gasCost = this.estimateGasCost(params.sourceChain, params.destinationChain);

    // Fast transfer has a small fee
    const isFastTransfer = true; // V2 uses fast transfers by default
    const fastTransferFee = isFastTransfer ? parseFloat(params.amount) * 0.0001 : 0; // 0.01%

    const totalFee = gasCost + fastTransferFee;

    return {
      id: `cctp_quote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      provider: this.name,
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      amount: { amount: params.amount, currency: params.currency },
      fee: { amount: totalFee.toFixed(4), currency: 'USDC' },
      amountReceived: {
        amount: (parseFloat(params.amount) - totalFee).toFixed(2),
        currency: params.currency,
      },
      estimatedTime: this.estimateTime(params.sourceChain, params.destinationChain),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
  }

  /**
   * Execute CCTP bridge
   */
  async execute(quote: BridgeQuote): Promise<BridgeExecution> {
    // In production, this would:
    // 1. Approve USDC for TokenMessenger contract
    // 2. Call depositForBurn on source chain
    // 3. Wait for attestation from Circle
    // 4. Call receiveMessage on destination chain

    // Simulate execution
    await delay(1000);

    const sourceTxHash = `0x${randomHex(64)}`;

    return {
      id: `cctp_exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      quote,
      sourceTxHash,
      status: {
        status: 'attesting',
        sourceTxHash,
      },
    };
  }

  /**
   * Get bridge status
   */
  async getStatus(executionId: string): Promise<BridgeStatus> {
    // In production, check attestation service and destination chain
    // Simulate completed status
    return {
      status: 'completed',
      sourceTxHash: `0x${randomHex(64)}`,
      destinationTxHash: `0x${randomHex(64)}`,
    };
  }

  /**
   * Estimate gas cost for bridge
   */
  private estimateGasCost(source: SupportedChain, destination: SupportedChain): number {
    // Approximate gas costs in USD
    const gasCosts: Record<SupportedChain, number> = {
      ethereum: 5.0,
      base: 0.01,
      arbitrum: 0.10,
      polygon: 0.05,
      optimism: 0.05,
      avalanche: 0.10,
      solana: 0.001,
    };

    // Source chain gas (burn) + destination gas (mint)
    return gasCosts[source] + gasCosts[destination] * 0.5;
  }

  /**
   * Estimate time for bridge
   */
  private estimateTime(source: SupportedChain, destination: SupportedChain): number {
    // CCTP V2 fast transfers are typically 10-30 seconds
    // Non-EVM chains may take slightly longer
    if (source === 'solana' || destination === 'solana') {
      return 45; // 45 seconds for Solana
    }
    return 15; // 15 seconds for EVM chains
  }
}

// =============================================================================
// Bridge Aggregator
// =============================================================================

/**
 * Aggregates multiple bridge providers for best routing
 */
export class BridgeAggregator {
  private providers: BridgeProvider[] = [];

  constructor(providers?: BridgeProvider[]) {
    if (providers) {
      this.providers = providers;
    } else {
      // Default to CCTP
      this.providers = [new CCTPBridgeProvider()];
    }
  }

  /**
   * Add a bridge provider
   */
  addProvider(provider: BridgeProvider): void {
    this.providers.push(provider);
  }

  /**
   * Get best quote across all providers
   */
  async getBestQuote(params: BridgeQuoteParams): Promise<BridgeQuote> {
    const quotes = await Promise.all(
      this.providers
        .filter((p) =>
          p.supportedChains.includes(params.sourceChain) &&
          p.supportedChains.includes(params.destinationChain)
        )
        .map((p) => p.getQuote(params).catch(() => null))
    );

    const validQuotes = quotes.filter((q): q is BridgeQuote => q !== null);

    if (validQuotes.length === 0) {
      throw new Error('No bridge providers support this route');
    }

    // Sort by fee (lowest first)
    validQuotes.sort(
      (a, b) => parseFloat(a.fee.amount) - parseFloat(b.fee.amount)
    );

    return validQuotes[0];
  }

  /**
   * Get all quotes for comparison
   */
  async getAllQuotes(params: BridgeQuoteParams): Promise<BridgeQuote[]> {
    const quotes = await Promise.all(
      this.providers
        .filter((p) =>
          p.supportedChains.includes(params.sourceChain) &&
          p.supportedChains.includes(params.destinationChain)
        )
        .map((p) => p.getQuote(params).catch(() => null))
    );

    return quotes.filter((q): q is BridgeQuote => q !== null);
  }

  /**
   * Execute bridge with specific provider
   */
  async executeBridge(quote: BridgeQuote): Promise<BridgeExecution> {
    const provider = this.providers.find((p) => p.name === quote.provider);
    if (!provider) {
      throw new Error(`Provider ${quote.provider} not found`);
    }
    return provider.execute(quote);
  }

  /**
   * Get bridge status
   */
  async getStatus(provider: string, executionId: string): Promise<BridgeStatus> {
    const prov = this.providers.find((p) => p.name === provider);
    if (!prov) {
      throw new Error(`Provider ${provider} not found`);
    }
    return prov.getStatus(executionId);
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

export { CCTPBridgeProvider, BridgeAggregator };
