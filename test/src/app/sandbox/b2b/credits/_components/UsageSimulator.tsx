import { meterOptions, type MeterOption } from '../_lib';

interface UsageSimulatorProps {
  selectedMeter: MeterOption;
  usageCount: number;
  isRecording: boolean;
  recordsCount: number;
  onMeterChange: (meter: MeterOption) => void;
  onUsageCountChange: (count: number) => void;
  onRecordUsage: () => void;
}

export function UsageSimulator({
  selectedMeter,
  usageCount,
  isRecording,
  recordsCount,
  onMeterChange,
  onUsageCountChange,
  onRecordUsage,
}: UsageSimulatorProps) {
  const estimatedCost = (usageCount * selectedMeter.rate).toFixed(2);

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-800/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/20 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500 uppercase">Usage Simulator</span>
        <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
          {recordsCount} Events Recorded
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Meter Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {meterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onMeterChange(opt)}
              className={`p-3 rounded-lg border text-left transition-all ${selectedMeter.value === opt.value
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
            >
              <div className={`text-[10px] font-mono mb-1 ${selectedMeter.value === opt.value ? 'text-cyan-400' : 'text-slate-500'}`}>
                ${opt.rate.toFixed(2)}/{opt.unit}
              </div>
              <div className={`text-xs font-bold ${selectedMeter.value === opt.value ? 'text-white' : 'text-slate-300'}`}>
                {opt.label}
              </div>
            </button>
          ))}
        </div>

        {/* Interactive Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-slate-300">Usage Volume</label>
            <div className="text-right">
              <span className="text-2xl font-bold text-white font-mono">{usageCount.toLocaleString()}</span>
              <span className="text-xs text-slate-500 ml-1">{selectedMeter.unit}s</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="1000"
            value={usageCount}
            onChange={(e) => onUsageCountChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600 font-mono">
            <span>1</span>
            <span>250</span>
            <span>500</span>
            <span>750</span>
            <span>1000</span>
          </div>
        </div>

        {/* Cost Preview & Action */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">Estimated Cost</div>
            <div className="text-xl font-bold text-white font-mono">${estimatedCost}</div>
          </div>
          <button
            onClick={onRecordUsage}
            disabled={isRecording}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isRecording ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>EXECUTE METER</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
