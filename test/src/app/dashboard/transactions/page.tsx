'use client';

import { useState } from 'react';
import { useApiKeys } from '@/features/api-keys';
import { useBlockchainTransactions, SUPPORTED_CHAINS } from '@/features/transactions';
import { useOrganization } from '@/features/shared';
import type { BlockchainTransaction } from '@/lib/supabase/types';

export default function TransactionsPage() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { apiKeys, isLoading: apiKeysLoading } = useApiKeys({
    organizationId: organization?.id,
  });

  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('all');
  const [selectedChain, setSelectedChain] = useState<string>('all');

  const {
    transactions,
    isLoading,
    error,
    stats,
    filters,
    sortOrder,
    updateFilters,
    clearFilters,
    toggleSortOrder,
    refetch,
  } = useBlockchainTransactions({
    apiKeys,
    selectedApiKeyId,
    selectedChain,
  });

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExplorerUrl = (tx: BlockchainTransaction) => {
    const chain = SUPPORTED_CHAINS[tx.chain];
    if (!chain) return '#';
    return `${chain.explorerUrl}/tx/${tx.hash}`;
  };

  const statusStyles: Record<string, string> = {
    success: 'bg-green-500/10 text-green-400',
    failed: 'bg-red-500/10 text-red-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
  };

  const typeStyles: Record<string, string> = {
    native: 'text-purple-400',
    erc20: 'text-cyan-400',
    internal: 'text-orange-400',
  };

  if (orgLoading || apiKeysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blockchain Transactions</h1>
          <p className="text-slate-400 mt-1">View transactions from wallets linked to your API keys</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Last 24h</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.last24h}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Volume (24h)</div>
          <div className="text-2xl font-bold text-white font-mono">{stats.volume24h.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">{stats.successRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* API Key / Wallet Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1.5">API Key / Wallet</label>
            <select
              value={selectedApiKeyId}
              onChange={(e) => setSelectedApiKeyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Wallets</option>
              {apiKeys.filter(k => k.wallet_address).map((key) => (
                <option key={key.id} value={key.id}>
                  {key.name} ({formatAddress(key.wallet_address!)})
                </option>
              ))}
            </select>
          </div>

          {/* Chain Filter */}
          <div className="w-40">
            <label className="block text-xs text-slate-500 mb-1.5">Chain</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Chains</option>
              {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                <option key={id} value={id}>{chain.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-40">
            <label className="block text-xs text-slate-500 mb-1.5">Type</label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => updateFilters({ type: e.target.value as 'all' | 'native' | 'erc20' })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="native">Native</option>
              <option value="erc20">ERC-20</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <label className="block text-xs text-slate-500 mb-1.5">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => updateFilters({ status: e.target.value as 'all' | 'success' | 'failed' })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs text-slate-500 mb-1.5">Search</label>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by hash or address..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {apiKeys.filter(k => k.wallet_address).length === 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-white">No wallet-linked API keys found</p>
              <p className="text-xs text-slate-400 mt-1">
                Link a blockchain wallet to an API key to track its transactions here.
                Go to <a href="/dashboard/api-keys" className="text-cyan-400 hover:underline">API Keys</a> to create one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={refetch} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tx Hash</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">From / To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Chain</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">API Key</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                      onClick={toggleSortOrder}
                    >
                      <div className="flex items-center gap-1">
                        Time
                        <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => {
                    const chainConfig = SUPPORTED_CHAINS[tx.chain];
                    return (
                      <tr key={tx.hash} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <a
                            href={getExplorerUrl(tx)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 font-mono hover:underline flex items-center gap-1"
                          >
                            {formatAddress(tx.hash)}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <div className="text-xs text-slate-600 mt-0.5">Block #{tx.blockNumber.toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium capitalize ${typeStyles[tx.type]}`}>
                            {tx.type === 'erc20' ? 'ERC-20' : tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[tx.status]}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-medium text-white">
                            {tx.valueFormatted.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{tx.tokenSymbol}</span>
                          {tx.gasFee && (
                            <div className="text-xs text-slate-600">
                              Gas: {tx.gasFee.toFixed(6)} ETH
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <div className="text-slate-400 font-mono">{formatAddress(tx.from)}</div>
                            <div className="text-slate-600">↓</div>
                            <div className="text-slate-400 font-mono">{formatAddress(tx.to)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {chainConfig && (
                            <span className={`px-2 py-0.5 text-xs rounded bg-${chainConfig.color}-500/10 text-${chainConfig.color}-400`}
                              style={{
                                backgroundColor: chainConfig.color === 'cyan' ? 'rgb(6 182 212 / 0.1)' :
                                                 chainConfig.color === 'purple' ? 'rgb(168 85 247 / 0.1)' :
                                                 chainConfig.color === 'violet' ? 'rgb(139 92 246 / 0.1)' :
                                                 'rgb(59 130 246 / 0.1)',
                                color: chainConfig.color === 'cyan' ? 'rgb(34 211 238)' :
                                       chainConfig.color === 'purple' ? 'rgb(192 132 252)' :
                                       chainConfig.color === 'violet' ? 'rgb(167 139 250)' :
                                       'rgb(96 165 250)'
                              }}>
                              {chainConfig.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-400">{tx.apiKeyName || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">{formatTimestamp(tx.timestamp)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-400 text-sm">No transactions found</p>
                {(selectedApiKeyId !== 'all' || selectedChain !== 'all' || filters.type || filters.status || filters.search) && (
                  <button
                    onClick={() => {
                      setSelectedApiKeyId('all');
                      setSelectedChain('all');
                      clearFilters();
                    }}
                    className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            {transactions.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Showing {transactions.length} transactions
                </span>
                <div className="text-xs text-slate-500">
                  Data refreshed from blockchain explorers
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
