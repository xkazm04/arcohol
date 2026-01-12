import { statusColors, companyLogos } from '../_lib';

interface Invoice {
  id: string;
  reference: string;
  amount: { amount: string };
  status: string;
  createdAt: string;
  buyer: { company: string };
}

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-slate-800/60">
        <input type="text" placeholder="Search invoices..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-3 bg-slate-800/20 hover:bg-slate-800/40 rounded-lg border border-transparent hover:border-slate-700 transition-all cursor-pointer group">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {companyLogos[inv.buyer.company] || '??'}
                </div>
                <div>
                  <div className="text-xs font-medium text-white group-hover:text-cyan-400 transition-colors">{inv.reference}</div>
                  <div className="text-[10px] text-slate-500">{inv.buyer.company}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">${inv.amount.amount}</div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${statusColors[inv.status]} uppercase`}>{inv.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
              <span className="text-[10px] text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
