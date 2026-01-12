import type { WebhookEndpoint } from '../_lib';

interface EndpointCardProps {
  endpoint: WebhookEndpoint;
}

export function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              endpoint.status === 'active' ? 'bg-green-500' :
              endpoint.status === 'failing' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
            }`} />
            <span className="text-sm font-mono text-white truncate">{endpoint.url}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {endpoint.events.map((event) => (
              <span key={event} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">
                {event}
              </span>
            ))}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          endpoint.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          endpoint.status === 'failing' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {endpoint.status}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Success: <span className={endpoint.successRate > 90 ? 'text-green-400' : 'text-red-400'}>{endpoint.successRate}%</span></span>
          <span>Last: {endpoint.lastDelivery}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
