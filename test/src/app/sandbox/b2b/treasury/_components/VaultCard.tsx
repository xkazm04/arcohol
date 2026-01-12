interface VaultCardProps {
  totalBalance: number;
  operatingBalance: number;
  reserveBalance: number;
  yieldPercent: number;
  currentRatio: number;
}

export function VaultCard({ totalBalance, operatingBalance, reserveBalance, yieldPercent, currentRatio }: VaultCardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[300px] flex flex-col shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.4),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-2">Total Assets Under Management</div>
            <div className="text-5xl font-bold text-white tracking-tight flex items-baseline gap-2">
              ${totalBalance.toLocaleString()}
              <span className="text-lg font-normal text-slate-500">USD</span>
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 backdrop-blur">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-xs font-mono text-slate-400 uppercase">Operating (USDC)</span>
            </div>
            <div className="text-2xl font-bold text-white">${operatingBalance.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Liquid Capital</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-mono text-slate-400 uppercase">Reserve (USDY)</span>
            </div>
            <div className="text-2xl font-bold text-white">${reserveBalance.toLocaleString()}</div>
            <div className="text-xs text-green-400 mt-1">Earning {yieldPercent}% APY</div>
          </div>
        </div>

        {/* Allocation Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
            <span>Current Allocation</span>
            <span>{currentRatio.toFixed(1)}% Yield Bearing</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${100 - currentRatio}%` }} />
            <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${currentRatio}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
