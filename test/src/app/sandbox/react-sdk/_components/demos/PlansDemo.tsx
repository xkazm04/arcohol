'use client';

import { useState } from 'react';
import type { DemoProps } from '../../_lib/types';

export function PlansDemo({ variant }: DemoProps) {
  const [plan, setPlan] = useState('pro');
  const plans = [
    { id: 'starter', name: 'Starter', price: 9, features: ['1k API Calls', 'Email Support'] },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: ['10k API Calls', 'Priority Support', 'Analytics'],
      popular: true,
    },
  ];

  if (variant === 'basic') {
    return (
      <div className="flex gap-3">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`p-4 rounded-xl border-2 text-left w-36 ${
              plan === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="text-sm font-medium text-slate-900">{p.name}</div>
            <div className="text-xl font-bold text-slate-900">
              ${p.price}
              <span className="text-xs font-normal">/mo</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="flex gap-4">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`relative p-5 rounded-2xl border-2 text-left w-44 ${
              plan === p.id
                ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-lg shadow-cyan-500/20'
                : 'border-slate-700 bg-slate-800'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold rounded-full">
                POPULAR
              </div>
            )}
            <div className="text-sm font-medium text-white mb-2">{p.name}</div>
            <div className="text-3xl font-bold text-white mb-3">
              ${p.price}
              <span className="text-sm font-normal text-slate-400">/mo</span>
            </div>
            <div className="space-y-1.5">
              {p.features.map((f) => (
                <div key={f} className="text-xs text-slate-400 flex items-center gap-2">
                  <svg className="w-3 h-3 text-cyan-500" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {plans.map((p) => (
        <button
          key={p.id}
          onClick={() => setPlan(p.id)}
          className={`p-4 rounded-lg border text-left w-40 ${
            plan === p.id ? 'border-white bg-slate-800' : 'border-slate-700 bg-slate-900'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white">{p.name}</span>
            {plan === p.id && <div className="w-2 h-2 bg-cyan-500 rounded-full" />}
          </div>
          <div className="text-lg font-bold text-white">${p.price}/mo</div>
        </button>
      ))}
    </div>
  );
}
