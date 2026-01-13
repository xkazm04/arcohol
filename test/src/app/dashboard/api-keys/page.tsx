'use client';

import { useState } from 'react';
import { useApiKeys } from '@/features/api-keys';
import { useOrganization } from '@/features/shared';
import { SUPPORTED_CHAINS } from '@/features/transactions';

export default function ApiKeysPage() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { apiKeys, isLoading, error, stats, createApiKey, revokeApiKey, refetch } = useApiKeys({
    organizationId: organization?.id,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: ['read', 'write'],
    wallet_address: '',
    chain: 'arc',
    environment: 'production',
  });

  const handleCopyKey = (keyId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async () => {
    if (!newKeyData.name.trim()) return;

    setIsCreating(true);
    const result = await createApiKey({
      name: newKeyData.name,
      permissions: newKeyData.permissions,
      wallet_address: newKeyData.wallet_address || undefined,
      chain: newKeyData.chain,
    });

    if (result) {
      setNewSecret(result.secretKey);
      setShowCreateModal(false);
      setShowSecretModal(true);
      setNewKeyData({
        name: '',
        permissions: ['read', 'write'],
        wallet_address: '',
        chain: 'arc',
        environment: 'production',
      });
    }
    setIsCreating(false);
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      await revokeApiKey(keyId);
    }
  };

  const formatLastUsed = (lastUsedAt?: string) => {
    if (!lastUsedAt) return 'Never';
    const date = new Date(lastUsedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (orgLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={refetch} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400 mt-1">Manage API keys and linked blockchain wallets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Total API Keys</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Active Keys</div>
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">With Wallet</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.withWallet}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Chains</div>
          <div className="text-2xl font-bold text-purple-400">
            {new Set(apiKeys.filter(k => k.chain).map(k => k.chain)).size || 0}
          </div>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">Wallet-Linked API Keys</h3>
              <p className="text-xs text-slate-400">
                Each API key can be paired with a blockchain wallet address. Transactions from that wallet
                will be tracked and displayed in the Transactions dashboard. Supports Arc, Ethereum, Polygon, and Base.
              </p>
            </div>
          </div>
          <a
            href="/sandbox/react-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            React SDK Docs
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Your API Keys</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Keys are encrypted at rest
          </div>
        </div>

        {apiKeys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-slate-400 text-sm mb-3">No API keys yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Create your first API key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {apiKeys.map((apiKey) => {
              const chainConfig = SUPPORTED_CHAINS[apiKey.chain || 'arc'];
              return (
                <div key={apiKey.id} className="px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        apiKey.wallet_address ? 'bg-cyan-500/10' : 'bg-slate-500/10'
                      }`}>
                        <svg className={`w-5 h-5 ${apiKey.wallet_address ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{apiKey.name}</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400">
                            active
                          </span>
                          {chainConfig && (
                            <span className={`px-2 py-0.5 text-xs rounded-full bg-${chainConfig.color}-500/10 text-${chainConfig.color}-400`}
                              style={{ backgroundColor: `rgb(var(--${chainConfig.color}-500) / 0.1)` }}>
                              {chainConfig.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <code className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-0.5 rounded">
                            {apiKey.key_prefix}
                          </code>
                          <button
                            onClick={() => handleCopyKey(apiKey.id, apiKey.key_prefix)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            {copiedKey === apiKey.id ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {apiKey.wallet_address ? (
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Wallet</div>
                          <code className="text-xs text-cyan-400 font-mono">
                            {formatAddress(apiKey.wallet_address)}
                          </code>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-xs text-slate-500">No wallet linked</div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Last used</div>
                        <div className="text-xs text-slate-500">{formatLastUsed(apiKey.last_used_at)}</div>
                      </div>
                      <button
                        onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Permissions:</span>
                    {apiKey.permissions.map((perm) => (
                      <span key={perm} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create API Key</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Key Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Production Frontend"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Blockchain Network</label>
                <select
                  value={newKeyData.chain}
                  onChange={(e) => setNewKeyData({ ...newKeyData, chain: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                    <option key={id} value={id}>{chain.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Wallet Address
                  <span className="text-slate-600 ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newKeyData.wallet_address}
                  onChange={(e) => setNewKeyData({ ...newKeyData, wallet_address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Link a wallet to track its transactions in the dashboard
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Permissions</label>
                <div className="grid grid-cols-3 gap-2">
                  {['read', 'write', 'delete'].map((perm) => (
                    <label key={perm} className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={newKeyData.permissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({ ...newKeyData, permissions: [...newKeyData.permissions, perm] });
                          } else {
                            setNewKeyData({ ...newKeyData, permissions: newKeyData.permissions.filter(p => p !== perm) });
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-slate-700"
                      />
                      <span className="text-sm text-white capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateKey}
                disabled={isCreating || !newKeyData.name.trim()}
                className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create API Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Key Modal */}
      {showSecretModal && newSecret && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg m-4">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">API Key Created</h3>
              <p className="text-sm text-slate-400 mt-1">
                Make sure to copy your secret key now. You won&apos;t be able to see it again!
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-400 text-sm mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Store this securely
                </div>
                <p className="text-xs text-slate-400">
                  This secret key will only be shown once. Store it in a secure location.
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Secret Key</label>
                <div className="flex gap-2">
                  <code className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-cyan-400 text-sm font-mono break-all">
                    {newSecret}
                  </code>
                  <button
                    onClick={() => handleCopyKey('new-secret', newSecret)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                  >
                    {copiedKey === 'new-secret' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setNewSecret(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                I&apos;ve saved my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
