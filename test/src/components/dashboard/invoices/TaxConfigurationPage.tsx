'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../layout/Card';
import { GlowButton } from '../ui/GlowButton';
import { FormInput } from '../ui/FormInput';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { Modal } from '../layout/Modal';
import { staggerContainer, listItem } from '../utils/animations';
import { TAX_REGIONS } from '@/features/invoices';
import type { TaxConfiguration } from '@/features/invoices';

interface TaxConfigurationPageProps {
  className?: string;
}

export function TaxConfigurationPage({ className = '' }: TaxConfigurationPageProps) {
  const [configs, setConfigs] = useState<TaxConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<TaxConfiguration> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/settings/tax');
      if (!response.ok) throw new Error('Failed to fetch tax configurations');
      const data = await response.json();
      setConfigs(data.configurations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig({
      name: '',
      regionCode: '',
      taxType: 'vat',
      defaultRate: 0,
      reverseChargeEnabled: false,
      isDefault: false,
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (config: TaxConfiguration) => {
    setEditingConfig({ ...config });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingConfig?.name || !editingConfig?.regionCode) {
      setError('Name and region are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const isCreate = !editingConfig.id;
      const url = isCreate ? '/api/settings/tax' : `/api/settings/tax/${editingConfig.id}`;

      const response = await fetch(url, {
        method: isCreate ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingConfig),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      await fetchConfigs();
      setIsModalOpen(false);
      setEditingConfig(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax configuration?')) return;

    try {
      const response = await fetch(`/api/settings/tax/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete configuration');
      await fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleEnabled = async (config: TaxConfiguration) => {
    try {
      const response = await fetch(`/api/settings/tax/${config.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !config.enabled }),
      });

      if (!response.ok) throw new Error('Failed to update configuration');
      await fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateEditingConfig = (updates: Partial<TaxConfiguration>) => {
    setEditingConfig(prev => prev ? { ...prev, ...updates } : null);
  };

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case 'vat': return 'VAT';
      case 'gst': return 'GST';
      case 'sales_tax': return 'Sales Tax';
      default: return type;
    }
  };

  return (
    <div className={className}>
      <Card accent="emerald" delay={0}>
        <CardHeader
          title="Tax Configurations"
          action={
            <GlowButton size="sm" onClick={handleCreate}>
              + Add Configuration
            </GlowButton>
          }
        />
        <CardBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
              />
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-slate-400 text-sm mb-1">No tax configurations</p>
              <p className="text-slate-500 text-xs mb-4">
                Add tax configurations for different regions
              </p>
              <GlowButton size="sm" onClick={handleCreate}>
                Add First Configuration
              </GlowButton>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {configs.map(config => (
                <motion.div
                  key={config.id}
                  variants={listItem}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                          ${config.enabled ? 'bg-emerald-500/20' : 'bg-slate-700'}
                        `}
                      >
                        {TAX_REGIONS[config.regionCode]?.flag || '🌐'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{config.name}</span>
                          {config.isDefault && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-500 text-xs">{config.regionCode}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 text-xs">{getTaxTypeLabel(config.taxType)}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 text-xs font-medium">{config.defaultRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={config.enabled}
                        onChange={() => handleToggleEnabled(config)}
                        size="sm"
                      />
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {config.reverseChargeEnabled && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-[10px]">↩️ Reverse charge enabled</span>
                        {config.reverseChargeThreshold && (
                          <span className="text-slate-500 text-[10px]">
                            (threshold: ${config.reverseChargeThreshold.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <p className="text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingConfig(null); setError(null); }}
        title={editingConfig?.id ? 'Edit Tax Configuration' : 'New Tax Configuration'}
        subtitle="Configure tax settings for a region"
        accent="emerald"
        size="md"
        footer={
          <>
            <GlowButton
              variant="secondary"
              onClick={() => { setIsModalOpen(false); setEditingConfig(null); setError(null); }}
            >
              Cancel
            </GlowButton>
            <GlowButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingConfig?.id ? 'Save Changes' : 'Create'}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Configuration Name"
            value={editingConfig?.name || ''}
            onChange={e => updateEditingConfig({ name: e.target.value })}
            placeholder="e.g., EU VAT Standard"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Region</label>
              <select
                value={editingConfig?.regionCode || ''}
                onChange={e => updateEditingConfig({ regionCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select region...</option>
                {Object.entries(TAX_REGIONS).map(([code, region]) => (
                  <option key={code} value={code}>
                    {region.flag} {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tax Type</label>
              <select
                value={editingConfig?.taxType || 'vat'}
                onChange={e => updateEditingConfig({ taxType: e.target.value as TaxConfiguration['taxType'] })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="vat">VAT (Value Added Tax)</option>
                <option value="gst">GST (Goods & Services Tax)</option>
                <option value="sales_tax">Sales Tax</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Default Rate (%)</label>
            <input
              type="number"
              value={editingConfig?.defaultRate || 0}
              onChange={e => updateEditingConfig({ defaultRate: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Reverse Charge</div>
                <div className="text-[10px] text-slate-500">Enable for B2B cross-border transactions</div>
              </div>
              <ToggleSwitch
                checked={editingConfig?.reverseChargeEnabled ?? false}
                onChange={reverseChargeEnabled => updateEditingConfig({ reverseChargeEnabled })}
              />
            </div>

            <AnimatePresence>
              {editingConfig?.reverseChargeEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Reverse Charge Threshold (optional)
                  </label>
                  <input
                    type="number"
                    value={editingConfig?.reverseChargeThreshold || ''}
                    onChange={e => updateEditingConfig({
                      reverseChargeThreshold: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    placeholder="e.g., 10000"
                    min={0}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Set as Default</div>
                <div className="text-[10px] text-slate-500">Use for new invoices without specified region</div>
              </div>
              <ToggleSwitch
                checked={editingConfig?.isDefault ?? false}
                onChange={isDefault => updateEditingConfig({ isDefault })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Enabled</div>
                <div className="text-[10px] text-slate-500">Active for tax calculations</div>
              </div>
              <ToggleSwitch
                checked={editingConfig?.enabled ?? true}
                onChange={enabled => updateEditingConfig({ enabled })}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
