'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  StatCard,
  HeroStatCard,
  ActivityFeed,
  Card,
  CardHeader,
  CardBody,
  staggerContainer,
  GlowButton,
  FilterTabs,
} from '@/components/dashboard';

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
  { id: '1', type: 'invoice_paid', title: 'Invoice #INV-2024-0847 paid', value: '+$5,000.00', valueColor: 'positive' as const, time: '5m', iconColor: 'emerald' as const },
  { id: '2', type: 'credit_deposit', title: 'Credit account deposit', value: '+$10,000.00', valueColor: 'positive' as const, time: '1h', iconColor: 'emerald' as const },
  { id: '3', type: 'dispute_resolved', title: 'Dispute #DSP-0234 resolved', value: '$1,200.00', valueColor: 'neutral' as const, time: '3h', iconColor: 'blue' as const },
  { id: '4', type: 'yield_credit', title: 'Monthly yield credited', value: '+$1,082.50', valueColor: 'positive' as const, time: '1d', iconColor: 'purple' as const },
];

const quickActions = [
  { label: 'Invoice', href: '/dashboard/invoices/new', icon: 'M12 4v16m8-8H4' },
  { label: 'Credits', href: '/dashboard/credits', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1' },
  { label: 'Treasury', href: '/dashboard/treasury', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
  { label: 'Agents', href: '/dashboard/agents', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    invoice_paid: 'M5 13l4 4L19 7',
    credit_deposit: 'M12 4v16m8-8H4',
    dispute_resolved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    yield_credit: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  };
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type] || icons.invoice_paid} />
    </svg>
  );
};

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const [timePeriod, setTimePeriod] = useState('30D');
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

  const activityItems = recentActivity.map((activity) => ({
    id: activity.id,
    icon: getActivityIcon(activity.type),
    iconColor: activity.iconColor,
    title: activity.title,
    value: activity.value,
    valueColor: activity.valueColor,
    time: activity.time,
  }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl"
    >
      {/* Compact Header with Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">
            {organization ? organization.name : 'Dashboard'}
          </h1>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                </svg>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] text-cyan-400 font-mono flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          Live
        </motion.span>
      </motion.div>

      {/* Stats Row with enhanced cards */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Credits"
          value={`$${stats.creditBalance.toLocaleString()}`}
          accent="cyan"
          delay={0}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
            </svg>
          }
          trend={{ value: '5.2% APY', positive: true }}
        />

        <StatCard
          label="Treasury"
          value={`$${stats.treasuryBalance.toLocaleString()}`}
          subValue={`+$${stats.yieldEarned.toLocaleString()} yield`}
          accent="purple"
          delay={0.05}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          }
        />

        <StatCard
          label="Invoices"
          value={stats.pendingInvoices}
          subValue="pending"
          accent="amber"
          delay={0.1}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <StatCard
          label="Disputes"
          value={stats.openDisputes}
          subValue="open"
          accent="red"
          delay={0.15}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Performance Metrics */}
        <Card accent="cyan" showGrid delay={0.2} className="lg:col-span-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-slate-400">30-Day Performance</span>
            <FilterTabs
              tabs={[
                { id: '7D', label: '7D' },
                { id: '30D', label: '30D' },
                { id: '90D', label: '90D' },
              ]}
              activeTab={timePeriod}
              onChange={setTimePeriod}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div
                className="text-2xl font-bold text-white font-mono"
                style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
              >
                ${stats.revenue30d.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-slate-500">Revenue</span>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[10px] text-green-400 flex items-center"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  23.5%
                </motion.span>
              </div>
            </div>
            <div>
              <div
                className="text-2xl font-bold text-emerald-400 font-mono"
                style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
              >
                $2,594
              </div>
              <div className="text-xs text-slate-500 mt-1">Savings vs rails</div>
            </div>
            <div>
              <div
                className="text-2xl font-bold text-white font-mono"
                style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
              >
                &lt;5s
              </div>
              <div className="text-xs text-slate-500 mt-1">Settlement</div>
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card accent="cyan" delay={0.25} className="lg:col-span-2 overflow-hidden">
          <CardHeader
            title="Activity"
            action={
              <Link href="/dashboard/activity" className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
                All
              </Link>
            }
          />
          <ActivityFeed items={activityItems} />
        </Card>
      </div>

      {/* Bottom Stats Row - Link cards with enhanced styling */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Active Agents"
          value="3"
          subValue="$158.50 spent (24h)"
          accent="cyan"
          href="/dashboard/agents"
          delay={0.3}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatCard
          label="API Requests"
          value="12.4k"
          subValue="99.7% success rate"
          accent="purple"
          href="/dashboard/x402"
          delay={0.35}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        />

        <StatCard
          label="Chains Active"
          value="4"
          subValue="Arc, Base, ETH, Polygon"
          accent="blue"
          href="/dashboard/crosschain"
          delay={0.4}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />

        <StatCard
          label="Webhooks"
          value="2"
          subValue="99.2% delivery"
          accent="amber"
          href="/dashboard/webhooks"
          delay={0.45}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </motion.div>
    </motion.div>
  );
}
