import { Dispute } from '../_lib';

interface AITerminalProps {
  disputes: Dispute[];
  evaluatingId: string | null;
  terminalText: string;
  onEvaluate: (id: string) => void;
}

export function AITerminal({ disputes, evaluatingId, terminalText, onEvaluate }: AITerminalProps) {
  return (
    <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-[10px] font-mono text-slate-500">AI_FRAUD_ANALYSIS_V4.EXE</span>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-6 font-mono text-sm overflow-y-auto">
        {disputes.length > 0 ? (
          <>
            <div className="text-slate-500 mb-4">
              // Select a dispute for detailed analysis<br />
              // System ready. Awaiting input...
            </div>

            {disputes.map(d => (
              <div key={d.id} className="mb-6 border-b border-slate-800/50 pb-6 last:border-0">
                <div className="flex items-center gap-2 text-slate-300 mb-2">
                  <span className="text-orange-500">&gt;</span>
                  <span>ANALYZING CASE: {d.id}</span>
                  {evaluatingId === d.id && <span className="animate-pulse">_</span>}
                </div>

                {evaluatingId === d.id && (
                  <div className="text-blue-400 whitespace-pre-wrap pl-4 mb-2">{terminalText}</div>
                )}

                {d.aiEvaluation ? (
                  <div className="pl-4 space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-32">RECOMMENDATION:</span>
                      <span className={`font-bold ${d.aiEvaluation.recommendation === 'approve' ? 'text-green-400' :
                          d.aiEvaluation.recommendation === 'deny' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                        [{d.aiEvaluation.recommendation.toUpperCase()}]
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-32">CONFIDENCE:</span>
                      <span className="text-cyan-400">{(d.aiEvaluation.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 w-32">REASONING:</span>
                      <span className="text-slate-300">"{d.aiEvaluation.reasoning}"</span>
                    </div>
                  </div>
                ) : (
                  !evaluatingId && (
                    <button
                      onClick={() => onEvaluate(d.id)}
                      className="ml-4 mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded border border-slate-700 transition-colors"
                    >
                      INITIALIZE EVALUATION
                    </button>
                  )
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="text-slate-600">No active cases to analyze.</div>
        )}
      </div>
    </div>
  );
}
