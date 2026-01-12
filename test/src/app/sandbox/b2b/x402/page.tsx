'use client';

import { useState } from 'react';
import { mockEndpoints, codeExample, type PricingModel } from './_lib';
import { X402Stats, RevenueChart, EndpointsTable, CreateEndpointModal } from './_components';

export default function X402Page() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel>('exact');

  const totalRevenue24h = mockEndpoints.reduce((acc, ep) => acc + parseFloat(ep.revenue24h), 0);
  const totalCalls24h = mockEndpoints.reduce((acc, ep) => acc + ep.calls24h, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">x402 API Monetization</h1>
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded border border-purple-500/20">HTTP 402</span>
          </div>
          <p className="text-sm text-slate-400">Pay-per-use API endpoints with instant micropayments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Endpoint
        </button>
      </div>

      <X402Stats totalRevenue24h={totalRevenue24h} totalCalls24h={totalCalls24h} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />

        {/* Quick Setup */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
          <div className="text-xs font-mono text-slate-500 uppercase mb-4">Integration</div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <div className="text-[10px] text-slate-500 mb-2">Middleware Setup</div>
              <code className="text-xs text-purple-400 font-mono">import {'{ paymentProxy }'} from &apos;@x402/next&apos;</code>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <div className="text-[10px] text-slate-500 mb-2">Your Wallet</div>
              <code className="text-xs text-slate-300 font-mono break-all">0x742d35Cc6634C0532925a3b844Bc9e7595f...</code>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
              <div className="text-[10px] text-slate-500 mb-2">Network</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-300">Base Sepolia (testnet)</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
            View Documentation
          </button>
        </div>
      </div>

      <EndpointsTable />

      {/* Code Example */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">CLIENT INTEGRATION</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-medium rounded">Agent</button>
            <button className="px-2 py-1 text-slate-500 text-[10px] font-medium rounded hover:bg-slate-800">cURL</button>
          </div>
        </div>
        <pre className="p-5 text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
          {codeExample}
        </pre>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateEndpointModal
          onClose={() => setShowCreateModal(false)}
          selectedPricing={selectedPricing}
          onPricingChange={setSelectedPricing}
        />
      )}
    </div>
  );
}
