import { motion } from 'framer-motion';
import { Dispute } from '../_lib';

interface AITerminalProps {
  disputes: Dispute[];
  evaluatingId: string | null;
  terminalText: string;
  onEvaluate: (id: string) => void;
}

// Factor weights displayed in results
const factorWeights = [
  { key: 'partyHistory', label: 'Party History', weight: 25 },
  { key: 'evidenceQuality', label: 'Evidence Quality', weight: 30 },
  { key: 'transactionAnalysis', label: 'Transaction Analysis', weight: 20 },
  { key: 'claimValidity', label: 'Claim Validity', weight: 25 },
];

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
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">AI_DISPUTE_EVAL_V4.2.EXE</span>
          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded text-[9px] text-purple-400">
            4-FACTOR MODEL
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-6 font-mono text-sm overflow-y-auto">
        {disputes.length > 0 ? (
          <>
            <div className="text-slate-500 mb-4">
              // AI-powered dispute evaluation with weighted factor analysis<br />
              // Factors: party_history (25%), evidence (30%), transaction (20%), claim (25%)<br />
              // Select a dispute to run evaluation...
            </div>

            {disputes.map(d => (
              <div key={d.id} className="mb-6 border-b border-slate-800/50 pb-6 last:border-0">
                <div className="flex items-center gap-2 text-slate-300 mb-2">
                  <span className="text-orange-500">&gt;</span>
                  <span>CASE: {d.id}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-500">{d.category.replace(/_/g, ' ')}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-cyan-400">${d.amount.amount}</span>
                  {evaluatingId === d.id && <span className="animate-pulse text-green-400">_</span>}
                </div>

                {evaluatingId === d.id && (
                  <div className="text-blue-400 whitespace-pre-wrap pl-4 mb-2 text-xs leading-relaxed">{terminalText}</div>
                )}

                {d.aiEvaluation ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pl-4 space-y-3"
                  >
                    {/* Main Result */}
                    <div className="flex items-center gap-4 py-2 border-y border-slate-800/50">
                      <div className="flex gap-4">
                        <span className="text-slate-500 w-32">RECOMMENDATION:</span>
                        <span className={`font-bold ${d.aiEvaluation.recommendation === 'approve' ? 'text-green-400' :
                            d.aiEvaluation.recommendation === 'deny' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                          [{d.aiEvaluation.recommendation.toUpperCase()}]
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-500">CONFIDENCE:</span>
                        <span className="text-cyan-400 font-bold">{(d.aiEvaluation.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Factor Breakdown */}
                    <div className="space-y-1.5">
                      <div className="text-slate-600 text-xs mb-2">FACTOR BREAKDOWN:</div>
                      {factorWeights.map((factor, idx) => {
                        // Generate mock scores based on confidence
                        const baseScore = d.aiEvaluation!.confidence * 100;
                        const variance = (idx * 7) % 15 - 7;
                        const score = Math.min(100, Math.max(60, baseScore + variance));
                        return (
                          <div key={factor.key} className="flex items-center gap-3 text-xs">
                            <span className="text-slate-500 w-36">{factor.label} ({factor.weight}%):</span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-32">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className={`h-full rounded-full ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                            <span className={`w-12 ${
                              score >= 80 ? 'text-green-400' :
                              score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {score.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reasoning */}
                    <div className="pt-2 border-t border-slate-800/50">
                      <span className="text-slate-500 text-xs">REASONING: </span>
                      <span className="text-slate-300 text-xs italic">"{d.aiEvaluation.reasoning}"</span>
                    </div>

                    {/* Action hint */}
                    <div className="text-[10px] text-slate-600">
                      {d.aiEvaluation.recommendation === 'approve' && '// Buyer claim validated. Recommend refund processing.'}
                      {d.aiEvaluation.recommendation === 'deny' && '// Merchant evidence strong. Recommend rejection.'}
                      {d.aiEvaluation.recommendation === 'escalate' && '// Confidence below threshold. Human review required.'}
                    </div>
                  </motion.div>
                ) : (
                  !evaluatingId && (
                    <button
                      onClick={() => onEvaluate(d.id)}
                      className="ml-4 mt-2 px-4 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-xs text-orange-400 rounded border border-orange-500/30 transition-colors"
                    >
                      RUN AI EVALUATION
                    </button>
                  )
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="text-slate-600">
            // No active cases to analyze.<br />
            // Create a dispute using the form to begin evaluation.
          </div>
        )}
      </div>
    </div>
  );
}
