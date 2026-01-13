'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCreditAccount, useTreasury, useInvoices, useDisputes } from '@/mocks/MockB2BProvider';
import { StatCard, Card, CardHeader, staggerContainer, listItem } from '@/components/dashboard';

export default function B2BOverviewPage() {
  const { creditAccount, loadAccount } = useCreditAccount();
  const { overview, loadTreasury } = useTreasury();
  const { invoices } = useInvoices();
  const { disputes } = useDisputes();

  useEffect(() => {
    loadAccount();
    loadTreasury();
  }, [loadAccount, loadTreasury]);

  const totalBalance = creditAccount
    ? parseFloat(creditAccount.availableBalance.amount) + parseFloat(creditAccount.yieldBalance.amount)
    : 0;
  const treasuryTotal = overview ? parseFloat(overview.total.amount) : 0;
  const pendingInvoices = invoices.filter((i) => i.status === 'sent').length;
  const openDisputes = disputes.filter((d) => d.status !== 'resolved').length;

  const modules = [
    {
      href: '/sandbox/b2b/credits',
      label: 'Credit Lines',
      desc: 'Extend credit to business customers with automated underwriting and real-time risk monitoring.',
      target: 'Platforms offering net terms or buy-now-pay-later',
      value: `$${totalBalance.toLocaleString()}`,
      trend: '+12.5%',
      color: 'blue',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      href: '/sandbox/b2b/invoices',
      label: 'Invoicing',
      desc: 'Generate professional invoices with automatic payment tracking and reminders.',
      target: 'Service providers, wholesalers, recurring revenue',
      value: `${pendingInvoices} pending`,
      trend: '4 due soon',
      color: 'amber',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      href: '/sandbox/b2b/disputes',
      label: 'Dispute Resolution',
      desc: 'AI-powered dispute handling that analyzes evidence and automates refund decisions.',
      target: 'Marketplaces and high-volume platforms',
      value: `${openDisputes} open`,
      trend: 'Avg 2h resolve',
      color: 'red',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
    },
    {
      href: '/sandbox/b2b/treasury',
      label: 'Treasury Operations',
      desc: 'Optimize working capital with automated yield strategies on idle funds.',
      target: 'Finance teams managing stablecoin holdings',
      value: `$${treasuryTotal.toLocaleString()}`,
      trend: '5.2% APY',
      color: 'purple',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
    },
  ];

  const colorConfig: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.5)' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.5)' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'rgba(168, 85, 247, 0.5)' },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10 max-w-6xl"
    >
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-[10px] font-mono text-slate-500"
      >
        <Link href="/sandbox" className="hover:text-cyan-400 transition-colors">SANDBOX</Link>
        <span>/</span>
        <span className="text-slate-300">B2B DASHBOARD</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-xl font-bold text-white mb-1"
            style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
          >
            B2B Finance Suite
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Enterprise payment infrastructure for platforms and marketplaces. Credit lines, invoicing, dispute resolution, and treasury operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-mono">SETTLEMENT: T+0</span>
          <div className="h-4 w-px bg-slate-800" />
          <motion.div
            animate={{ boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.3)', '0 0 0 4px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-medium text-green-400">System Operational</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Credit Balance"
          value={`$${totalBalance.toLocaleString()}`}
          subValue="+5.2% APY"
          accent="blue"
          delay={0}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          href="/sandbox/b2b/credits"
        />
        <StatCard
          label="Treasury Assets"
          value={`$${treasuryTotal.toLocaleString()}`}
          subValue={overview ? `$${overview.projectedAnnualYield.amount}/yr` : 'Yielding'}
          accent="purple"
          delay={0.05}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>}
          href="/sandbox/b2b/treasury"
        />
        <StatCard
          label="Pending Invoices"
          value={pendingInvoices.toString()}
          subValue={`${invoices.length} total`}
          accent="amber"
          delay={0.1}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          href="/sandbox/b2b/invoices"
        />
        <StatCard
          label="Open Disputes"
          value={openDisputes.toString()}
          subValue="AI resolution"
          accent="red"
          delay={0.15}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          href="/sandbox/b2b/disputes"
        />
      </motion.div>

      {/* Modules */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-mono text-slate-500 uppercase mb-3 pl-1"
        >
          Operational Modules
        </motion.div>
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((m, index) => {
            const colors = colorConfig[m.color];
            return (
              <motion.div
                key={m.href}
                variants={listItem}
                whileHover={{ scale: 1.01, x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href={m.href}
                  className={`group relative block p-4 bg-slate-900/50 rounded-lg border border-slate-800/40 transition-all duration-300 hover:bg-slate-900/70 overflow-hidden`}
                >
                  {/* Corner markers */}
                  <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 ${colors.border} rounded-tl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 ${colors.border} rounded-tr opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 ${colors.border} rounded-bl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 ${colors.border} rounded-br opacity-50 group-hover:opacity-100 transition-opacity`} />

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 20% 50%, ${colors.glow.replace('0.5', '0.08')}, transparent 50%)`,
                    }}
                  />

                  <div className="flex items-start justify-between mb-2 relative">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-2 ${colors.bg} rounded-lg ${colors.text}`}
                      >
                        {m.icon('w-5 h-5')}
                      </motion.div>
                      <span className={`text-sm font-semibold text-white group-hover:${colors.text} transition-colors`}>
                        {m.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-mono text-white font-bold"
                        style={{ textShadow: `0 0 10px ${colors.glow.replace('0.5', '0.3')}` }}
                      >
                        {m.value}
                      </div>
                      <div className="text-[10px] text-slate-500">{m.trend}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">{m.desc}</p>
                  <div className={`text-[10px] ${colors.text} opacity-70`}>
                    <span className="text-slate-600">For: </span>
                    {m.target}
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Value Proposition */}
      <Card accent="cyan" delay={0.3}>
        <CardHeader title="Why Arc B2B" />
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/40">
          {[
            { value: '96%+', label: 'Fee savings vs traditional rails', color: 'blue', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { value: '<5s', label: 'Instant final settlement', color: 'green', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { value: '5.2%', label: 'Automatic APY on idle funds', color: 'purple', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1 bg-${stat.color}-500/10 rounded text-${stat.color}-400`}>
                  {stat.icon}
                </div>
                <div
                  className="text-xl font-bold text-white font-mono"
                  style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}
                >
                  {stat.value}
                </div>
              </div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Quick Start Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative bg-slate-950 rounded-lg border border-slate-800/40 overflow-hidden"
      >
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500/30 rounded-br" />

        <div className="px-4 py-2.5 border-b border-slate-800/40 bg-slate-900/50">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Integration Example</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
          <code>{`import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  secretKey: process.env.ARCPAY_SECRET_KEY
})

// Create invoice ($10k, instant settlement)
const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  reference: 'INV-2024-001',
  buyer: { email: 'buyer@acme.com' }
})

// Fee: ~$10 (0.1%) vs Stripe: $290 (2.9%)`}</code>
        </pre>
      </motion.div>
    </motion.div>
  );
}
