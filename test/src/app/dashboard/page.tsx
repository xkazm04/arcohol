'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  creditBalance: number;
  treasuryBalance: number;
  pendingInvoices: number;
  openDisputes: number;
  revenue30d: number;
  yieldEarned: number;
}

const mockStats: DashboardStats = {
  creditBalance: 45230.50,
  treasuryBalance: 250000.00,
  pendingInvoices: 12,
  openDisputes: 3,
  revenue30d: 89450.00,
  yieldEarned: 1082.50,
};

const recentActivity = [
  { id: 1, type: 'invoice_paid', description: 'Invoice #INV-2024-0847 paid', amount: '+$5,000.00', time: '5 min ago' },
  { id: 2, type: 'credit_deposit', description: 'Credit account deposit', amount: '+$10,000.00', time: '1 hour ago' },
  { id: 3, type: 'dispute_resolved', description: 'Dispute #DSP-0234 resolved in your favor', amount: '$1,200.00', time: '3 hours ago' },
  { id: 4, type: 'yield_credit', description: 'Monthly yield credited', amount: '+$1,082.50', time: '1 day ago' },
  { id: 5, type: 'invoice_created', description: 'Invoice #INV-2024-0848 created', amount: '$15,000.00', time: '2 days ago' },
];

const quickActions = [
  { label: 'Create Invoice', href: '/dashboard/invoices/new', icon: 'M12 4v16m8-8H4', color: 'cyan' },
  { label: 'Add Credits', href: '/dashboard/credits', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1', color: 'green' },
  { label: 'View Reports', href: '/dashboard/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'purple' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'slate' },
];

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadOrganization = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('org_profiles')
          .select('current_organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.current_organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', profile.current_organization_id)
            .single();

          setOrganization(org);
        }
      }
    };

    loadOrganization();
  }, [supabase]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{organization ? `, ${organization.name}` : ''}
          </h1>
          <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your account today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">Last updated: Just now</span>
          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">+5.2% APY</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Credit Balance</div>
            <div className="text-2xl font-bold text-white font-mono">${stats.creditBalance.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Treasury AUM</div>
            <div className="text-2xl font-bold text-white font-mono">${stats.treasuryBalance.toLocaleString()}</div>
            <div className="text-[10px] text-green-400 mt-1">+${stats.yieldEarned.toLocaleString()} yield this month</div>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Pending Invoices</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.pendingInvoices}</div>
            <div className="text-[10px] text-slate-500 mt-1">$47,500 outstanding</div>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 relative overflow-hidden group hover:border-red-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              {stats.openDisputes > 0 && (
                <span className="text-[10px] font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Action Req</span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Open Disputes</div>
            <div className="text-2xl font-bold text-white font-mono">{stats.openDisputes}</div>
            <div className="text-[10px] text-slate-500 mt-1">AI resolution active</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="text-xs font-mono text-slate-500 uppercase mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-${action.color}-500/10 text-${action.color}-400 group-hover:bg-${action.color}-500/20 transition-colors`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-500 uppercase">Recent Activity</span>
            <button className="text-xs text-cyan-400 hover:text-cyan-300">View All</button>
          </div>
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'invoice_paid' || activity.type === 'credit_deposit' ? 'bg-green-500/10 text-green-400' :
                        activity.type === 'dispute_resolved' ? 'bg-blue-500/10 text-blue-400' :
                        activity.type === 'yield_credit' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {activity.type === 'invoice_paid' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                          {activity.type === 'credit_deposit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                          {activity.type === 'dispute_resolved' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />}
                          {activity.type === 'yield_credit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                          {activity.type === 'invoice_created' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-white">{activity.description}</div>
                        <div className="text-xs text-slate-500">{activity.time}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-mono ${activity.amount.startsWith('+') ? 'text-green-400' : 'text-white'}`}>
                      {activity.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-slate-500 uppercase">30-Day Performance</span>
          <div className="flex gap-2">
            {['7D', '30D', '90D'].map((period) => (
              <button
                key={period}
                className={`px-2 py-1 text-[10px] font-medium rounded ${period === '30D' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-slate-400 text-sm mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-white font-mono">${stats.revenue30d.toLocaleString()}</div>
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +23.5% from last month
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Settlement Savings</div>
            <div className="text-3xl font-bold text-green-400 font-mono">$2,594</div>
            <div className="text-xs text-slate-500 mt-1">vs traditional payment rails</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Avg Settlement Time</div>
            <div className="text-3xl font-bold text-white font-mono">&lt;5s</div>
            <div className="text-xs text-slate-500 mt-1">Instant final settlement</div>
          </div>
        </div>
      </div>
    </div>
  );
}
