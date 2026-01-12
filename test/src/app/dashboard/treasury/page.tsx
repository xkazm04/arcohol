'use client';

import { useState } from 'react';

const mockTreasury = {
  totalBalance: 250000.00,
  operating: { balance: 45000, target: 50000, currency: 'USDC' },
  reserve: { balance: 180000, apy: 5.2, currency: 'USDY' },
  vault: { balance: 25000, lockPeriod: 30, unlockDate: '2024-02-15' },
  yieldEarned: {
    today: 25.34,
    week: 178.50,
    month: 1082.50,
    total: 4520.00,
  },
  chainAllocations: [
    { chain: 'Arc', balance: 125000, percentage: 50, color: 'cyan' },
    { chain: 'Base', balance: 62500, percentage: 25, color: 'blue' },
    { chain: 'Ethereum', balance: 37500, percentage: 15, color: 'purple' },
    { chain: 'Polygon', balance: 25000, percentage: 10, color: 'violet' },
  ],
};

const recentTransactions = [
  { id: 1, type: 'yield_credit', amount: 25.34, description: 'Daily yield credited', time: '2 hours ago' },
  { id: 2, type: 'deposit', amount: 10000, description: 'Invoice payment received', time: '5 hours ago' },
  { id: 3, type: 'transfer_to_reserve', amount: 5000, description: 'Moved to reserve fund', time: '1 day ago' },
  { id: 4, type: 'payment', amount: -2500, description: 'Vendor payment sent', time: '2 days ago' },
];

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'allocations' | 'transactions'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Treasury</h1>
          <p className="text-slate-400 mt-1">Multi-fund management with automated yield optimization</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
            Rebalance
          </button>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
            Transfer Funds
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-slate-800/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400 mb-1">Total Treasury Balance</div>
            <div className="text-4xl font-bold text-white font-mono">${mockTreasury.totalBalance.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-400 text-sm font-medium">+${mockTreasury.yieldEarned.month.toLocaleString()}</span>
              <span className="text-slate-500 text-sm">yield this month</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Projected Annual Yield</div>
            <div className="text-2xl font-bold text-green-400">$12,990</div>
            <div className="text-sm text-slate-500">@ 5.2% APY</div>
          </div>
        </div>
      </div>

      {/* Funds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operating Fund */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Operating</span>
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">USDC</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-2">${mockTreasury.operating.balance.toLocaleString()}</div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Target: ${mockTreasury.operating.target.toLocaleString()}</span>
            <span>{Math.round((mockTreasury.operating.balance / mockTreasury.operating.target) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((mockTreasury.operating.balance / mockTreasury.operating.target) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Reserve Fund */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Reserve</span>
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">USDY • {mockTreasury.reserve.apy}% APY</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-2">${mockTreasury.reserve.balance.toLocaleString()}</div>
          <div className="text-xs text-green-400">
            +${mockTreasury.yieldEarned.today.toFixed(2)} today
          </div>
        </div>

        {/* Vault Fund */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Vault</span>
            </div>
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Locked</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mb-2">${mockTreasury.vault.balance.toLocaleString()}</div>
          <div className="text-xs text-slate-500">
            Unlocks {mockTreasury.vault.unlockDate}
          </div>
        </div>
      </div>

      {/* Chain Allocations */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <h2 className="text-sm font-medium text-white mb-4">Chain Allocations</h2>
        <div className="space-y-4">
          {mockTreasury.chainAllocations.map((chain) => (
            <div key={chain.chain} className="flex items-center gap-4">
              <div className="w-20 text-sm text-slate-400">{chain.chain}</div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-${chain.color}-500`}
                  style={{ width: `${chain.percentage}%`, backgroundColor: chain.color === 'cyan' ? '#06b6d4' : chain.color === 'blue' ? '#3b82f6' : chain.color === 'purple' ? '#a855f7' : '#8b5cf6' }}
                />
              </div>
              <div className="w-32 text-right">
                <span className="text-sm font-mono text-white">${chain.balance.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-2">{chain.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'yield_credit' ? 'bg-green-500/10 text-green-400' :
                  tx.type === 'deposit' ? 'bg-cyan-500/10 text-cyan-400' :
                  tx.type === 'transfer_to_reserve' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tx.amount > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    )}
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-white">{tx.description}</div>
                  <div className="text-xs text-slate-500">{tx.time}</div>
                </div>
              </div>
              <span className={`text-sm font-mono ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
