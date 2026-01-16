'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowButton } from '../ui/GlowButton';

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onAction: (action: BulkAction, options?: BulkActionOptions) => Promise<void>;
  allowedStatuses?: string[];
}

export type BulkAction = 'send' | 'remind' | 'cancel' | 'delete' | 'export';

export interface BulkActionOptions {
  format?: 'csv' | 'excel' | 'json';
  reason?: string;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  onAction,
  allowedStatuses = [],
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<BulkAction | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const count = selectedIds.length;

  const handleAction = async (action: BulkAction, options?: BulkActionOptions) => {
    setIsProcessing(true);
    setActiveAction(action);
    try {
      await onAction(action, options);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
      setShowExportMenu(false);
    }
  };

  const canSend = allowedStatuses.some(s => ['draft'].includes(s));
  const canRemind = allowedStatuses.some(s => ['sent', 'viewed', 'overdue'].includes(s));
  const canCancel = allowedStatuses.some(s => ['draft', 'sent', 'viewed', 'overdue'].includes(s));
  const canDelete = allowedStatuses.every(s => s === 'draft');

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 px-4 py-3 flex items-center gap-4">
            {/* Selection count */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
              <motion.div
                key={count}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center"
              >
                <span className="text-cyan-400 text-xs font-semibold">{count}</span>
              </motion.div>
              <span className="text-slate-400 text-xs">
                {count === 1 ? 'invoice' : 'invoices'} selected
              </span>
              <button
                onClick={onClearSelection}
                className="ml-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Send */}
              <ActionButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                label="Send"
                onClick={() => handleAction('send')}
                disabled={!canSend || isProcessing}
                loading={activeAction === 'send'}
              />

              {/* Remind */}
              <ActionButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                label="Remind"
                onClick={() => handleAction('remind')}
                disabled={!canRemind || isProcessing}
                loading={activeAction === 'remind'}
              />

              {/* Export dropdown */}
              <div className="relative">
                <ActionButton
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                  label="Export"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isProcessing}
                  loading={activeAction === 'export'}
                  hasDropdown
                />

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                    >
                      {(['csv', 'excel', 'json'] as const).map(format => (
                        <button
                          key={format}
                          onClick={() => handleAction('export', { format })}
                          className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <span className="text-slate-500">
                            {format === 'csv' && '📄'}
                            {format === 'excel' && '📊'}
                            {format === 'json' && '{ }'}
                          </span>
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-slate-700 mx-1" />

              {/* Cancel */}
              <ActionButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                }
                label="Cancel"
                onClick={() => handleAction('cancel')}
                disabled={!canCancel || isProcessing}
                loading={activeAction === 'cancel'}
                variant="warning"
              />

              {/* Delete */}
              <ActionButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
                label="Delete"
                onClick={() => handleAction('delete')}
                disabled={!canDelete || isProcessing}
                loading={activeAction === 'delete'}
                variant="danger"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'danger';
  hasDropdown?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  loading,
  variant = 'default',
  hasDropdown,
}: ActionButtonProps) {
  const variantClasses = {
    default: 'hover:bg-slate-700 text-slate-300 hover:text-white',
    warning: 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300',
    danger: 'hover:bg-red-500/10 text-red-400 hover:text-red-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
      `}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        icon
      )}
      <span>{label}</span>
      {hasDropdown && (
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection<T extends { id: string; status?: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = (items: T[]) => {
    setSelectedIds(new Set(items.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const getSelectedStatuses = (items: T[]) => {
    return items
      .filter(item => selectedIds.has(item.id))
      .map(item => item.status || 'unknown');
  };

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedStatuses,
  };
}
