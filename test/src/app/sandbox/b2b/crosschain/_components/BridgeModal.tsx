import { chainAllocations } from '../_lib';

interface BridgeModalProps {
  onClose: () => void;
  sourceChain: string;
  destChain: string;
  bridgeAmount: string;
  onSourceChange: (value: string) => void;
  onDestChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSwap: () => void;
}

export function BridgeModal({
  onClose,
  sourceChain,
  destChain,
  bridgeAmount,
  onSourceChange,
  onDestChange,
  onAmountChange,
  onSwap,
}: BridgeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-white mb-4">Bridge USDC</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">From Chain</label>
            <select
              value={sourceChain}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              {chainAllocations.map(c => <option key={c.chain} value={c.chain}>{c.chain}</option>)}
            </select>
          </div>
          <div className="flex justify-center">
            <button
              onClick={onSwap}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">To Chain</label>
            <select
              value={destChain}
              onChange={(e) => onDestChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              {chainAllocations.map(c => <option key={c.chain} value={c.chain}>{c.chain}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Amount (USDC)</label>
            <input
              type="number"
              value={bridgeAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="1000.00"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500">Estimated Time</span>
              <span className="text-white">~10 minutes</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Bridge Fee</span>
              <span className="text-green-400">Gas only (~$0.50)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
          <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Bridge Funds</button>
        </div>
      </div>
    </div>
  );
}
