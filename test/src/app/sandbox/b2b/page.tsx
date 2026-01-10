'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCreditAccount, useTreasury, useInvoices, useDisputes } from '@/mocks/MockB2BProvider';

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'from-blue-600 to-blue-400',
    green: 'from-green-600 to-green-400',
    purple: 'from-purple-600 to-purple-400',
    orange: 'from-orange-600 to-orange-400',
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg"
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-xl transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </Link>
  );
}

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">B2B Dashboard</h1>
        <p className="text-zinc-400">
          Overview of your business payment infrastructure
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💳"
          title="Credit Balance"
          value={`$${totalBalance.toLocaleString()}`}
          subtitle={creditAccount ? `${creditAccount.yieldBalance.amount} USDY earning yield` : undefined}
          color="blue"
          trend={{ value: '5.2% APY', positive: true }}
        />
        <StatCard
          icon="🏦"
          title="Treasury"
          value={`$${treasuryTotal.toLocaleString()}`}
          subtitle={overview ? `$${overview.projectedAnnualYield.amount}/yr projected` : undefined}
          color="green"
        />
        <StatCard
          icon="📄"
          title="Pending Invoices"
          value={pendingInvoices.toString()}
          subtitle={`${invoices.length} total invoices`}
          color="purple"
        />
        <StatCard
          icon="⚖️"
          title="Open Disputes"
          value={openDisputes.toString()}
          subtitle="LLM auto-resolution"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            href="/sandbox/b2b/credits"
            icon="📊"
            title="Record Usage"
            description="Track API calls and deduct from credits"
          />
          <QuickAction
            href="/sandbox/b2b/invoices"
            icon="📄"
            title="Create Invoice"
            description="Generate B2B invoice with instant settlement"
          />
          <QuickAction
            href="/sandbox/b2b/disputes"
            icon="🤖"
            title="Test Dispute Resolution"
            description="See LLM-powered chargeback evaluation"
          />
          <QuickAction
            href="/sandbox/b2b/treasury"
            icon="💰"
            title="Manage Treasury"
            description="Transfer funds and optimize yield"
          />
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Why Arc B2B?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">96%+</div>
            <p className="text-sm text-zinc-400">Fee savings vs traditional rails</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">&lt;5s</div>
            <p className="text-sm text-zinc-400">Settlement time (vs T+2)</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">5.2%</div>
            <p className="text-sm text-zinc-400">APY on idle funds via USDY</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-sm text-zinc-400">example.ts</span>
          </div>
          <pre className="p-4 text-sm overflow-x-auto">
            <code className="text-zinc-300">{`import { ArcPayB2B } from '@arcpay/b2b';

const arcpay = new ArcPayB2B({
  secretKey: process.env.ARCPAY_SECRET_KEY!,
});

// Create an invoice ($10k, instant settlement)
const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  reference: 'INV-2024-001',
  buyer: { email: 'buyer@acme.com', company: 'Acme Corp' },
  lineItems: [{ description: 'Annual License', quantity: 1, unitPrice: 10000 }],
  dueDate: new Date('2024-02-01'),
});

// Fee: ~$10 (0.1%) vs Stripe: $290 (2.9%)
console.log('Saved:', 290 - 10, '= $280');`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
