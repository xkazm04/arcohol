'use client';

import { useState } from 'react';
import { mockEndpoints } from './_lib';
import { WebhookStats, EndpointCard, DeliveryLogs, CreateModal, TestModal } from './_components';

export default function WebhooksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const runTest = () => {
    setTestResult('testing');
    setTimeout(() => setTestResult('success'), 1500);
  };

  const handleCloseTest = () => {
    setShowTestModal(false);
    setTestResult('idle');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Webhooks</h1>
          <p className="text-sm text-slate-400">Receive real-time event notifications for your integrations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Test Webhook
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Endpoint
          </button>
        </div>
      </div>

      <WebhookStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase">Webhook Endpoints</div>
          {mockEndpoints.map((endpoint) => (
            <EndpointCard key={endpoint.id} endpoint={endpoint} />
          ))}
        </div>

        {/* Delivery Logs */}
        <DeliveryLogs />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          selectedEvents={selectedEvents}
          onToggleEvent={toggleEvent}
        />
      )}
      {showTestModal && (
        <TestModal
          onClose={handleCloseTest}
          testResult={testResult}
          onTest={runTest}
        />
      )}
    </div>
  );
}
