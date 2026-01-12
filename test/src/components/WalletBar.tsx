'use client';

import React, { useState } from 'react';
import { useModeStore } from '@/store/modeStore';
import { useWallet, useBalance, useTransactionHistory } from '@/mocks/MockArcPayProvider';
import { useTestnetWallet, useTestnetBalance, useTestnetTransactionHistory, ARC_TESTNET } from '@/providers/TestnetWalletProvider';

function MockWalletContent() {
  const { wallet, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { balance, isLoading: balanceLoading } = useBalance();
  const { transactions } = useTransactionHistory();
  const [showDropdown, setShowDropdown] = useState(false);

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-[10px] uppercase tracking-wider font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="hidden sm:inline">Connecting</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Connect</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 hover:border-zinc-900 transition-colors"
      >
        <div className="w-6 h-6 bg-violet-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">M</span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-zinc-900">{balanceLoading ? '...' : `$${balance}`}</div>
          <div className="text-[10px] text-zinc-400 font-mono">{wallet ? formatAddress(wallet.address) : ''}</div>
        </div>
        <svg className={`w-3 h-3 text-zinc-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-zinc-900 text-white">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Mock Mode
              </div>
              <div className="text-2xl font-bold">${balance}</div>
              <div className="mt-1 text-[10px] text-zinc-500 font-mono">{wallet?.address}</div>
            </div>

            {/* Transactions */}
            <div className="p-3 border-b border-zinc-100">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Recent</div>
              {transactions.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-3">No transactions</p>
              ) : (
                <div className="space-y-1">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 flex items-center justify-center ${tx.type === 'OUTBOUND' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.type === 'OUTBOUND' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                          </svg>
                        </div>
                        <span className="text-xs text-zinc-600">{tx.type === 'OUTBOUND' ? 'Sent' : 'Received'}</span>
                      </div>
                      <span className={`text-xs font-semibold ${tx.type === 'OUTBOUND' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'OUTBOUND' ? '-' : '+'}${tx.amounts[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disconnect */}
            <div className="p-2">
              <button
                onClick={() => { disconnect(); setShowDropdown(false); }}
                className="w-full py-2 text-[10px] uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TestnetWalletContent() {
  const { wallet, isConnected, isConnecting, connect, disconnect, switchToArcTestnet, isCorrectNetwork } = useTestnetWallet();
  const { balance, isLoading: balanceLoading } = useTestnetBalance();
  const { transactions } = useTestnetTransactionHistory();
  const [showDropdown, setShowDropdown] = useState(false);

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-[10px] uppercase tracking-wider font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="hidden sm:inline">Connecting</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="hidden sm:inline">MetaMask</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 border border-orange-200 bg-orange-50 hover:border-orange-500 transition-colors"
      >
        <div className="relative">
          <div className="w-6 h-6 bg-orange-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          {!isCorrectNetwork && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-zinc-900">{balanceLoading ? '...' : `${balance} ARC`}</div>
          <div className="text-[10px] text-zinc-400 font-mono">{wallet ? formatAddress(wallet.address) : ''}</div>
        </div>
        <svg className={`w-3 h-3 text-zinc-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-orange-500 text-white">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-orange-200 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isCorrectNetwork ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                {isCorrectNetwork ? 'Arc Testnet' : 'Wrong Network'}
              </div>
              <div className="text-2xl font-bold">{balance} ARC</div>
              <div className="mt-1 text-[10px] text-orange-200 font-mono">{wallet?.address}</div>
            </div>

            {/* Network Switch */}
            {!isCorrectNetwork && (
              <div className="p-3 bg-red-50 border-b border-red-100">
                <button
                  onClick={switchToArcTestnet}
                  className="w-full py-2 bg-red-600 text-white text-[10px] uppercase tracking-wider font-medium hover:bg-red-700 transition-colors"
                >
                  Switch to Arc Testnet
                </button>
              </div>
            )}

            {/* Network Info */}
            <div className="p-3 border-b border-zinc-100">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Network</div>
              <div className="grid grid-cols-2 gap-px bg-zinc-200">
                <div className="bg-white p-2">
                  <div className="text-[10px] text-zinc-400">Chain ID</div>
                  <div className="text-xs font-mono font-semibold">{ARC_TESTNET.chainId}</div>
                </div>
                <div className="bg-white p-2">
                  <div className="text-[10px] text-zinc-400">Symbol</div>
                  <div className="text-xs font-semibold">{ARC_TESTNET.nativeCurrency.symbol}</div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="p-3 border-b border-zinc-100">
                <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Recent</div>
                <div className="space-y-1">
                  {transactions.slice(0, 2).map((tx) => (
                    <a
                      key={tx.id}
                      href={`${ARC_TESTNET.blockExplorer}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[160px]">{tx.hash}</span>
                      <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disconnect */}
            <div className="p-2">
              <button
                onClick={() => { disconnect(); setShowDropdown(false); }}
                className="w-full py-2 text-[10px] uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function WalletBar() {
  const mode = useModeStore((state) => state.mode);

  if (mode === 'testnet') {
    return <TestnetWalletContent />;
  }

  return <MockWalletContent />;
}
