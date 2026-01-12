'use client';

import { useEffect, useState } from 'react';
import { useTreasury } from '@/mocks/MockB2BProvider';
import { TreasuryLoader, VaultCard, YieldChart, TransferControls, AutoPilotPanel } from './_components';

export default function TreasuryPage() {
  const { overview, isLoading, loadTreasury, transferToReserve, transferFromReserve } = useTreasury();

  const [transferAmount, setTransferAmount] = useState('10000');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'to' | 'from'>('to');
  const [reserveRatio, setReserveRatio] = useState(70);

  useEffect(() => {
    loadTreasury();
  }, [loadTreasury]);

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (amount <= 0) return;

    setIsTransferring(true);
    if (transferDirection === 'to') {
      await transferToReserve(amount);
    } else {
      await transferFromReserve(amount);
    }
    setIsTransferring(false);
    setTransferAmount('10000');
  };

  if (isLoading) {
    return <TreasuryLoader />;
  }

  const operatingBalance = overview ? parseFloat(overview.operating.balance.amount) : 0;
  const reserveBalance = overview ? parseFloat(overview.reserve.balance.amount) : 0;
  const totalBalance = overview ? parseFloat(overview.total.amount) : 0;
  const yieldPercent = overview ? overview.reserve.apy : 5.2;
  const earnedYTD = overview ? parseFloat(overview.reserve.earnedYTD.amount) : 0;
  const projectedYield = overview ? parseFloat(overview.projectedAnnualYield.amount) : 0;
  const currentRatio = totalBalance > 0 ? (reserveBalance / totalBalance) * 100 : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Corporate Treasury</h1>
          <p className="text-sm text-slate-400">Yield optimization and liquidity management</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-300">Strategy: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vault Visuals */}
        <div className="lg:col-span-8 space-y-6">
          <VaultCard
            totalBalance={totalBalance}
            operatingBalance={operatingBalance}
            reserveBalance={reserveBalance}
            yieldPercent={yieldPercent}
            currentRatio={currentRatio}
          />
          <YieldChart
            earnedYTD={earnedYTD}
            projectedYield={projectedYield}
            yieldPercent={yieldPercent}
          />
        </div>

        {/* Right Column: Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <TransferControls
            transferDirection={transferDirection}
            transferAmount={transferAmount}
            isTransferring={isTransferring}
            operatingBalance={operatingBalance}
            reserveBalance={reserveBalance}
            yieldPercent={yieldPercent}
            onDirectionChange={setTransferDirection}
            onAmountChange={setTransferAmount}
            onTransfer={handleTransfer}
          />
          <AutoPilotPanel
            reserveRatio={reserveRatio}
            onRatioChange={setReserveRatio}
          />
        </div>
      </div>
    </div>
  );
}
