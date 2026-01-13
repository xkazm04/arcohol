'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BlockchainTransaction, ChainConfig, ApiKey } from '@/lib/supabase/types';

// Chain configurations with explorer API endpoints
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  arc: {
    id: 'arc',
    name: 'Arc',
    chainId: 1516,
    explorerUrl: 'https://explorer.arc.dev',
    explorerApiUrl: 'https://explorer.arc.dev/api',
    rpcUrl: 'https://rpc.arc.dev',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    color: 'cyan',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    color: 'purple',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    rpcUrl: 'https://polygon.llamarpc.com',
    nativeCurrency: { symbol: 'MATIC', decimals: 18 },
    color: 'violet',
  },
  base: {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://api.basescan.org/api',
    rpcUrl: 'https://mainnet.base.org',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    color: 'blue',
  },
};

interface UseBlockchainTransactionsOptions {
  apiKeys: ApiKey[];
  selectedApiKeyId?: string;
  selectedChain?: string;
}

interface TransactionFilters {
  type?: 'all' | 'native' | 'erc20';
  status?: 'all' | 'success' | 'failed';
  search?: string;
}

// Etherscan-like API response types
interface EtherscanTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
  contractAddress?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[] | string;
}

// Parse value from wei to readable format
function parseValue(value: string, decimals: number = 18): number {
  try {
    const wei = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const intPart = wei / divisor;
    const fracPart = wei % divisor;
    const fracStr = fracPart.toString().padStart(decimals, '0').slice(0, 6);
    return parseFloat(`${intPart}.${fracStr}`);
  } catch {
    return 0;
  }
}

// Fetch transactions from blockchain explorer API
async function fetchChainTransactions(
  walletAddress: string,
  chain: string,
  apiKeyName: string,
  apiKeyId: string
): Promise<BlockchainTransaction[]> {
  const chainConfig = SUPPORTED_CHAINS[chain];
  if (!chainConfig) return [];

  const transactions: BlockchainTransaction[] = [];

  try {
    // Fetch normal (native) transactions
    const normalTxUrl = `${chainConfig.explorerApiUrl}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;

    const normalResponse = await fetch(normalTxUrl);
    const normalData: EtherscanResponse = await normalResponse.json();

    if (normalData.status === '1' && Array.isArray(normalData.result)) {
      for (const tx of normalData.result) {
        transactions.push({
          hash: tx.hash,
          blockNumber: parseInt(tx.blockNumber, 10),
          timestamp: parseInt(tx.timeStamp, 10) * 1000,
          from: tx.from,
          to: tx.to || '',
          value: tx.value,
          valueFormatted: parseValue(tx.value, chainConfig.nativeCurrency.decimals),
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          gasFee: parseValue((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(), 18),
          status: tx.isError === '0' ? 'success' : 'failed',
          chain,
          chainId: chainConfig.chainId,
          tokenSymbol: chainConfig.nativeCurrency.symbol,
          type: 'native',
          apiKeyId,
          apiKeyName,
        });
      }
    }

    // Fetch ERC-20 token transfers
    const tokenTxUrl = `${chainConfig.explorerApiUrl}?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;

    const tokenResponse = await fetch(tokenTxUrl);
    const tokenData: EtherscanResponse = await tokenResponse.json();

    if (tokenData.status === '1' && Array.isArray(tokenData.result)) {
      for (const tx of tokenData.result) {
        const decimals = parseInt(tx.tokenDecimal || '18', 10);
        transactions.push({
          hash: tx.hash,
          blockNumber: parseInt(tx.blockNumber, 10),
          timestamp: parseInt(tx.timeStamp, 10) * 1000,
          from: tx.from,
          to: tx.to || '',
          value: tx.value,
          valueFormatted: parseValue(tx.value, decimals),
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          gasFee: parseValue((BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0')).toString(), 18),
          status: 'success', // Token transfers shown are always successful
          chain,
          chainId: chainConfig.chainId,
          tokenSymbol: tx.tokenSymbol || 'TOKEN',
          tokenAddress: tx.contractAddress,
          tokenDecimals: decimals,
          type: 'erc20',
          apiKeyId,
          apiKeyName,
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching ${chain} transactions for ${walletAddress}:`, error);
  }

  return transactions;
}

// Generate demo transactions when no real wallets are linked
function generateDemoTransactions(): BlockchainTransaction[] {
  const transactions: BlockchainTransaction[] = [];
  const now = Date.now();

  const demoWallets = [
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5E0B1', chain: 'arc', name: 'Demo Wallet 1' },
    { address: '0x8ba1f109551bD432803012645Hc136E1bD8f25a1', chain: 'ethereum', name: 'Demo Wallet 2' },
  ];

  demoWallets.forEach((wallet, walletIndex) => {
    for (let i = 0; i < 5; i++) {
      const isIncoming = Math.random() > 0.5;
      const chain = wallet.chain;
      const chainConfig = SUPPORTED_CHAINS[chain];

      transactions.push({
        hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`.slice(0, 66),
        blockNumber: 18500000 - Math.floor(Math.random() * 10000),
        timestamp: now - (i * 3600000 + walletIndex * 7200000) - Math.floor(Math.random() * 86400000),
        from: isIncoming ? `0x${Math.random().toString(16).slice(2, 42)}` : wallet.address,
        to: isIncoming ? wallet.address : `0x${Math.random().toString(16).slice(2, 42)}`,
        value: (Math.random() * 10).toFixed(4),
        valueFormatted: parseFloat((Math.random() * 10).toFixed(4)),
        gasUsed: Math.floor(21000 + Math.random() * 50000).toString(),
        gasPrice: Math.floor(10 + Math.random() * 50).toString(),
        gasFee: parseFloat((Math.random() * 0.01).toFixed(6)),
        status: Math.random() > 0.1 ? 'success' : 'failed',
        chain,
        chainId: chainConfig.chainId,
        tokenSymbol: chainConfig.nativeCurrency.symbol,
        type: 'native',
        apiKeyName: wallet.name,
      });
    }
  });

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

export function useBlockchainTransactions({
  apiKeys,
  selectedApiKeyId,
  selectedChain,
}: UseBlockchainTransactionsOptions) {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const keysWithWallets = apiKeys.filter(k => k.wallet_address);

      if (keysWithWallets.length === 0) {
        // No wallets linked - show demo data
        setTransactions(generateDemoTransactions());
        setIsLoading(false);
        return;
      }

      // Fetch transactions from all linked wallets
      const allTransactions: BlockchainTransaction[] = [];

      for (const apiKey of keysWithWallets) {
        const chain = apiKey.chain || 'arc';
        const txs = await fetchChainTransactions(
          apiKey.wallet_address!,
          chain,
          apiKey.name,
          apiKey.id
        );
        allTransactions.push(...txs);
      }

      // Sort by timestamp descending
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);

      // Remove duplicates (same tx might appear in multiple queries)
      const uniqueTxs = allTransactions.filter((tx, index, self) =>
        index === self.findIndex(t => t.hash === tx.hash && t.type === tx.type)
      );

      setTransactions(uniqueTxs);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      // Fall back to demo data on error
      setTransactions(generateDemoTransactions());
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by API key
    if (selectedApiKeyId && selectedApiKeyId !== 'all') {
      result = result.filter(tx => tx.apiKeyId === selectedApiKeyId);
    }

    // Filter by chain
    if (selectedChain && selectedChain !== 'all') {
      result = result.filter(tx => tx.chain === selectedChain);
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      result = result.filter(tx => tx.type === filters.type);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(tx => tx.status === filters.status);
    }

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(tx =>
        tx.hash.toLowerCase().includes(search) ||
        tx.from.toLowerCase().includes(search) ||
        tx.to.toLowerCase().includes(search) ||
        tx.apiKeyName?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return modifier * (a.timestamp - b.timestamp);
    });

    return result;
  }, [transactions, selectedApiKeyId, selectedChain, filters, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = selectedApiKeyId && selectedApiKeyId !== 'all'
      ? transactions.filter(tx => tx.apiKeyId === selectedApiKeyId)
      : transactions;

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const sevenDaysAgo = now - 604800000;

    const last24h = filtered.filter(tx => tx.timestamp > oneDayAgo);
    const last7d = filtered.filter(tx => tx.timestamp > sevenDaysAgo);

    return {
      total: filtered.length,
      totalVolume: filtered.reduce((sum, tx) => sum + tx.valueFormatted, 0),
      last24h: last24h.length,
      volume24h: last24h.reduce((sum, tx) => sum + tx.valueFormatted, 0),
      last7d: last7d.length,
      volume7d: last7d.reduce((sum, tx) => sum + tx.valueFormatted, 0),
      successRate: filtered.length > 0
        ? (filtered.filter(tx => tx.status === 'success').length / filtered.length) * 100
        : 100,
    };
  }, [transactions, selectedApiKeyId]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    error,
    stats,
    filters,
    sortOrder,
    updateFilters,
    clearFilters,
    toggleSortOrder,
    refetch: fetchTransactions,
  };
}
