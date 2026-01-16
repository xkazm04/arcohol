'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItem } from '../utils/animations';
import type { AuditLogEntry, AuditEventType } from '@/features/invoices';

interface AuditTrailProps {
  invoiceId: string;
  className?: string;
}

const EVENT_CONFIG: Record<AuditEventType, { icon: string; color: string; label: string }> = {
  created: { icon: '✨', color: 'text-cyan-400', label: 'Created' },
  updated: { icon: '✏️', color: 'text-slate-400', label: 'Updated' },
  sent: { icon: '📧', color: 'text-blue-400', label: 'Sent' },
  viewed: { icon: '👁️', color: 'text-purple-400', label: 'Viewed' },
  payment_received: { icon: '💰', color: 'text-emerald-400', label: 'Payment Received' },
  partially_paid: { icon: '💵', color: 'text-amber-400', label: 'Partially Paid' },
  paid: { icon: '✅', color: 'text-emerald-400', label: 'Paid' },
  refunded: { icon: '↩️', color: 'text-orange-400', label: 'Refunded' },
  canceled: { icon: '❌', color: 'text-red-400', label: 'Canceled' },
  reminder_sent: { icon: '🔔', color: 'text-amber-400', label: 'Reminder Sent' },
  status_changed: { icon: '🔄', color: 'text-blue-400', label: 'Status Changed' },
  due_date_changed: { icon: '📅', color: 'text-purple-400', label: 'Due Date Changed' },
  amount_changed: { icon: '💲', color: 'text-cyan-400', label: 'Amount Changed' },
};

export function AuditTrail({ invoiceId, className = '' }: AuditTrailProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditHistory();
  }, [invoiceId]);

  const fetchAuditHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/invoices/${invoiceId}/audit`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActor = (entry: AuditLogEntry) => {
    if (entry.actorType === 'system') return 'System';
    if (entry.actorType === 'customer') return 'Customer';
    if (entry.actorEmail) return entry.actorEmail;
    return entry.actorType === 'api' ? 'API' : 'User';
  };

  const renderChanges = (entry: AuditLogEntry) => {
    if (!entry.changes || Object.keys(entry.changes).length === 0) return null;

    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-2 overflow-hidden"
      >
        <div className="bg-slate-800/50 rounded-lg p-2 text-[10px]">
          {Object.entries(entry.changes).map(([field, change]) => (
            <div key={field} className="flex items-center gap-2 py-1">
              <span className="text-slate-500 capitalize">{field.replace(/_/g, ' ')}:</span>
              <span className="text-red-400/70 line-through">
                {typeof change.from === 'object' ? JSON.stringify(change.from) : String(change.from || '—')}
              </span>
              <span className="text-slate-600">→</span>
              <span className="text-emerald-400">
                {typeof change.to === 'object' ? JSON.stringify(change.to) : String(change.to || '—')}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-red-400 text-xs">{error}</p>
        <button
          onClick={fetchAuditHistory}
          className="mt-2 text-cyan-400 text-xs hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-slate-500 text-xs">No audit history available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-white">Activity History</h3>
        <span className="text-[10px] text-slate-500">{entries.length} events</span>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-800" />

        {entries.map((entry, index) => {
          const config = EVENT_CONFIG[entry.eventType] || {
            icon: '•',
            color: 'text-slate-400',
            label: entry.eventType,
          };
          const isExpanded = expandedEntry === entry.id;
          const hasChanges = entry.changes && Object.keys(entry.changes).length > 0;

          return (
            <motion.div
              key={entry.id}
              variants={listItem}
              className="relative pl-8 pb-4 last:pb-0"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] ${config.color}`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div
                className={`${hasChanges ? 'cursor-pointer hover:bg-slate-800/30 -ml-2 pl-2 pr-2 py-1 rounded-lg transition-colors' : ''}`}
                onClick={() => hasChanges && setExpandedEntry(isExpanded ? null : entry.id)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">
                    by {formatActor(entry)}
                  </span>
                  {hasChanges && (
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-slate-600 text-[10px]"
                    >
                      ▼
                    </motion.span>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && renderChanges(entry)}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Compact inline version for smaller spaces
export function CompactAuditTrail({ invoiceId }: { invoiceId: string }) {
  const [latestEntry, setLatestEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${invoiceId}/audit?limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.entries?.length > 0) {
          setLatestEntry(data.entries[0]);
        }
      })
      .catch(() => {});
  }, [invoiceId]);

  if (!latestEntry) return null;

  const config = EVENT_CONFIG[latestEntry.eventType];

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span>{config?.icon || '•'}</span>
      <span className={config?.color || 'text-slate-400'}>
        {config?.label || latestEntry.eventType}
      </span>
      <span className="text-slate-600">
        {new Date(latestEntry.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}
