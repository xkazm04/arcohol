'use client';

import { motion } from 'framer-motion';
import type { AutomationRule } from '../_lib';
import { Card, CardHeader, ToggleSwitch, staggerContainer, listItem } from '@/components/dashboard';

interface AutomationRulesListProps {
  rules: AutomationRule[];
  onToggle: (ruleId: string, enabled: boolean) => void;
  onSelect: (rule: AutomationRule) => void;
  onTrigger?: (ruleId: string) => void;
  isLoading?: boolean;
  isTriggering?: boolean;
}

const typeIcons: Record<AutomationRule['type'], React.ReactNode> = {
  percentage: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  threshold: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  scheduled: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const typeColors: Record<AutomationRule['type'], string> = {
  percentage: 'purple',
  threshold: 'blue',
  scheduled: 'emerald',
};

export function AutomationRulesList({
  rules,
  onToggle,
  onSelect,
  onTrigger,
  isLoading = false,
  isTriggering = false,
}: AutomationRulesListProps) {
  return (
    <Card accent="purple" className="h-full overflow-hidden flex flex-col">
      <CardHeader
        title="Automation Rules"
        action={
          <span className="text-[10px] font-mono text-slate-500">
            {rules.filter((r) => r.enabled).length}/{rules.length} active
          </span>
        }
      />

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading rules...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-slate-400 text-sm mb-1">No automation rules</p>
            <p className="text-slate-500 text-xs">Create rules to automate USDY deposits</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
            {rules.map((rule) => {
              const color = typeColors[rule.type];
              return (
                <motion.div
                  key={rule.id}
                  variants={listItem}
                  whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                  onClick={() => onSelect(rule)}
                  className="px-4 py-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-400 shrink-0`}>
                      {typeIcons[rule.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white truncate">{rule.name}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded bg-${color}-500/10 text-${color}-400`}>
                          {rule.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{rule.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {(rule.percentage || rule.config?.percentage) && (
                          <span className="text-[10px] font-mono text-purple-400">{rule.percentage || rule.config?.percentage}%</span>
                        )}
                        {(rule.threshold || rule.config?.threshold) && (
                          <span className="text-[10px] font-mono text-blue-400">${(rule.threshold || rule.config?.threshold)?.toLocaleString()}</span>
                        )}
                        {(rule.schedule || rule.config?.schedule) && (
                          <span className="text-[10px] font-mono text-emerald-400">{rule.schedule || rule.config?.schedule}</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          ${rule.totalDeposited.toLocaleString()} deposited
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {onTrigger && rule.enabled && (
                        <button
                          onClick={() => onTrigger(rule.id)}
                          disabled={isTriggering}
                          className="px-2 py-1 text-[9px] font-mono text-purple-400 bg-purple-500/10 rounded border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
                        >
                          {isTriggering ? '...' : 'Trigger'}
                        </button>
                      )}
                      <ToggleSwitch
                        checked={rule.enabled}
                        onChange={(checked) => onToggle(rule.id, checked)}
                        size="sm"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
