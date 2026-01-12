'use client';

interface CreditCardProps {
  balance: string;
  accountId: string;
  status: 'active' | 'suspended' | 'depleted';
  yieldBalance?: string;
}

export function CreditCard({ balance, accountId, status, yieldBalance }: CreditCardProps) {
  return (
    <div className="relative aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl group transition-transform hover:scale-[1.01]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

      {/* Holographic Element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-colors" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="text-slate-400 font-mono text-xs tracking-widest uppercase">Prepaid Account</div>
        <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-1">
        <div className="text-4xl font-mono font-bold text-white tracking-tight">
          ${balance}
        </div>
        <div className="text-slate-400 text-sm font-medium">Available Balance (USDC)</div>
        {yieldBalance && (
          <div className="text-xs text-green-400 mt-1">
            +${yieldBalance} in yield
          </div>
        )}
      </div>

      <div className="relative z-10 flex justify-between items-end">
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">Account ID</div>
          <div className="text-xs text-slate-300 font-mono">{accountId}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono uppercase mb-0.5">Status</div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
            status === 'active' ? 'bg-green-500/10 border-green-500/20' :
            status === 'suspended' ? 'bg-amber-500/10 border-amber-500/20' :
            'bg-red-500/10 border-red-500/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === 'active' ? 'bg-green-500 animate-pulse' :
              status === 'suspended' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              status === 'active' ? 'text-green-400' :
              status === 'suspended' ? 'text-amber-400' : 'text-red-400'
            }`}>{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
