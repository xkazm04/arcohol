'use client';

import { useState } from 'react';

const mockDisputes = [
  {
    id: 'DSP-2024-0234',
    transactionId: 'TXN-8472',
    amount: 1200.00,
    category: 'not_received',
    status: 'under_review',
    buyerName: 'TechCorp Inc.',
    filedAt: '2024-01-10',
    deadline: '2024-01-17',
    aiConfidence: 0.85,
    aiRecommendation: 'approve',
  },
  {
    id: 'DSP-2024-0233',
    transactionId: 'TXN-8401',
    amount: 450.00,
    category: 'not_as_described',
    status: 'awaiting_response',
    buyerName: 'StartupXYZ',
    filedAt: '2024-01-09',
    deadline: '2024-01-16',
    aiConfidence: 0.72,
    aiRecommendation: 'escalate',
  },
  {
    id: 'DSP-2024-0232',
    transactionId: 'TXN-8350',
    amount: 2500.00,
    category: 'unauthorized',
    status: 'resolved',
    buyerName: 'Enterprise Ltd.',
    filedAt: '2024-01-05',
    deadline: '2024-01-12',
    resolution: 'merchant_wins',
    aiConfidence: 0.91,
    aiRecommendation: 'deny',
  },
];

const statusColors: Record<string, string> = {
  filed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  under_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  awaiting_response: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  escalated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const categoryLabels: Record<string, string> = {
  not_received: 'Not Received',
  not_as_described: 'Not As Described',
  unauthorized: 'Unauthorized',
  duplicate_charge: 'Duplicate Charge',
  quality_issue: 'Quality Issue',
};

export default function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState<typeof mockDisputes[0] | null>(null);

  const stats = {
    open: mockDisputes.filter(d => d.status !== 'resolved').length,
    resolved: mockDisputes.filter(d => d.status === 'resolved').length,
    avgResolutionTime: '2.3 days',
    winRate: '87%',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Disputes</h1>
          <p className="text-slate-400 mt-1">AI-powered dispute resolution and management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs font-medium text-purple-400">AI Resolution Active</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Open Disputes</div>
          <div className="text-2xl font-bold text-white">{stats.open}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Resolved (30d)</div>
          <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Avg. Resolution</div>
          <div className="text-2xl font-bold text-white">{stats.avgResolutionTime}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.winRate}</div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">Active Disputes</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {mockDisputes.map((dispute) => (
            <div
              key={dispute.id}
              onClick={() => setSelectedDispute(dispute)}
              className="px-6 py-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{dispute.id}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[dispute.status]}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {dispute.buyerName} • {categoryLabels[dispute.category]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">${dispute.amount.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Filed {dispute.filedAt}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      dispute.aiRecommendation === 'approve' ? 'bg-green-500' :
                      dispute.aiRecommendation === 'deny' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs text-slate-400">
                      AI: {Math.round(dispute.aiConfidence * 100)}%
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedDispute(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl m-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedDispute.id}</h3>
                <p className="text-sm text-slate-400">{categoryLabels[selectedDispute.category]}</p>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Amount</div>
                  <div className="text-xl font-mono font-bold text-white">${selectedDispute.amount.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Deadline</div>
                  <div className="text-xl font-bold text-white">{selectedDispute.deadline}</div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                </div>
                <p className="text-sm text-slate-300">
                  Based on transaction history, buyer patterns, and evidence quality, AI recommends to{' '}
                  <span className={`font-semibold ${
                    selectedDispute.aiRecommendation === 'approve' ? 'text-green-400' :
                    selectedDispute.aiRecommendation === 'deny' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {selectedDispute.aiRecommendation}
                  </span>{' '}
                  this dispute with {Math.round(selectedDispute.aiConfidence * 100)}% confidence.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors">
                  Accept Dispute
                </button>
                <button className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors">
                  Respond
                </button>
                <button className="flex-1 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors border border-red-600/20">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
