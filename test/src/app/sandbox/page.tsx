'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet, ARC_TESTNET } from '../../hooks/useWallet';

interface Feature {
  href: string;
  label: string;
  desc: string;
  target: string;
  color: string;
  icon: (className: string) => React.ReactNode;
}

const features: Feature[] = [
  {
    href: '/sandbox/wallet',
    label: 'Wallet Integration',
    desc: 'Connect MetaMask, track balances, and execute on-chain transactions. Essential for any dApp requiring user wallet interactions.',
    target: 'Frontend developers building consumer-facing applications',
    color: 'cyan',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
    )
  },
  {
    href: '/sandbox/react-sdk',
    label: 'React SDK',
    desc: 'Pre-built UI components, React hooks, and checkout flows. Drop-in solutions that handle wallet connection, payments, and transaction states.',
    target: 'React developers who want production-ready components',
    color: 'purple',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )
  },
  {
    href: '/sandbox/b2b',
    label: 'B2B Suite',
    desc: 'Enterprise payment infrastructure including credit lines, automated invoicing, dispute resolution, and treasury operations. Built for complex business workflows.',
    target: 'Platform operators and enterprise integration teams',
    color: 'blue',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )
  },
  {
    href: '/sandbox/api-explorer',
    label: 'API Explorer',
    desc: 'Interactive playground to test SDK hooks in real-time. Execute methods, inspect state changes, and understand return values before integrating.',
    target: 'Developers learning the SDK or debugging integrations',
    color: 'green',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    )
  },
  {
    href: '/sandbox/webhooks',
    label: 'Webhooks',
    desc: 'Simulate payment events, test webhook endpoints, and verify payload signatures. Essential for building reliable server-side integrations.',
    target: 'Backend developers implementing event-driven architectures',
    color: 'amber',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    )
  },
  {
    href: '/sandbox/health',
    label: 'Health Monitor',
    desc: 'Real-time diagnostics for SDK configuration, network connectivity, and RPC latency. Troubleshoot issues and verify your integration status.',
    target: 'DevOps and developers monitoring production systems',
    color: 'emerald',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )
  },
  {
    href: '/sandbox/generator',
    label: 'Code Generator',
    desc: 'Generate integration code for common patterns: checkout buttons, payment forms, subscription flows. Copy-paste solutions with best practices built in.',
    target: 'Developers who want to accelerate implementation',
    color: 'orange',
    icon: (className: string) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
    )
  },
];

export default function SandboxOverview() {
  const wallet = useWallet();

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[300px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl opacity-30 pointer-events-none" />

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Sandbox Overview</h1>
            <p className="text-slate-400 max-w-xl">
              Explore the capabilities of the ArcPay Protocol. Test integrations, manage wallets, and debug webhooks in a safe environment.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={ARC_TESTNET.faucet}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:border-cyan-500/40 transition-all flex items-center gap-2"
            >
              <span>Get Testnet Tokens</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Network Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 relative group overflow-hidden bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 transition-all hover:border-slate-700/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Pulse Animation */}
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-slate-500'} transition-colors`} />
                {wallet.isConnected && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />}
              </div>

              <div>
                <div className="text-xs font-mono text-slate-500 mb-0.5">WALLET STATUS</div>
                {wallet.isConnected ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-white font-medium">{wallet.balance} ARC</span>
                    <span className="text-xs text-slate-600">|</span>
                    <span className="text-sm font-mono text-cyan-400">{wallet.formatAddress(wallet.address!)}</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">Not connected</div>
                )}
              </div>
            </div>

            {!wallet.isConnected && (
              <button
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-500">NETWORK</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-green-500/10 text-green-400 rounded border border-green-500/20">Active</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-white font-medium">{ARC_TESTNET.name}</span>
            <span className="text-xs font-mono text-slate-500">ID: {ARC_TESTNET.chainId}</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <div className="text-xs font-mono text-slate-500 mb-4 pl-1">SANDBOX MODULES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => {
            const colorMap: Record<string, { hover: string; icon: string; target: string }> = {
              cyan: { hover: 'group-hover:border-cyan-500/40', icon: 'bg-cyan-500/10 group-hover:text-cyan-400', target: 'text-cyan-400/70' },
              purple: { hover: 'group-hover:border-purple-500/40', icon: 'bg-purple-500/10 group-hover:text-purple-400', target: 'text-purple-400/70' },
              blue: { hover: 'group-hover:border-blue-500/40', icon: 'bg-blue-500/10 group-hover:text-blue-400', target: 'text-blue-400/70' },
              green: { hover: 'group-hover:border-green-500/40', icon: 'bg-green-500/10 group-hover:text-green-400', target: 'text-green-400/70' },
              amber: { hover: 'group-hover:border-amber-500/40', icon: 'bg-amber-500/10 group-hover:text-amber-400', target: 'text-amber-400/70' },
              emerald: { hover: 'group-hover:border-emerald-500/40', icon: 'bg-emerald-500/10 group-hover:text-emerald-400', target: 'text-emerald-400/70' },
              orange: { hover: 'group-hover:border-orange-500/40', icon: 'bg-orange-500/10 group-hover:text-orange-400', target: 'text-orange-400/70' },
            };
            const colors = colorMap[f.color];
            return (
              <Link
                key={f.href}
                href={f.href}
                className={`group relative p-6 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 transition-all duration-300 hover:bg-slate-900/60 ${colors.hover}`}
              >
                <div className="flex gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colors.icon} text-slate-400`}>
                    {f.icon('w-6 h-6')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-2">{f.label}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{f.desc}</p>
                    <div className={`text-xs font-medium ${colors.target}`}>
                      <span className="text-slate-600">For:</span> {f.target}
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
