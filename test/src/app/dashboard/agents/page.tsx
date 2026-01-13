'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeroStatCard,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  DataList,
  DataListItem,
  Modal,
  GlowButton,
  FormInput,
  FormTextarea,
  FormSelect,
  StatusBadge,
  ToggleSwitch,
  AlertBanner,
  staggerContainer,
  listItem,
  ProgressBar,
} from '@/components/dashboard';

// Channel configurations
const channelConfig = {
  google: {
    name: 'Google Ads',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  meta: {
    name: 'Meta Ads',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'indigo',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'cyan',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
  },
  tiktok: {
    name: 'TikTok',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    color: 'pink',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
  },
};

type Channel = keyof typeof channelConfig;

// Mock agents data with multiple channels and experiments
const mockAgents = [
  {
    id: 'agent_001',
    name: 'Q1 Product Launch',
    channel: 'google' as Channel,
    experiment: 'exp_001',
    experimentName: 'Landing Page Test',
    variant: 'A',
    status: 'active' as const,
    totalBudget: 5000.00,
    spent: 1847.32,
    dailyBudget: 150.00,
    spentToday: 89.45,
    impressions: 45230,
    clicks: 1247,
    conversions: 89,
    ctr: 2.76,
    roas: 4.2,
    revenue: 7758.74,
    costPerConversion: 20.75,
    isControl: true,
    enabled: true,
    createdAt: '2025-01-06',
  },
  {
    id: 'agent_002',
    name: 'Q1 Product Launch - V2',
    channel: 'google' as Channel,
    experiment: 'exp_001',
    experimentName: 'Landing Page Test',
    variant: 'B',
    status: 'active' as const,
    totalBudget: 5000.00,
    spent: 1623.18,
    dailyBudget: 150.00,
    spentToday: 112.30,
    impressions: 42890,
    clicks: 1456,
    conversions: 112,
    ctr: 3.39,
    roas: 5.1,
    revenue: 8278.14,
    costPerConversion: 14.49,
    isControl: false,
    enabled: true,
    createdAt: '2025-01-06',
  },
  {
    id: 'agent_003',
    name: 'Brand Awareness',
    channel: 'meta' as Channel,
    experiment: null,
    experimentName: null,
    variant: null,
    status: 'active' as const,
    totalBudget: 3000.00,
    spent: 987.45,
    dailyBudget: 100.00,
    spentToday: 67.20,
    impressions: 125670,
    clicks: 3421,
    conversions: 156,
    ctr: 2.72,
    roas: 3.8,
    revenue: 3752.31,
    costPerConversion: 6.33,
    isControl: false,
    enabled: true,
    createdAt: '2025-01-10',
  },
  {
    id: 'agent_004',
    name: 'B2B Decision Makers',
    channel: 'linkedin' as Channel,
    experiment: 'exp_002',
    experimentName: 'Audience Test',
    variant: 'A',
    status: 'active' as const,
    totalBudget: 2500.00,
    spent: 1245.00,
    dailyBudget: 80.00,
    spentToday: 45.80,
    impressions: 18340,
    clicks: 412,
    conversions: 28,
    ctr: 2.25,
    roas: 2.9,
    revenue: 3610.50,
    costPerConversion: 44.46,
    isControl: true,
    enabled: true,
    createdAt: '2025-01-08',
  },
  {
    id: 'agent_005',
    name: 'B2B Finance Leaders',
    channel: 'linkedin' as Channel,
    experiment: 'exp_002',
    experimentName: 'Audience Test',
    variant: 'B',
    status: 'learning' as const,
    totalBudget: 2500.00,
    spent: 890.00,
    dailyBudget: 80.00,
    spentToday: 62.10,
    impressions: 14280,
    clicks: 367,
    conversions: 31,
    ctr: 2.57,
    roas: 3.4,
    revenue: 3026.00,
    costPerConversion: 28.71,
    isControl: false,
    enabled: true,
    createdAt: '2025-01-08',
  },
  {
    id: 'agent_006',
    name: 'Gen Z Fintech',
    channel: 'tiktok' as Channel,
    experiment: null,
    experimentName: null,
    variant: null,
    status: 'paused' as const,
    totalBudget: 1500.00,
    spent: 750.00,
    dailyBudget: 50.00,
    spentToday: 0,
    impressions: 89450,
    clicks: 2134,
    conversions: 23,
    ctr: 2.39,
    roas: 1.2,
    revenue: 900.00,
    costPerConversion: 32.61,
    isControl: false,
    enabled: false,
    createdAt: '2025-01-12',
  },
];

// Group agents by experiment
const groupByExperiment = (agents: typeof mockAgents) => {
  const experiments: Record<string, { name: string; agents: typeof mockAgents }> = {};
  const standalone: typeof mockAgents = [];

  agents.forEach(agent => {
    if (agent.experiment) {
      if (!experiments[agent.experiment]) {
        experiments[agent.experiment] = {
          name: agent.experimentName || agent.experiment,
          agents: [],
        };
      }
      experiments[agent.experiment].agents.push(agent);
    } else {
      standalone.push(agent);
    }
  });

  return { experiments, standalone };
};

// Calculate totals
const calculateTotals = (agents: typeof mockAgents) => {
  return agents.reduce((acc, agent) => ({
    totalBudget: acc.totalBudget + agent.totalBudget,
    spent: acc.spent + agent.spent,
    revenue: acc.revenue + agent.revenue,
    conversions: acc.conversions + agent.conversions,
    impressions: acc.impressions + agent.impressions,
  }), { totalBudget: 0, spent: 0, revenue: 0, conversions: 0, impressions: 0 });
};

export default function MarketingAgentsPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof mockAgents[0] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'experiments'>('experiments');

  // New agent form state
  const [newAgent, setNewAgent] = useState({
    name: '',
    channel: 'google' as Channel,
    experiment: '',
    budget: '1000',
    dailyBudget: '50',
    targetAudience: '',
    objective: 'conversions',
  });

  // Filter agents by channel
  const filteredAgents = selectedChannel === 'all'
    ? mockAgents
    : mockAgents.filter(a => a.channel === selectedChannel);

  const { experiments, standalone } = groupByExperiment(filteredAgents);
  const totals = calculateTotals(filteredAgents);
  const overallRoas = totals.spent > 0 ? (totals.revenue / totals.spent).toFixed(1) : '0.0';

  // Active agents count
  const activeCount = filteredAgents.filter(a => a.status === 'active').length;
  const experimentCount = Object.keys(experiments).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold text-white" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
              Marketing Agents
            </h1>
            <p className="text-xs text-slate-400">
              {activeCount} active agents across {Object.keys(channelConfig).filter(ch =>
                filteredAgents.some(a => a.channel === ch)
              ).length} channels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={() => setViewMode('experiments')}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                viewMode === 'experiments'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Experiments
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All Agents
            </button>
          </div>

          <GlowButton onClick={() => setShowCreateModal(true)}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Agent
          </GlowButton>
        </div>
      </motion.div>

      {/* Channel Filter Tabs */}
      <motion.div variants={listItem} className="flex items-center gap-2">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
            selectedChannel === 'all'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'text-slate-500 hover:text-slate-300 border border-transparent'
          }`}
        >
          All Channels
        </button>
        {Object.entries(channelConfig).map(([key, config]) => {
          const count = mockAgents.filter(a => a.channel === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedChannel(key as Channel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                selectedChannel === key
                  ? `${config.bgColor} ${config.textColor} border ${config.borderColor}`
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {config.icon}
              <span>{config.name}</span>
              <span className="text-[9px] opacity-60">({count})</span>
            </button>
          );
        })}
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={staggerContainer} className="grid grid-cols-5 gap-3">
        <StatCard
          label="Total Budget"
          value={`$${totals.totalBudget.toLocaleString()}`}
          subValue={`$${totals.spent.toLocaleString()} spent`}
          accent="purple"
          delay={0.1}
        />
        <StatCard
          label="Revenue"
          value={`$${totals.revenue.toLocaleString()}`}
          accent="emerald"
          delay={0.15}
        />
        <StatCard
          label="Overall ROAS"
          value={`${overallRoas}x`}
          accent={parseFloat(overallRoas) >= 3 ? 'emerald' : parseFloat(overallRoas) >= 2 ? 'amber' : 'red'}
          delay={0.2}
        />
        <StatCard
          label="Conversions"
          value={totals.conversions.toLocaleString()}
          accent="cyan"
          delay={0.25}
        />
        <StatCard
          label="Active Experiments"
          value={experimentCount.toString()}
          subValue={`${filteredAgents.length} total agents`}
          accent="blue"
          delay={0.3}
        />
      </motion.div>

      {/* Experiments View */}
      {viewMode === 'experiments' && (
        <div className="space-y-4">
          {/* Experiments */}
          {Object.entries(experiments).map(([expId, exp], idx) => (
            <ExperimentCard
              key={expId}
              experimentId={expId}
              experimentName={exp.name}
              agents={exp.agents}
              delay={0.35 + idx * 0.1}
              onSelectAgent={setSelectedAgent}
            />
          ))}

          {/* Standalone Agents */}
          {standalone.length > 0 && (
            <motion.div variants={listItem}>
              <Card accent="slate" delay={0.4 + Object.keys(experiments).length * 0.1}>
                <CardHeader
                  title="Standalone Campaigns"
                  action={
                    <span className="text-[10px] text-slate-500">
                      {standalone.length} agent{standalone.length !== 1 ? 's' : ''}
                    </span>
                  }
                />
                <CardBody>
                  <div className="grid grid-cols-3 gap-3">
                    {standalone.map(agent => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onClick={() => setSelectedAgent(agent)}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <motion.div variants={listItem} className="grid grid-cols-3 gap-4">
          {filteredAgents.map((agent, idx) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => setSelectedAgent(agent)}
              showExperiment
            />
          ))}
        </motion.div>
      )}

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Marketing Agent"
        subtitle="Deploy a new autonomous marketing agent"
        size="md"
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
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            placeholder="Q1 Product Launch Campaign"
          />

          {/* Channel Selection */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">
              Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(channelConfig).map(([key, config]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setNewAgent({ ...newAgent, channel: key as Channel })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                    newAgent.channel === key
                      ? `${config.bgColor} ${config.textColor} border ${config.borderColor}`
                      : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800'
                  }`}
                >
                  {config.icon}
                  <span className="text-xs font-medium">{config.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Experiment */}
          <FormSelect
            label="A/B Experiment (Optional)"
            value={newAgent.experiment}
            onChange={(e) => setNewAgent({ ...newAgent, experiment: e.target.value })}
            options={[
              { value: '', label: 'No experiment (standalone)' },
              { value: 'exp_001', label: 'Landing Page Test' },
              { value: 'exp_002', label: 'Audience Test' },
              { value: 'new', label: '+ Create new experiment' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Total Budget"
              value={newAgent.budget}
              onChange={(e) => setNewAgent({ ...newAgent, budget: e.target.value })}
              type="number"
              prefix="$"
              className="font-mono"
            />
            <FormInput
              label="Daily Budget"
              value={newAgent.dailyBudget}
              onChange={(e) => setNewAgent({ ...newAgent, dailyBudget: e.target.value })}
              type="number"
              prefix="$"
              className="font-mono"
            />
          </div>

          <FormSelect
            label="Campaign Objective"
            value={newAgent.objective}
            onChange={(e) => setNewAgent({ ...newAgent, objective: e.target.value })}
            options={[
              { value: 'conversions', label: 'Maximize Conversions' },
              { value: 'clicks', label: 'Maximize Clicks' },
              { value: 'impressions', label: 'Brand Awareness' },
              { value: 'roas', label: 'Target ROAS' },
            ]}
          />

          <FormTextarea
            label="Target Audience"
            value={newAgent.targetAudience}
            onChange={(e) => setNewAgent({ ...newAgent, targetAudience: e.target.value })}
            placeholder="B2B SaaS decision makers, 25-54, US & UK..."
            rows={2}
          />

          <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-purple-400 mb-1">Autonomous Operation</div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  Once created, the agent will automatically optimize bids, pause underperforming ads,
                  and reallocate budget based on performance data.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </motion.div>
  );
}

// Experiment Card Component
function ExperimentCard({
  experimentId,
  experimentName,
  agents,
  delay,
  onSelectAgent,
}: {
  experimentId: string;
  experimentName: string;
  agents: typeof mockAgents;
  delay: number;
  onSelectAgent: (agent: typeof mockAgents[0]) => void;
}) {
  const controlAgent = agents.find(a => a.isControl);
  const variants = agents.filter(a => !a.isControl);

  // Calculate winner
  const sortedByRoas = [...agents].sort((a, b) => b.roas - a.roas);
  const winner = sortedByRoas[0];
  const improvement = controlAgent
    ? ((winner.roas - controlAgent.roas) / controlAgent.roas * 100).toFixed(0)
    : '0';

  return (
    <motion.div variants={listItem}>
      <Card accent="purple" delay={delay}>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{experimentName}</span>
            </div>
          }
          action={
            <div className="flex items-center gap-2">
              {parseFloat(improvement) > 0 && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +{improvement}% vs control
                </span>
              )}
              <span className="text-[10px] text-slate-500">
                {agents.length} variants
              </span>
            </div>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            {/* Control */}
            {controlAgent && (
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Control (Variant A)
                </div>
                <AgentCard
                  agent={controlAgent}
                  onClick={() => onSelectAgent(controlAgent)}
                  isControl
                />
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Challenger{variants.length > 1 ? 's' : ''} (Variant {variants.map((_, i) => String.fromCharCode(66 + i)).join(', ')})
                </div>
                <div className="space-y-2">
                  {variants.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onClick={() => onSelectAgent(agent)}
                      isWinner={agent.id === winner.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-[9px] text-slate-500 uppercase mb-1">Variant</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase mb-1">ROAS</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase mb-1">Conv Rate</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase mb-1">CPA</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase mb-1">Confidence</div>
              </div>
            </div>
            {agents.map(agent => {
              const confidence = agent.conversions > 50 ? 95 : agent.conversions > 30 ? 85 : agent.conversions > 10 ? 70 : 50;
              return (
                <div key={agent.id} className="grid grid-cols-5 gap-4 text-center py-2 border-t border-slate-800/30">
                  <div className="text-xs text-slate-300 flex items-center justify-center gap-1">
                    {agent.isControl ? 'A (Control)' : agent.variant}
                    {agent.id === winner.id && (
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`text-xs font-mono ${agent.id === winner.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {agent.roas}x
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {((agent.conversions / agent.clicks) * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs font-mono ${agent.costPerConversion < 25 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    ${agent.costPerConversion.toFixed(2)}
                  </div>
                  <div className="flex justify-center">
                    <div className={`text-[10px] px-2 py-0.5 rounded ${
                      confidence >= 95 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      confidence >= 85 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {confidence}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// Agent Card Component
function AgentCard({
  agent,
  onClick,
  isControl,
  isWinner,
  showExperiment,
}: {
  agent: typeof mockAgents[0];
  onClick: () => void;
  isControl?: boolean;
  isWinner?: boolean;
  showExperiment?: boolean;
}) {
  const channel = channelConfig[agent.channel];
  const budgetUsed = (agent.spent / agent.totalBudget) * 100;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isWinner
          ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
          : isControl
          ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${channel.bgColor}`}>
            <div className={channel.textColor}>{channel.icon}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-white flex items-center gap-1.5">
              {agent.name}
              {isWinner && (
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30">
                  WINNER
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">{channel.name}</div>
          </div>
        </div>
        <StatusBadge
          status={agent.status === 'active' ? 'active' : agent.status === 'learning' ? 'pending' : 'inactive'}
          label={agent.status}
          size="sm"
        />
      </div>

      {showExperiment && agent.experimentName && (
        <div className="mb-2 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded inline-flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          {agent.experimentName} - {agent.variant}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-[9px] text-slate-500 uppercase">ROAS</div>
          <div className={`text-sm font-bold font-mono ${agent.roas >= 3 ? 'text-emerald-400' : agent.roas >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
            {agent.roas}x
          </div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500 uppercase">Conv</div>
          <div className="text-sm font-bold font-mono text-white">{agent.conversions}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500 uppercase">CPA</div>
          <div className="text-sm font-bold font-mono text-white">${agent.costPerConversion.toFixed(0)}</div>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px]">
          <span className="text-slate-500">Budget</span>
          <span className="text-slate-400 font-mono">${agent.spent.toLocaleString()} / ${agent.totalBudget.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${budgetUsed}%` }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`h-full rounded-full ${
              isWinner ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
              'bg-gradient-to-r from-purple-600 to-purple-400'
            }`}
          />
        </div>
      </div>
    </motion.button>
  );
}

// Agent Detail Modal
function AgentDetailModal({
  agent,
  onClose,
}: {
  agent: typeof mockAgents[0] | null;
  onClose: () => void;
}) {
  const [agentEnabled, setAgentEnabled] = useState(true);

  if (!agent) return null;

  const channel = channelConfig[agent.channel];
  const budgetUsed = (agent.spent / agent.totalBudget) * 100;
  const dailyBudgetUsed = (agent.spentToday / agent.dailyBudget) * 100;

  // Mock activity data
  const mockActions = [
    { id: 1, time: '5 min ago', action: 'Increased bid on "payment automation" by 12%', type: 'optimization' },
    { id: 2, time: '1 hour ago', action: 'Paused underperforming ad variant', type: 'pause' },
    { id: 3, time: '3 hours ago', action: 'Added negative keyword "tutorial"', type: 'keyword' },
  ];

  return (
    <Modal
      isOpen={!!agent}
      onClose={onClose}
      title={agent.name}
      subtitle={`${channel.name} Campaign`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${channel.bgColor}`}>
              <div className={channel.textColor}>{channel.icon}</div>
            </div>
            <div>
              <StatusBadge
                status={agent.status === 'active' ? 'active' : agent.status === 'learning' ? 'pending' : 'inactive'}
                label={agent.status}
              />
              {agent.experimentName && (
                <div className="text-[10px] text-purple-400 mt-1">
                  {agent.experimentName} - Variant {agent.variant}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Agent</span>
            <ToggleSwitch
              checked={agentEnabled}
              onChange={setAgentEnabled}
              size="sm"
            />
          </div>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="text-[9px] text-slate-500 uppercase mb-1">ROAS</div>
            <div className={`text-xl font-bold font-mono ${agent.roas >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {agent.roas}x
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Revenue</div>
            <div className="text-xl font-bold font-mono text-white">${agent.revenue.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Conversions</div>
            <div className="text-xl font-bold font-mono text-white">{agent.conversions}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <div className="text-[9px] text-slate-500 uppercase mb-1">CPA</div>
            <div className="text-xl font-bold font-mono text-white">${agent.costPerConversion.toFixed(2)}</div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Total Budget</span>
              <span className="text-white font-mono">
                ${agent.spent.toLocaleString()} / ${agent.totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                style={{ width: `${budgetUsed}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Daily Budget</span>
              <span className="text-white font-mono">
                ${agent.spentToday.toFixed(2)} / ${agent.dailyBudget.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                style={{ width: `${dailyBudgetUsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Impressions</div>
            <div className="text-sm font-mono text-white">{agent.impressions.toLocaleString()}</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Clicks</div>
            <div className="text-sm font-mono text-white">{agent.clicks.toLocaleString()}</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-[9px] text-slate-500 uppercase mb-1">CTR</div>
            <div className="text-sm font-mono text-white">{agent.ctr}%</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Conv Rate</div>
            <div className="text-sm font-mono text-white">{((agent.conversions / agent.clicks) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center p-2 bg-slate-800/30 rounded-lg">
            <div className="text-[9px] text-slate-500 uppercase mb-1">Avg CPC</div>
            <div className="text-sm font-mono text-white">${(agent.spent / agent.clicks).toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="text-xs font-medium text-slate-400 mb-3">Recent Agent Activity</div>
          <div className="space-y-2">
            {mockActions.map(action => (
              <div key={action.id} className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white">{action.action}</div>
                  <div className="text-[10px] text-slate-500">{action.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-slate-800">
          <div className="flex gap-2">
            <GlowButton variant="secondary">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Strategy
            </GlowButton>
            <GlowButton variant="secondary">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Reports
            </GlowButton>
          </div>
          <GlowButton>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Funds
          </GlowButton>
        </div>
      </div>
    </Modal>
  );
}
