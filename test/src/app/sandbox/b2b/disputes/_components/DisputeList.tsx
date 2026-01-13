import { Dispute } from '../_lib';
import { categoryLabels } from '../_lib/constants';

interface DisputeListProps {
  disputes: Dispute[];
  activeTab: 'open' | 'resolved';
  onTabChange: (tab: 'open' | 'resolved') => void;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  filed: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Filed' },
  under_review: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Reviewing' },
  awaiting_merchant_response: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Awaiting' },
  merchant_responded: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Responded' },
  escalated: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Escalated' },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Resolved' },
};

export function DisputeList({ disputes, activeTab, onTabChange }: DisputeListProps) {
  const filteredDisputes = disputes.filter(d =>
    activeTab === 'open' ? d.status !== 'resolved' : d.status === 'resolved'
  );

  const openCount = disputes.filter(d => d.status !== 'resolved').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length;

  return (
    <div className="flex-1 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col overflow-hidden min-h-0">
      <div className="flex border-b border-slate-800/60">
        <button
          onClick={() => onTabChange('open')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'open' ? 'text-white bg-slate-800/50 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Active
          {openCount > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded-full">{openCount}</span>
          )}
        </button>
        <button
          onClick={() => onTabChange('resolved')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'resolved' ? 'text-white bg-slate-800/50 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Resolved
          {resolvedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 rounded-full">{resolvedCount}</span>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredDisputes.map(d => {
          const status = statusConfig[d.status] || statusConfig.filed;
          const category = categoryLabels[d.category] || d.category;
          return (
            <div key={d.id} className="p-3 bg-slate-800/30 rounded-lg border border-transparent hover:border-orange-500/30 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <span className="text-xs font-bold text-white">${d.amount.amount}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{category}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 font-mono truncate group-hover:text-slate-400 transition-colors">{d.id}</div>
              {d.aiEvaluation && (
                <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center gap-2">
                  <span className={`text-[9px] font-bold ${
                    d.aiEvaluation.recommendation === 'approve' ? 'text-emerald-400' :
                    d.aiEvaluation.recommendation === 'deny' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    AI: {d.aiEvaluation.recommendation.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {(d.aiEvaluation.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
              )}
            </div>
          );
        })}
        {filteredDisputes.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-8 h-8 mx-auto text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-slate-500">No {activeTab} disputes</p>
          </div>
        )}
      </div>
    </div>
  );
}
