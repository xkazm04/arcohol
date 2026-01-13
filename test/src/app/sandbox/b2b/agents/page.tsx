'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StatCard,
  Card,
  CardHeader,
  DataList,
  DataListItem,
  Modal,
  GlowButton,
  FormInput,
  StatusBadge,
  ToggleSwitch,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

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
  const [anomalyDetection, setAnomalyDetection] = useState(true);

  const totalBalance = mockAgents.reduce((acc, a) => acc + parseFloat(a.balance), 0);
  const totalSpent24h = mockAgents.reduce((acc, a) => acc + parseFloat(a.spent24h), 0);
  const activeAgents = mockAgents.filter(a => a.status === 'active').length;

  const statusMap: Record<string, 'active' | 'pending' | 'failed'> = {
    active: 'active',
    paused: 'pending',
    depleted: 'failed',
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white"
            style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            AI Agent Wallets
          </h1>
          <p className="text-xs text-slate-400">Manage autonomous agent wallets with budget controls</p>
        </div>
        <GlowButton
          onClick={() => setShowCreateModal(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Create Agent
        </GlowButton>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Balance"
          value={`$${totalBalance.toFixed(2)}`}
          subValue="Across all agents"
          accent="cyan"
          delay={0}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
        <StatCard
          label="Spent (24h)"
          value={`$${totalSpent24h.toFixed(2)}`}
          subValue="Within budget"
          accent="emerald"
          delay={0.05}
          trend={{ value: 'OK', positive: true }}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard
          label="Active Agents"
          value={`${activeAgents}/${mockAgents.length}`}
          subValue="Currently running"
          accent="blue"
          delay={0.1}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Anomalies"
          value="0"
          subValue="Last 7 days"
          accent="emerald"
          delay={0.15}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase pl-1">Agent Wallets</div>
          <motion.div variants={staggerContainer} className="space-y-3">
            {mockAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                variants={listItem}
                whileHover={{ scale: 1.01, x: 3 }}
                onClick={() => setSelectedAgent(agent)}
                className={`relative bg-slate-900/50 rounded-lg border p-4 cursor-pointer transition-all overflow-hidden ${
                  selectedAgent?.id === agent.id ? 'border-cyan-500/50' : 'border-slate-800/40 hover:border-slate-700/50'
                }`}
              >
                {/* Corner markers */}
                <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 rounded-tl ${
                  agent.status === 'active' ? 'border-green-500/30' : agent.status === 'paused' ? 'border-amber-500/30' : 'border-red-500/30'
                }`} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 rounded-tr ${
                  agent.status === 'active' ? 'border-green-500/30' : agent.status === 'paused' ? 'border-amber-500/30' : 'border-red-500/30'
                }`} />
                <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 rounded-bl ${
                  agent.status === 'active' ? 'border-green-500/30' : agent.status === 'paused' ? 'border-amber-500/30' : 'border-red-500/30'
                }`} />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 rounded-br ${
                  agent.status === 'active' ? 'border-green-500/30' : agent.status === 'paused' ? 'border-amber-500/30' : 'border-red-500/30'
                }`} />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        agent.status === 'active' ? 'bg-green-500/10 text-green-400' :
                        agent.status === 'paused' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <div>
                      <div className="text-sm font-semibold text-white">{agent.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{agent.walletAddress}</div>
                    </div>
                  </div>
                  <StatusBadge status={statusMap[agent.status]} label={agent.status} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Balance</div>
                    <div
                      className="text-base font-bold text-white font-mono"
                      style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.3)' }}
                    >
                      ${agent.balance}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Spent 24h</div>
                    <div className="text-base font-bold text-white font-mono">${agent.spent24h}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Budget Used</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.budget.used}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${agent.budget.used > 80 ? 'bg-red-500' : agent.budget.used > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{agent.budget.used}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{agent.transactionCount} transactions</span>
                  <span>Last active: {agent.lastActivity}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Recent Transactions */}
          <Card accent="cyan" delay={0.2} className="overflow-hidden">
            <CardHeader
              title="Recent Transactions"
              action={
                <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">All</button>
              }
            />
            <DataList>
              {recentTransactions.map((tx) => (
                <DataListItem key={tx.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-white">{tx.agent}</div>
                      <div className="text-[10px] text-slate-500">{tx.type} - {tx.vendor}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-red-400">-${tx.amount}</div>
                      <div className="text-[10px] text-slate-600">{tx.time}</div>
                    </div>
                  </div>
                </DataListItem>
              ))}
            </DataList>
          </Card>

          {/* Budget Controls */}
          <Card accent="purple" delay={0.3}>
            <CardHeader title="Budget Controls" />
            <div className="p-3 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Daily Limit</span>
                  <span className="text-xs font-mono text-white">$50.00</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '25%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Monthly Limit</span>
                  <span className="text-xs font-mono text-white">$1,000.00</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '20%' }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
                <span className="text-xs text-slate-300">Anomaly Detection</span>
                <ToggleSwitch
                  checked={anomalyDetection}
                  onChange={() => setAnomalyDetection(!anomalyDetection)}
                  size="sm"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create AI Agent"
        subtitle="Set up a new autonomous agent wallet"
        size="sm"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</GlowButton>
            <GlowButton onClick={() => setShowCreateModal(false)}>Create Agent</GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Agent Name"
            placeholder="e.g., Research Assistant"
          />
          <FormInput
            label="Initial Balance"
            type="number"
            placeholder="100.00"
            className="font-mono"
          />
          <FormInput
            label="Daily Budget Limit"
            type="number"
            placeholder="50.00"
            className="font-mono"
          />
        </div>
      </Modal>
    </motion.div>
  );
}
