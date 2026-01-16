'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  Card,
  CardHeader,
  GlowButton,
  FormInput,
  Modal,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import { ActivityLog } from './ActivityLog';
import type {
  TreasuryAgentConfig,
  TreasuryAgentAction,
  ScheduledUnstake,
  UpdateAgentConfigParams,
  CreateScheduledUnstakeParams,
  TriggerActionParams,
} from '@/features/treasury';

interface AgentTabProps {
  config: TreasuryAgentConfig | null;
  isLoading: boolean;
  updateConfig: (params: UpdateAgentConfigParams) => Promise<TreasuryAgentConfig | null>;
  isUpdating: boolean;
  toggleAgent: (enabled: boolean) => Promise<TreasuryAgentConfig | null>;
  actions: TreasuryAgentAction[];
  actionsLoading: boolean;
  triggerAction: (params: TriggerActionParams) => Promise<TreasuryAgentAction | null>;
  isTriggering: boolean;
  // Scheduled unstakes
  unstakes: ScheduledUnstake[];
  unstakesLoading: boolean;
  createUnstake: (params: CreateScheduledUnstakeParams) => Promise<ScheduledUnstake | null>;
  isCreatingUnstake: boolean;
  cancelUnstake: (id: string) => Promise<boolean>;
}

function formatTimeRemaining(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) return 'Ready';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

function formatScheduledDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AgentTab({
  config,
  isLoading,
  updateConfig,
  isUpdating,
  toggleAgent,
  actions,
  actionsLoading,
  triggerAction,
  isTriggering,
  unstakes,
  unstakesLoading,
  createUnstake,
  isCreatingUnstake,
  cancelUnstake,
}: AgentTabProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    amount: '',
    date: '',
    reason: '',
  });

  // Local form state for configuration
  const [stakeThreshold, setStakeThreshold] = useState(config?.stakeThreshold || 10000);
  const [minimumReserve, setMinimumReserve] = useState(config?.minimumReserve || 5000);
  const [stakePercentage, setStakePercentage] = useState(config?.stakePercentage || 50);
  const [cooldownHours, setCooldownHours] = useState(config?.cooldownHours || 24);
  const [cooldownEnabled, setCooldownEnabled] = useState(config?.cooldownEnabled ?? true);

  const handleSaveConfig = async () => {
    await updateConfig({
      stakeThreshold,
      minimumReserve,
      stakePercentage,
      cooldownHours,
      cooldownEnabled,
    });
  };

  const handleScheduleUnstake = async () => {
    if (!scheduleForm.amount || !scheduleForm.date) return;

    await createUnstake({
      amount: parseFloat(scheduleForm.amount),
      scheduledFor: new Date(scheduleForm.date).toISOString(),
      reason: scheduleForm.reason || undefined,
    });

    setShowScheduleModal(false);
    setScheduleForm({ amount: '', date: '', reason: '' });
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Agent Status Hero */}
      <motion.div variants={listItem}>
        <div className={`relative rounded-xl overflow-hidden p-6 border transition-colors ${
          config.enabled
            ? 'bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-900 border-purple-500/20'
            : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Background effects when enabled */}
          {config.enabled && (
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.2),rgba(0,0,0,0))]" />
          )}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={config.enabled ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    config.enabled
                      ? 'bg-purple-500/20 border-purple-500/30'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <svg className={`w-5 h-5 ${config.enabled ? 'text-purple-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Treasury Agent</h2>
                  <p className="text-xs text-slate-400">Automated USDC to USDY staking</p>
                </div>
              </div>

              {/* Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleAgent(!config.enabled)}
                disabled={isUpdating}
                className={`w-14 h-7 rounded-full p-1 transition-colors ${
                  config.enabled
                    ? 'bg-purple-500/20 border border-purple-500/40'
                    : 'bg-slate-700/50 border border-slate-600/50'
                } ${isUpdating ? 'opacity-50' : ''}`}
              >
                <motion.div
                  animate={{ x: config.enabled ? 26 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-5 h-5 rounded-full shadow ${
                    config.enabled ? 'bg-purple-500' : 'bg-slate-500'
                  }`}
                />
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Total Staked</div>
                <div className="text-lg font-bold text-white font-mono">${config.totalStaked.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Total Unstaked</div>
                <div className="text-lg font-bold text-white font-mono">${config.totalUnstaked.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Executions</div>
                <div className="text-lg font-bold text-white font-mono">{config.executionCount}</div>
              </div>
              <div className={`rounded-lg p-3 border ${
                config.canExecute
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <div className="text-[10px] text-slate-500 mb-1">Status</div>
                <div className={`text-sm font-bold ${config.canExecute ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {config.canExecute ? 'Ready' : `Cooldown ${config.cooldownEndsAt ? formatTimeRemaining(config.cooldownEndsAt) : ''}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Configuration & Scheduled */}
        <div className="col-span-5 space-y-4">
          {/* Configuration */}
          <Card accent="purple" delay={0.2} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Configuration</h3>

            <div className="space-y-4">
              {/* Stake Threshold */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Stake Threshold</span>
                  <span className="text-white font-mono">${stakeThreshold.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={stakeThreshold}
                  onChange={(e) => setStakeThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">Stake when USDC exceeds this amount</div>
              </div>

              {/* Minimum Reserve */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Minimum Reserve</span>
                  <span className="text-white font-mono">${minimumReserve.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={minimumReserve}
                  onChange={(e) => setMinimumReserve(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">Always keep this USDC amount liquid</div>
              </div>

              {/* Stake Percentage */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Stake Percentage</span>
                  <span className="text-white font-mono">{stakePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={stakePercentage}
                  onChange={(e) => setStakePercentage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">% of excess to stake when threshold met</div>
              </div>

              {/* Cooldown */}
              <div className="pt-2 border-t border-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-500">Cooldown Period</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCooldownEnabled(!cooldownEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      cooldownEnabled
                        ? 'bg-purple-500/20 border border-purple-500/40'
                        : 'bg-slate-700/50 border border-slate-600/50'
                    }`}
                  >
                    <motion.div
                      animate={{ x: cooldownEnabled ? 16 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`w-4 h-4 rounded-full shadow ${
                        cooldownEnabled ? 'bg-purple-500' : 'bg-slate-500'
                      }`}
                    />
                  </motion.button>
                </div>
                {cooldownEnabled && (
                  <div>
                    <div className="flex justify-between text-[10px] mb-2">
                      <span className="text-slate-500">Hours between transactions</span>
                      <span className="text-white font-mono">{cooldownHours}h</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="72"
                      step="1"
                      value={cooldownHours}
                      onChange={(e) => setCooldownHours(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <GlowButton
                onClick={handleSaveConfig}
                disabled={isUpdating}
                className="w-full mt-2"
              >
                {isUpdating ? 'Saving...' : 'Save Configuration'}
              </GlowButton>
            </div>
          </Card>

          {/* Scheduled Unstakes */}
          <Card accent="amber" delay={0.3} className="overflow-hidden">
            <CardHeader
              title="Scheduled Unstakes"
              action={
                <GlowButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowScheduleModal(true)}
                >
                  + Schedule
                </GlowButton>
              }
            />

            {unstakesLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : unstakes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No scheduled unstakes
              </div>
            ) : (
              <div className="divide-y divide-slate-800/30">
                {unstakes.map((unstake) => (
                  <div key={unstake.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">${unstake.amount.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">on {formatScheduledDate(unstake.scheduledFor)}</span>
                      </div>
                      {unstake.reason && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{unstake.reason}</div>
                      )}
                    </div>
                    <button
                      onClick={() => cancelUnstake(unstake.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Manual Actions */}
          <Card delay={0.35} className="p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-3">Manual Actions</div>
            <div className="flex gap-2">
              <GlowButton
                variant="primary"
                onClick={() => triggerAction({ actionType: 'stake' })}
                disabled={isTriggering || !config.enabled || !config.canExecute}
                className="flex-1"
              >
                {isTriggering ? 'Processing...' : 'Stake Now'}
              </GlowButton>
              <GlowButton
                variant="secondary"
                onClick={() => triggerAction({ actionType: 'unstake' })}
                disabled={isTriggering || !config.enabled}
                className="flex-1"
              >
                Unstake Now
              </GlowButton>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity Log */}
        <div className="col-span-7">
          <ActivityLog actions={actions} isLoading={actionsLoading} limit={15} />
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Unstake"
      >
        <div className="space-y-4">
          <FormInput
            label="Amount (USDC)"
            value={scheduleForm.amount}
            onChange={(e) => setScheduleForm({ ...scheduleForm, amount: e.target.value })}
            type="number"
            prefix="$"
            placeholder="5000"
          />
          <FormInput
            label="Scheduled Date"
            value={scheduleForm.date}
            onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
            type="date"
          />
          <FormInput
            label="Reason (optional)"
            value={scheduleForm.reason}
            onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
            placeholder="e.g., Vendor payment"
          />
          <div className="flex gap-2 pt-2">
            <GlowButton
              variant="secondary"
              onClick={() => setShowScheduleModal(false)}
              className="flex-1"
            >
              Cancel
            </GlowButton>
            <GlowButton
              variant="primary"
              onClick={handleScheduleUnstake}
              disabled={isCreatingUnstake || !scheduleForm.amount || !scheduleForm.date}
              className="flex-1"
            >
              {isCreatingUnstake ? 'Scheduling...' : 'Schedule'}
            </GlowButton>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
