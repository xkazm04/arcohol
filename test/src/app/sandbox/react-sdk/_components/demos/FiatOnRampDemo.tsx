'use client';

import { useState } from 'react';
import type { DemoProps } from '../../_lib/types';

interface Provider {
  id: string;
  name: string;
  fee: string;
  quote: string;
  best?: boolean;
}

export function FiatOnRampDemo({ variant }: DemoProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>('circle');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const providers: Provider[] = [
    { id: 'moonpay', name: 'MoonPay', fee: '4.5%', quote: '$52.25' },
    { id: 'transak', name: 'Transak', fee: '3.5%', quote: '$51.75' },
    { id: 'coinbase', name: 'Coinbase Pay', fee: '2.5%', quote: '$51.25' },
    { id: 'circle', name: 'Circle', fee: '1.5%', quote: '$50.75', best: true },
  ];

  if (variant === 'basic') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 w-72 text-slate-900">
        <h3 className="text-lg font-bold mb-1">Buy USDC</h3>
        <p className="text-xs text-slate-500 mb-4">50 USDC on Arc</p>
        <div className="space-y-2 mb-4">
          {providers.slice(2).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`w-full p-3 rounded-lg border-2 text-left flex justify-between items-center ${
                selectedProvider === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-slate-500">{p.fee} fee</div>
              </div>
              <div className="text-sm font-mono">{p.quote}</div>
            </button>
          ))}
        </div>
        <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
          Pay $50.75 USD
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 w-80 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Buy USDC</h3>
            <p className="text-xs text-slate-400">Purchase with card or bank</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold">
            US
          </div>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
          <div className="text-xs text-slate-400 mb-1">You&apos;ll receive</div>
          <div className="text-2xl font-bold text-white">50.00 USDC</div>
        </div>
        <div className="text-xs font-medium text-slate-400 mb-2">Select Provider</div>
        <div className="space-y-2 mb-4">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`w-full p-3 rounded-xl border-2 text-left flex justify-between items-center transition-all ${
                selectedProvider === p.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {p.name.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    {p.name}
                    {p.best && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{p.fee} fee</div>
                </div>
              </div>
              <div className="text-sm font-mono text-cyan-400">{p.quote}</div>
            </button>
          ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-xl">
          Pay $50.75 USD
        </button>
      </div>
    );
  }

  // Hook variant
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 w-72">
      <div className="text-xs text-slate-500 mb-1">Amount</div>
      <div className="text-2xl font-bold text-white mb-4">50.00 USDC</div>
      <div className="text-xs text-slate-400 mb-2">Provider: {selectedProvider || 'None'}</div>
      <div className="text-xs text-slate-400 mb-2">Status: {status}</div>
      <div className="space-y-2 mb-4">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={`w-full p-2 rounded-lg text-left text-sm flex justify-between ${
              selectedProvider === p.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span>{p.name}</span>
            <span className="font-mono">{p.quote}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setStatus('processing');
          setTimeout(() => setStatus('success'), 2000);
        }}
        className="w-full py-2.5 bg-white text-black font-medium rounded-lg"
      >
        {status === 'processing' ? 'Processing...' : status === 'success' ? '✓ Complete' : 'Buy Now'}
      </button>
    </div>
  );
}
