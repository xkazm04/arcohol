'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  useTreasuryStats,
  useTreasuryAgent,
  useScheduledUnstakes,
  type ChainEnvironment,
} from '@/features/treasury';
import {
  ChainSelector,
  TreasuryTab,
  YieldTab,
  AgentTab,
  TreasuryEmptyState,
} from './_components';
import { OnboardingModal } from '@/components/dashboard';

type TabType = 'treasury' | 'yield' | 'agent';

const tabs: { id: TabType; label: string }[] = [
  { id: 'treasury', label: 'Treasury' },
  { id: 'yield', label: 'Yield' },
  { id: 'agent', label: 'Agent' },
];

export default function TreasuryPage() {
  const router = useRouter();
  const [chain, setChain] = useState<ChainEnvironment>('arc-testnet');
  const [activeTab, setActiveTab] = useState<TabType>('treasury');

  // Hooks
  const { stats, isLoading: statsLoading, noApiKey: statsNoApiKey, noOrganization: statsNoOrg } = useTreasuryStats(chain);
  const {
    config,
    isLoading: agentLoading,
    noApiKey: agentNoApiKey,
    noOrganization: agentNoOrg,
    updateConfig,
    isUpdating,
    toggleAgent,
    actions,
    actionsLoading,
    triggerAction,
    isTriggering,
    refetch: refetchAgent,
  } = useTreasuryAgent(chain);
  const {
    unstakes,
    isLoading: unstakesLoading,
    createUnstake,
    isCreating: isCreatingUnstake,
    cancelUnstake,
  } = useScheduledUnstakes(chain);

  // Check if any hook indicates no API key or no organization
  const noApiKey = statsNoApiKey || agentNoApiKey;
  const noOrganization = statsNoOrg || agentNoOrg;
  const isLoading = statsLoading || agentLoading;

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    refetchAgent();
    router.refresh();
  };

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-semibold text-white"
            style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
          >
            Treasury Management
          </h1>
          {stats && (
            <span className="text-xs text-slate-500 font-mono">{stats.accountId}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Chain Selector */}
          <ChainSelector chain={chain} onChange={setChain} />

          {/* Only show tabs and agent status when API key exists */}
          {!noApiKey && !isLoading && (
            <>
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === tab.id
                        ? tab.id === 'agent'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : tab.id === 'yield'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Agent Status Indicator */}
              {config && (
                <motion.div
                  animate={{
                    boxShadow: config.enabled
                      ? ['0 0 0 0 rgba(168, 85, 247, 0)', '0 0 10px 2px rgba(168, 85, 247, 0.2)', '0 0 0 0 rgba(168, 85, 247, 0)']
                      : 'none'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                    config.enabled
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <motion.div
                    animate={config.enabled ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-purple-500' : 'bg-slate-600'}`}
                  />
                  <span className={`text-[10px] font-mono ${config.enabled ? 'text-purple-400' : 'text-slate-500'}`}>
                    Agent {config.enabled ? 'ON' : 'OFF'}
                  </span>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State - No API Key */}
      {!isLoading && noApiKey && (
        <TreasuryEmptyState chain={chain} />
      )}

      {/* Tab Content - Only show when API key exists */}
      {!isLoading && !noApiKey && (
        <>
          {activeTab === 'treasury' && (
            <TreasuryTab stats={stats} isLoading={statsLoading} />
          )}

          {activeTab === 'yield' && (
            <YieldTab stats={stats} isLoading={statsLoading} />
          )}

          {activeTab === 'agent' && (
            <AgentTab
              config={config}
              isLoading={agentLoading}
              updateConfig={updateConfig}
              isUpdating={isUpdating}
              toggleAgent={toggleAgent}
              actions={actions}
              actionsLoading={actionsLoading}
              triggerAction={triggerAction}
              isTriggering={isTriggering}
              unstakes={unstakes}
              unstakesLoading={unstakesLoading}
              createUnstake={createUnstake}
              isCreatingUnstake={isCreatingUnstake}
              cancelUnstake={cancelUnstake}
            />
          )}
        </>
      )}

      {/* Onboarding Modal - Show when no organization */}
      <OnboardingModal
        isOpen={!isLoading && noOrganization}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
