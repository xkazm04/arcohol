import { companyLogos } from '../_lib';

interface InvoiceFormData {
  amount: string;
  reference: string;
  buyerEmail: string;
  buyerCompany: string;
}

interface InvoiceFormProps {
  formData: InvoiceFormData;
  isCreating: boolean;
  onFormChange: (data: InvoiceFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function InvoiceForm({ formData, isCreating, onFormChange, onSubmit }: InvoiceFormProps) {
  const feeAmount = (parseFloat(formData.amount) * 0.001).toFixed(2);
  const netAmount = (parseFloat(formData.amount) - parseFloat(feeAmount)).toFixed(2);

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
        <h3 className="text-sm font-semibold text-white">Invoice Details</h3>
        <div className="text-xs font-mono text-cyan-400">Drafting...</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 block">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
                className="w-full pl-7 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 block">Reference ID</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => onFormChange({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 block">Buyer Company</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.buyerCompany}
                  onChange={(e) => onFormChange({ ...formData, buyerCompany: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  list="companies"
                />
                <datalist id="companies">
                  {Object.keys(companyLogos).map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 block">Buyer Email</label>
              <input
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => onFormChange({ ...formData, buyerEmail: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4 space-y-2 border border-slate-800/50">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white font-mono">${parseFloat(formData.amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Platform Fee (0.1%)</span>
            <span className="text-green-400 font-mono">-${feeAmount}</span>
          </div>
          <div className="h-px bg-slate-700/50 my-2" />
          <div className="flex justify-between text-sm font-medium">
            <span className="text-white">Net Receivable</span>
            <span className="text-white font-mono">${parseFloat(netAmount).toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>GENERATING...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>CREATE INVOICE</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
