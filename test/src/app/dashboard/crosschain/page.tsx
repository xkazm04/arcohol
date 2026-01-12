'use client';

import { useState } from 'react';

const supportedChains = [
  { id: 'arc', name: 'Arc', icon: 'A', color: 'cyan', balance: 125000, status: 'active' },
  { id: 'base', name: 'Base', icon: 'B', color: 'blue', balance: 62500, status: 'active' },
  { id: 'ethereum', name: 'Ethereum', icon: 'E', color: 'purple', balance: 37500, status: 'active' },
  { id: 'polygon', name: 'Polygon', icon: 'P', color: 'violet', balance: 25000, status: 'active' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'A', color: 'orange', balance: 0, status: 'coming_soon' },
];

const recentBridges = [
  {
    id: 'BR-001',
    from: { chain: 'Base', amount: 5000 },
    to: { chain: 'Arc', amount: 5000 },
    status: 'completed',
    time: '2 hours ago',
    fee: 0.50,
  },
  {
    id: 'BR-002',
    from: { chain: 'Ethereum', amount: 10000 },
    to: { chain: 'Base', amount: 10000 },
    status: 'pending',
    time: '15 minutes ago',
    fee: 2.50,
  },
  {
    id: 'BR-003',
    from: { chain: 'Polygon', amount: 2500 },
    to: { chain: 'Arc', amount: 2500 },
    status: 'completed',
    time: '1 day ago',
    fee: 0.25,
  },
];

const bridgeRoutes = [
  { from: 'Ethereum', to: 'Base', time: '~2 min', fee: '0.1%' },
  { from: 'Ethereum', to: 'Arc', time: '~5 min', fee: '0.05%' },
  { from: 'Base', to: 'Arc', time: '~1 min', fee: '0.01%' },
  { from: 'Polygon', to: 'Arc', time: '~3 min', fee: '0.02%' },
];

export default function CrossChainPage() {
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [selectedFromChain, setSelectedFromChain] = useState('base');
  const [selectedToChain, setSelectedToChain] = useState('arc');

  const totalBalance = supportedChains.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CrossChain</h1>
          <p className="text-slate-400 mt-1">Multi-chain treasury management and bridging</p>
        </div>
        <button
          onClick={() => setShowBridgeModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Bridge Funds
        </button>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-slate-800/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400 mb-1">Total Cross-Chain Balance</div>
            <div className="text-4xl font-bold text-white font-mono">${totalBalance.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-4">
            {supportedChains.filter(c => c.status === 'active').map((chain) => (
              <div key={chain.id} className="text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-1`}
                     style={{ backgroundColor: chain.color === 'cyan' ? '#06b6d4' : chain.color === 'blue' ? '#3b82f6' : chain.color === 'purple' ? '#a855f7' : '#8b5cf6' }}>
                  {chain.icon}
                </div>
                <div className="text-xs text-slate-500">{chain.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chain Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {supportedChains.map((chain) => (
          <div
            key={chain.id}
            className={`bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 ${chain.status === 'coming_soon' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: chain.color === 'cyan' ? '#06b6d4' : chain.color === 'blue' ? '#3b82f6' : chain.color === 'purple' ? '#a855f7' : chain.color === 'violet' ? '#8b5cf6' : '#f97316' }}
                >
                  {chain.icon}
                </div>
                <span className="text-sm font-medium text-white">{chain.name}</span>
              </div>
              {chain.status === 'coming_soon' ? (
                <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">Coming Soon</span>
              ) : (
                <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded">Active</span>
              )}
            </div>
            <div className="text-2xl font-bold text-white font-mono">${chain.balance.toLocaleString()}</div>
            {chain.status === 'active' && chain.balance > 0 && (
              <div className="mt-3 flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors">
                  Send
                </button>
                <button className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors">
                  Bridge
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bridge Routes */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">Available Bridge Routes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {bridgeRoutes.map((route, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-sm font-medium text-white">{route.from}</span>
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-sm font-medium text-white">{route.to}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{route.time}</span>
                <span>{route.fee} fee</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bridges */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">Recent Bridges</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {recentBridges.map((bridge) => (
            <div key={bridge.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{bridge.from.chain.charAt(0)}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">{bridge.to.chain.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white">{bridge.from.chain} → {bridge.to.chain}</div>
                  <div className="text-xs text-slate-500">{bridge.id} • {bridge.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-mono text-white">${bridge.from.amount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Fee: ${bridge.fee}</div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  bridge.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  bridge.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {bridge.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge Modal */}
      {showBridgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowBridgeModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Bridge Funds</h3>
              <button onClick={() => setShowBridgeModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">From</label>
                <select
                  value={selectedFromChain}
                  onChange={(e) => setSelectedFromChain(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {supportedChains.filter(c => c.status === 'active').map((chain) => (
                    <option key={chain.id} value={chain.id}>{chain.name} (${chain.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center">
                <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">To</label>
                <select
                  value={selectedToChain}
                  onChange={(e) => setSelectedToChain(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {supportedChains.filter(c => c.status === 'active').map((chain) => (
                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Amount (USDC)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Estimated time</span>
                  <span className="text-white">~1 min</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Bridge fee</span>
                  <span className="text-white">0.01%</span>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors">
                Bridge Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
