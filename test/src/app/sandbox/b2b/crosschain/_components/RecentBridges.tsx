import { recentBridges } from '../_lib';

export function RecentBridges() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-slate-500 uppercase">Recent Bridges</div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {recentBridges.map((bridge) => (
            <div key={bridge.id} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white">{bridge.from}</span>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-white">{bridge.to}</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  bridge.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {bridge.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">${bridge.amount} USDC</span>
                <span className="text-slate-500">{bridge.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800/60 bg-slate-900/20">
          <button className="w-full text-xs text-cyan-400 hover:text-cyan-300 text-center">
            View All Bridges
          </button>
        </div>
      </div>

      {/* Auto Rebalance */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-slate-500 uppercase">Auto-Rebalance</span>
          <div className="w-10 h-5 bg-slate-700 rounded-full p-0.5 cursor-pointer">
            <div className="w-4 h-4 bg-slate-500 rounded-full" />
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Target: Arc</span>
            <span className="text-white font-mono">50%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Threshold</span>
            <span className="text-white font-mono">5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Frequency</span>
            <span className="text-white">Weekly</span>
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-sm rounded-lg border border-cyan-600/20 transition-colors">
          Configure Strategy
        </button>
      </div>
    </div>
  );
}
