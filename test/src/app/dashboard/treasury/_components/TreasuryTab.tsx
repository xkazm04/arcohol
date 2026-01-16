'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from '@/app/features/credits';
import {
  StatCard,
  Card,
  CardHeader,
  DataList,
  DataListItem,
  GlowButton,
  FormInput,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import type { TreasuryStats, TreasuryActivityItem } from '@/features/treasury';

interface TreasuryTabProps {
  stats: TreasuryStats | null;
  isLoading: boolean;
}

// Mock recent activity for the treasury tab
const recentActivity: TreasuryActivityItem[] = [
  { id: '1', type: 'yield_credit', description: 'Daily yield accrual', amount: 25.34, time: '2h ago' },
  { id: '2', type: 'deposit', description: 'Invoice payment received', amount: 10000, time: '5h ago' },
  { id: '3', type: 'stake', description: 'Auto-sweep to USDY', amount: 5000, time: '1d ago' },
  { id: '4', type: 'payment', description: 'Vendor payment', amount: -2500, time: '2d ago' },
  { id: '5', type: 'yield_credit', description: 'Weekly yield bonus', amount: 178.50, time: '3d ago' },
];

export function TreasuryTab({ stats, isLoading }: TreasuryTabProps) {
  const [depositAmount, setDepositAmount] = useState('1000');

  const quickAmounts = [1000, 5000, 10000, 25000];

  // Yield curve data points (simulated monthly projections)
  const yieldCurve = [35, 38, 42, 45, 48, 52, 55, 60, 65, 68, 72, 75];

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const currentRatio = stats.totalAssets > 0 ? (stats.yieldReserve / stats.totalAssets) * 100 : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Total Assets Hero */}
      <motion.div variants={listItem}>
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-6">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.3),rgba(0,0,0,0)),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.3),rgba(0,0,0,0))]" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Total Assets Under Management</div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}
                  >
                    ${stats.totalAssets.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">USD</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 mb-1">Earning {stats.currentApy}% APY</div>
                <div
                  className="text-lg font-bold text-emerald-400 font-mono"
                  style={{ textShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
                >
                  +${stats.earnedToday.toFixed(2)}/day
                </div>
              </div>
            </div>

            {/* Operating vs Yield Split */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Operating (USDC)</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">${stats.operatingBalance.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">Liquid capital for operations</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Yield Reserve (USDY)</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">${stats.yieldReserve.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 mt-1">Earning {stats.currentApy}% APY</div>
              </div>
            </div>

            {/* Allocation Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-2">
                <span>Current Allocation</span>
                <span>{currentRatio.toFixed(1)}% Yield Bearing</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - currentRatio}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="bg-blue-500 h-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentRatio}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="bg-emerald-500 h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Today"
          value={`+$${stats.earnedToday.toFixed(2)}`}
          accent="emerald"
          delay={0.1}
        />
        <StatCard
          label="Earned YTD"
          value={`+$${stats.earnedYtd.toLocaleString()}`}
          accent="cyan"
          delay={0.15}
        />
        <StatCard
          label="Projected Annual"
          value={`+$${stats.projectedAnnual.toLocaleString()}`}
          accent="purple"
          delay={0.2}
        />
        <StatCard
          label="Effective APY"
          value={`${stats.currentApy}%`}
          accent="emerald"
          delay={0.25}
        />
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Yield Curve & Activity */}
        <div className="col-span-8 space-y-4">
          {/* Projected Yield Curve */}
          <Card accent="emerald" delay={0.3} className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Projected Yield Curve</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-slate-500 cursor-pointer hover:text-slate-300">30D</span>
                <span className="text-white font-bold border-b border-emerald-500 pb-0.5">1Y</span>
                <span className="text-slate-500 cursor-pointer hover:text-slate-300">ALL</span>
              </div>
            </div>
            <div className="h-32 flex items-end justify-between gap-1">
              {yieldCurve.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500/50 rounded-t hover:to-emerald-400/70 transition-colors cursor-pointer group relative"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-slate-700">
                    +${(h * 15).toFixed(0)}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-slate-800/50">
              <div className="text-[10px] text-slate-500 uppercase">Jan</div>
              <div className="text-[10px] text-slate-500 uppercase">Jun</div>
              <div className="text-[10px] text-slate-500 uppercase">Dec</div>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card accent="cyan" delay={0.35} className="overflow-hidden">
            <CardHeader
              title="Recent Activity"
              action={
                <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
                  View All
                </button>
              }
            />
            <DataList>
              {recentActivity.map((record) => (
                <DataListItem key={record.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-6 h-6 rounded flex items-center justify-center border ${
                          record.type === 'yield_credit'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : record.type === 'deposit'
                            ? 'bg-cyan-500/10 border-cyan-500/30'
                            : record.type === 'stake' || record.type === 'unstake'
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <svg
                          className={`w-3 h-3 ${
                            record.type === 'yield_credit'
                              ? 'text-emerald-400'
                              : record.type === 'deposit'
                              ? 'text-cyan-400'
                              : record.type === 'stake' || record.type === 'unstake'
                              ? 'text-purple-400'
                              : 'text-red-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {record.amount > 0 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          )}
                        </svg>
                      </motion.div>
                      <div>
                        <div className="text-xs text-white">{record.description}</div>
                        <div className="text-[10px] text-slate-600">{record.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-mono ${record.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {record.amount > 0 ? '+' : ''}${Math.abs(record.amount).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-600">{record.time}</div>
                    </div>
                  </div>
                </DataListItem>
              ))}
            </DataList>
          </Card>
        </div>

        {/* Right Column: Controls */}
        <div className="col-span-4 space-y-4">
          {/* Credit Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CreditCard
              balance={stats.operatingBalance.toLocaleString()}
              accountId={stats.accountId}
              status={stats.status === 'low_balance' ? 'depleted' : stats.status}
              yieldBalance={stats.yieldReserve.toLocaleString()}
            />
          </motion.div>

          {/* Quick Deposit */}
          <Card accent="cyan" delay={0.45} className="p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-3">Add Funds</div>
            <div className="flex gap-1.5 mb-3">
              {quickAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                    depositAmount === amt.toString()
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800 hover:border-slate-700'
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
                onClick={() => console.log('Deposit:', depositAmount)}
                className="px-3"
              >
                ADD
              </GlowButton>
            </div>
          </Card>

          {/* Pending Activity */}
          {(stats.pendingStake > 0 || stats.pendingUnstake > 0) && (
            <Card accent="amber" delay={0.5} className="p-4">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-3">Pending</div>
              <div className="space-y-2">
                {stats.pendingStake > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Staking</span>
                    <span className="font-mono text-amber-400">+${stats.pendingStake.toLocaleString()}</span>
                  </div>
                )}
                {stats.pendingUnstake > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Unstaking</span>
                    <span className="font-mono text-amber-400">-${stats.pendingUnstake.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
