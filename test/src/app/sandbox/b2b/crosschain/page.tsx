'use client';

import { useState } from 'react';
import { chainAllocations } from './_lib';
import { TotalBalance, ChainCard, RecentBridges, BridgeModal } from './_components';

export default function CrossChainPage() {
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [sourceChain, setSourceChain] = useState('Ethereum');
  const [destChain, setDestChain] = useState('Arc');
  const [bridgeAmount, setBridgeAmount] = useState('');

  const totalBalance = chainAllocations.reduce((acc, c) => acc + parseFloat(c.balance.replace(',', '')), 0);

  const handleSwap = () => {
    const temp = sourceChain;
    setSourceChain(destChain);
    setDestChain(temp);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">Cross-Chain Treasury</h1>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded border border-cyan-500/20">CCTP V2</span>
          </div>
          <p className="text-sm text-slate-400">Multi-chain fund allocation with Circle bridge integration</p>
        </div>
        <button
          onClick={() => setShowBridgeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Bridge Funds
        </button>
      </div>

      <TotalBalance totalBalance={totalBalance} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chain Balances */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase">Chain Allocations</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chainAllocations.map((chain) => (
              <ChainCard key={chain.chain} chain={chain} />
            ))}
          </div>
        </div>

        <RecentBridges />
      </div>

      {/* Bridge Info */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <span className="text-xs font-mono text-slate-500">BRIDGE INFORMATION</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
          <div className="p-5">
            <div className="text-xs text-slate-500 mb-1">Protocol</div>
            <div className="text-lg font-bold text-white">Circle CCTP V2</div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 mb-1">Bridge Time</div>
            <div className="text-lg font-bold text-white">&lt;15 min</div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 mb-1">Fee Structure</div>
            <div className="text-lg font-bold text-white">Gas Only</div>
          </div>
          <div className="p-5">
            <div className="text-xs text-slate-500 mb-1">Security</div>
            <div className="text-lg font-bold text-green-400">Native Burn/Mint</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showBridgeModal && (
        <BridgeModal
          onClose={() => setShowBridgeModal(false)}
          sourceChain={sourceChain}
          destChain={destChain}
          bridgeAmount={bridgeAmount}
          onSourceChange={setSourceChain}
          onDestChange={setDestChain}
          onAmountChange={setBridgeAmount}
          onSwap={handleSwap}
        />
      )}
    </div>
  );
}
