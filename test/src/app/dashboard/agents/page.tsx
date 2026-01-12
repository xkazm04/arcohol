'use client';

import { useState } from 'react';

const mockAgents = [
  {
    id: 'agent-001',
    name: 'Sales Assistant',
    description: 'Handles customer inquiries and processes orders',
    walletAddress: '0x7a23...8f4d',
    balance: 2500.00,
    status: 'active',
    spent24h: 45.50,
    spent7d: 312.00,
    spentTotal: 1850.00,
    transactionCount: 156,
    budgets: { daily: 100, monthly: 2000, perTx: 50 },
    vendors: ['OpenAI', 'Anthropic', 'Perplexity'],
  },
  {
    id: 'agent-002',
    name: 'Data Analyst',
    description: 'Processes reports and generates insights',
    walletAddress: '0x3f91...2c8a',
    balance: 1200.00,
    status: 'active',
    spent24h: 28.00,
    spent7d: 195.00,
    spentTotal: 890.00,
    transactionCount: 89,
    budgets: { daily: 75, monthly: 1500, perTx: 25 },
    vendors: ['OpenAI', 'Databricks'],
  },
  {
    id: 'agent-003',
    name: 'Support Bot',
    description: 'Customer support automation',
    walletAddress: '0x9d47...1e3b',
    balance: 150.00,
    status: 'low_balance',
    spent24h: 85.00,
    spent7d: 520.00,
    spentTotal: 2100.00,
    transactionCount: 312,
    budgets: { daily: 150, monthly: 3000, perTx: 10 },
    vendors: ['Anthropic', 'Twilio'],
  },
];

const pendingApprovals = [
  { id: 1, agent: 'Sales Assistant', amount: 75.00, vendor: 'OpenAI', reason: 'Exceeds per-transaction limit' },
  { id: 2, agent: 'Support Bot', amount: 200.00, vendor: 'Anthropic', reason: 'New vendor access request' },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<typeof mockAgents[0] | null>(null);

  const totalBalance = mockAgents.reduce((sum, a) => sum + a.balance, 0);
  const totalSpent24h = mockAgents.reduce((sum, a) => sum + a.spent24h, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-slate-400 mt-1">Manage agent wallets, budgets, and spending limits</p>
        </div>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Agent Balance</div>
          <div className="text-2xl font-bold text-white font-mono">${totalBalance.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Spent (24h)</div>
          <div className="text-2xl font-bold text-white font-mono">${totalSpent24h.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Active Agents</div>
          <div className="text-2xl font-bold text-green-400">{mockAgents.filter(a => a.status === 'active').length}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Pending Approvals</div>
          <div className="text-2xl font-bold text-orange-400">{pendingApprovals.length}</div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-orange-400">Pending Approvals</span>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div>
                  <div className="text-sm text-white">{approval.agent} → {approval.vendor}</div>
                  <div className="text-xs text-slate-500">{approval.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">${approval.amount}</span>
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg">Approve</button>
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg">Deny</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 hover:border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{agent.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{agent.walletAddress}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                agent.status === 'active' ? 'bg-green-500/10 text-green-400' :
                agent.status === 'low_balance' ? 'bg-orange-500/10 text-orange-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {agent.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-2xl font-bold text-white font-mono mb-1">${agent.balance.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mb-4">{agent.description}</div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800/50 rounded-lg p-2">
                <div className="text-xs text-slate-500">24h</div>
                <div className="text-sm font-mono text-white">${agent.spent24h}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <div className="text-xs text-slate-500">7d</div>
                <div className="text-sm font-mono text-white">${agent.spent7d}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2">
                <div className="text-xs text-slate-500">Txns</div>
                <div className="text-sm font-mono text-white">{agent.transactionCount}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {agent.vendors.map((vendor) => (
                <span key={vendor} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                  {vendor}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{selectedAgent.name}</h3>
              <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500">Daily Limit</div>
                  <div className="text-lg font-mono text-white">${selectedAgent.budgets.daily}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500">Monthly Limit</div>
                  <div className="text-lg font-mono text-white">${selectedAgent.budgets.monthly}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500">Per-Tx Limit</div>
                  <div className="text-lg font-mono text-white">${selectedAgent.budgets.perTx}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg">
                  Add Funds
                </button>
                <button className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg">
                  Edit Budgets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
