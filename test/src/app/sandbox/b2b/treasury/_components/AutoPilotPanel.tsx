interface AutoPilotPanelProps {
  reserveRatio: number;
  onRatioChange: (ratio: number) => void;
}

export function AutoPilotPanel({ reserveRatio, onRatioChange }: AutoPilotPanelProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white">Auto-Pilot</h3>
        <div className="w-8 h-4 bg-green-500/20 rounded-full p-0.5 border border-green-500/30 cursor-pointer">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow translate-x-4" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Target Reserve Ratio</span>
            <span className="text-white font-mono">{reserveRatio}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={reserveRatio}
            onChange={(e) => onRatioChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>
        <div className="p-3 bg-slate-800/30 rounded flex gap-3 border border-slate-800/50">
          <div className="mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-400">
            Strategy will automatically sweep excess operating capital into high-yield reserves above <span className="text-white">{reserveRatio}%</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
