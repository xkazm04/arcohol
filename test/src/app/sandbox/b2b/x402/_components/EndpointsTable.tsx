import { mockEndpoints } from '../_lib';

export function EndpointsTable() {
  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500 uppercase">Monetized Endpoints</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search endpoints..."
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Endpoint</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Price</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Calls (24h)</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Revenue (24h)</th>
              <th className="text-left px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-[10px] font-mono text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockEndpoints.map((endpoint) => (
              <tr key={endpoint.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      endpoint.method === 'GET' ? 'bg-green-500/10 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                      endpoint.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-mono text-white">{endpoint.path}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-white">${endpoint.price}</span>
                  <span className="text-xs text-slate-500 ml-1">{endpoint.currency}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-white">{endpoint.calls24h.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-green-400">${endpoint.revenue24h}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                    endpoint.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {endpoint.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
