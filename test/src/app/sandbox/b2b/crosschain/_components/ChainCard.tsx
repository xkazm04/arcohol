import type { ChainAllocation } from '../_lib';
import { getChainColor } from '../_lib';

interface ChainCardProps {
  chain: ChainAllocation;
}

export function ChainCard({ chain }: ChainCardProps) {
  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: getChainColor(chain.color) }}>
            {chain.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{chain.chain}</div>
            <div className="text-xs text-slate-500">Chain ID: {chain.chainId}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
          chain.status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${chain.status === 'connected' ? 'bg-green-500' : 'bg-amber-500'}`} />
          {chain.status}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-mono text-slate-500 mb-1">BALANCE</div>
          <div className="text-xl font-bold text-white font-mono">${chain.balance}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500 mb-1">ALLOCATION</div>
          <div className="text-lg font-bold text-slate-300">{chain.percentage}%</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex gap-2">
        <button className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded transition-colors">
          Deposit
        </button>
        <button className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded transition-colors">
          Bridge Out
        </button>
      </div>
    </div>
  );
}
