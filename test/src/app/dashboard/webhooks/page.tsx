'use client';

import { useState } from 'react';

const mockWebhooks = [
  {
    id: 'wh-001',
    url: 'https://api.example.com/webhooks/arcpay',
    events: ['payment.completed', 'payment.failed', 'invoice.paid'],
    status: 'active',
    created: '2024-01-05',
    successRate: 99.8,
    lastDelivery: '2 minutes ago',
  },
  {
    id: 'wh-002',
    url: 'https://app.mycompany.io/hooks/payments',
    events: ['payment.completed'],
    status: 'active',
    created: '2024-01-10',
    successRate: 100,
    lastDelivery: '1 hour ago',
  },
  {
    id: 'wh-003',
    url: 'https://old-system.internal/webhook',
    events: ['invoice.created'],
    status: 'disabled',
    created: '2023-12-01',
    successRate: 85.2,
    lastDelivery: '5 days ago',
  },
];

const eventTypes = [
  { category: 'Payments', events: ['payment.created', 'payment.completed', 'payment.failed', 'payment.refunded'] },
  { category: 'Invoices', events: ['invoice.created', 'invoice.paid', 'invoice.overdue', 'invoice.cancelled'] },
  { category: 'Disputes', events: ['dispute.opened', 'dispute.resolved', 'dispute.escalated'] },
  { category: 'Agents', events: ['agent.payment_authorized', 'agent.budget_exceeded', 'agent.vendor_added'] },
];

const recentDeliveries = [
  { id: 1, event: 'payment.completed', webhook: 'wh-001', status: 'delivered', time: '2 min ago', responseTime: '145ms' },
  { id: 2, event: 'invoice.paid', webhook: 'wh-001', status: 'delivered', time: '15 min ago', responseTime: '89ms' },
  { id: 3, event: 'payment.completed', webhook: 'wh-002', status: 'delivered', time: '1 hour ago', responseTime: '203ms' },
  { id: 4, event: 'payment.failed', webhook: 'wh-001', status: 'failed', time: '3 hours ago', responseTime: 'timeout' },
];

export default function WebhooksPage() {
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-slate-400 mt-1">Real-time event notifications for your integrations</p>
        </div>
        <button
          onClick={() => setShowNewWebhookModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Active Webhooks</div>
          <div className="text-2xl font-bold text-white">{mockWebhooks.filter(w => w.status === 'active').length}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Deliveries (24h)</div>
          <div className="text-2xl font-bold text-white">1,247</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">99.2%</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Avg Response</div>
          <div className="text-2xl font-bold text-cyan-400">142ms</div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">Configured Webhooks</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {mockWebhooks.map((webhook) => (
            <div key={webhook.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    webhook.status === 'active' ? 'bg-green-500/10' : 'bg-slate-800'
                  }`}>
                    <svg className={`w-5 h-5 ${webhook.status === 'active' ? 'text-green-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white">{webhook.url}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        webhook.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {webhook.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.map((event) => (
                        <span key={event} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-white">{webhook.successRate}%</div>
                    <div className="text-xs text-slate-500">success rate</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Recent Deliveries</h2>
          <button className="text-xs text-cyan-400 hover:text-cyan-300">View all</button>
        </div>
        <div className="divide-y divide-slate-800/60">
          {recentDeliveries.map((delivery) => (
            <div key={delivery.id} className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${delivery.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <span className="text-sm font-mono text-white">{delivery.event}</span>
                  <span className="text-xs text-slate-500 ml-2">→ {delivery.webhook}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-slate-500">{delivery.time}</span>
                <span className={`text-xs font-mono ${delivery.status === 'delivered' ? 'text-slate-400' : 'text-red-400'}`}>
                  {delivery.responseTime}
                </span>
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Webhook Modal */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewWebhookModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg m-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h3 className="text-lg font-semibold text-white">Add Webhook</h3>
              <button onClick={() => setShowNewWebhookModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Endpoint URL</label>
                <input
                  type="url"
                  placeholder="https://your-server.com/webhooks"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Production payment notifications"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-3">Events to listen for</label>
                <div className="space-y-4">
                  {eventTypes.map((category) => (
                    <div key={category.category}>
                      <div className="text-xs text-slate-500 mb-2">{category.category}</div>
                      <div className="flex flex-wrap gap-2">
                        {category.events.map((event) => (
                          <button
                            key={event}
                            onClick={() => toggleEvent(event)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              selectedEvents.includes(event)
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {event}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <button className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors">
                  Create Webhook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
