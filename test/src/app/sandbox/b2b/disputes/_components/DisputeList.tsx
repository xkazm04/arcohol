import { Dispute } from '../_lib';

interface DisputeListProps {
  disputes: Dispute[];
  activeTab: 'open' | 'resolved';
  onTabChange: (tab: 'open' | 'resolved') => void;
}

export function DisputeList({ disputes, activeTab, onTabChange }: DisputeListProps) {
  const filteredDisputes = disputes.filter(d =>
    activeTab === 'open' ? d.status !== 'resolved' : d.status === 'resolved'
  );

  return (
    <div className="flex-1 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col overflow-hidden min-h-0">
      <div className="flex border-b border-slate-800/60">
        <button
          onClick={() => onTabChange('open')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${activeTab === 'open' ? 'text-white bg-slate-800/50 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Active
        </button>
        <button
          onClick={() => onTabChange('resolved')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${activeTab === 'resolved' ? 'text-white bg-slate-800/50 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Resolved
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredDisputes.map(d => (
          <div key={d.id} className="p-3 bg-slate-800/30 rounded-lg border border-transparent hover:border-slate-700 transition-colors">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-white">${d.amount.amount}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${d.status === 'filed' ? 'bg-orange-500/10 text-orange-400' :
                  d.status === 'under_review' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-green-500/10 text-green-400'
                }`}>
                {d.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">{d.id}</div>
          </div>
        ))}
        {disputes.length === 0 && <div className="text-center py-8 text-xs text-slate-500">No disputes found</div>}
      </div>
    </div>
  );
}
