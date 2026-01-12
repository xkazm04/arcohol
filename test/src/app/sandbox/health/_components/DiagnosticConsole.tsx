import { Check } from '../_lib';

interface DiagnosticConsoleProps {
  checks: Check[];
}

export function DiagnosticConsole({ checks }: DiagnosticConsoleProps) {
  return (
    <div className="bg-black/40 rounded-xl border border-slate-800/60 overflow-hidden">
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <span className="ml-2 text-sm font-medium text-slate-500">Execution Log</span>
      </div>
      <div className="p-4 space-y-3 font-mono text-xs">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-3 group">
            <div className={`mt-0.5 ${check.status === 'pass' ? 'text-emerald-500' :
              check.status === 'warn' ? 'text-amber-500' :
                check.status === 'fail' ? 'text-red-500' :
                  check.status === 'running' ? 'text-blue-400' : 'text-slate-600'
              }`}>
              {check.status === 'running' ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              ) : check.status === 'pending' ? (
                <div className="w-3 h-3 rounded-full border border-slate-600 border-dashed" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${check.status === 'pending' ? 'text-slate-500' : 'text-slate-200'
                  }`}>{check.name}</span>
                {check.duration && <span className="text-[10px] text-slate-600">_{check.duration}ms</span>}
              </div>
              <div className={`${check.status === 'warn' ? 'text-amber-500/80' :
                check.status === 'fail' ? 'text-red-400' : 'text-slate-500'
                }`}>{check.message}</div>
            </div>

            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-[10px] bg-opacity-10 border border-opacity-20 ${check.status === 'pass' ? 'bg-emerald-500 border-emerald-500 text-emerald-500' :
                check.status === 'warn' ? 'bg-amber-500 border-amber-500 text-amber-500' :
                  check.status === 'fail' ? 'bg-red-500 border-red-500 text-red-500' :
                    check.status === 'running' ? 'bg-blue-500 border-blue-500 text-blue-500' :
                      'bg-slate-500 border-slate-500 text-slate-500'
                }`}>
                {check.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
