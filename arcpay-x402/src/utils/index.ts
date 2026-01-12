import type {
  X402PaymentRequirement,
  X402PaymentSignature,
  X402Price,
  X402Chain,
  X402Currency,
} from '../types';

// =============================================================================
// ID Generation
// =============================================================================

/**
 * Generate a unique payment ID
 */
export function generatePaymentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `x402_${timestamp}_${random}`;
}

// =============================================================================
// Header Parsing
// =============================================================================

/**
 * Parse payment requirement from header
 */
export function parsePaymentRequirement(header: string): X402PaymentRequirement {
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded) as X402PaymentRequirement;
  } catch {
    throw new Error('Invalid payment requirement header');
  }
}

/**
 * Encode payment requirement for header
 */
export function encodePaymentRequirement(requirement: X402PaymentRequirement): string {
  return Buffer.from(JSON.stringify(requirement)).toString('base64');
}

/**
 * Parse payment signature from header
 */
export function parsePaymentSignature(header: string): X402PaymentSignature {
  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded) as X402PaymentSignature;
  } catch {
    throw new Error('Invalid payment signature header');
  }
}

/**
 * Encode payment signature for header
 */
export function encodePaymentSignature(signature: X402PaymentSignature): string {
  return Buffer.from(JSON.stringify(signature)).toString('base64');
}

// =============================================================================
// Price Utilities
// =============================================================================

/**
 * Parse price amount to smallest unit (e.g., USDC has 6 decimals)
 */
export function parsePriceToSmallestUnit(amount: string, currency: X402Currency): bigint {
  const decimals = getCurrencyDecimals(currency);
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

/**
 * Format smallest unit to human-readable price
 */
export function formatPriceFromSmallestUnit(amount: bigint, currency: X402Currency): string {
  const decimals = getCurrencyDecimals(currency);
  const str = amount.toString().padStart(decimals + 1, '0');
  const whole = str.slice(0, -decimals) || '0';
  const fraction = str.slice(-decimals);
  return `${whole}.${fraction}`;
}

/**
 * Get decimal places for currency
 */
export function getCurrencyDecimals(currency: X402Currency): number {
  switch (currency) {
    case 'USDC':
    case 'USDT':
      return 6;
    case 'DAI':
    case 'ETH':
      return 18;
    default:
      return 6;
  }
}

/**
 * Validate price object
 */
export function validatePrice(price: X402Price): void {
  if (!price.amount || typeof price.amount !== 'string') {
    throw new Error('Price amount must be a string');
  }

  const parsed = parseFloat(price.amount);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Price amount must be a non-negative number');
  }
}

// =============================================================================
// Chain Utilities
// =============================================================================

const CHAIN_IDS: Record<X402Chain, number> = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  optimism: 10,
  avalanche: 43114,
  solana: 0, // Not EVM
};

const USDC_ADDRESSES: Record<X402Chain, string> = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

/**
 * Get chain ID
 */
export function getChainId(chain: X402Chain): number {
  return CHAIN_IDS[chain];
}

/**
 * Get USDC address for chain
 */
export function getUSDCAddress(chain: X402Chain): string {
  return USDC_ADDRESSES[chain];
}

/**
 * Check if chain is EVM-compatible
 */
export function isEVMChain(chain: X402Chain): boolean {
  return chain !== 'solana';
}

// =============================================================================
// Expiration Utilities
// =============================================================================

/**
 * Create expiration timestamp
 */
export function createExpiration(ttlSeconds: number = 300): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

/**
 * Check if payment requirement is expired
 */
export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate payment signature matches requirement
 */
export function validateSignatureMatchesRequirement(
  signature: X402PaymentSignature,
  requirement: X402PaymentRequirement
): { valid: boolean; error?: string } {
  if (signature.paymentId !== requirement.paymentId) {
    return { valid: false, error: 'Payment ID mismatch' };
  }

  if (!requirement.chains.includes(signature.chain)) {
    return { valid: false, error: 'Chain not accepted' };
  }

  if (isExpired(requirement.expiresAt)) {
    return { valid: false, error: 'Payment requirement expired' };
  }

  return { valid: true };
}
