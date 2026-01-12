'use client';

import type { DemoProps } from '../../_lib/types';

export function InvoiceDemo({ variant }: DemoProps) {
  const lines = [
    { desc: 'API Integration', qty: 40, rate: 150 },
    { desc: 'Smart Contract Audit', qty: 1, rate: 2500 },
  ];
  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);

  if (variant === 'basic') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-slate-900 w-72">
        <h3 className="text-lg font-bold mb-4">Invoice #001</h3>
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-slate-100 text-sm">
            <span>{l.desc}</span>
            <span className="font-mono">${(l.qty * l.rate).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Total</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <button className="w-full mt-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
          Pay Invoice
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 text-slate-900 w-80 shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-900">INVOICE</h3>
            <p className="text-xs text-blue-600">#INV-2024-001</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Amount Due</div>
            <div className="text-2xl font-bold text-blue-600">${subtotal.toLocaleString()}</div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between p-3 bg-white rounded-xl shadow-sm">
              <div>
                <div className="text-sm font-medium">{l.desc}</div>
                <div className="text-xs text-slate-500">
                  {l.qty} x ${l.rate}
                </div>
              </div>
              <span className="text-sm font-bold">${(l.qty * l.rate).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl">
          Pay Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 w-72">
      <div className="text-xs text-slate-500 mb-1">Invoice</div>
      <div className="text-2xl font-bold text-white mb-4">${subtotal.toLocaleString()}</div>
      {lines.map((l, i) => (
        <div key={i} className="flex justify-between py-2 text-sm text-slate-400">
          <span>{l.desc}</span>
          <span className="font-mono">${(l.qty * l.rate).toLocaleString()}</span>
        </div>
      ))}
      <button className="w-full mt-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
        Pay
      </button>
    </div>
  );
}
