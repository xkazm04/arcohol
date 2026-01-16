'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlowButton } from '@/components/dashboard';
import type { ChainEnvironment } from '@/features/treasury';
import { CHAIN_CONFIGS } from '@/features/treasury';

interface TreasuryEmptyStateProps {
  chain: ChainEnvironment;
}

export function TreasuryEmptyState({ chain }: TreasuryEmptyStateProps) {
  const config = CHAIN_CONFIGS[chain];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />

        {/* Icon container */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 flex items-center justify-center">
          {/* Key icon */}
          <svg
            className="w-16 h-16 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>

          {/* Chain indicator */}
          <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-[10px] font-mono border ${
            chain === 'arc-testnet'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {config.name}
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-white mb-3 text-center"
      >
        No API Key for {config.name}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-slate-400 text-center max-w-md mb-6"
      >
        To view treasury data and manage the Treasury Agent for {config.name}, you need to create an API key with a wallet address on this network.
      </motion.p>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-8 max-w-md w-full"
      >
        <h3 className="text-xs font-mono text-slate-500 uppercase mb-4">Setup Steps</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <div className="text-sm text-white">Create an API Key</div>
              <div className="text-xs text-slate-500">Go to API Keys and create a new key</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </div>
            <div>
              <div className="text-sm text-white">Assign a Wallet Address</div>
              <div className="text-xs text-slate-500">Link a wallet on {config.name} (Chain ID: {config.chainId})</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </div>
            <div>
              <div className="text-sm text-white">Fund Your Wallet</div>
              <div className="text-xs text-slate-500">Deposit USDC to start earning yield with USDY</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <Link href="/dashboard/api-keys">
          <GlowButton variant="primary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create API Key
          </GlowButton>
        </Link>
        <a
          href={config.blockExplorer}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Explorer
        </a>
      </motion.div>

      {/* Network info footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex items-center gap-6 text-[10px] font-mono text-slate-600"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Chain ID:</span>
          <span className="text-slate-400">{config.chainId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">RPC:</span>
          <span className="text-slate-400 truncate max-w-[200px]">{config.rpcUrl}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
