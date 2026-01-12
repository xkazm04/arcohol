'use client';

import { useState } from 'react';

const mockOrganization = {
  name: 'Acme Corporation',
  slug: 'acme-corp',
  email: 'billing@acme.com',
  website: 'https://acme.com',
  address: '123 Business Ave, San Francisco, CA 94102',
  taxId: 'US-12-3456789',
};

const mockUser = {
  name: 'John Smith',
  email: 'john@acme.com',
  role: 'Owner',
  avatar: null,
};

const notificationSettings = [
  { id: 'payment_received', label: 'Payment received', description: 'When a payment is successfully processed', email: true, push: true },
  { id: 'invoice_paid', label: 'Invoice paid', description: 'When an invoice is marked as paid', email: true, push: false },
  { id: 'dispute_opened', label: 'Dispute opened', description: 'When a customer opens a dispute', email: true, push: true },
  { id: 'agent_budget_alert', label: 'Agent budget alert', description: 'When an agent approaches budget limit', email: true, push: true },
  { id: 'weekly_report', label: 'Weekly summary', description: 'Weekly treasury and payment summary', email: true, push: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'organization' | 'account' | 'notifications' | 'security'>('organization');
  const [notifications, setNotifications] = useState(notificationSettings);

  const toggleNotification = (id: string, type: 'email' | 'push') => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, [type]: !n[type] } : n)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your organization and account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/40 p-1 rounded-lg border border-slate-800/60 w-fit">
        {[
          { id: 'organization', label: 'Organization' },
          { id: 'account', label: 'Account' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Settings */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Organization Name</label>
                <input
                  type="text"
                  defaultValue={mockOrganization.name}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Slug</label>
                <input
                  type="text"
                  defaultValue={mockOrganization.slug}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Billing Email</label>
                <input
                  type="email"
                  defaultValue={mockOrganization.email}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Website</label>
                <input
                  type="url"
                  defaultValue={mockOrganization.website}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Business Address</label>
                <input
                  type="text"
                  defaultValue={mockOrganization.address}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tax ID</label>
                <input
                  type="text"
                  defaultValue={mockOrganization.taxId}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <h2 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-400 mb-4">
              Once you delete your organization, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-600/20">
              Delete Organization
            </button>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Profile</h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {mockUser.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={mockUser.name}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={mockUser.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email is managed through Google OAuth</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
                Update Profile
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Connected Account</h2>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-white">Google</div>
                  <div className="text-xs text-slate-500">{mockUser.email}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded">Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60">
            <h2 className="text-sm font-medium text-white">Notification Preferences</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-end gap-12 mb-4 pr-4">
              <span className="text-xs text-slate-500 w-16 text-center">Email</span>
              <span className="text-xs text-slate-500 w-16 text-center">Push</span>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{notification.label}</div>
                    <div className="text-xs text-slate-500">{notification.description}</div>
                  </div>
                  <div className="flex items-center gap-12">
                    <button
                      onClick={() => toggleNotification(notification.id, 'email')}
                      className={`w-16 h-8 rounded-full transition-colors flex items-center ${
                        notification.email ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-6 h-6 bg-white rounded-full m-1" />
                    </button>
                    <button
                      onClick={() => toggleNotification(notification.id, 'push')}
                      className={`w-16 h-8 rounded-full transition-colors flex items-center ${
                        notification.push ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-6 h-6 bg-white rounded-full m-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Two-Factor Authentication</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
              </div>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Active Sessions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Chrome on Windows</div>
                    <div className="text-xs text-slate-500">San Francisco, CA • Current session</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Safari on iPhone</div>
                    <div className="text-xs text-slate-500">Last active 2 days ago</div>
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
            <h2 className="text-sm font-medium text-white mb-4">Audit Log</h2>
            <div className="space-y-2">
              {[
                { action: 'API key created', time: '2 hours ago' },
                { action: 'Webhook endpoint added', time: '1 day ago' },
                { action: 'Agent budget updated', time: '3 days ago' },
                { action: 'Organization settings changed', time: '1 week ago' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-sm text-slate-300">{log.action}</span>
                  <span className="text-xs text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-cyan-400 hover:text-cyan-300">View full audit log</button>
          </div>
        </div>
      )}
    </div>
  );
}
