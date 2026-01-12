interface YieldChartProps {
  earnedYTD: number;
  projectedYield: number;
  yieldPercent: number;
}

export function YieldChart({ earnedYTD, projectedYield, yieldPercent }: YieldChartProps) {
  const chartHeights = [35, 38, 42, 45, 48, 52, 55, 60, 65, 68, 72, 75, 78, 80, 85, 88, 92, 95];

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-white">Projected Yield Curve</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">30D</span>
          <span className="text-white font-bold border-b-2 border-green-500">1Y</span>
          <span className="text-slate-400">ALL</span>
        </div>
      </div>
      <div className="h-40 flex items-end justify-between gap-1 relative">
        {chartHeights.map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-green-500/10 to-green-500/40 rounded-t-sm hover:to-green-400/60 transition-colors group relative" style={{ height: `${h}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              +${(h * 10).toFixed(0)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Earned YTD</div>
          <div className="text-lg font-bold text-white">${earnedYTD.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Projected (1Y)</div>
          <div className="text-lg font-bold text-green-400">+${projectedYield.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Effective APY</div>
          <div className="text-lg font-bold text-purple-400">{yieldPercent}%</div>
        </div>
      </div>
    </div>
  );
}
