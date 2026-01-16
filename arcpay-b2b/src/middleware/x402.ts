/**
 * x402 Middleware - Shared Types and Utilities
 *
 * Common types and helpers for x402 payment middleware integration.
 * Used by both Express and Next.js middleware implementations.
 */

// ==========================================================================
// Types
// ==========================================================================

/**
 * Payment information attached to requests after successful payment
 */
export interface X402PaymentInfo {
  /** Whether the payment was verified */
  verified: boolean;
  /** Payer's wallet address */
  payer: string;
  /** Payment amount in USD */
  amount: string;
  /** Network the payment was made on (e.g., 'eip155:5042002') */
  network: string;
  /** Transaction hash from settlement */
  transaction?: string;
  /** Timestamp of the payment */
  timestamp: string;
}

/**
 * Payment requirements returned in 402 response
 */
export interface X402PaymentRequirements {
  /** x402 protocol version */
  x402Version: number;
  /** Payment scheme (e.g., 'exact') */
  scheme: string;
  /** Network identifier */
  network: string;
  /** Maximum amount in base units */
  maxAmountRequired: string;
  /** Payment resource description */
  resource: string;
  /** Seller's wallet address */
  payTo: string;
  /** Additional scheme-specific data */
  extra?: {
    /** Name for EIP-712 domain */
    name?: string;
    /** Version for EIP-712 domain */
    version?: string;
    /** Verifying contract address */
    verifyingContract?: string;
  };
}

/**
 * Base options for x402 middleware
 */
export interface X402MiddlewareBaseOptions {
  /** Seller wallet address to receive payments */
  sellerAddress: string;
  /** Networks to accept payments from (default: all supported) */
  networks?: string[];
  /** Description of the resource being sold */
  description?: string;
}

/**
 * Supported chain configurations
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  network: string;
  usdcAddress: string;
  gatewayAddress: string;
}

// ==========================================================================
// Constants
// ==========================================================================

/**
 * Default supported networks for x402 Gateway
 */
export const DEFAULT_NETWORKS = [
  'eip155:5042002',  // Arc Testnet (gasless batching)
];

/**
 * All Gateway-supported networks (for deposits/withdrawals)
 */
export const GATEWAY_NETWORKS = {
  // Testnets
  arcTestnet: { chainId: 5042002, network: 'eip155:5042002', name: 'Arc Testnet' },
  baseSepolia: { chainId: 84532, network: 'eip155:84532', name: 'Base Sepolia' },
  ethereumSepolia: { chainId: 11155111, network: 'eip155:11155111', name: 'Ethereum Sepolia' },
  // Mainnets
  arbitrum: { chainId: 42161, network: 'eip155:42161', name: 'Arbitrum One' },
  base: { chainId: 8453, network: 'eip155:8453', name: 'Base' },
  ethereum: { chainId: 1, network: 'eip155:1', name: 'Ethereum' },
  polygon: { chainId: 137, network: 'eip155:137', name: 'Polygon PoS' },
  optimism: { chainId: 10, network: 'eip155:10', name: 'Optimism' },
} as const;

/**
 * x402 protocol constants
 */
export const X402_CONSTANTS = {
  VERSION: 2,
  SCHEME: 'exact',
  BATCHING_NAME: 'GatewayWalletBatched',
  BATCHING_VERSION: '1',
} as const;

// ==========================================================================
// Utilities
// ==========================================================================

/**
 * Parse a price string to amount in USDC base units (6 decimals)
 * Accepts formats: '$0.01', '0.01', '1.00'
 */
export function parsePriceToBaseUnits(price: string): string {
  // Remove $ prefix if present
  const cleanPrice = price.replace(/^\$/, '').trim();

  // Parse as float and convert to base units (6 decimals for USDC)
  const amount = parseFloat(cleanPrice);
  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid price format: ${price}`);
  }

  // Convert to base units (multiply by 10^6)
  const baseUnits = Math.round(amount * 1_000_000);
  return baseUnits.toString();
}

/**
 * Format base units to human-readable USD amount
 */
export function formatBaseUnitsToUSD(baseUnits: string): string {
  const amount = parseInt(baseUnits, 10) / 1_000_000;
  return `$${amount.toFixed(2)}`;
}

/**
 * Build payment requirements for a 402 response
 */
export function buildPaymentRequirements(
  price: string,
  sellerAddress: string,
  options: {
    networks?: string[];
    description?: string;
    verifyingContract?: string;
  } = {}
): X402PaymentRequirements[] {
  const { networks = DEFAULT_NETWORKS, description = 'API access' } = options;
  const maxAmount = parsePriceToBaseUnits(price);

  return networks.map(network => ({
    x402Version: X402_CONSTANTS.VERSION,
    scheme: X402_CONSTANTS.SCHEME,
    network,
    maxAmountRequired: maxAmount,
    resource: description,
    payTo: sellerAddress,
    extra: {
      name: X402_CONSTANTS.BATCHING_NAME,
      version: X402_CONSTANTS.BATCHING_VERSION,
      verifyingContract: options.verifyingContract,
    },
  }));
}

/**
 * Extract payment header from request
 */
export function extractPaymentHeader(headers: Record<string, string | string[] | undefined>): string | undefined {
  const paymentHeader = headers['x-payment'] || headers['X-Payment'];
  if (Array.isArray(paymentHeader)) {
    return paymentHeader[0];
  }
  return paymentHeader;
}

/**
 * Validate an Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Create a 402 Payment Required response body
 */
export function create402Response(requirements: X402PaymentRequirements[]): {
  status: 402;
  body: {
    error: string;
    accepts: X402PaymentRequirements[];
  };
} {
  return {
    status: 402,
    body: {
      error: 'Payment Required',
      accepts: requirements,
    },
  };
}
