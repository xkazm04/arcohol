'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useModeStore, PaymentMode } from '@/store/modeStore';
import { WalletBar } from './WalletBar';

function ModeToggle() {
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);

  return (
    <div className="flex items-center border border-zinc-200 divide-x divide-zinc-200">
      <button
        onClick={() => setMode('mock')}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all ${
          mode === 'mock'
            ? 'bg-zinc-900 text-white'
            : 'bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
        }`}
      >
        Mock
      </button>
      <button
        onClick={() => setMode('testnet')}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 ${
          mode === 'testnet'
            ? 'bg-orange-500 text-white'
            : 'bg-white text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          mode === 'testnet' ? 'bg-white animate-pulse' : 'bg-orange-400'
        }`} />
        Testnet
      </button>
    </div>
  );
}

export function Header() {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const totalItems = useCartStore((state) => state.totalItems);
  const mode = useModeStore((state) => state.mode);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-9 h-9 flex items-center justify-center transition-colors ${
            mode === 'mock' ? 'bg-zinc-900' : 'bg-orange-500'
          }`}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">
              Arc Store
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">
              {mode === 'mock' ? 'Demo' : 'Testnet'}
            </p>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <ModeToggle />

          {/* Sandbox Link */}
          <Link
            href="/sandbox"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Sandbox
          </Link>

          {/* Wallet */}
          <WalletBar />

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-2 px-3 py-1.5 border border-zinc-200 hover:border-zinc-900 transition-colors group"
          >
            <svg
              className="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-[10px] uppercase tracking-wider font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors hidden sm:inline">
              Cart
            </span>
            {totalItems() > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white flex items-center justify-center ${
                mode === 'mock' ? 'bg-violet-600' : 'bg-orange-500'
              }`}>
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
