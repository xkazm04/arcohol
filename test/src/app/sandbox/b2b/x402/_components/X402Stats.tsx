import { mockEndpoints } from '../_lib';

interface X402StatsProps {
  totalRevenue24h: number;
  totalCalls24h: number;
}

export function X402Stats({ totalRevenue24h, totalCalls24h }: X402StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full blur-2xl" />
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Revenue (24h)</div>
        <div className="text-2xl font-bold text-white font-mono">${totalRevenue24h.toFixed(2)}</div>
        <div className="text-xs text-green-400 mt-1">+18.5% from yesterday</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">API Calls (24h)</div>
        <div className="text-2xl font-bold text-white font-mono">{totalCalls24h.toLocaleString()}</div>
        <div className="text-xs text-slate-500 mt-1">Avg: $0.023/call</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Active Endpoints</div>
        <div className="text-2xl font-bold text-white font-mono">{mockEndpoints.filter(e => e.status === 'active').length}</div>
        <div className="text-xs text-slate-500 mt-1">{mockEndpoints.length} total configured</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Settlement</div>
        <div className="text-2xl font-bold text-green-400 font-mono">Instant</div>
        <div className="text-xs text-slate-500 mt-1">Via facilitator</div>
      </div>
    </div>
  );
}
