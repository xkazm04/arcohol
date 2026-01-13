'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet, useBalance, useTransfer } from '@/mocks/MockArcPayProvider';
import { Card, CardHeader, GlowButton, FormInput, StatusBadge, staggerContainer, listItem } from '@/components/dashboard';

const integrationOptions = [
  {
    name: 'WalletConnect',
    desc: 'Industry standard for connecting wallets across 300+ apps.',
    url: 'https://walletconnect.com',
    tag: 'Recommended',
    color: 'cyan',
  },
  {
    name: 'Wagmi',
    desc: 'React hooks for Ethereum. Type-safe, extensible, and feature-rich.',
    url: 'https://wagmi.sh',
    tag: 'React',
    color: 'purple',
  },
  {
    name: 'RainbowKit',
    desc: 'Beautiful wallet connection UI out of the box.',
    url: 'https://rainbowkit.com',
    tag: 'UI Kit',
    color: 'blue',
  },
  {
    name: 'Web3Modal',
    desc: 'WalletConnect\'s official modal for wallet connection.',
    url: 'https://web3modal.com',
    tag: 'Universal',
    color: 'emerald',
  },
];

const colorConfig: Record<string, { border: string; bg: string; text: string }> = {
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

export default function WalletPage() {
  const wallet = useWallet();
  const balance = useBalance();
  const transfer = useTransfer();

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    if (!wallet.isConnected) return;
    await transfer.transfer({ to, amount });
    setTo('');
    setAmount('');
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-5xl space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-lg font-semibold text-white mb-1"
          style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
        >
          Wallet Integration
        </h1>
        <p className="text-xs text-slate-400 max-w-xl">Connect MetaMask, track balances, and execute on-chain transactions.</p>
      </motion.div>

      {/* Wallet Connection Status */}
      <motion.div
        variants={listItem}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 overflow-hidden"
      >
        {/* Corner markers */}
        <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 rounded-tl ${wallet.isConnected ? 'border-green-500/30' : 'border-slate-500/30'}`} />
        <div className={`absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 rounded-tr ${wallet.isConnected ? 'border-green-500/30' : 'border-slate-500/30'}`} />
        <div className={`absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 rounded-bl ${wallet.isConnected ? 'border-green-500/30' : 'border-slate-500/30'}`} />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 rounded-br ${wallet.isConnected ? 'border-green-500/30' : 'border-slate-500/30'}`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="relative">
              <motion.div
                animate={wallet.isConnected ? {
                  boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                } : undefined}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-slate-500'}`}
              />
            </div>

            {/* Connection Info */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-0.5">Status</div>
                  <div className="text-xs font-medium text-green-400">Connected</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-0.5">Address</div>
                  <div className="text-xs font-mono text-white">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-0.5">USDC Balance</div>
                  <div
                    className="text-xs font-mono text-cyan-400 font-bold"
                    style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}
                  >
                    ${balance.balance}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-0.5">Network</div>
                  <div className="text-xs text-white">Arc Testnet</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No wallet connected</div>
            )}
          </div>

          {/* Action Button */}
          {wallet.isConnected ? (
            <GlowButton variant="secondary" size="sm" onClick={wallet.disconnect}>
              Disconnect
            </GlowButton>
          ) : (
            <GlowButton
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
            >
              {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </GlowButton>
          )}
        </div>
      </motion.div>

      {/* Transfer Demo */}
      <Card accent="cyan" delay={0.1}>
        <CardHeader
          title="Test Transfer"
          action={<span className="text-[10px] text-slate-500">Arc Testnet</span>}
        />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              label="Recipient Address"
              placeholder="0x..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="font-mono"
            />
            <FormInput
              label="Amount (USDC)"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          <GlowButton
            onClick={handleSend}
            disabled={!wallet.isConnected || transfer.isTransferring || !amount || !to}
            className="w-full"
          >
            {!wallet.isConnected ? 'Connect Wallet First' : transfer.isTransferring ? 'Processing...' : 'Send Transaction'}
          </GlowButton>
        </div>
      </Card>

      {/* Implementation Resources */}
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-medium text-white mb-1">Implementation Resources</h2>
          <p className="text-[10px] text-slate-400">Popular libraries for integrating wallet connection.</p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrationOptions.map((option, index) => {
            const colors = colorConfig[option.color];
            return (
              <motion.a
                key={option.name}
                variants={listItem}
                whileHover={{ scale: 1.01, x: 3 }}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative p-3 bg-slate-900/50 rounded-lg border border-slate-800/40 hover:${colors.border} transition-all overflow-hidden`}
              >
                {/* Corner markers */}
                <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 ${colors.border} rounded-tl opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 ${colors.border} rounded-tr opacity-50 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-start justify-between mb-1.5">
                  <h3 className={`text-xs font-semibold text-white group-hover:${colors.text} transition-colors`}>{option.name}</h3>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 ${colors.bg} ${colors.text} rounded border ${colors.border}`}>
                    {option.tag}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{option.desc}</p>
                <div className={`flex items-center gap-1 text-[10px] ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>View docs</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
