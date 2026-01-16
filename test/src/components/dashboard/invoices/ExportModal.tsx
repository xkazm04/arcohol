'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../layout/Modal';
import { GlowButton } from '../ui/GlowButton';
import { FormInput } from '../ui/FormInput';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import type { InvoiceStatus } from '@/features/invoices';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: ExportParams) => Promise<void>;
}

export interface ExportParams {
  format: 'csv' | 'excel' | 'json';
  fromDate?: string;
  toDate?: string;
  status?: InvoiceStatus[];
  includePayments?: boolean;
  includeLineItems?: boolean;
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'canceled', label: 'Canceled' },
];

const FORMAT_OPTIONS: { value: ExportParams['format']; label: string; icon: string; description: string }[] = [
  { value: 'csv', label: 'CSV', icon: '📄', description: 'Comma-separated values for spreadsheets' },
  { value: 'excel', label: 'Excel', icon: '📊', description: 'Native Excel format with formatting' },
  { value: 'json', label: 'JSON', icon: '{ }', description: 'Structured data for developers' },
];

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<ExportParams['format']>('csv');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<InvoiceStatus[]>([]);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeLineItems, setIncludeLineItems] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await onExport({
        format,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        includePayments,
        includeLineItems,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleStatus = (status: InvoiceStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    const from = new Date();

    switch (preset) {
      case 'today':
        break;
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(today.getFullYear() - 1);
        break;
    }

    setFromDate(from.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Invoices"
      subtitle="Download invoice data in your preferred format"
      accent="cyan"
      size="md"
      footer={
        <>
          <GlowButton variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </GlowButton>
          <GlowButton onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Exporting...
              </span>
            ) : (
              `Export as ${format.toUpperCase()}`
            )}
          </GlowButton>
        </>
      }
    >
      <div className="space-y-5">
        {/* Format selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map(option => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormat(option.value)}
                className={`
                  relative p-3 rounded-lg border text-left transition-all
                  ${format === option.value
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                <div className="text-lg mb-1">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{option.description}</div>
                {format === option.value && (
                  <motion.div
                    layoutId="format-indicator"
                    className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-400">Date Range</label>
            <div className="flex gap-1">
              {(['week', 'month', 'quarter', 'year'] as const).map(preset => (
                <button
                  key={preset}
                  onClick={() => setDatePreset(preset)}
                  className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  {preset === 'week' && '7D'}
                  {preset === 'month' && '30D'}
                  {preset === 'quarter' && '90D'}
                  {preset === 'year' && '1Y'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Status Filter
            <span className="text-slate-500 font-normal ml-1">(leave empty for all)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${selectedStatuses.includes(option.value)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Include options */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white">Include Payment Details</div>
              <div className="text-[10px] text-slate-500">Transaction hashes, dates, payer info</div>
            </div>
            <ToggleSwitch checked={includePayments} onChange={setIncludePayments} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white">Include Line Items</div>
              <div className="text-[10px] text-slate-500">Individual invoice line items</div>
            </div>
            <ToggleSwitch checked={includeLineItems} onChange={setIncludeLineItems} />
          </div>
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
