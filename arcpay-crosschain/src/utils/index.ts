import type { SupportedChain, Money } from '../types';

/**
 * Chain metadata
 */
export const CHAIN_METADATA: Record<SupportedChain, {
  name: string;
  chainId: number;
  nativeCurrency: string;
  explorer: string;
  isEVM: boolean;
}> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    nativeCurrency: 'ETH',
    explorer: 'https://etherscan.io',
    isEVM: true,
  },
  base: {
    name: 'Base',
    chainId: 8453,
    nativeCurrency: 'ETH',
    explorer: 'https://basescan.org',
    isEVM: true,
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    nativeCurrency: 'ETH',
    explorer: 'https://arbiscan.io',
    isEVM: true,
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    nativeCurrency: 'MATIC',
    explorer: 'https://polygonscan.com',
    isEVM: true,
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    nativeCurrency: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    isEVM: true,
  },
  avalanche: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    nativeCurrency: 'AVAX',
    explorer: 'https://snowtrace.io',
    isEVM: true,
  },
  solana: {
    name: 'Solana',
    chainId: 0,
    nativeCurrency: 'SOL',
    explorer: 'https://solscan.io',
    isEVM: false,
  },
};

/**
 * USDC contract addresses
 */
export const USDC_ADDRESSES: Record<SupportedChain, string> = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

/**
 * CCTP Token Messenger addresses (for bridging)
 */
export const CCTP_TOKEN_MESSENGER: Record<SupportedChain, string> = {
  ethereum: '0xbd3fa81b58ba92a82136038b25adec7066af3155',
  base: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
  arbitrum: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
  polygon: '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
  optimism: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
  avalanche: '0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982',
  solana: 'CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3',
};

/**
 * Format money for display
 */
export function formatMoney(money: Money): string {
  const amount = parseFloat(money.amount);
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${money.currency}`;
}

/**
 * Calculate total from money array
 */
export function sumMoney(amounts: Money[]): Money {
  const total = amounts.reduce((sum, m) => sum + parseFloat(m.amount), 0);
  return {
    amount: total.toFixed(2),
    currency: amounts[0]?.currency || 'USDC',
  };
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerTxUrl(chain: SupportedChain, txHash: string): string {
  const metadata = CHAIN_METADATA[chain];
  if (chain === 'solana') {
    return `${metadata.explorer}/tx/${txHash}`;
  }
  return `${metadata.explorer}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getExplorerAddressUrl(chain: SupportedChain, address: string): string {
  const metadata = CHAIN_METADATA[chain];
  if (chain === 'solana') {
    return `${metadata.explorer}/account/${address}`;
  }
  return `${metadata.explorer}/address/${address}`;
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Estimate bridge time based on chains
 */
export function estimateBridgeTime(source: SupportedChain, destination: SupportedChain): number {
  // CCTP V2 is generally 10-30 seconds
  const isNonEVM = !CHAIN_METADATA[source].isEVM || !CHAIN_METADATA[destination].isEVM;
  return isNonEVM ? 45 : 15;
}

/**
 * Validate chain is supported
 */
export function isChainSupported(chain: string): chain is SupportedChain {
  return chain in CHAIN_METADATA;
}
