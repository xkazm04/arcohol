import { DisputeFormData } from '../_lib';

interface DisputeFormProps {
  formData: DisputeFormData;
  isCreating: boolean;
  onFormChange: (data: DisputeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DisputeForm({ formData, isCreating, onFormChange, onSubmit }: DisputeFormProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 shrink-0">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        File New Dispute
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => onFormChange({ ...formData, transactionId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500/50 outline-none"
            placeholder="Transaction ID"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500/50 outline-none"
            placeholder="Amount"
          />
          <select
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value as DisputeFormData['category'] })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500/50 outline-none"
          >
            <option value="not_received">Not Received</option>
            <option value="quality">Quality Issue</option>
          </select>
        </div>
        <textarea
          value={formData.claim}
          onChange={(e) => onFormChange({ ...formData, claim: e.target.value })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500/50 outline-none resize-none h-20"
          placeholder="Customer claim details..."
        />

        {/* Drop Zone */}
        <div className="border-2 border-dashed border-slate-800 rounded-lg p-4 text-center cursor-pointer hover:border-slate-700 transition-colors">
          <div className="text-[10px] text-slate-500">Drag & drop evidence files here</div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          {isCreating ? 'FILING...' : 'SUBMIT DISPUTE'}
        </button>
      </form>
    </div>
  );
}
