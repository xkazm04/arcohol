'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet, ARC_TESTNET } from '../../hooks/useWallet';
import { GlowButton, StatusBadge, staggerContainer, listItem } from '@/components/dashboard';

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

const colorConfig: Record<string, { primary: string; glow: string; border: string; bg: string; text: string }> = {
  cyan: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  purple: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  blue: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  green: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
  amber: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  emerald: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  orange: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
};

export default function SandboxOverview() {
  const wallet = useWallet();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10 max-w-6xl"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 right-0 -z-10 w-[600px] h-[300px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl pointer-events-none"
        />

        <div className="flex items-end justify-between mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white mb-2 tracking-tight"
              style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}
            >
              Sandbox Overview
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-slate-400 max-w-xl"
            >
              Explore the capabilities of the ArcPay Protocol. Test integrations, manage wallets, and debug webhooks in a safe environment.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlowButton
              as="a"
              href={ARC_TESTNET.faucet}
              target="_blank"
              rel="noopener noreferrer"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              }
            >
              Get Testnet Tokens
            </GlowButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Network Status Bar */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Wallet Status Card */}
        <motion.div
          variants={listItem}
          whileHover={{ scale: 1.01 }}
          className="col-span-2 relative group overflow-hidden bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 transition-all"
        >
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Pulse Animation */}
              <div className="relative">
                <motion.div
                  animate={wallet.isConnected ? {
                    boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                  } : undefined}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-slate-500'} transition-colors`}
                />
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">Wallet Status</div>
                {wallet.isConnected ? (
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-mono text-white font-bold"
                      style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.5)' }}
                    >
                      {wallet.balance} ARC
                    </span>
                    <span className="text-xs text-slate-600">|</span>
                    <span className="text-xs font-mono text-cyan-400">{wallet.formatAddress(wallet.address!)}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Not connected</div>
                )}
              </div>
            </div>

            {!wallet.isConnected && (
              <GlowButton
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                size="sm"
              >
                {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </GlowButton>
            )}
          </div>
        </motion.div>

        {/* Network Card */}
        <motion.div
          variants={listItem}
          whileHover={{ scale: 1.02 }}
          className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 flex flex-col justify-center overflow-hidden"
        >
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500/30 rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500/30 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500/30 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500/30 rounded-br" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Network</span>
            <StatusBadge status="active" label="Active" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-white font-medium">{ARC_TESTNET.name}</span>
            <span className="text-[10px] font-mono text-slate-500">ID: {ARC_TESTNET.chainId}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] font-mono text-slate-500 uppercase mb-3 pl-1"
        >
          Sandbox Modules
        </motion.div>
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {features.map((f, index) => {
            const colors = colorConfig[f.color];
            return (
              <motion.div
                key={f.href}
                variants={listItem}
                whileHover={{ scale: 1.01, x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href={f.href}
                  className={`group relative block p-4 bg-slate-900/50 rounded-lg border border-slate-800/40 transition-all duration-300 hover:bg-slate-900/70 hover:${colors.border} overflow-hidden`}
                >
                  {/* Corner markers */}
                  <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 ${colors.border} rounded-tl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 ${colors.border} rounded-tr opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 ${colors.border} rounded-bl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 ${colors.border} rounded-br opacity-50 group-hover:opacity-100 transition-opacity`} />

                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 20% 50%, ${colors.glow.replace('0.5', '0.1')}, transparent 50%)`,
                    }}
                  />

                  <div className="flex gap-4 relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} text-slate-400 group-hover:${colors.text} transition-colors`}
                      style={{
                        boxShadow: `0 0 0 rgba(0,0,0,0)`,
                      }}
                    >
                      {f.icon('w-5 h-5')}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-white transition-colors">{f.label}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{f.desc}</p>
                      <div className={`text-[10px] ${colors.text} opacity-70`}>
                        <span className="text-slate-600">For:</span> {f.target}
                      </div>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 text-slate-500 group-hover:text-slate-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
