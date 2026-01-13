'use client';

import { motion } from 'framer-motion';
import type { Subscription } from '../_lib';
import { Card, CardHeader, StatusBadge, staggerContainer, listItem } from '@/components/dashboard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  activeFilter: 'all' | 'active' | 'past_due';
  onFilterChange: (filter: 'all' | 'active' | 'past_due') => void;
  onSelect: (subscription: Subscription) => void;
}

const statusMapping: Record<string, 'pending' | 'active' | 'paid' | 'failed' | 'sent' | 'viewed' | 'overdue'> = {
  active: 'active',
  paused: 'pending',
  cancelled: 'failed',
  past_due: 'overdue',
};

export function SubscriptionList({
  subscriptions,
  activeFilter,
  onFilterChange,
  onSelect,
}: SubscriptionListProps) {
  const filteredSubscriptions = activeFilter === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.status === activeFilter);

  return (
    <Card accent="blue" className="h-full overflow-hidden flex flex-col">
      <CardHeader
        title="Subscriptions"
        action={
          <div className="flex items-center gap-1">
            {(['all', 'active', 'past_due'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {filter === 'past_due' ? 'past due' : filter}
              </button>
            ))}
          </div>
        }
      />

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-800/20 border-b border-slate-800/40 text-[10px] font-medium text-slate-500 uppercase">
        <div className="col-span-4">Customer</div>
        <div className="col-span-3">Plan</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-3 text-center">Status</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {filteredSubscriptions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400 text-sm mb-1">No subscriptions found</p>
            <p className="text-slate-500 text-xs">Create your first subscription to get started</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
            {filteredSubscriptions.map((subscription) => (
              <motion.div
                key={subscription.id}
                variants={listItem}
                whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                onClick={() => onSelect(subscription)}
                className="grid grid-cols-12 gap-2 px-3 py-2.5 cursor-pointer transition-colors items-center group"
              >
                <div className="col-span-4">
                  <div className="text-xs font-medium text-white">{subscription.customer.name}</div>
                  <div className="text-[10px] text-slate-600">{subscription.customer.email}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs text-slate-300">{subscription.planName}</div>
                  <div className="text-[10px] text-slate-600">{subscription.interval}</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-xs font-mono text-white">${subscription.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-600">{subscription.currency}</div>
                </div>
                <div className="col-span-3 text-center">
                  <StatusBadge
                    status={statusMapping[subscription.status] || 'pending'}
                    label={subscription.status.replace(/_/g, ' ')}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
