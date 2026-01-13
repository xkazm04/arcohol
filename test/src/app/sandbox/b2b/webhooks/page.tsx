'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockEndpoints } from './_lib';
import { WebhookStats, EndpointCard, DeliveryLogs, CreateModal, TestModal } from './_components';
import { GlowButton, staggerContainer, listItem } from '@/components/dashboard';

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
          >
            Webhooks
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">Receive real-time event notifications for your integrations</p>
        </div>
        <div className="flex gap-2">
          <GlowButton
            variant="secondary"
            size="sm"
            onClick={() => setShowTestModal(true)}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            Test Webhook
          </GlowButton>
          <GlowButton
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Endpoint
          </GlowButton>
        </div>
      </motion.div>

      <motion.div variants={listItem}>
        <WebhookStats />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Endpoints */}
        <motion.div variants={listItem} className="lg:col-span-2 space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Webhook Endpoints</div>
          {mockEndpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <EndpointCard endpoint={endpoint} />
            </motion.div>
          ))}
        </motion.div>

        {/* Delivery Logs */}
        <motion.div variants={listItem}>
          <DeliveryLogs />
        </motion.div>
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
    </motion.div>
  );
}
