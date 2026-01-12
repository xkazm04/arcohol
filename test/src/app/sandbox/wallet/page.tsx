'use client';

import { useState } from 'react';
import { useWallet, useBalance, useTransfer } from '@/mocks/MockArcPayProvider';

const integrationOptions = [
  {
    name: 'WalletConnect',
    desc: 'Industry standard for connecting wallets across 300+ apps. Best for multi-wallet support.',
    url: 'https://walletconnect.com',
    tag: 'Recommended',
  },
  {
    name: 'Wagmi',
    desc: 'React hooks for Ethereum. Type-safe, extensible, and feature-rich.',
    url: 'https://wagmi.sh',
    tag: 'React',
  },
  {
    name: 'RainbowKit',
    desc: 'Beautiful wallet connection UI out of the box. Built on top of Wagmi.',
    url: 'https://rainbowkit.com',
    tag: 'UI Kit',
  },
  {
    name: 'Web3Modal',
    desc: 'WalletConnect\'s official modal for wallet connection. Framework agnostic.',
    url: 'https://web3modal.com',
    tag: 'Universal',
  },
];

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Wallet Integration</h1>
        <p className="text-sm text-slate-400 max-w-xl">Connect MetaMask, track balances, and execute on-chain transactions. Test wallet flows and transaction states in a sandbox environment.</p>
      </div>

      {/* Simple Wallet Connection Status */}
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? 'bg-green-500' : 'bg-slate-500'}`} />
              {wallet.isConnected && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />}
            </div>

            {/* Connection Info */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Status</div>
                  <div className="text-sm font-medium text-green-400">Connected</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Address</div>
                  <div className="text-sm font-mono text-white">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">USDC Balance</div>
                  <div className="text-sm font-mono text-cyan-400">${balance.balance}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Network</div>
                  <div className="text-sm text-white">Arc Testnet</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-slate-400">No wallet connected</div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {wallet.isConnected ? (
            <button
              onClick={wallet.disconnect}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 transition-all"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
              className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all disabled:opacity-50"
            >
              {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>

      {/* Transfer Demo */}
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800/60">
          <h2 className="text-lg font-semibold text-white">Test Transfer</h2>
          <p className="text-sm text-slate-400">Send USDC to another address on Arc Testnet</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Amount (USDC)</label>
              <input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!wallet.isConnected || transfer.isTransferring || !amount || !to}
            className="w-full py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!wallet.isConnected ? 'Connect Wallet First' : transfer.isTransferring ? 'Processing...' : 'Send Transaction'}
          </button>
        </div>
      </div>

      {/* Implementation Resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Implementation Resources</h2>
        <p className="text-sm text-slate-400">Popular libraries for integrating wallet connection in your frontend application.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrationOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-slate-900/40 rounded-xl border border-slate-800/60 hover:border-cyan-500/30 hover:bg-slate-800/40 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{option.name}</h3>
                <span className="text-xs font-medium px-2 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                  {option.tag}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{option.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View documentation</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
