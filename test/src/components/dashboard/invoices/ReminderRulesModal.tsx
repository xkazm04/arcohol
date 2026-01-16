'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../layout/Modal';
import { GlowButton } from '../ui/GlowButton';
import { FormInput } from '../ui/FormInput';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { staggerContainer, listItem } from '../utils/animations';
import type { ReminderRule } from '@/features/invoices';

interface ReminderRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditMode = 'list' | 'create' | 'edit';

export function ReminderRulesModal({ isOpen, onClose }: ReminderRulesModalProps) {
  const [mode, setMode] = useState<EditMode>('list');
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<Partial<ReminderRule> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen]);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/invoices/reminder-rules');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRule({
      name: '',
      enabled: true,
      reminderDays: [-3, 0, 3, 7, 14],
      escalateAfterDays: 30,
      escalationAction: 'none',
      includePdf: true,
      isDefault: false,
    });
    setMode('create');
  };

  const handleEdit = (rule: ReminderRule) => {
    setEditingRule({ ...rule });
    setMode('edit');
  };

  const handleSave = async () => {
    if (!editingRule?.name) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const isCreate = mode === 'create';
      const url = isCreate
        ? '/api/invoices/reminder-rules'
        : `/api/invoices/reminder-rules/${editingRule.id}`;

      const response = await fetch(url, {
        method: isCreate ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rule');
      }

      await fetchRules();
      setMode('list');
      setEditingRule(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder rule?')) return;

    try {
      const response = await fetch(`/api/invoices/reminder-rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      await fetchRules();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateEditingRule = (updates: Partial<ReminderRule>) => {
    setEditingRule(prev => prev ? { ...prev, ...updates } : null);
  };

  const toggleReminderDay = (day: number) => {
    if (!editingRule) return;
    const days = editingRule.reminderDays || [];
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day].sort((a, b) => a - b);
    updateEditingRule({ reminderDays: newDays });
  };

  const renderList = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">
          Configure automatic reminder emails for overdue invoices
        </p>
        <GlowButton size="sm" onClick={handleCreateNew}>
          + New Rule
        </GlowButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
          />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔔</span>
          </div>
          <p className="text-slate-400 text-sm mb-1">No reminder rules yet</p>
          <p className="text-slate-500 text-xs">Create a rule to automate payment reminders</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {rules.map(rule => (
            <motion.div
              key={rule.id}
              variants={listItem}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span className="text-white text-sm font-medium">{rule.name}</span>
                  {rule.isDefault && (
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.reminderDays.map(day => (
                  <span
                    key={day}
                    className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded"
                  >
                    {day < 0 ? `${Math.abs(day)}d before` : day === 0 ? 'On due date' : `${day}d after`}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );

  const renderForm = () => (
    <div className="space-y-4">
      <button
        onClick={() => { setMode('list'); setEditingRule(null); setError(null); }}
        className="flex items-center gap-1 text-slate-400 hover:text-white text-xs transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to rules
      </button>

      <FormInput
        label="Rule Name"
        value={editingRule?.name || ''}
        onChange={e => updateEditingRule({ name: e.target.value })}
        placeholder="e.g., Standard Reminders"
      />

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-xs text-white">Enabled</div>
          <div className="text-[10px] text-slate-500">Send reminders using this rule</div>
        </div>
        <ToggleSwitch
          checked={editingRule?.enabled ?? true}
          onChange={enabled => updateEditingRule({ enabled })}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Reminder Schedule (days relative to due date)
        </label>
        <div className="flex flex-wrap gap-2">
          {[-7, -3, -1, 0, 1, 3, 7, 14, 21, 30].map(day => {
            const isSelected = editingRule?.reminderDays?.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleReminderDay(day)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isSelected
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                {day < 0 ? `${Math.abs(day)}d before` : day === 0 ? 'Due date' : `${day}d after`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Escalate After (days)
          </label>
          <input
            type="number"
            value={editingRule?.escalateAfterDays || 30}
            onChange={e => updateEditingRule({ escalateAfterDays: parseInt(e.target.value) || 30 })}
            min={1}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Escalation Action
          </label>
          <select
            value={editingRule?.escalationAction || 'none'}
            onChange={e => updateEditingRule({ escalationAction: e.target.value as ReminderRule['escalationAction'] })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="none">No action</option>
            <option value="pause">Pause reminders</option>
            <option value="mark_uncollectible">Mark uncollectible</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-xs text-white">Include PDF</div>
          <div className="text-[10px] text-slate-500">Attach invoice PDF to reminder emails</div>
        </div>
        <ToggleSwitch
          checked={editingRule?.includePdf ?? true}
          onChange={includePdf => updateEditingRule({ includePdf })}
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-xs text-white">Set as Default</div>
          <div className="text-[10px] text-slate-500">Apply to new invoices automatically</div>
        </div>
        <ToggleSwitch
          checked={editingRule?.isDefault ?? false}
          onChange={isDefault => updateEditingRule({ isDefault })}
        />
      </div>

      <FormInput
        label="CC Internal Email (optional)"
        value={editingRule?.ccInternalEmail || ''}
        onChange={e => updateEditingRule({ ccInternalEmail: e.target.value })}
        placeholder="billing@yourcompany.com"
        type="email"
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reminder Rules"
      subtitle={mode === 'list' ? 'Manage automatic payment reminders' : mode === 'create' ? 'Create new rule' : 'Edit rule'}
      accent="amber"
      size="md"
      footer={
        mode !== 'list' ? (
          <>
            <GlowButton variant="secondary" onClick={() => { setMode('list'); setEditingRule(null); setError(null); }}>
              Cancel
            </GlowButton>
            <GlowButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create Rule' : 'Save Changes'}
            </GlowButton>
          </>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {mode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderList()}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {renderForm()}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
