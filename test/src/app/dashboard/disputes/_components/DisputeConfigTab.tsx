'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  GlowButton,
  FormInput,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import type {
  DisputeProtectionConfig,
  UpdateDisputeProtectionParams,
  DisputeWebhookEvent,
} from '@/features/disputes';

interface DisputeConfigTabProps {
  config: DisputeProtectionConfig | null;
  isLoading: boolean;
  updateConfig: (params: UpdateDisputeProtectionParams) => Promise<DisputeProtectionConfig | null>;
  isUpdating: boolean;
  toggleProtection: (enabled: boolean) => Promise<DisputeProtectionConfig | null>;
}

const WEBHOOK_EVENTS: { id: DisputeWebhookEvent; label: string }[] = [
  { id: 'dispute.created', label: 'New Dispute' },
  { id: 'dispute.response_required', label: 'Response Required' },
  { id: 'dispute.escalated', label: 'Escalated' },
  { id: 'dispute.resolved', label: 'Resolved' },
  { id: 'dispute.ai_evaluated', label: 'AI Evaluation Complete' },
];

export function DisputeConfigTab({
  config,
  isLoading,
  updateConfig,
  isUpdating,
  toggleProtection,
}: DisputeConfigTabProps) {
  // Local form state
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(85);
  const [autoDenyThreshold, setAutoDenyThreshold] = useState(75);
  const [reservePercentage, setReservePercentage] = useState(2);
  const [reserveCap, setReserveCap] = useState(5000);
  const [responseWindowHours, setResponseWindowHours] = useState(72);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<DisputeWebhookEvent[]>(['dispute.created', 'dispute.resolved']);

  // Sync local state with config
  useEffect(() => {
    if (config) {
      setAutoApproveThreshold(Math.round(config.autoApproveThreshold * 100));
      setAutoDenyThreshold(Math.round(config.autoDenyThreshold * 100));
      setReservePercentage(config.reservePercentage);
      setReserveCap(config.reserveCap);
      setResponseWindowHours(config.responseWindowHours);
      setWebhookUrl(config.webhookUrl || '');
      setAlertEmail(config.alertEmail || '');
      setWebhookEvents(config.webhookEvents || ['dispute.created', 'dispute.resolved']);
    }
  }, [config]);

  const handleSaveThresholds = async () => {
    await updateConfig({
      autoApproveThreshold: autoApproveThreshold / 100,
      autoDenyThreshold: autoDenyThreshold / 100,
    });
  };

  const handleSaveReserve = async () => {
    await updateConfig({
      reservePercentage,
      reserveCap,
    });
  };

  const handleSaveResponse = async () => {
    await updateConfig({
      responseWindowHours,
    });
  };

  const handleSaveNotifications = async () => {
    await updateConfig({
      webhookUrl: webhookUrl || undefined,
      alertEmail: alertEmail || undefined,
      webhookEvents,
    });
  };

  const toggleWebhookEvent = (event: DisputeWebhookEvent) => {
    setWebhookEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
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
      {/* Protection Status Hero */}
      <motion.div variants={listItem}>
        <div className={`relative rounded-xl overflow-hidden p-6 border transition-colors ${
          config.enabled
            ? 'bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-900 border-purple-500/20'
            : 'bg-slate-900 border-slate-800'
        }`}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Dispute Protection</h2>
                  <p className="text-xs text-slate-400">Automate dispute resolution with AI-powered evaluation</p>
                </div>
              </div>

              {/* Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleProtection(!config.enabled)}
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

            {/* Reserve Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Reserve Balance</div>
                <div className="text-lg font-bold text-white font-mono">${config.reserveBalance.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Reserve Cap</div>
                <div className="text-lg font-bold text-white font-mono">${config.reserveCap.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Reserve Rate</div>
                <div className="text-lg font-bold text-white font-mono">{config.reservePercentage}%</div>
              </div>
              <div className={`rounded-lg p-3 border ${
                config.enabled
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-slate-800/30 border-slate-700/30'
              }`}>
                <div className="text-[10px] text-slate-500 mb-1">Status</div>
                <div className={`text-sm font-bold ${config.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {config.enabled ? 'Protected' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: AI Thresholds & Reserve */}
        <div className="col-span-6 space-y-4">
          {/* AI Decision Thresholds */}
          <Card accent="purple" delay={0.2} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">AI Decision Thresholds</h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Set confidence levels for automatic decisions. Between thresholds = escalate for manual review.
            </p>

            <div className="space-y-5">
              {/* Auto-Approve */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-emerald-400">Auto-Approve Buyer Claim</span>
                  <span className="text-white font-mono">{autoApproveThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  step="1"
                  value={autoApproveThreshold}
                  onChange={(e) => setAutoApproveThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">When AI is confident buyer is right</div>
              </div>

              {/* Auto-Deny */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-red-400">Auto-Deny Buyer Claim</span>
                  <span className="text-white font-mono">{autoDenyThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  step="1"
                  value={autoDenyThreshold}
                  onChange={(e) => setAutoDenyThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">When AI is confident merchant is right</div>
              </div>

              {/* Visual indicator */}
              <div className="pt-3 border-t border-slate-800/50">
                <div className="text-[10px] text-slate-500 mb-2">Decision Zones</div>
                <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 h-full bg-emerald-500/30"
                    style={{ width: `${autoApproveThreshold}%` }}
                  />
                  <div
                    className="absolute right-0 h-full bg-red-500/30"
                    style={{ width: `${100 - autoDenyThreshold}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] text-amber-400 font-medium">Manual Review Zone</span>
                  </div>
                </div>
              </div>

              <GlowButton
                onClick={handleSaveThresholds}
                disabled={isUpdating}
                className="w-full mt-2"
              >
                {isUpdating ? 'Saving...' : 'Save Thresholds'}
              </GlowButton>
            </div>
          </Card>

          {/* Reserve Configuration */}
          <Card accent="cyan" delay={0.3} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Reserve Configuration</h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Set aside funds to cover potential refunds automatically.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Reserve Percentage</span>
                  <span className="text-white font-mono">{reservePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={reservePercentage}
                  onChange={(e) => setReservePercentage(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">% of revenue to reserve</div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Reserve Cap</span>
                  <span className="text-white font-mono">${reserveCap.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={reserveCap}
                  onChange={(e) => setReserveCap(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">Maximum reserve amount</div>
              </div>

              <GlowButton
                onClick={handleSaveReserve}
                disabled={isUpdating}
                variant="secondary"
                className="w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Reserve Settings'}
              </GlowButton>
            </div>
          </Card>
        </div>

        {/* Right Column: Response Rules & Notifications */}
        <div className="col-span-6 space-y-4">
          {/* Response Rules */}
          <Card accent="amber" delay={0.25} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Response Rules</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Response Window</span>
                  <span className="text-white font-mono">{responseWindowHours} hours</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="168"
                  step="12"
                  value={responseWindowHours}
                  onChange={(e) => setResponseWindowHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="text-[9px] text-slate-600 mt-1">Time to respond before auto-escalation</div>
              </div>

              {/* Auto-Response Templates */}
              <div className="pt-3 border-t border-slate-800/50">
                <div className="text-[10px] font-medium text-slate-400 mb-3">Auto-Response Logic</div>
                <div className="space-y-2 text-[10px]">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                    <span>Not Received → Check delivery proof → Auto-respond if found</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <span>Unauthorized → Request verification → Escalate if confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-purple-500/50" />
                    <span>Quality Issue → Request details → Manual review required</span>
                  </div>
                </div>
              </div>

              <GlowButton
                onClick={handleSaveResponse}
                disabled={isUpdating}
                variant="secondary"
                className="w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Response Rules'}
              </GlowButton>
            </div>
          </Card>

          {/* Notifications */}
          <Card delay={0.35} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Notifications</h3>

            <div className="space-y-4">
              <FormInput
                label="Alert Email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                type="email"
                placeholder="team@company.com"
              />

              <FormInput
                label="Webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                type="url"
                placeholder="https://api.company.com/webhooks/disputes"
              />

              {/* Webhook Events */}
              <div>
                <div className="text-[10px] text-slate-500 mb-2">Webhook Events</div>
                <div className="flex flex-wrap gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => toggleWebhookEvent(event.id)}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                        webhookEvents.includes(event.id)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800/50 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                      }`}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>
              </div>

              <GlowButton
                onClick={handleSaveNotifications}
                disabled={isUpdating}
                variant="secondary"
                className="w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Notifications'}
              </GlowButton>
            </div>
          </Card>

          {/* AI Evaluation Factors Info */}
          <Card accent="purple" delay={0.4} className="p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-3">AI Evaluation Factors</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">
                <div className="text-xs text-slate-400">Party History</div>
                <div className="text-lg font-bold text-purple-400">25%</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">
                <div className="text-xs text-slate-400">Evidence Quality</div>
                <div className="text-lg font-bold text-purple-400">30%</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">
                <div className="text-xs text-slate-400">Transaction Analysis</div>
                <div className="text-lg font-bold text-purple-400">20%</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">
                <div className="text-xs text-slate-400">Claim Validity</div>
                <div className="text-lg font-bold text-purple-400">25%</div>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-3">
              Register delivery proofs proactively to improve your dispute outcomes.
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
