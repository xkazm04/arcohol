'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { chainAllocations } from './_lib';
import { TotalBalance, ChainCard, RecentBridges, BridgeModal } from './_components';
import { GlowButton, staggerContainer, listItem } from '@/components/dashboard';

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-lg font-semibold text-white"
              style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
            >
              Cross-Chain Treasury
            </h1>
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold rounded border border-cyan-500/30"
              style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)' }}
            >
              CCTP V2
            </motion.span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">Multi-chain fund allocation with Circle bridge integration</p>
        </div>
        <GlowButton
          onClick={() => setShowBridgeModal(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        >
          Bridge Funds
        </GlowButton>
      </motion.div>

      <motion.div variants={listItem}>
        <TotalBalance totalBalance={totalBalance} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chain Balances */}
        <motion.div variants={listItem} className="lg:col-span-2 space-y-3">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Chain Allocations</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chainAllocations.map((chain, index) => (
              <motion.div
                key={chain.chain}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <ChainCard chain={chain} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={listItem}>
          <RecentBridges />
        </motion.div>
      </div>

      {/* Bridge Info */}
      <motion.div
        variants={listItem}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 overflow-hidden"
      >
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />

        <div className="px-4 py-2.5 border-b border-slate-800/40 bg-slate-900/30">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Bridge Information</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/40">
          {[
            { label: 'Protocol', value: 'Circle CCTP V2', color: 'white' },
            { label: 'Bridge Time', value: '<15 min', color: 'white' },
            { label: 'Fee Structure', value: 'Gas Only', color: 'white' },
            { label: 'Security', value: 'Native Burn/Mint', color: 'emerald' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4"
            >
              <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
              <div
                className={`text-sm font-bold ${item.color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}
                style={item.color === 'emerald' ? { textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' } : undefined}
              >
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
    </motion.div>
  );
}
