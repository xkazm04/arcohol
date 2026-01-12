'use client';

import { useEffect, useState } from 'react';
import { useCreditAccount, useUsage } from '@/mocks/MockB2BProvider';
import { meterOptions, type MeterOption } from './_lib';
import { CreditCard, DepositForm, UsageSimulator } from './_components';

export default function CreditsPage() {
  const { creditAccount, isLoading, loadAccount, deposit } = useCreditAccount();
  const { usageRecords, isRecording, recordUsage } = useUsage();

  const [selectedMeter, setSelectedMeter] = useState<MeterOption>(meterOptions[0]);
  const [usageCount, setUsageCount] = useState<number>(100);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [isDepositing, setIsDepositing] = useState(false);
  const [autoRefill, setAutoRefill] = useState(false);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleRecordUsage = async () => {
    if (usageCount > 0) {
      await recordUsage(selectedMeter.value, usageCount);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      setIsDepositing(true);
      await deposit(amount);
      setIsDepositing(false);
      setDepositAmount('1000');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-cyan-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const yieldProgress = creditAccount ? (parseFloat(creditAccount.yieldEarned.amount) / 1000) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Credits & Usage</h1>
          <p className="text-sm text-slate-400">Manage prepaid balances and monitor consumption</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-slate-500">AUTO-REFILL</div>
            <div className="text-sm font-medium text-white">{autoRefill ? 'ON (Threshold: $100)' : 'OFF'}</div>
          </div>
          <button
            onClick={() => setAutoRefill(!autoRefill)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRefill ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRefill ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          <CreditCard
            balance={creditAccount?.availableBalance.amount || '0.00'}
            accountId={creditAccount?.id || '----'}
          />

          <DepositForm
            depositAmount={depositAmount}
            isDepositing={isDepositing}
            onAmountChange={setDepositAmount}
            onDeposit={handleDeposit}
          />

          {/* Yield Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl" />
              <div className="text-xs font-mono text-slate-500 uppercase mb-1">Yield Balance</div>
              <div className="text-xl font-bold text-white mb-1">${creditAccount?.yieldBalance.amount}</div>
              <div className="text-[10px] text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                5.2% APY
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
              <div className="text-xs font-mono text-slate-500 uppercase mb-1">Earned YTD</div>
              <div className="text-xl font-bold text-white mb-1">${creditAccount?.yieldEarned.amount}</div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${yieldProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-6">
          <UsageSimulator
            selectedMeter={selectedMeter}
            usageCount={usageCount}
            isRecording={isRecording}
            recordsCount={usageRecords.length}
            onMeterChange={setSelectedMeter}
            onUsageCountChange={setUsageCount}
            onRecordUsage={handleRecordUsage}
          />

          {/* Recent Activity */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/60 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Live Usage Feed</span>
              <button className="text-[10px] text-cyan-400 hover:text-cyan-300">View All</button>
            </div>
            <div className="max-h-[220px] overflow-y-auto p-2 space-y-1">
              {usageRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No activity recorded yet</div>
              ) : (
                usageRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors group animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                        <div className="font-mono text-[10px]">{record.meter.slice(0, 2).toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{record.meter}</div>
                        <div className="text-[10px] text-slate-500">{new Date(record.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">-${record.cost.amount}</div>
                      <div className="text-[10px] text-slate-500">{record.count} units</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
