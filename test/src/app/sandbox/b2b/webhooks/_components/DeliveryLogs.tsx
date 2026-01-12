import { deliveryLogs } from '../_lib';

export function DeliveryLogs() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-slate-500 uppercase">Recent Deliveries</div>
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {deliveryLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-white">{log.event}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                  log.status === 'success' ? 'bg-green-500/10 text-green-400' :
                  log.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {log.responseCode || 'pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{log.endpoint}</span>
                <span>{log.duration}</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1">{log.timestamp}</div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800/60 bg-slate-900/20">
          <button className="w-full text-xs text-amber-400 hover:text-amber-300 text-center">
            View All Logs
          </button>
        </div>
      </div>

      {/* Signature Verification */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5">
        <div className="text-xs font-mono text-slate-500 uppercase mb-3">Webhook Secret</div>
        <div className="flex items-center gap-2 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
          <code className="flex-1 text-xs text-slate-400 font-mono truncate">whsec_••••••••••••••••••••</code>
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <button className="w-full mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors">
          Roll Secret
        </button>
      </div>
    </div>
  );
}
