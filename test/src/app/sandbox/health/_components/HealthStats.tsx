import { OverallStatus } from '../_lib';

interface HealthStatsProps {
  overall: OverallStatus;
  running: boolean;
  stats: { passed: number; warning: number; failed: number };
  totalChecks: number;
}

export function HealthStats({ overall, running, stats, totalChecks }: HealthStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Overall Health Status */}
      <div className="col-span-2 relative bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6 overflow-hidden flex items-center justify-between group">
        <div className={`absolute inset-0 opacity-10 ${overall === 'healthy' ? 'bg-emerald-500' :
          overall === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
          }`} />

        <div className="relative z-10">
          <div className="text-xs font-medium text-slate-500 uppercase mb-1">System Status</div>
          <div className={`text-3xl font-bold tracking-tight ${overall === 'healthy' ? 'text-emerald-400' :
            overall === 'degraded' ? 'text-amber-400' : 'text-red-400'
            }`}>
            {running ? 'VERIFYING...' : overall.toUpperCase()}
          </div>
        </div>

        <div className="relative z-10 h-16 w-16">
          <svg className={`w-full h-full transform transition-transform duration-700 ${running ? 'rotate-180 opacity-50' : 'rotate-0'} ${overall === 'healthy' ? 'text-emerald-500' :
            overall === 'degraded' ? 'text-amber-500' : 'text-red-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 flex flex-col justify-center">
        <div className="text-3xl font-bold text-white mb-1">{stats.passed}/{totalChecks}</div>
        <div className="text-sm font-medium text-slate-500">Checks Passed</div>
        <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(stats.passed / (totalChecks || 1)) * 100}%` }} />
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 flex flex-col justify-center">
        <div className="flex gap-2 mb-1">
          <span className="text-3xl font-bold text-amber-400">{stats.warning}</span>
          <span className="text-sm text-slate-500 mt-auto mb-1">WARN</span>
          <span className="text-3xl font-bold text-red-400 ml-2">{stats.failed}</span>
          <span className="text-sm text-slate-500 mt-auto mb-1">FAIL</span>
        </div>
        <div className="text-sm font-medium text-slate-500">Issues Found</div>
      </div>
    </div>
  );
}
