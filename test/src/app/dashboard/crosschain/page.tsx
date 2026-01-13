'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeroStatCard,
  Card,
  CardHeader,
  DataList,
  DataListItem,
  Modal,
  GlowButton,
  FormInput,
  FormSelect,
  StatusBadge,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

const supportedChains = [
  { id: 'arc', name: 'Arc', icon: 'A', color: '#06b6d4', balance: 125000, status: 'active' },
  { id: 'base', name: 'Base', icon: 'B', color: '#3b82f6', balance: 62500, status: 'active' },
  { id: 'ethereum', name: 'Ethereum', icon: 'E', color: '#a855f7', balance: 37500, status: 'active' },
  { id: 'polygon', name: 'Polygon', icon: 'P', color: '#8b5cf6', balance: 25000, status: 'active' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'A', color: '#f97316', balance: 0, status: 'coming_soon' },
];

const recentBridges = [
  { id: 'BR-001', from: 'Base', to: 'Arc', amount: 5000, status: 'completed', time: '2h', fee: 0.50 },
  { id: 'BR-002', from: 'Ethereum', to: 'Base', amount: 10000, status: 'pending', time: '15m', fee: 2.50 },
  { id: 'BR-003', from: 'Polygon', to: 'Arc', amount: 2500, status: 'completed', time: '1d', fee: 0.25 },
];

const bridgeRoutes = [
  { from: 'ETH', to: 'Base', time: '~2m', fee: '0.1%' },
  { from: 'ETH', to: 'Arc', time: '~5m', fee: '0.05%' },
  { from: 'Base', to: 'Arc', time: '~1m', fee: '0.01%' },
  { from: 'Polygon', to: 'Arc', time: '~3m', fee: '0.02%' },
];

export default function CrossChainPage() {
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [selectedFromChain, setSelectedFromChain] = useState('base');
  const [selectedToChain, setSelectedToChain] = useState('arc');

  const totalBalance = supportedChains.reduce((sum, c) => sum + c.balance, 0);

  const chainOptions = supportedChains
    .filter(c => c.status === 'active')
    .map((chain) => ({
      value: chain.id,
      label: `${chain.name} ($${(chain.balance/1000).toFixed(0)}k)`,
    }));

  const toChainOptions = supportedChains
    .filter(c => c.status === 'active')
    .map((chain) => ({
      value: chain.id,
      label: chain.name,
    }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">CrossChain</h1>
          <div className="flex gap-1">
            {supportedChains.filter(c => c.status === 'active').map((chain, index) => (
              <motion.div
                key={chain.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white cursor-pointer"
                style={{
                  backgroundColor: chain.color,
                  boxShadow: `0 0 10px ${chain.color}40`,
                }}
              >
                {chain.icon}
              </motion.div>
            ))}
          </div>
        </div>
        <GlowButton
          onClick={() => setShowBridgeModal(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        >
          Bridge
        </GlowButton>
      </motion.div>

      {/* Total Balance */}
      <HeroStatCard
        label="Total Balance"
        value={`$${totalBalance.toLocaleString()}`}
        accent="cyan"
        delay={0}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        }
      >
        <div className="flex gap-4">
          {bridgeRoutes.slice(0, 3).map((route, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="text-[10px] text-slate-500">{route.from} → {route.to}</div>
              <div className="text-xs text-cyan-400 font-mono">{route.time}</div>
            </motion.div>
          ))}
        </div>
      </HeroStatCard>

      {/* Chain Balances Grid */}
      <motion.div variants={staggerContainer} className="grid grid-cols-5 gap-3">
        {supportedChains.map((chain, index) => (
          <motion.div
            key={chain.id}
            variants={listItem}
            whileHover={chain.status === 'active' ? { scale: 1.02, y: -2 } : undefined}
            className={`relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-3 overflow-hidden ${chain.status === 'coming_soon' ? 'opacity-40' : ''}`}
          >
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t rounded-tl" style={{ borderColor: `${chain.color}50` }} />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t rounded-tr" style={{ borderColor: `${chain.color}50` }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b rounded-bl" style={{ borderColor: `${chain.color}50` }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b rounded-br" style={{ borderColor: `${chain.color}50` }} />

            <div className="flex items-center gap-2 mb-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  backgroundColor: chain.color,
                  boxShadow: `0 0 8px ${chain.color}40`,
                }}
              >
                {chain.icon}
              </motion.div>
              <span className="text-xs text-white">{chain.name}</span>
            </div>
            <div
              className="text-lg font-bold text-white font-mono"
              style={{ textShadow: chain.status === 'active' ? `0 0 15px ${chain.color}40` : 'none' }}
            >
              ${(chain.balance / 1000).toFixed(0)}k
            </div>
            {chain.status === 'active' && chain.balance > 0 && (
              <div className="mt-2 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-1.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 rounded transition-colors border border-slate-700/50"
                >
                  Send
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-1.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 rounded transition-colors border border-slate-700/50"
                >
                  Bridge
                </motion.button>
              </div>
            )}
            {chain.status === 'coming_soon' && (
              <div className="text-[10px] text-slate-500 mt-1">Coming soon</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Bridges */}
      <Card accent="cyan" delay={0.2} className="overflow-hidden">
        <CardHeader
          title="Recent Bridges"
          action={
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">All</button>
          }
        />
        <DataList>
          {recentBridges.map((bridge) => (
            <DataListItem key={bridge.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">{bridge.from}</span>
                    <motion.svg
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 text-cyan-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                    <span className="text-[10px] text-cyan-400">{bridge.to}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">{bridge.id}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-white">${bridge.amount.toLocaleString()}</span>
                  <StatusBadge
                    status={bridge.status === 'completed' ? 'paid' : 'pending'}
                    label={bridge.status}
                  />
                  <span className="text-[10px] text-slate-600 w-8">{bridge.time}</span>
                </div>
              </div>
            </DataListItem>
          ))}
        </DataList>
      </Card>

      {/* Bridge Modal */}
      <Modal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
        title="Bridge Funds"
        subtitle="Transfer funds between chains"
        size="sm"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowBridgeModal(false)}>
              Cancel
            </GlowButton>
            <GlowButton onClick={() => setShowBridgeModal(false)}>
              Bridge Funds
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormSelect
            label="From"
            options={chainOptions}
            value={selectedFromChain}
            onChange={(e) => setSelectedFromChain(e.target.value)}
          />

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const temp = selectedFromChain;
                setSelectedFromChain(selectedToChain);
                setSelectedToChain(temp);
              }}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700/50"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </motion.button>
          </div>

          <FormSelect
            label="To"
            options={toChainOptions}
            value={selectedToChain}
            onChange={(e) => setSelectedToChain(e.target.value)}
          />

          <FormInput
            label="Amount (USDC)"
            type="number"
            placeholder="0.00"
            className="font-mono"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-700/50"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Estimated Time</span>
              <span className="text-white font-mono">~1 min</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Network Fee</span>
              <span className="text-emerald-400 font-mono">0.01%</span>
            </div>
          </motion.div>
        </div>
      </Modal>
    </motion.div>
  );
}
