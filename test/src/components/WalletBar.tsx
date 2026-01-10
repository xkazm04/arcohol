'use client';

import React, { useState } from 'react';
import { useWallet, useBalance, useTransactionHistory } from '@/mocks/MockArcPayProvider';

export function WalletBar() {
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
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
        <div className="text-left">
          <div className="text-sm font-semibold text-zinc-900">
            {balanceLoading ? '...' : `$${balance}`}
          </div>
          <div className="text-xs text-zinc-500">
            {wallet ? formatAddress(wallet.address) : ''}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden">
            {/* Balance Section */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <div className="text-sm opacity-80 mb-1">USDC Balance</div>
              <div className="text-3xl font-bold">${balance}</div>
              <div className="mt-2 text-xs opacity-70 font-mono">
                {wallet?.address}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-zinc-500 mb-3">
                Recent Transactions
              </h4>
              {transactions.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'OUTBOUND'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {tx.type === 'OUTBOUND' ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {tx.type === 'OUTBOUND' ? 'Sent' : 'Received'}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {new Date(tx.createDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          tx.type === 'OUTBOUND'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {tx.type === 'OUTBOUND' ? '-' : '+'}${tx.amounts[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
