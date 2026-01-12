'use client';

import { useState } from 'react';
import type { DemoProps } from '../../_lib/types';

export function CheckoutDemo({ variant }: DemoProps) {
  const [chain, setChain] = useState('arc');
  const items = [
    { name: 'Pro Plan (Monthly)', price: 29.99 },
    { name: 'API Credits Pack', price: 10.0 },
  ];
  const total = items.reduce((s, i) => s + i.price, 0);

  if (variant === 'basic') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-slate-900 w-72">
        <div className="p-4 border-b border-slate-200 font-semibold text-sm">Order Summary</div>
        <div className="p-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-mono">${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg">
            Pay Now
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 text-white w-80 shadow-2xl">
        <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700 flex justify-between items-center">
          <span className="font-bold">Checkout</span>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Secure</span>
        </div>
        <div className="p-5 space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-mono text-cyan-400">${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
            <span className="text-slate-400">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['arc', 'ethereum', 'polygon'].map((c) => (
              <button
                key={c}
                onClick={() => setChain(c)}
                className={`py-2 text-xs font-medium rounded-lg capitalize ${
                  chain === c ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-xl">
            Complete Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 w-72">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm text-slate-300 mb-2">
          <span>{item.name}</span>
          <span className="font-mono">${item.price.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between text-white font-bold my-4 pt-4 border-t border-slate-700">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="text-xs text-slate-500 mb-2">Status: idle | Chain: {chain}</div>
      <button className="w-full py-3 bg-white text-black font-medium rounded-lg">Initiate Payment</button>
    </div>
  );
}
