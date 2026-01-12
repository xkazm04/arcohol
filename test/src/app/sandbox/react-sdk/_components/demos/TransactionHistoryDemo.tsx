'use client';

import type { DemoProps } from '../../_lib/types';

export function TransactionHistoryDemo({ variant }: DemoProps) {
  const txs = [
    { type: 'payment', to: '0x1234...5678', amount: '-50.00', status: 'confirmed' },
    { type: 'receive', from: '0xabcd...ef01', amount: '+125.00', status: 'confirmed' },
    { type: 'payment', to: '0x9876...5432', amount: '-30.00', status: 'pending' },
  ];

  if (variant === 'basic') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 w-72 overflow-hidden">
        <div className="p-3 border-b border-slate-200 text-sm font-medium text-slate-900">
          Transaction History
        </div>
        {txs.map((tx, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0"
          >
            <div className="text-xs text-slate-600">
              {tx.type === 'payment' ? `To: ${tx.to}` : `From: ${tx.from}`}
            </div>
            <span
              className={`text-sm font-mono ${tx.type === 'receive' ? 'text-green-600' : 'text-slate-900'}`}
            >
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <span className="text-sm font-medium text-white">Transaction History</span>
          <span className="text-xs text-slate-500">{txs.length} transactions</span>
        </div>
        {txs.map((tx, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={tx.type === 'receive' ? 'M19 14l-7 7m0 0l-7-7m7 7V3' : 'M5 10l7-7m0 0l7 7m-7-7v18'}
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-white capitalize">{tx.type}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {tx.type === 'payment' ? tx.to : tx.from}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-mono ${tx.type === 'receive' ? 'text-green-400' : 'text-white'}`}>
                {tx.amount}
              </div>
              <div className={`text-[10px] ${tx.status === 'pending' ? 'text-amber-400' : 'text-slate-500'}`}>
                {tx.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 w-72 p-4 space-y-2">
      {txs.map((tx, i) => (
        <div key={i} className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${tx.type === 'receive' ? 'bg-green-500' : 'bg-slate-500'}`}
            />
            <span className="text-xs text-slate-400 font-mono">
              {tx.type === 'payment' ? tx.to : tx.from}
            </span>
          </div>
          <span className={`text-xs font-mono ${tx.type === 'receive' ? 'text-green-400' : 'text-slate-300'}`}>
            {tx.amount}
          </span>
        </div>
      ))}
    </div>
  );
}
