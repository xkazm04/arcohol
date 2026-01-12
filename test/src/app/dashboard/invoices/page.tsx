'use client';

import { useState } from 'react';

export default function InvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const invoices = [
    { id: 'INV-2024-0847', customer: 'Acme Corp', amount: '5,000.00', status: 'paid', date: '2024-01-15' },
    { id: 'INV-2024-0846', customer: 'TechStart Inc', amount: '12,500.00', status: 'sent', date: '2024-01-14' },
    { id: 'INV-2024-0845', customer: 'Global Systems', amount: '8,750.00', status: 'viewed', date: '2024-01-12' },
    { id: 'INV-2024-0844', customer: 'Startup Labs', amount: '3,200.00', status: 'overdue', date: '2024-01-05' },
    { id: 'INV-2024-0843', customer: 'Enterprise Co', amount: '25,000.00', status: 'paid', date: '2024-01-03' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'viewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Invoices</h1>
          <p className="text-sm text-slate-400">Create and manage commercial invoices</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-white font-mono">$47,500</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Paid This Month</div>
          <div className="text-2xl font-bold text-green-400 font-mono">$89,450</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Pending</div>
          <div className="text-2xl font-bold text-white font-mono">12</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-400 font-mono">2</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 uppercase">Recent Invoices</span>
          <input
            type="text"
            placeholder="Search invoices..."
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
          />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Invoice</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Customer</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Amount</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Date</th>
              <th className="text-right px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-white">{invoice.id}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-white">{invoice.customer}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-white">${invoice.amount}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded border uppercase ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-400">{invoice.date}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-white mb-4">Create Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Customer Name</label>
                <input type="text" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email</label>
                <input type="email" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Amount</label>
                <input type="number" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
              <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
