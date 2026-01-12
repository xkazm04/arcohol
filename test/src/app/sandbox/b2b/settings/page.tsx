'use client';

import { useState } from 'react';
import { tabs, type TabId } from './_lib';
import {
  OrganizationTab,
  ApiKeysTab,
  TeamTab,
  BillingTab,
  CreateKeyModal,
  InviteModal,
} from './_components';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('organization');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Manage your organization, API keys, and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900/40 rounded-lg border border-slate-800/60 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'organization' && <OrganizationTab />}
      {activeTab === 'api-keys' && <ApiKeysTab onCreateKey={() => setShowCreateKeyModal(true)} />}
      {activeTab === 'team' && <TeamTab onInvite={() => setShowInviteModal(true)} />}
      {activeTab === 'billing' && <BillingTab />}

      {/* Modals */}
      {showCreateKeyModal && <CreateKeyModal onClose={() => setShowCreateKeyModal(false)} />}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
