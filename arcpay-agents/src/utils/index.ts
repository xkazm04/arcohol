/**
 * Create a wallet adapter from viem wallet client
 */
export function createViemAdapter(walletClient: unknown): {
  address: string;
  chain: string;
  signMessage: (message: string) => Promise<string>;
} {
  // Type assertion for viem wallet client
  const client = walletClient as {
    account: { address: string };
    chain: { name: string };
    signMessage: (args: { message: string }) => Promise<string>;
  };

  return {
    address: client.account.address,
    chain: mapChainName(client.chain.name),
    signMessage: async (message: string) => {
      return client.signMessage({ message });
    },
  };
}

/**
 * Map viem chain name to our chain type
 */
function mapChainName(name: string): string {
  const mapping: Record<string, string> = {
    'Ethereum': 'ethereum',
    'Base': 'base',
    'Arbitrum One': 'arbitrum',
    'Polygon': 'polygon',
    'OP Mainnet': 'optimism',
    'Avalanche': 'avalanche',
  };
  return mapping[name] || 'base';
}

/**
 * Format currency amount for display
 */
export function formatAmount(amount: string | number, currency: string = 'USDC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
