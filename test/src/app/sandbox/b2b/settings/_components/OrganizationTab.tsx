export function OrganizationTab() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Organization Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Organization Name</label>
            <input type="text" defaultValue="Acme Corporation" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Organization ID</label>
            <input type="text" value="org_abc123xyz" disabled className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Contact Email</label>
            <input type="email" defaultValue="finance@acme.com" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Industry</label>
            <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
              <option>Technology</option>
              <option>Finance</option>
              <option>E-commerce</option>
              <option>Healthcare</option>
            </select>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Settlement Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Default Settlement Address</label>
            <input type="text" defaultValue="0x742d35Cc6634C0532925a3b844Bc9e7595f2..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
            <div>
              <div className="text-sm text-white">Instant Settlement</div>
              <div className="text-xs text-slate-500">Receive funds immediately after payment</div>
            </div>
            <div className="w-10 h-5 bg-cyan-600 rounded-full p-0.5 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
            <div>
              <div className="text-sm text-white">Auto Yield Optimization</div>
              <div className="text-xs text-slate-500">Automatically move idle funds to yield</div>
            </div>
            <div className="w-10 h-5 bg-cyan-600 rounded-full p-0.5 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
