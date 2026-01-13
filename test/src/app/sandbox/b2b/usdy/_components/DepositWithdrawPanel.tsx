'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, GlowButton } from '@/components/dashboard';

interface DepositWithdrawPanelProps {
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  isDepositing?: boolean;
  isWithdrawing?: boolean;
}

export function DepositWithdrawPanel({
  onDeposit,
  onWithdraw,
  isDepositing = false,
  isWithdrawing = false,
}: DepositWithdrawPanelProps) {
  const isProcessing = isDepositing || isWithdrawing;
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const quickAmounts = [1000, 5000, 10000, 25000];

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    if (activeTab === 'deposit') {
      onDeposit(value);
    } else {
      onWithdraw(value);
    }
    setAmount('');
  };

  return (
    <Card accent="purple" className="overflow-hidden">
      <CardHeader
        title="Quick Operations"
        action={
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                activeTab === 'deposit'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Withdraw
            </button>
          </div>
        }
      />

      <div className="p-4 space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5">
            Amount (USDC)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2">
          {quickAmounts.map((quickAmount) => (
            <motion.button
              key={quickAmount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAmount(quickAmount.toString())}
              className="flex-1 py-1.5 text-[10px] font-mono text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-purple-500/30 hover:text-purple-400 transition-all"
            >
              ${quickAmount.toLocaleString()}
            </motion.button>
          ))}
        </div>

        {/* Submit Button */}
        <GlowButton
          onClick={handleSubmit}
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full"
          variant={activeTab === 'deposit' ? 'primary' : 'secondary'}
        >
          {activeTab === 'deposit'
            ? isDepositing
              ? 'Depositing...'
              : 'Deposit to USDY'
            : isWithdrawing
            ? 'Withdrawing...'
            : 'Withdraw from USDY'}
        </GlowButton>

        {/* Info Text */}
        <p className="text-[10px] text-slate-500 text-center">
          {activeTab === 'deposit'
            ? 'Funds will start earning yield immediately'
            : 'T+0 settlement for instant liquidity'}
        </p>
      </div>
    </Card>
  );
}
