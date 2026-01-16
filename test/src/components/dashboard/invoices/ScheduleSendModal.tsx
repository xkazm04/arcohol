'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../layout/Modal';
import { GlowButton } from '../ui/GlowButton';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import type { Invoice, ReminderRule } from '@/features/invoices';

interface ScheduleSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSchedule: (params: ScheduleParams) => Promise<void>;
}

export interface ScheduleParams {
  scheduledSendAt: string;
  autoSendReminders: boolean;
  reminderRuleId?: string;
}

export function ScheduleSendModal({
  isOpen,
  onClose,
  invoice,
  onSchedule,
}: ScheduleSendModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [autoSendReminders, setAutoSendReminders] = useState(true);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchReminderRules();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const fetchReminderRules = async () => {
    try {
      const response = await fetch('/api/invoices/reminder-rules');
      if (response.ok) {
        const data = await response.json();
        setReminderRules(data.rules || []);
        // Select default rule if available
        const defaultRule = data.rules?.find((r: ReminderRule) => r.isDefault);
        if (defaultRule) {
          setSelectedRuleId(defaultRule.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reminder rules:', err);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scheduledSendAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      await onSchedule({
        scheduledSendAt,
        autoSendReminders,
        reminderRuleId: autoSendReminders && selectedRuleId ? selectedRuleId : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule send');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const formatScheduledDateTime = () => {
    if (!scheduledDate) return '';
    const date = new Date(`${scheduledDate}T${scheduledTime}`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const presetOptions = [
    { label: 'Tomorrow 9 AM', days: 1, time: '09:00' },
    { label: 'In 2 days', days: 2, time: '09:00' },
    { label: 'Next Monday', days: 'monday', time: '09:00' },
    { label: 'First of month', days: 'first', time: '09:00' },
  ];

  const applyPreset = (preset: typeof presetOptions[0]) => {
    const date = new Date();

    if (preset.days === 'monday') {
      const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
      date.setDate(date.getDate() + daysUntilMonday);
    } else if (preset.days === 'first') {
      date.setMonth(date.getMonth() + 1, 1);
    } else {
      date.setDate(date.getDate() + preset.days);
    }

    setScheduledDate(date.toISOString().split('T')[0]);
    setScheduledTime(preset.time);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Send"
      subtitle={invoice ? `Schedule ${invoice.reference} for delivery` : 'Schedule invoice delivery'}
      accent="purple"
      size="sm"
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </GlowButton>
          <GlowButton onClick={handleSchedule} disabled={isLoading || !scheduledDate}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Scheduling...
              </span>
            ) : (
              'Schedule Send'
            )}
          </GlowButton>
        </>
      }
    >
      <div className="space-y-4">
        {/* Invoice preview */}
        {invoice && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-xs">Invoice</span>
              <span className="text-white text-xs font-mono">{invoice.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Amount</span>
              <span className="text-cyan-400 text-sm font-semibold">
                ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}
              </span>
            </div>
          </div>
        )}

        {/* Quick presets */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Quick Select</label>
          <div className="grid grid-cols-2 gap-2">
            {presetOptions.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date and time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={e => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Scheduled preview */}
        {scheduledDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-purple-300 text-xs">
                Will be sent on {formatScheduledDateTime()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Auto reminders */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-white">Auto-send Reminders</div>
              <div className="text-[10px] text-slate-500">Send payment reminders after delivery</div>
            </div>
            <ToggleSwitch checked={autoSendReminders} onChange={setAutoSendReminders} />
          </div>

          {autoSendReminders && reminderRules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Rule</label>
              <select
                value={selectedRuleId}
                onChange={e => setSelectedRuleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select a rule...</option>
                {reminderRules.map(rule => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name} {rule.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>

              {selectedRuleId && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {reminderRules
                    .find(r => r.id === selectedRuleId)
                    ?.reminderDays.map(day => (
                      <span
                        key={day}
                        className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded"
                      >
                        {day < 0 ? `${Math.abs(day)}d before` : day === 0 ? 'On due' : `${day}d after`}
                      </span>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
