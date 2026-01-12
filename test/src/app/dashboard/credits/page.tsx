'use client';

import { useState } from 'react';
import { CreditCard } from '@/app/features/credits';

export default function CreditsPage() {
  const [autoRefill, setAutoRefill] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');

  // Mock data - will be replaced with real API calls
  const creditAccount = {
    balance: '45,230.50',
    accountId: 'cred_abc123xyz',
    status: 'active' as const,
    yieldBalance: '2,450.00',
    yieldEarned: '182.50',
  };

  const usageRecords = [
    { id: '1', meter: 'api_call', count: 100, cost: '1.00', time: '2 min ago' },
    { id: '2', meter: 'data_export', count: 5, cost: '2.50', time: '15 min ago' },
    { id: '3', meter: 'premium_feature', count: 1, cost: '5.00', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Credits & Usage</h1>
          <p className="text-sm text-slate-400">Manage prepaid balances and monitor consumption</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-slate-500">AUTO-REFILL</div>
            <div className="text-sm font-medium text-white">{autoRefill ? 'ON (Threshold: $100)' : 'OFF'}</div>
          </div>
          <button
            onClick={() => setAutoRefill(!autoRefill)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRefill ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRefill ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Credit Card */}
          <CreditCard
            balance={creditAccount.balance}
            accountId={creditAccount.accountId}
            status={creditAccount.status}
            yieldBalance={creditAccount.yieldBalance}
          />

          {/* Quick Deposit */}
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
            <div className="text-xs font-mono text-slate-500 uppercase mb-4">Add Funds</div>
            <div className="flex gap-2">
              {[100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`flex-1 py-2 text-xs font-medium rounded border transition-all ${
                    depositAmount === amt.toString()
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                />
              </div>
              <button className="px-6 py-2.5 bg-white hover:bg-slate-200 text-black text-xs font-bold rounded-lg transition-all min-w-[100px]">
                DEPOSIT
              </button>
            </div>
          </div>

          {/* Yield Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl" />
              <div className="text-xs font-mono text-slate-500 uppercase mb-1">Yield Balance</div>
              <div className="text-xl font-bold text-white mb-1">${creditAccount.yieldBalance}</div>
              <div className="text-[10px] text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                5.2% APY
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
              <div className="text-xs font-mono text-slate-500 uppercase mb-1">Earned YTD</div>
              <div className="text-xl font-bold text-white mb-1">${creditAccount.yieldEarned}</div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Usage */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 uppercase">Recent Usage</span>
              <button className="text-xs text-cyan-400 hover:text-cyan-300">View All</button>
            </div>
            <div className="divide-y divide-slate-800/60">
              {usageRecords.map((record) => (
                <div key={record.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="font-mono text-[10px]">{record.meter.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{record.meter}</div>
                        <div className="text-xs text-slate-500">{record.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">-${record.cost}</div>
                      <div className="text-xs text-slate-500">{record.count} units</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Summary */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
            <div className="text-xs font-mono text-slate-500 uppercase mb-4">This Month</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-white font-mono">$1,247</div>
                <div className="text-xs text-slate-500">Total Usage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">12,450</div>
                <div className="text-xs text-slate-500">API Calls</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">89%</div>
                <div className="text-xs text-slate-500">vs Last Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
