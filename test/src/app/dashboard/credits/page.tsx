'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from '@/app/features/credits';
import {
  HeroStatCard,
  StatCard,
  Card,
  CardHeader,
  DataList,
  DataListItem,
  GlowButton,
  ToggleSwitch,
  FormInput,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

export default function CreditsPage() {
  const [autoRefill, setAutoRefill] = useState(false);
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [reserveRatio, setReserveRatio] = useState(70);

  // Combined Treasury + Credits data
  const account = {
    // Total assets (Operating + Yield Reserve)
    totalAssets: 250000.00,
    // Operating balance (liquid USDC)
    operatingBalance: 75000.00,
    operatingCurrency: 'USDC',
    // Yield reserve (USDY earning interest)
    yieldReserve: 175000.00,
    yieldCurrency: 'USDY',
    yieldApy: 5.2,
    // Earnings
    earnedToday: 25.34,
    earnedYTD: 4520.00,
    projectedAnnual: 12990.00,
    // Account info
    accountId: 'acc_corp_xyz789',
    status: 'active' as const,
  };

  const currentRatio = (account.yieldReserve / account.totalAssets) * 100;

  const usageRecords = [
    { id: '1', type: 'yield_credit', description: 'Daily yield accrual', amount: 25.34, time: '2h' },
    { id: '2', type: 'deposit', description: 'Invoice payment received', amount: 10000, time: '5h' },
    { id: '3', type: 'transfer', description: 'Auto-sweep to reserve', amount: 5000, time: '1d' },
    { id: '4', type: 'payment', description: 'Vendor payment', amount: -2500, time: '2d' },
    { id: '5', type: 'yield_credit', description: 'Weekly yield bonus', amount: 178.50, time: '3d' },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000];

  // Yield curve data points (simulated monthly projections)
  const yieldCurve = [35, 38, 42, 45, 48, 52, 55, 60, 65, 68, 72, 75];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-semibold text-white"
            style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
          >
            Assets & Treasury
          </h1>
          <span className="text-xs text-slate-500 font-mono">{account.accountId}</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              boxShadow: autoPilotEnabled
                ? ['0 0 0 0 rgba(34, 197, 94, 0)', '0 0 10px 2px rgba(34, 197, 94, 0.2)', '0 0 0 0 rgba(34, 197, 94, 0)']
                : 'none'
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
              autoPilotEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <motion.div
              animate={autoPilotEnabled ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${autoPilotEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
            />
            <span className={`text-[10px] font-mono ${autoPilotEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              Auto-Pilot {autoPilotEnabled ? 'ON' : 'OFF'}
            </span>
          </motion.div>
          <ToggleSwitch
            checked={autoRefill}
            onChange={setAutoRefill}
            label="Auto-refill"
            size="sm"
          />
        </div>
      </motion.div>

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
                    ${account.totalAssets.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">USD</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 mb-1">Earning {account.yieldApy}% APY</div>
                <div
                  className="text-lg font-bold text-emerald-400 font-mono"
                  style={{ textShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
                >
                  +${account.earnedToday.toFixed(2)}/day
                </div>
              </div>
            </div>

            {/* Operating vs Yield Split */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Operating ({account.operatingCurrency})</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">${account.operatingBalance.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">Liquid capital for operations</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Yield Reserve ({account.yieldCurrency})</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">${account.yieldReserve.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400 mt-1">Earning {account.yieldApy}% APY</div>
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
          value={`+$${account.earnedToday.toFixed(2)}`}
          accent="emerald"
          delay={0.1}
        />
        <StatCard
          label="Earned YTD"
          value={`+$${account.earnedYTD.toLocaleString()}`}
          accent="cyan"
          delay={0.15}
        />
        <StatCard
          label="Projected Annual"
          value={`+$${account.projectedAnnual.toLocaleString()}`}
          accent="purple"
          delay={0.2}
        />
        <StatCard
          label="Effective APY"
          value={`${account.yieldApy}%`}
          accent="emerald"
          delay={0.25}
        />
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Yield Curve & Auto-Pilot */}
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
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Jan</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Jun</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Dec</div>
              </div>
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
              {usageRecords.map((record) => (
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
                            : record.type === 'transfer'
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
                              : record.type === 'transfer'
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
              balance={account.operatingBalance.toLocaleString()}
              accountId={account.accountId}
              status={account.status}
              yieldBalance={account.yieldReserve.toLocaleString()}
            />
          </motion.div>

          {/* Auto-Pilot Panel */}
          <Card accent="emerald" delay={0.4} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold text-white">Auto-Pilot Strategy</h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  autoPilotEnabled
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : 'bg-slate-700/50 border border-slate-600/50'
                }`}
              >
                <motion.div
                  animate={{ x: autoPilotEnabled ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-4 h-4 rounded-full shadow ${
                    autoPilotEnabled ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
              </motion.button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-slate-500">Target Reserve Ratio</span>
                  <span className="text-white font-mono">{reserveRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reserveRatio}
                  onChange={(e) => setReserveRatio(parseInt(e.target.value))}
                  disabled={!autoPilotEnabled}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
                />
              </div>
              <div className={`p-3 rounded border transition-colors ${
                autoPilotEnabled
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-slate-800/30 border-slate-700/30'
              }`}>
                <div className="flex gap-2">
                  <div className="mt-0.5">
                    <motion.div
                      animate={autoPilotEnabled ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-1.5 h-1.5 rounded-full ${autoPilotEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {autoPilotEnabled
                      ? <>Auto-sweep excess operating capital into yield reserve above <span className="text-white">{reserveRatio}%</span> allocation.</>
                      : 'Auto-pilot is disabled. Manual transfers only.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </Card>

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
        </div>
      </div>
    </motion.div>
  );
}
