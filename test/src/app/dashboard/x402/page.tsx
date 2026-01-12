'use client';

import { useState } from 'react';

const mockApiKeys = [
  {
    id: 'key-001',
    name: 'Production API',
    key: 'arc_live_7x9f...3k2m',
    created: '2024-01-05',
    lastUsed: '2 minutes ago',
    status: 'active',
    requests24h: 12450,
  },
  {
    id: 'key-002',
    name: 'Development',
    key: 'arc_test_4h8j...9p1n',
    created: '2024-01-10',
    lastUsed: '1 hour ago',
    status: 'active',
    requests24h: 342,
  },
];

const mockEndpoints = [
  { method: 'POST', path: '/v1/payments/create', description: 'Create a new payment request', status: 'stable' },
  { method: 'GET', path: '/v1/payments/:id', description: 'Get payment details', status: 'stable' },
  { method: 'POST', path: '/v1/invoices/create', description: 'Create a new invoice', status: 'stable' },
  { method: 'GET', path: '/v1/invoices/:id', description: 'Get invoice details', status: 'stable' },
  { method: 'POST', path: '/v1/agents/:id/authorize', description: 'Authorize agent payment', status: 'beta' },
  { method: 'POST', path: '/v1/crosschain/bridge', description: 'Initiate cross-chain transfer', status: 'beta' },
];

const mockUsageData = {
  totalRequests: 458230,
  successRate: 99.7,
  avgLatency: 145,
  peakRps: 850,
};

export default function X402Page() {
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">x402 API</h1>
          <p className="text-slate-400 mt-1">HTTP 402 Payment Required - Native payment protocol</p>
        </div>
        <div className="flex gap-3">
          <a
            href="#"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Documentation
          </a>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New API Key
          </button>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-mono font-bold text-cyan-400">402</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">HTTP 402 Payment Required</h3>
            <p className="text-sm text-slate-400 mb-3">
              The x402 protocol enables native payment negotiation at the HTTP level. Any API request that requires payment
              returns a 402 status with payment details in the response headers.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">X-Payment-Amount</span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">X-Payment-Currency</span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">X-Payment-Address</span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">X-Payment-Chain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Requests (30d)</div>
          <div className="text-2xl font-bold text-white font-mono">{mockUsageData.totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">{mockUsageData.successRate}%</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Avg Latency</div>
          <div className="text-2xl font-bold text-white">{mockUsageData.avgLatency}ms</div>
        </div>
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
          <div className="text-xs text-slate-500 mb-1">Peak RPS</div>
          <div className="text-2xl font-bold text-cyan-400">{mockUsageData.peakRps}</div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">API Keys</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {mockApiKeys.map((apiKey) => (
            <div key={apiKey.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{apiKey.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{apiKey.key}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-white font-mono">{apiKey.requests24h.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">requests (24h)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Last used {apiKey.lastUsed}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-medium text-white">API Endpoints</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {mockEndpoints.map((endpoint, idx) => (
            <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-xs font-mono rounded ${
                  endpoint.method === 'GET' ? 'bg-green-500/10 text-green-400' :
                  endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                  endpoint.method === 'PUT' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {endpoint.method}
                </span>
                <span className="text-sm font-mono text-white">{endpoint.path}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{endpoint.description}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  endpoint.status === 'stable' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {endpoint.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Quick Start</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs rounded-lg">cURL</button>
            <button className="px-3 py-1 text-slate-400 text-xs hover:text-white rounded-lg">JavaScript</button>
            <button className="px-3 py-1 text-slate-400 text-xs hover:text-white rounded-lg">Python</button>
          </div>
        </div>
        <div className="p-6">
          <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`curl -X POST https://api.arcpay.io/v1/payments/create \\
  -H "Authorization: Bearer arc_live_7x9f...3k2m" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100.00,
    "currency": "USDC",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
    "chain": "base",
    "metadata": {
      "invoice_id": "INV-2024-001"
    }
  }'`}
          </pre>
        </div>
      </div>

      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNewKeyModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create API Key</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Environment</label>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium">Live</button>
                  <button className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors">Test</button>
                </div>
              </div>
              <button className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
