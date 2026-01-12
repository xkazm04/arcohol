import { recentInvoices } from '../_lib';

export function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900/40 rounded-xl border border-cyan-800/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded mb-2 inline-block">CURRENT PLAN</span>
            <h2 className="text-2xl font-bold text-white">Enterprise</h2>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
            Change Plan
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Platform Fee</div>
            <div className="text-lg font-bold text-white">0.1%</div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Monthly Volume</div>
            <div className="text-lg font-bold text-white">Unlimited</div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Support</div>
            <div className="text-lg font-bold text-white">Priority</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Usage This Month</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Transaction Volume</span>
              <span className="text-sm font-mono text-white">$1,245,000</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">API Calls</span>
              <span className="text-sm font-mono text-white">847,293</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Platform Fees</span>
              <span className="text-sm font-mono text-white">$1,245.00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
          <button className="text-xs text-cyan-400 hover:text-cyan-300">View All</button>
        </div>
        <div className="space-y-2">
          {recentInvoices.map((invoice, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
              <span className="text-sm text-white">{invoice.month}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-white">{invoice.amount}</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded">{invoice.status}</span>
                <button className="text-xs text-slate-400 hover:text-white">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
