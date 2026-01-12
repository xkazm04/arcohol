import { chainAllocations, getChainColor } from '../_lib';

interface TotalBalanceProps {
  totalBalance: number;
}

export function TotalBalance({ totalBalance }: TotalBalanceProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur rounded-xl border border-slate-800/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase mb-1">Total Multi-Chain Balance</div>
          <div className="text-4xl font-bold text-white font-mono">${totalBalance.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Active Chains</div>
            <div className="text-lg font-bold text-white">{chainAllocations.filter(c => c.status === 'connected').length}</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-right">
            <div className="text-xs text-slate-500">Bridge Provider</div>
            <div className="text-lg font-bold text-cyan-400">Circle CCTP</div>
          </div>
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-slate-800">
        {chainAllocations.map((chain) => (
          <div
            key={chain.chain}
            className="h-full transition-all"
            style={{ width: `${chain.percentage}%`, backgroundColor: getChainColor(chain.color) }}
            title={`${chain.chain}: ${chain.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {chainAllocations.map((chain) => (
          <div key={chain.chain} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getChainColor(chain.color) }} />
            <span className="text-xs text-slate-400">{chain.chain} ({chain.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
