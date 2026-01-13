'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  FormInput,
  GlowButton,
  ToggleSwitch,
  FilterTabs,
  AlertBanner,
  StatusBadge,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

const mockOrganization = {
  name: 'Acme Corporation',
  slug: 'acme-corp',
  email: 'billing@acme.com',
  website: 'https://acme.com',
  address: '123 Business Ave, San Francisco, CA 94102',
  taxId: 'US-12-3456789',
};

const mockUser = { name: 'John Smith', email: 'john@acme.com', role: 'Owner' };

const notificationSettings = [
  { id: 'payment_received', label: 'Payment received', email: true, push: true },
  { id: 'invoice_paid', label: 'Invoice paid', email: true, push: false },
  { id: 'dispute_opened', label: 'Dispute opened', email: true, push: true },
  { id: 'agent_budget_alert', label: 'Agent budget alert', email: true, push: true },
  { id: 'weekly_report', label: 'Weekly summary', email: true, push: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization');
  const [notifications, setNotifications] = useState(notificationSettings);

  const toggleNotification = (id: string, type: 'email' | 'push') => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, [type]: !n[type] } : n));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-4xl"
    >
      {/* Compact Header with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <FilterTabs
          tabs={[
            { id: 'organization', label: 'Organization' },
            { id: 'account', label: 'Account' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>

      {/* Organization Settings */}
      {activeTab === 'organization' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card accent="cyan" delay={0.1}>
            <CardHeader title="Organization Details" />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Name"
                  defaultValue={mockOrganization.name}
                />
                <FormInput
                  label="Slug"
                  defaultValue={mockOrganization.slug}
                  className="font-mono"
                />
                <FormInput
                  label="Billing Email"
                  type="email"
                  defaultValue={mockOrganization.email}
                />
                <FormInput
                  label="Website"
                  type="url"
                  defaultValue={mockOrganization.website}
                />
                <div className="col-span-2">
                  <FormInput
                    label="Address"
                    defaultValue={mockOrganization.address}
                  />
                </div>
                <FormInput
                  label="Tax ID"
                  defaultValue={mockOrganization.taxId}
                  className="font-mono"
                />
              </div>
              <div className="flex justify-end">
                <GlowButton>Save Changes</GlowButton>
              </div>
            </div>
          </Card>

          <AlertBanner
            variant="danger"
            title="Danger Zone"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          >
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-500">Permanently delete this organization and all its data</span>
              <GlowButton variant="danger" size="sm">
                Delete Organization
              </GlowButton>
            </div>
          </AlertBanner>
        </motion.div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card accent="cyan" delay={0.1}>
            <CardHeader title="Profile" />
            <div className="p-4">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                  style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
                >
                  {mockUser.name.charAt(0)}
                </motion.div>
                <div className="flex-1 space-y-3">
                  <FormInput
                    label="Name"
                    defaultValue={mockUser.name}
                  />
                  <div>
                    <FormInput
                      label="Email"
                      type="email"
                      defaultValue={mockUser.email}
                      disabled
                    />
                    <div className="text-[9px] text-slate-600 mt-1">Managed via Google OAuth</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <GlowButton>Update Profile</GlowButton>
              </div>
            </div>
          </Card>

          <Card accent="cyan" delay={0.15}>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <div>
                    <div className="text-xs text-white">Google</div>
                    <div className="text-[10px] text-slate-500">{mockUser.email}</div>
                  </div>
                </div>
                <StatusBadge status="active" label="Connected" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card accent="cyan" delay={0.1} className="overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
              <span>Notification Type</span>
              <div className="flex gap-6">
                <span className="w-12 text-center text-[10px]">Email</span>
                <span className="w-12 text-center text-[10px]">Push</span>
              </div>
            </div>
            <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  variants={listItem}
                  className="px-3 py-3 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                >
                  <span className="text-xs text-white">{notification.label}</span>
                  <div className="flex gap-6">
                    <div className="w-12 flex justify-center">
                      <ToggleSwitch
                        checked={notification.email}
                        onChange={() => toggleNotification(notification.id, 'email')}
                        size="sm"
                      />
                    </div>
                    <div className="w-12 flex justify-center">
                      <ToggleSwitch
                        checked={notification.push}
                        onChange={() => toggleNotification(notification.id, 'push')}
                        size="sm"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card accent="cyan" delay={0.1}>
            <div className="p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white">Two-Factor Authentication</div>
                <div className="text-[10px] text-slate-500">Add extra security to your account</div>
              </div>
              <GlowButton size="sm">Enable 2FA</GlowButton>
            </div>
          </Card>

          <Card accent="cyan" delay={0.15}>
            <CardHeader title="Active Sessions" />
            <div className="p-3 space-y-2">
              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <div>
                    <div className="text-xs text-white">Chrome on Windows</div>
                    <div className="text-[10px] text-slate-500">Current session</div>
                  </div>
                </div>
                <StatusBadge status="active" label="Active" />
              </motion.div>
              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <div>
                    <div className="text-xs text-white">Safari on iPhone</div>
                    <div className="text-[10px] text-slate-500">2 days ago</div>
                  </div>
                </div>
                <GlowButton variant="danger" size="sm">Revoke</GlowButton>
              </motion.div>
            </div>
          </Card>

          <Card accent="cyan" delay={0.2}>
            <CardHeader
              title="Audit Log"
              action={
                <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">View all</button>
              }
            />
            <motion.div variants={staggerContainer} className="p-3 space-y-1">
              {[
                { action: 'API key created', time: '2h ago' },
                { action: 'Webhook added', time: '1d ago' },
                { action: 'Agent budget updated', time: '3d ago' },
              ].map((log, idx) => (
                <motion.div
                  key={idx}
                  variants={listItem}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between py-2 px-2 hover:bg-slate-800/30 rounded transition-colors"
                >
                  <span className="text-xs text-slate-300">{log.action}</span>
                  <span className="text-[10px] text-slate-600">{log.time}</span>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
