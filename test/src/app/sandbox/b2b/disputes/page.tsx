'use client';

import { useState } from 'react';
import { useDisputes } from '@/mocks/MockB2BProvider';
import { terminalLines, type DisputeFormData } from './_lib';
import { DisputeForm, DisputeList, AITerminal } from './_components';

export default function DisputesPage() {
  const { disputes, isCreating, createDispute, evaluateDispute } = useDisputes();
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [terminalText, setTerminalText] = useState<string>('');

  const [formData, setFormData] = useState<DisputeFormData>({
    transactionId: 'txn_demo_001',
    amount: '500',
    category: 'not_received',
    claim: 'I paid for the annual subscription but never received access.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDispute({
      transactionId: formData.transactionId,
      amount: parseFloat(formData.amount),
      category: formData.category,
      claim: formData.claim,
    });
    setFormData((prev) => ({
      ...prev,
      transactionId: `txn_demo_${Date.now().toString(36).slice(0, 6)}`,
      claim: '',
    }));
  };

  const handleEvaluate = async (disputeId: string) => {
    setEvaluatingId(disputeId);
    setTerminalText('');

    for (let i = 0; i < terminalLines.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setTerminalText(prev => prev + terminalLines[i] + '\n');
    }

    await evaluateDispute(disputeId);
    setEvaluatingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Shield Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dispute Resolution</h1>
            <p className="text-sm text-slate-400">AI-powered chargeback protection and evidence management</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/40 px-4 py-2 rounded-lg border border-slate-800/60 text-center">
            <div className="text-xs font-mono text-slate-500 uppercase">Win Rate</div>
            <div className="text-lg font-bold text-green-400">94.2%</div>
          </div>
          <div className="bg-slate-900/40 px-4 py-2 rounded-lg border border-slate-800/60 text-center">
            <div className="text-xs font-mono text-slate-500 uppercase">Risk Level</div>
            <div className="text-lg font-bold text-blue-400">Low</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Column: List & Form */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <DisputeForm
            formData={formData}
            isCreating={isCreating}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
          />
          <DisputeList
            disputes={disputes}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Column: AI Analysis Terminal */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          <AITerminal
            disputes={disputes}
            evaluatingId={evaluatingId}
            terminalText={terminalText}
            onEvaluate={handleEvaluate}
          />
        </div>
      </div>
    </div>
  );
}
