import { ethers } from 'ethers';

// RPC endpoints by chain
const RPC_ENDPOINTS: Record<string, string> = {
  // Mainnet
  'ethereum': process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
  'polygon': process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
  'arbitrum': process.env.ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
  'optimism': process.env.OPTIMISM_RPC_URL || 'https://optimism.llamarpc.com',
  'base': process.env.BASE_RPC_URL || 'https://base.llamarpc.com',
  'avalanche': process.env.AVALANCHE_RPC_URL || 'https://avalanche.llamarpc.com',

  // Testnets
  'sepolia': process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
  'polygon-amoy': process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
  'arbitrum-sepolia': process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
  'base-sepolia': process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',

  // ArcPay testnet (mock/local)
  'arc-testnet': process.env.ARC_TESTNET_RPC_URL || 'http://localhost:8545',
};

// Chain IDs
const CHAIN_IDS: Record<string, number> = {
  'ethereum': 1,
  'polygon': 137,
  'arbitrum': 42161,
  'optimism': 10,
  'base': 8453,
  'avalanche': 43114,
  'sepolia': 11155111,
  'polygon-amoy': 80002,
  'arbitrum-sepolia': 421614,
  'base-sepolia': 84532,
  'arc-testnet': 31337,
};

// Provider cache
const providerCache = new Map<string, ethers.JsonRpcProvider>();

/**
 * Get a JSON-RPC provider for the specified chain
 */
export function getProvider(chain: string): ethers.JsonRpcProvider {
  const cached = providerCache.get(chain);
  if (cached) {
    return cached;
  }

  const rpcUrl = RPC_ENDPOINTS[chain];
  if (!rpcUrl) {
    throw new Error(`No RPC endpoint configured for chain: ${chain}`);
  }

  const chainId = CHAIN_IDS[chain];
  const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
  providerCache.set(chain, provider);

  return provider;
}

/**
 * Get a wallet signer for executing transactions
 * Requires BILLING_PRIVATE_KEY environment variable
 */
export function getSigner(chain: string): ethers.Wallet {
  const privateKey = process.env.BILLING_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('BILLING_PRIVATE_KEY environment variable not set');
  }

  const provider = getProvider(chain);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get chain ID for a given chain name
 */
export function getChainId(chain: string): number {
  const chainId = CHAIN_IDS[chain];
  if (!chainId) {
    throw new Error(`Unknown chain: ${chain}`);
  }
  return chainId;
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chain: string): boolean {
  return chain.includes('testnet') || chain.includes('sepolia') || chain.includes('amoy');
}

/**
 * Get supported chains
 */
export function getSupportedChains(): string[] {
  return Object.keys(RPC_ENDPOINTS);
}

/**
 * Wait for transaction confirmation with retry
 */
export async function waitForTransaction(
  provider: ethers.JsonRpcProvider,
  txHash: string,
  confirmations: number = 1,
  timeout: number = 60000
): Promise<ethers.TransactionReceipt | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt && receipt.confirmations >= confirmations) {
        return receipt;
      }
    } catch {
      // Retry on error
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return null;
}
