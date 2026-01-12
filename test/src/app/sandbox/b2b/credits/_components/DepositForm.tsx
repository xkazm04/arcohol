interface DepositFormProps {
  depositAmount: string;
  isDepositing: boolean;
  onAmountChange: (amount: string) => void;
  onDeposit: () => void;
}

export function DepositForm({ depositAmount, isDepositing, onAmountChange, onDeposit }: DepositFormProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
      <div className="text-xs font-mono text-slate-500 uppercase mb-4">Add Funds</div>
      <div className="flex gap-2">
        {[100, 500, 1000].map(amt => (
          <button
            key={amt}
            onClick={() => onAmountChange(amt.toString())}
            className={`flex-1 py-2 text-xs font-medium rounded border transition-all ${depositAmount === amt.toString()
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
          >
            +${amt}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full pl-6 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
          />
        </div>
        <button
          onClick={onDeposit}
          disabled={isDepositing}
          className="px-6 py-2.5 bg-white hover:bg-slate-200 text-black text-xs font-bold rounded-lg transition-all disabled:opacity-50 min-w-[100px]"
        >
          {isDepositing ? 'PROCESSING...' : 'DEPOSIT'}
        </button>
      </div>
    </div>
  );
}
