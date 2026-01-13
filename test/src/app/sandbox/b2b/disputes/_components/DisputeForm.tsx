import { DisputeFormData, DisputeCategory } from '../_lib';
import { categoryLabels } from '../_lib/constants';

interface DisputeFormProps {
  formData: DisputeFormData;
  isCreating: boolean;
  onFormChange: (data: DisputeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const categories: DisputeCategory[] = [
  'not_received',
  'not_as_described',
  'duplicate_charge',
  'quality_issue',
  'unauthorized',
  'other',
];

export function DisputeForm({ formData, isCreating, onFormChange, onSubmit }: DisputeFormProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 shrink-0">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        File New Dispute
      </h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] text-slate-500 uppercase mb-1 block">Transaction ID</label>
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => onFormChange({ ...formData, transactionId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500/50 outline-none"
            placeholder="txn_abc123"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 uppercase mb-1 block">Amount (USDC)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500/50 outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase mb-1 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange({ ...formData, category: e.target.value as DisputeCategory })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500/50 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase mb-1 block">Claim Details</label>
          <textarea
            value={formData.claim}
            onChange={(e) => onFormChange({ ...formData, claim: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500/50 outline-none resize-none h-16"
            placeholder="Describe the issue..."
          />
        </div>

        {/* Drop Zone */}
        <div className="border-2 border-dashed border-slate-800 rounded-lg p-3 text-center cursor-pointer hover:border-orange-500/30 transition-colors group">
          <svg className="w-5 h-5 mx-auto text-slate-600 group-hover:text-orange-500/50 transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Drop evidence files here</div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          {isCreating ? 'FILING...' : 'SUBMIT DISPUTE'}
        </button>
      </form>
    </div>
  );
}
