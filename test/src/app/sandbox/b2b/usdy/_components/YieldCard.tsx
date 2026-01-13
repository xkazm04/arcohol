'use client';

import { motion } from 'framer-motion';

interface YieldCardProps {
  balance: number;
  apy: number;
  earnedThisMonth: number;
  isLoading?: boolean;
}

export function YieldCard({ balance, apy, earnedThisMonth, isLoading = false }: YieldCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-900/80 rounded-xl p-5 border border-purple-500/20 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-500/40 rounded-tl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-500/40 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-500/40 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-500/40 rounded-br" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-mono text-purple-400/80 uppercase">USDY Balance</div>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400">{apy}% APY</span>
          </div>
        </div>

        <div
          className="text-3xl font-bold text-white font-mono mb-1"
          style={{ textShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
        >
          {isLoading ? (
            <span className="inline-block w-32 h-8 bg-slate-700/50 rounded animate-pulse" />
          ) : (
            `$${balance.toLocaleString()}`
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">Earned This Month</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              +${earnedThisMonth.toFixed(2)}
            </div>
          </div>
          <div className="flex-1 bg-slate-800/40 rounded-lg p-2.5 border border-slate-700/30">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">Daily Yield</div>
            <div className="text-sm font-bold text-purple-400 font-mono">
              ~${((balance * apy / 100) / 365).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
