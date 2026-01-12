import { mockApiKeys } from '../_lib';

interface ApiKeysTabProps {
  onCreateKey: () => void;
}

export function ApiKeysTab({ onCreateKey }: ApiKeysTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">API Keys</h2>
          <p className="text-xs text-slate-500">Manage your API keys for SDK integration</p>
        </div>
        <button
          onClick={onCreateKey}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Key
        </button>
      </div>

      <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {mockApiKeys.map((key) => (
            <div key={key.id} className="p-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{key.name}</div>
                    <code className="text-xs text-slate-500 font-mono">{key.prefix}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {key.permissions.map((perm) => (
                    <span key={perm} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded uppercase">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last used: {key.lastUsed}</span>
                <div className="flex items-center gap-2">
                  <button className="text-slate-400 hover:text-white">Reveal</button>
                  <span className="text-slate-700">|</span>
                  <button className="text-red-400 hover:text-red-300">Revoke</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="text-sm font-medium text-amber-400">Keep your API keys secure</div>
            <div className="text-xs text-amber-400/70 mt-1">Never share your secret keys in client-side code or public repositories.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
