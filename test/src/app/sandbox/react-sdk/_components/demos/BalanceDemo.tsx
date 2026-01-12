'use client';

import { useState } from 'react';
import type { DemoProps } from '../../_lib/types';

export function BalanceDemo({ variant }: DemoProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [network, setNetwork] = useState<'arc' | 'ethereum' | 'polygon'>('arc');

  const networkInfo = {
    arc: { name: 'Arc', bal: '1,250.00', color: 'bg-cyan-500' },
    ethereum: { name: 'Ethereum', bal: '500.00', color: 'bg-slate-500' },
    polygon: { name: 'Polygon', bal: '325.50', color: 'bg-purple-500' },
  };

  const chains = [
    { name: 'Arc', symbol: 'USDC', bal: '1,250.00', color: 'bg-cyan-500' },
    { name: 'Ethereum', symbol: 'USDC', bal: '500.00', color: 'bg-slate-500' },
    { name: 'Polygon', symbol: 'USDC', bal: '325.50', color: 'bg-purple-500' },
  ];

  // Basic: Single network balance with wallet connection
  if (variant === 'basic') {
    const current = networkInfo[network];

    if (!isConnected) {
      return (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 w-64 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-400 mb-3">Connect wallet to view balance</p>
          <button
            onClick={() => setIsConnected(true)}
            className="w-full py-2.5 bg-cyan-500 text-black text-sm font-medium rounded-lg hover:bg-cyan-400"
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 w-64">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${current.color}`} />
            <span className="text-xs text-slate-400">{current.name}</span>
          </div>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as 'arc' | 'ethereum' | 'polygon')}
            className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300"
          >
            <option value="arc">Arc</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{current.bal}</div>
          <div className="text-sm text-slate-500">USDC</div>
        </div>
        <button
          onClick={() => setIsConnected(false)}
          className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Full: Multi-chain breakdown
  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-5 w-72 shadow-2xl">
        <div className="text-xs text-slate-400 mb-1">Total Balance</div>
        <div className="text-3xl font-bold text-white mb-4">$2,075.50</div>
        <div className="space-y-3">
          {chains.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {c.symbol.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-white">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.symbol}</div>
                </div>
              </div>
              <span className="text-sm font-mono text-white">{c.bal}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 w-64">
      {chains.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${c.color}`} />
            <span className="text-sm text-slate-400">{c.name}</span>
          </div>
          <span className="text-sm font-mono text-white">{c.bal}</span>
        </div>
      ))}
    </div>
  );
}
