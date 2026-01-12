interface TransferControlsProps {
  transferDirection: 'to' | 'from';
  transferAmount: string;
  isTransferring: boolean;
  operatingBalance: number;
  reserveBalance: number;
  yieldPercent: number;
  onDirectionChange: (dir: 'to' | 'from') => void;
  onAmountChange: (amount: string) => void;
  onTransfer: () => void;
}

export function TransferControls({
  transferDirection,
  transferAmount,
  isTransferring,
  operatingBalance,
  reserveBalance,
  yieldPercent,
  onDirectionChange,
  onAmountChange,
  onTransfer,
}: TransferControlsProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Liquidity Sweeps</h3>

      <div className="space-y-4">
        {/* Toggle Direction */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onDirectionChange('to')}
            className={`flex-1 py-2 text-xs font-medium rounded transition-all ${transferDirection === 'to' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Deposit (Earn)
          </button>
          <button
            onClick={() => onDirectionChange('from')}
            className={`flex-1 py-2 text-xs font-medium rounded transition-all ${transferDirection === 'from' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Withdraw
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-500">Amount</span>
            <span className="text-cyan-400 cursor-pointer">Max: ${transferDirection === 'to' ? operatingBalance.toLocaleString() : reserveBalance.toLocaleString()}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-lg font-mono text-white focus:outline-none focus:border-cyan-500/50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-500">
              {transferDirection === 'to' ? 'USDC' : 'USDY'}
            </div>
          </div>
        </div>

        <button
          onClick={onTransfer}
          disabled={isTransferring}
          className={`w-full py-3 font-bold text-xs rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${transferDirection === 'to'
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
        >
          {isTransferring ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>PROCESSING...</span>
            </>
          ) : (
            transferDirection === 'to' ? 'DEPOSIT TO VAULT' : 'WITHDRAW LIQUIDITY'
          )}
        </button>

        <div className="p-3 bg-slate-800/30 rounded border border-slate-800/50 text-[10px] text-slate-400 leading-relaxed">
          {transferDirection === 'to'
            ? `Estimated Yield: +$${((parseFloat(transferAmount || '0') * yieldPercent) / 100).toFixed(2)}/yr. Funds begin earning immediately upon settlement.`
            : 'Withdrawals are instant for amounts under $1M. Larger amounts may require T+1 settlement.'
          }
        </div>
      </div>
    </div>
  );
}
