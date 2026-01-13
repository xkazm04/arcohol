'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tabs, type TabId } from './_lib';
import {
  OrganizationTab,
  ApiKeysTab,
  TeamTab,
  BillingTab,
  CreateKeyModal,
  InviteModal,
} from './_components';
import { staggerContainer, listItem } from '@/components/dashboard';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('organization');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-lg font-semibold text-white mb-1"
          style={{ textShadow: '0 0 20px rgba(148, 163, 184, 0.3)' }}
        >
          Settings
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">Manage your organization, API keys, and team</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={listItem}
        className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-slate-800/40 w-fit"
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeSettingsTab"
                className="absolute inset-0 bg-slate-800 rounded-md border border-slate-700/50"
                style={{ boxShadow: '0 0 10px rgba(148, 163, 184, 0.1)' }}
              />
            )}
            <svg className="relative z-10 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'organization' && <OrganizationTab />}
          {activeTab === 'api-keys' && <ApiKeysTab onCreateKey={() => setShowCreateKeyModal(true)} />}
          {activeTab === 'team' && <TeamTab onInvite={() => setShowInviteModal(true)} />}
          {activeTab === 'billing' && <BillingTab />}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      {showCreateKeyModal && <CreateKeyModal onClose={() => setShowCreateKeyModal(false)} />}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </motion.div>
  );
}
