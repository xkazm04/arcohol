'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  Card,
  CardHeader,
  DataList,
  DataListItem,
  Modal,
  GlowButton,
  FormInput,
  StatusDot,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

const mockWebhooks = [
  { id: 'wh-001', url: 'api.example.com/webhooks', events: ['payment.completed', 'payment.failed', 'invoice.paid'], status: 'active', successRate: 99.8, lastDelivery: '2m' },
  { id: 'wh-002', url: 'app.mycompany.io/hooks', events: ['payment.completed'], status: 'active', successRate: 100, lastDelivery: '1h' },
  { id: 'wh-003', url: 'old-system.internal/webhook', events: ['invoice.created'], status: 'disabled', successRate: 85.2, lastDelivery: '5d' },
];

const eventTypes = [
  { category: 'Payments', events: ['payment.created', 'payment.completed', 'payment.failed'] },
  { category: 'Invoices', events: ['invoice.created', 'invoice.paid', 'invoice.overdue'] },
  { category: 'Disputes', events: ['dispute.opened', 'dispute.resolved'] },
  { category: 'Agents', events: ['agent.payment_authorized', 'agent.budget_exceeded'] },
];

const recentDeliveries = [
  { id: 1, event: 'payment.completed', webhook: 'wh-001', status: 'delivered', time: '2m', responseTime: '145ms' },
  { id: 2, event: 'invoice.paid', webhook: 'wh-001', status: 'delivered', time: '15m', responseTime: '89ms' },
  { id: 3, event: 'payment.failed', webhook: 'wh-001', status: 'failed', time: '3h', responseTime: 'timeout' },
];

export default function WebhooksPage() {
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const activeWebhooks = mockWebhooks.filter(w => w.status === 'active').length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-5xl"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Webhooks</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Active <span className="text-white font-mono ml-1">{activeWebhooks}</span></span>
            <span>Success <span className="text-green-400 font-mono ml-1">99.2%</span></span>
          </div>
        </div>
        <GlowButton
          onClick={() => setShowNewWebhookModal(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Webhook
        </GlowButton>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Active"
          value={activeWebhooks}
          accent="cyan"
          delay={0}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
        <StatCard
          label="24h Deliveries"
          value="1,247"
          accent="cyan"
          delay={0.05}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          label="Success"
          value="99.2%"
          accent="emerald"
          delay={0.1}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Response"
          value="142ms"
          accent="purple"
          delay={0.15}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </motion.div>

      {/* Webhooks List */}
      <Card accent="cyan" delay={0.2} className="overflow-hidden">
        <CardHeader title="Configured Webhooks" />
        <DataList>
          {mockWebhooks.map((webhook, index) => (
            <DataListItem key={webhook.id}>
              <motion.div
                variants={listItem}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={webhook.status === 'active' ? 'active' : 'disabled'} pulse={webhook.status === 'active'} />
                    <span className="text-xs font-mono text-white">{webhook.url}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono ${webhook.successRate >= 99 ? 'text-green-400' : webhook.successRate >= 90 ? 'text-amber-400' : 'text-red-400'}`}>
                      {webhook.successRate}%
                    </span>
                    <span className="text-[10px] text-slate-600">{webhook.lastDelivery}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 ml-4">
                  {webhook.events.map((event) => (
                    <motion.span
                      key={event}
                      whileHover={{ scale: 1.05 }}
                      className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400/70 text-[9px] rounded border border-cyan-500/20"
                    >
                      {event}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </DataListItem>
          ))}
        </DataList>
      </Card>

      {/* Recent Deliveries */}
      <Card accent="cyan" delay={0.25} className="overflow-hidden">
        <CardHeader
          title="Recent Deliveries"
          action={
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">All</button>
          }
        />
        <DataList>
          {recentDeliveries.map((delivery) => (
            <DataListItem key={delivery.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={delivery.status === 'delivered' ? 'active' : 'failed'} />
                  <span className="text-xs font-mono text-white">{delivery.event}</span>
                  <span className="text-[10px] text-slate-600">→ {delivery.webhook}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono ${delivery.status === 'delivered' ? 'text-slate-400' : 'text-red-400'}`}>
                    {delivery.responseTime}
                  </span>
                  <span className="text-[10px] text-slate-600">{delivery.time}</span>
                </div>
              </div>
            </DataListItem>
          ))}
        </DataList>
      </Card>

      {/* New Webhook Modal */}
      <Modal
        isOpen={showNewWebhookModal}
        onClose={() => setShowNewWebhookModal(false)}
        title="Add Webhook"
        subtitle="Configure a new webhook endpoint"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowNewWebhookModal(false)}>
              Cancel
            </GlowButton>
            <GlowButton onClick={() => setShowNewWebhookModal(false)}>
              Create Webhook
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Endpoint URL"
            type="url"
            placeholder="https://your-server.com/webhooks"
            className="font-mono"
          />
          <div>
            <label className="text-[10px] text-slate-500 uppercase mb-2 block">Events</label>
            <div className="space-y-3">
              {eventTypes.map((category) => (
                <div key={category.category}>
                  <div className="text-[10px] text-slate-600 mb-1.5">{category.category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.events.map((event) => (
                      <motion.button
                        key={event}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleEvent(event)}
                        className={`px-2 py-1 text-[10px] rounded-lg transition-all ${
                          selectedEvents.includes(event)
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {event}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
