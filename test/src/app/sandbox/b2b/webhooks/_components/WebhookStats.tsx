import { mockEndpoints } from '../_lib';

export function WebhookStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Endpoints</div>
        <div className="text-2xl font-bold text-white font-mono">{mockEndpoints.length}</div>
        <div className="text-xs text-slate-500 mt-1">{mockEndpoints.filter(e => e.status === 'active').length} active</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Events (24h)</div>
        <div className="text-2xl font-bold text-white font-mono">1,247</div>
        <div className="text-xs text-green-400 mt-1">+12% from yesterday</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Success Rate</div>
        <div className="text-2xl font-bold text-green-400 font-mono">98.5%</div>
        <div className="text-xs text-slate-500 mt-1">Last 7 days</div>
      </div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4">
        <div className="text-xs font-mono text-slate-500 uppercase mb-1">Avg Latency</div>
        <div className="text-2xl font-bold text-white font-mono">156ms</div>
        <div className="text-xs text-slate-500 mt-1">Response time</div>
      </div>
    </div>
  );
}
