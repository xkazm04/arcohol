'use client';

import { useEffect, useState } from 'react';
import { useCreditAccount, useUsage } from '@/mocks/MockB2BProvider';

const meterOptions = [
  { value: 'api_call', label: 'API Call', rate: '$0.01' },
  { value: 'data_export', label: 'Data Export', rate: '$0.50' },
  { value: 'premium_feature', label: 'Premium Feature', rate: '$5.00' },
  { value: 'storage_gb', label: 'Storage (GB)', rate: '$0.10' },
];

export default function CreditsPage() {
  const { creditAccount, isLoading, loadAccount, deposit } = useCreditAccount();
  const { usageRecords, usageSummary, isRecording, recordUsage } = useUsage();

  const [selectedMeter, setSelectedMeter] = useState('api_call');
  const [usageCount, setUsageCount] = useState('10');
  const [depositAmount, setDepositAmount] = useState('1000');
  const [isDepositing, setIsDepositing] = useState(false);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleRecordUsage = async () => {
    const count = parseInt(usageCount, 10);
    if (count > 0) {
      await recordUsage(selectedMeter, count);
      setUsageCount('10');
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Credits & Usage</h1>
        <p className="text-zinc-400">
          Manage prepaid credits and track usage-based billing
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-white">
            ${creditAccount?.availableBalance.amount || '0.00'}
          </p>
          <p className="text-sm text-zinc-500 mt-1">USDC • Instant access</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400 mb-1">In Yield Vault</p>
          <p className="text-3xl font-bold text-green-400">
            ${creditAccount?.yieldBalance.amount || '0.00'}
          </p>
          <p className="text-sm text-zinc-500 mt-1">USDY • 5.2% APY</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <p className="text-sm text-zinc-400 mb-1">Yield Earned</p>
          <p className="text-3xl font-bold text-purple-400">
            ${creditAccount?.yieldEarned.amount || '0.00'}
          </p>
          <p className="text-sm text-zinc-500 mt-1">This month</p>
        </div>
      </div>

      {/* Deposit Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Deposit Funds</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-2">Amount (USDC)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDeposit}
              disabled={isDepositing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {isDepositing ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Usage */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Record Usage</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Meter Type</label>
              <select
                value={selectedMeter}
                onChange={(e) => setSelectedMeter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {meterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.rate}/unit)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Count</label>
              <input
                type="number"
                value={usageCount}
                onChange={(e) => setUsageCount(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>

            <button
              onClick={handleRecordUsage}
              disabled={isRecording}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {isRecording ? 'Recording...' : 'Record Usage'}
            </button>
          </div>

          {/* Recent Usage */}
          {usageRecords.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Usage</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {usageRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 px-3 bg-zinc-800 rounded-lg text-sm"
                  >
                    <div>
                      <span className="text-white">{record.meter}</span>
                      <span className="text-zinc-500 ml-2">×{record.count}</span>
                    </div>
                    <span className="text-red-400">-${record.cost.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Usage Summary */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage Summary</h2>
          <p className="text-sm text-zinc-500 mb-4">
            Period: {usageSummary?.period || 'Current month'}
          </p>

          {usageSummary?.items && usageSummary.items.length > 0 ? (
            <>
              <div className="space-y-3">
                {usageSummary.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                  >
                    <div>
                      <p className="text-white font-medium">{item.meter}</p>
                      <p className="text-sm text-zinc-500">
                        {item.count.toLocaleString()} units
                      </p>
                    </div>
                    <p className="text-white font-medium">${item.cost.amount}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                <p className="text-lg font-medium text-white">Total</p>
                <p className="text-2xl font-bold text-white">${usageSummary.total.amount}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              No usage recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
          <span className="text-sm text-zinc-400">Usage Metering Example</span>
        </div>
        <pre className="p-4 text-sm overflow-x-auto">
          <code className="text-zinc-300">{`// Create a usage meter for your API
const meter = arcpay.createUsageMeter({
  accountId: '${creditAccount?.id || 'acc_xxx'}',
  rateCard: {
    api_call: 0.01,
    data_export: 0.50,
    premium_feature: 5.00,
  },
});

// Record usage (e.g., in Express middleware)
app.use('/api', async (req, res, next) => {
  await meter.record('api_call');
  next();
});

// Get current period summary
const summary = await meter.getSummary();
// { period: '2024-01', total: { amount: '154.20', currency: 'USDC' } }`}</code>
        </pre>
      </div>
    </div>
  );
}
