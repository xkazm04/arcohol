'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  Card,
  CardHeader,
  GlowButton,
  FormInput,
  ToggleSwitch,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import type { TreasuryStats, YieldDataPoint } from '@/features/treasury';

interface YieldTabProps {
  stats: TreasuryStats | null;
  isLoading: boolean;
}

// Mock yield history data
const yieldHistory: YieldDataPoint[] = [
  { month: 'Jul', projected: 800, actual: 750 },
  { month: 'Aug', projected: 850, actual: 820 },
  { month: 'Sep', projected: 900, actual: 890 },
  { month: 'Oct', projected: 950, actual: 980 },
  { month: 'Nov', projected: 1000, actual: 1020 },
  { month: 'Dec', projected: 1050 },
];

export function YieldTab({ stats, isLoading }: YieldTabProps) {
  const [depositAmount, setDepositAmount] = useState('5000');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [autoYieldEnabled, setAutoYieldEnabled] = useState(true);
  const [autoThreshold, setAutoThreshold] = useState(10000);

  const quickAmounts = [1000, 5000, 10000, 25000];

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const maxYield = Math.max(...yieldHistory.map(d => d.actual || d.projected));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* USDY Hero */}
      <motion.div variants={listItem}>
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/20 p-6">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.2),rgba(0,0,0,0))]" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold text-xs">$</span>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">USDY Balance</div>
                    <div className="text-[10px] text-slate-500">Yield-bearing Stablecoin</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ textShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}
                  >
                    ${stats.yieldReserve.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {stats.currentApy}%
                  </div>
                  <div className="text-[10px] text-emerald-400/70">Current APY</div>
                </div>
              </div>
            </div>

            {/* Yield Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Today</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">+${stats.earnedToday.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Year to Date</div>
                <div className="text-lg font-bold text-white font-mono">+${stats.earnedYtd.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <div className="text-[10px] text-slate-500 mb-1">Projected Annual</div>
                <div className="text-lg font-bold text-white font-mono">+${stats.projectedAnnual.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Chart & Automation */}
        <div className="col-span-8 space-y-4">
          {/* Yield History Chart */}
          <Card accent="emerald" delay={0.2} className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Yield History</h3>
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-400">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <span className="text-slate-400">Projected</span>
                </div>
              </div>
            </div>
            <div className="h-40 flex items-end justify-between gap-4">
              {yieldHistory.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end justify-center gap-1" style={{ height: '140px' }}>
                    {/* Projected bar (background) */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(point.projected / maxYield) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="w-3 bg-slate-700/50 rounded-t"
                    />
                    {/* Actual bar (foreground) */}
                    {point.actual && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(point.actual / maxYield) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                        className="w-3 bg-emerald-500 rounded-t absolute left-1/2 -translate-x-1/2"
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{point.month}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Automation Rules */}
          <Card accent="purple" delay={0.3} className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Auto-Yield Rules</h3>
              <ToggleSwitch
                checked={autoYieldEnabled}
                onChange={setAutoYieldEnabled}
                label=""
                size="sm"
              />
            </div>

            <div className={`space-y-4 transition-opacity ${autoYieldEnabled ? 'opacity-100' : 'opacity-50'}`}>
              {/* Threshold Setting */}
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Auto-stake when USDC exceeds</span>
                  <span className="text-white font-mono">${autoThreshold.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={autoThreshold}
                  onChange={(e) => setAutoThreshold(parseInt(e.target.value))}
                  disabled={!autoYieldEnabled}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Rule Description */}
              <div className={`p-3 rounded-lg border transition-colors ${
                autoYieldEnabled
                  ? 'bg-purple-500/5 border-purple-500/20'
                  : 'bg-slate-800/30 border-slate-700/30'
              }`}>
                <div className="flex items-start gap-2">
                  <motion.div
                    animate={autoYieldEnabled ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${autoYieldEnabled ? 'bg-purple-500' : 'bg-slate-600'}`}
                  />
                  <div className="text-[10px] text-slate-400">
                    {autoYieldEnabled
                      ? <>Automatically convert excess USDC to USDY when operating balance exceeds <span className="text-white font-mono">${autoThreshold.toLocaleString()}</span>. Maintains liquidity while maximizing yield.</>
                      : 'Auto-yield is disabled. Manual conversions only.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions */}
        <div className="col-span-4 space-y-4">
          {/* Deposit to USDY */}
          <Card accent="emerald" delay={0.25} className="p-4">
            <div className="text-[10px] font-mono text-emerald-400 uppercase mb-3">Stake USDC to USDY</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                    depositAmount === amt.toString()
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800'
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <FormInput
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                type="number"
                prefix="$"
                className="font-mono"
              />
              <GlowButton
                variant="primary"
                onClick={() => console.log('Stake:', depositAmount)}
                className="px-3 !bg-emerald-500/20 !border-emerald-500/30 hover:!bg-emerald-500/30"
              >
                STAKE
              </GlowButton>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              Available: <span className="text-slate-400 font-mono">${stats.operatingBalance.toLocaleString()}</span> USDC
            </div>
          </Card>

          {/* Withdraw from USDY */}
          <Card accent="cyan" delay={0.3} className="p-4">
            <div className="text-[10px] font-mono text-cyan-400 uppercase mb-3">Unstake USDY to USDC</div>
            <div className="flex gap-2">
              <FormInput
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                type="number"
                prefix="$"
                placeholder="Amount"
                className="font-mono"
              />
              <GlowButton
                variant="secondary"
                onClick={() => console.log('Unstake:', withdrawAmount)}
                className="px-3"
              >
                UNSTAKE
              </GlowButton>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              Available: <span className="text-slate-400 font-mono">${stats.yieldReserve.toLocaleString()}</span> USDY
            </div>
          </Card>

          {/* Info Card */}
          <Card delay={0.35} className="p-4 bg-slate-800/30 border-slate-700/30">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-[10px] text-slate-400">
                <p className="mb-2">USDY is a yield-bearing stablecoin backed by US Treasuries and bank deposits.</p>
                <p>Staking typically completes within 1-2 minutes on Arc network.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
