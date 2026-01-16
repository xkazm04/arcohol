'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, StatusBadge, staggerContainer, listItem } from '@/components/dashboard';
import type { TreasuryAgentAction, AgentActionType } from '@/features/treasury';
import { CHAIN_CONFIGS } from '@/features/treasury';

interface ActivityLogProps {
  actions: TreasuryAgentAction[];
  isLoading?: boolean;
  limit?: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActionTypeLabel(type: AgentActionType): string {
  switch (type) {
    case 'stake':
      return 'STAKE';
    case 'unstake':
      return 'UNSTAKE';
    case 'scheduled_unstake':
      return 'SCHEDULED';
  }
}

function getActionTypeColor(type: AgentActionType): 'cyan' | 'purple' | 'amber' {
  switch (type) {
    case 'stake':
      return 'cyan';
    case 'unstake':
      return 'purple';
    case 'scheduled_unstake':
      return 'amber';
  }
}

function getTriggerLabel(trigger: TreasuryAgentAction['triggerType']): string {
  switch (trigger) {
    case 'auto':
      return 'Auto';
    case 'manual':
      return 'Manual';
    case 'scheduled':
      return 'Scheduled';
  }
}

export function ActivityLog({ actions, isLoading, limit = 10 }: ActivityLogProps) {
  const displayActions = actions.slice(0, limit);

  return (
    <Card accent="purple" delay={0.3} className="overflow-hidden">
      <CardHeader title="Activity Log" />

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800/30">
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-2">Trigger</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Time</div>
        <div className="col-span-2 text-right">TX</div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : displayActions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No activity yet
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-800/30"
        >
          {displayActions.map((action) => (
            <motion.div
              key={action.id}
              variants={listItem}
              whileHover={{ x: 3 }}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-slate-800/20 transition-colors"
            >
              {/* Type */}
              <div className="col-span-2 flex items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  getActionTypeColor(action.actionType) === 'cyan'
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : getActionTypeColor(action.actionType) === 'purple'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {getActionTypeLabel(action.actionType)}
                </span>
              </div>

              {/* Amount */}
              <div className="col-span-2 flex items-center">
                <span className="font-mono text-white">
                  ${action.amount.toLocaleString()}
                </span>
              </div>

              {/* Trigger */}
              <div className="col-span-2 flex items-center">
                <span className="text-slate-400">{getTriggerLabel(action.triggerType)}</span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center">
                <StatusBadge status={action.status} />
              </div>

              {/* Time */}
              <div className="col-span-2 flex items-center">
                <span className="text-slate-500 text-xs">{formatTimeAgo(action.createdAt)}</span>
              </div>

              {/* TX Hash */}
              <div className="col-span-2 flex items-center justify-end">
                {action.txHash ? (
                  <a
                    href={`${CHAIN_CONFIGS[action.chain].blockExplorer}/tx/${action.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    {action.txHash.slice(0, 8)}...
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-slate-600 text-xs">-</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
}
