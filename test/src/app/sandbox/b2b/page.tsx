'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCreditAccount, useTreasury, useInvoices, useDisputes } from '@/mocks/MockB2BProvider';

export default function B2BOverviewPage() {
  const { creditAccount, loadAccount } = useCreditAccount();
  const { overview, loadTreasury } = useTreasury();
  const { invoices } = useInvoices();
  const { disputes } = useDisputes();
  const [demoRunning, setDemoRunning] = useState(false);

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
      desc: 'Extend credit to business customers with automated underwriting and real-time risk monitoring. Track balances, set limits, and manage repayment schedules.',
      target: 'Platforms offering net terms or buy-now-pay-later for businesses',
      value: `$${totalBalance.toLocaleString()}`,
      trend: '+12.5%',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      href: '/sandbox/b2b/invoices',
      label: 'Invoicing',
      desc: 'Generate professional invoices with automatic payment tracking and reminders. Support for recurring billing, partial payments, and multi-currency.',
      target: 'Service providers, wholesalers, and recurring revenue businesses',
      value: `${pendingInvoices} pending`,
      trend: '4 due soon',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      href: '/sandbox/b2b/disputes',
      label: 'Dispute Resolution',
      desc: 'AI-powered dispute handling that analyzes evidence, suggests resolutions, and automates refund decisions. Reduce chargebacks and operational overhead.',
      target: 'Marketplaces and platforms handling high transaction volumes',
      value: `${openDisputes} open`,
      trend: 'Avg 2h resolve',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
    },
    {
      href: '/sandbox/b2b/treasury',
      label: 'Treasury Operations',
      desc: 'Optimize working capital with automated yield strategies on idle funds. Multi-chain treasury management with real-time liquidity dashboards.',
      target: 'Finance teams managing significant stablecoin holdings',
      value: `$${treasuryTotal.toLocaleString()}`,
      trend: '5.2% APY',
      icon: (cls: string) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
    },
  ];

  const runDemo = async () => {
    setDemoRunning(true);
    await new Promise(r => setTimeout(r, 1500));
    setDemoRunning(false);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Link href="/sandbox" className="hover:text-cyan-400 transition-colors">SANDBOX</Link>
        <span>/</span>
        <span className="text-slate-300">B2B DASHBOARD</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">B2B Finance Suite</h1>
          <p className="text-slate-400 text-sm max-w-xl">Enterprise payment infrastructure for platforms and marketplaces. Credit lines, automated invoicing, AI-powered dispute resolution, and treasury operations with T+0 settlement.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">SETTLEMENT: T+0</span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">System Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Balance */}
        <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 overflow-hidden transition-all hover:border-blue-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <span className="flex items-center text-[10px] font-medium text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">+5.2% APY</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mb-1">CREDIT BALANCE</div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-blue-400 transition-colors">${totalBalance.toLocaleString()}</div>
        </div>

        {/* Treasury */}
        <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 overflow-hidden transition-all hover:border-purple-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg></div>
            {overview && <span className="flex items-center text-[10px] font-medium text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded">Yielding</span>}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mb-1">TREASURY ASSETS</div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-purple-400 transition-colors">${treasuryTotal.toLocaleString()}</div>
          {overview && <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">Est. ${overview.projectedAnnualYield.amount}/yr yield</div>}
        </div>

        {/* Invoices */}
        <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 overflow-hidden transition-all hover:border-amber-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mb-1">PENDING INVOICES</div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-amber-400 transition-colors">{pendingInvoices}</div>
          <div className="text-[10px] text-slate-500 mt-1">{invoices.length} total processed</div>
        </div>

        {/* Disputes */}
        <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 overflow-hidden transition-all hover:border-red-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
            {openDisputes > 0 && <span className="flex items-center text-[10px] font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Action Req</span>}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mb-1">OPEN DISPUTES</div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-red-400 transition-colors">{openDisputes}</div>
          <div className="text-[10px] text-slate-500 mt-1">AI resolution active</div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <div className="text-xs font-mono text-slate-500 mb-3 pl-1">OPERATIONAL MODULES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="p-5 bg-slate-900/40 rounded-xl border border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700 hover:-translate-y-1 transition-all group duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors">
                    {m.icon('w-5 h-5')}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {m.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white mb-0.5">{m.value}</div>
                  <div className="text-xs text-slate-500">{m.trend}</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3 leading-relaxed">{m.desc}</p>
              <div className="text-xs">
                <span className="text-slate-600">For: </span>
                <span className="text-cyan-400/70">{m.target}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur rounded-xl border border-slate-800/60">
        <div className="px-5 py-4 border-b border-slate-800/60">
          <span className="text-xs font-mono text-slate-500">WHY ARC B2B</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded text-blue-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
              <div className="text-2xl font-bold text-white tracking-tight">96%+</div>
            </div>
            <div className="text-sm text-slate-400">Total fee savings vs traditional rails</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-green-500/10 rounded text-green-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div className="text-2xl font-bold text-white tracking-tight">&lt;5s</div>
            </div>
            <div className="text-sm text-slate-400">Instant final settlement anywhere</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-purple-500/10 rounded text-purple-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div className="text-2xl font-bold text-white tracking-tight">5.2%</div>
            </div>
            <div className="text-sm text-slate-400">Automatic APY on idle funds</div>
          </div>
        </div>
      </div>

      {/* Quick Start Code */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">INTEGRATION EXAMPLE</span>
          <button
            onClick={runDemo}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-green-600/10 text-green-400 border border-green-600/20 rounded hover:bg-green-600/20 transition-all"
          >
            {demoRunning ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Running...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Run Simulation
              </>
            )}
          </button>
        </div>
        <pre className="p-5 text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
          {`import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  secretKey: process.env.ARCPAY_SECRET_KEY
})

// Create invoice ($10k, instant settlement)
const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  reference: 'INV-2024-001',
  buyer: { email: 'buyer@acme.com' }
})

// Fee: ~$10 (0.1%) vs Stripe: $290 (2.9%)`}
        </pre>
      </div>
    </div>
  );
}
