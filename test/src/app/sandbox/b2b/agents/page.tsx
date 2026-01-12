'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'depleted';
  walletAddress: string;
  balance: string;
  spent24h: string;
  spentTotal: string;
  budget: {
    daily: string;
    monthly: string;
    used: number;
  };
  lastActivity: string;
  transactionCount: number;
}

const mockAgents: Agent[] = [
  {
    id: 'agent_research_01',
    name: 'Research Assistant',
    status: 'active',
    walletAddress: '0x1234...abcd',
    balance: '450.00',
    spent24h: '23.50',
    spentTotal: '1,247.80',
    budget: { daily: '50.00', monthly: '1000.00', used: 47 },
    lastActivity: '2 min ago',
    transactionCount: 342,
  },
  {
    id: 'agent_data_02',
    name: 'Data Aggregator',
    status: 'active',
    walletAddress: '0x5678...efgh',
    balance: '892.15',
    spent24h: '8.20',
    spentTotal: '3,456.00',
    budget: { daily: '100.00', monthly: '2500.00', used: 8 },
    lastActivity: '15 min ago',
    transactionCount: 1205,
  },
  {
    id: 'agent_monitor_03',
    name: 'Price Monitor',
    status: 'paused',
    walletAddress: '0x9abc...ijkl',
    balance: '125.00',
    spent24h: '0.00',
    spentTotal: '567.90',
    budget: { daily: '25.00', monthly: '500.00', used: 0 },
    lastActivity: '3 hours ago',
    transactionCount: 89,
  },
];

const recentTransactions = [
  { id: 1, agent: 'Research Assistant', type: 'API Call', amount: '0.05', vendor: 'openai.com', time: '2 min ago' },
  { id: 2, agent: 'Data Aggregator', type: 'Data Fetch', amount: '0.02', vendor: 'coingecko.com', time: '5 min ago' },
  { id: 3, agent: 'Research Assistant', type: 'API Call', amount: '0.10', vendor: 'anthropic.com', time: '8 min ago' },
  { id: 4, agent: 'Data Aggregator', type: 'Storage', amount: '0.15', vendor: 'ipfs.io', time: '12 min ago' },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalBalance = mockAgents.reduce((acc, a) => acc + parseFloat(a.balance), 0);
  const totalSpent24h = mockAgents.reduce((acc, a) => acc + parseFloat(a.spent24h), 0);
  const activeAgents = mockAgents.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">AI Agent Wallets</h1>
          <p className="text-sm text-slate-400">Manage autonomous agent wallets with budget controls</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-white font-mono">${totalBalance.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Across all agents</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Spent (24h)</div>
          <div className="text-2xl font-bold text-white font-mono">${totalSpent24h.toFixed(2)}</div>
          <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            Within budget
          </div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Active Agents</div>
          <div className="text-2xl font-bold text-white font-mono">{activeAgents}/{mockAgents.length}</div>
          <div className="text-xs text-slate-500 mt-1">Currently running</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Anomalies</div>
          <div className="text-2xl font-bold text-green-400 font-mono">0</div>
          <div className="text-xs text-slate-500 mt-1">Last 7 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase">Agent Wallets</div>
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`bg-slate-900/40 rounded-xl border p-5 cursor-pointer transition-all hover:bg-slate-800/40 ${
                selectedAgent?.id === agent.id ? 'border-cyan-500/50' : 'border-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    agent.status === 'paused' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{agent.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{agent.walletAddress}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  agent.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  agent.status === 'paused' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {agent.status}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Balance</div>
                  <div className="text-lg font-bold text-white font-mono">${agent.balance}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Spent 24h</div>
                  <div className="text-lg font-bold text-white font-mono">${agent.spent24h}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-1">Budget Used</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${agent.budget.used > 80 ? 'bg-red-500' : agent.budget.used > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${agent.budget.used}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{agent.budget.used}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>{agent.transactionCount} transactions</span>
                <span>Last active: {agent.lastActivity}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase">Recent Transactions</div>
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{tx.agent}</span>
                    <span className="text-sm font-mono text-red-400">-${tx.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{tx.type} - {tx.vendor}</span>
                    <span>{tx.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800/60 bg-slate-900/20">
              <button className="w-full text-xs text-cyan-400 hover:text-cyan-300 text-center">
                View All Transactions
              </button>
            </div>
          </div>

          {/* Budget Controls */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
            <div className="text-xs font-mono text-slate-500 uppercase mb-4">Budget Controls</div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Daily Limit</span>
                  <span className="text-sm font-mono text-white">$50.00</span>
                </div>
                <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" defaultValue={50} max={200} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Monthly Limit</span>
                  <span className="text-sm font-mono text-white">$1,000.00</span>
                </div>
                <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" defaultValue={1000} max={5000} />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-sm text-slate-300">Anomaly Detection</span>
                <div className="w-10 h-5 bg-cyan-600 rounded-full p-0.5">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-white mb-4">Create AI Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Agent Name</label>
                <input type="text" placeholder="e.g., Research Assistant" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Initial Balance</label>
                <input type="number" placeholder="100.00" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Daily Budget Limit</label>
                <input type="number" placeholder="50.00" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
              <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Create Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
