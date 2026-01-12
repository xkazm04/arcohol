import { revenueData } from '../_lib';

export function RevenueChart() {
  const maxRevenue = Math.max(...revenueData.map(d => d.amount));
  const total = revenueData.reduce((a, d) => a + d.amount, 0);

  return (
    <div className="lg:col-span-2 bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-mono text-slate-500 uppercase">Revenue (7 Days)</span>
        <div className="flex gap-2">
          {['7D', '30D', '90D'].map((period) => (
            <button key={period} className={`px-2 py-1 text-[10px] font-medium rounded ${period === '7D' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between h-48 gap-2">
        {revenueData.map((day) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-slate-800 rounded-t relative overflow-hidden" style={{ height: `${(day.amount / maxRevenue) * 100}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-purple-400/50" />
            </div>
            <span className="text-[10px] text-slate-500">{day.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-xs">
        <span className="text-slate-500">Total: <span className="text-white font-mono">${total.toFixed(2)}</span></span>
        <span className="text-slate-500">Avg: <span className="text-white font-mono">${(total / 7).toFixed(2)}/day</span></span>
      </div>
    </div>
  );
}
