'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  StatCard,
  Card,
  CardHeader,
  Modal,
  GlowButton,
  StatusBadge,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import { useDisputes, useDisputeActions } from '@/features/disputes';
import { useOrganization } from '@/features/shared';

const statusMapping: Record<string, 'pending' | 'active' | 'paid' | 'failed' | 'sent' | 'viewed' | 'overdue'> = {
  filed: 'pending',
  under_review: 'sent',
  awaiting_merchant_response: 'overdue',
  merchant_responded: 'viewed',
  resolved: 'paid',
  escalated: 'failed',
};

const categoryLabels: Record<string, string> = {
  not_received: 'Not Received',
  not_as_described: 'Not As Described',
  unauthorized: 'Unauthorized',
  duplicate_charge: 'Duplicate',
  quality_issue: 'Quality',
};

export default function DisputesPage() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { disputes, isLoading, error, stats, refetch } = useDisputes({
    organizationId: organization?.id,
  });
  const { respondToDispute, resolveDispute, evaluateDispute, isLoading: actionLoading } = useDisputeActions();

  const [selectedDispute, setSelectedDispute] = useState<typeof disputes[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAccept = async () => {
    if (!selectedDispute) return;

    try {
      await resolveDispute({
        disputeId: selectedDispute.id,
        outcome: 'buyer_wins',
        refundAmount: selectedDispute.amount,
        reason: 'Merchant accepted the dispute claim',
        resolvedBy: 'human',
      });
      setSelectedDispute(null);
      refetch();
    } catch (err) {
      console.error('Error accepting dispute:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedDispute) return;

    try {
      await respondToDispute({
        disputeId: selectedDispute.id,
        acceptClaim: false,
        responseText: 'Dispute rejected by merchant',
        proposedResolution: 'reject',
      });
      setSelectedDispute(null);
      refetch();
    } catch (err) {
      console.error('Error rejecting dispute:', err);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedDispute) return;

    try {
      await evaluateDispute(selectedDispute.id);
      refetch();
    } catch (err) {
      console.error('Error evaluating dispute:', err);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredDisputes = statusFilter === 'all'
    ? disputes
    : disputes.filter(d => d.status === statusFilter);

  if (orgLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={refetch} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-5xl"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Disputes</h1>
          <motion.div
            animate={{
              boxShadow: ['0 0 10px rgba(168,85,247,0.3)', '0 0 20px rgba(168,85,247,0.5)', '0 0 10px rgba(168,85,247,0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/30 text-purple-400"
          >
            <motion.svg
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </motion.svg>
            <span className="text-[10px] font-medium">AI Active</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-slate-500">Open <span className="text-white font-mono ml-1">{stats.open}</span></div>
          <div className="text-slate-500">Win Rate <span className="text-cyan-400 font-mono ml-1">{stats.winRate.toFixed(0)}%</span></div>
          <div className="text-slate-500">Avg <span className="text-white font-mono ml-1">{stats.avgResolutionDays}d</span></div>
          <Link href="/dashboard/disputes/analytics">
            <GlowButton variant="secondary" size="sm">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </GlowButton>
          </Link>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'filed', 'under_review', 'awaiting_merchant_response', 'escalated', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              statusFilter === status
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <Card accent="cyan" delay={0.1} className="overflow-hidden">
        <CardHeader title={`${statusFilter === 'all' ? 'All' : statusFilter.replace(/_/g, ' ')} Disputes`} />
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-800/20 border-b border-slate-800/40 text-[10px] font-medium text-slate-500 uppercase">
          <div className="col-span-2">Dispute</div>
          <div className="col-span-3">Details</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">AI</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {filteredDisputes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <p className="text-slate-400 text-sm mb-1">No disputes found</p>
            <p className="text-slate-500 text-xs">Disputes from your transactions will appear here</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
            {filteredDisputes.map((dispute) => {
              const aiEval = dispute.ai_evaluation;
              return (
                <motion.div
                  key={dispute.id}
                  variants={listItem}
                  whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                  onClick={() => setSelectedDispute(dispute)}
                  className="grid grid-cols-12 gap-2 px-3 py-2.5 cursor-pointer transition-colors items-center group"
                >
                  <div className="col-span-2">
                    <div className="text-xs font-mono text-white">{dispute.id.slice(0, 8)}...</div>
                    <div className="text-[10px] text-slate-600">{categoryLabels[dispute.category] || dispute.category}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs text-slate-300">{dispute.buyer_id?.slice(0, 12) || 'Unknown'}...</div>
                    <div className="text-[10px] text-slate-600">Filed {formatDate(dispute.filed_at)}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-xs font-mono text-white">${(dispute.amount || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-600">{dispute.currency || 'USDC'}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <StatusBadge
                      status={statusMapping[dispute.status] || 'pending'}
                      label={dispute.status.replace(/_/g, ' ')}
                    />
                  </div>
                  <div className="col-span-2 text-center">
                    {aiEval ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <motion.div
                          animate={{
                            boxShadow: [
                              `0 0 5px ${aiEval.recommendation === 'approve' ? 'rgba(34,197,94,0.5)' : aiEval.recommendation === 'deny' ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.5)'}`,
                              `0 0 10px ${aiEval.recommendation === 'approve' ? 'rgba(34,197,94,0.8)' : aiEval.recommendation === 'deny' ? 'rgba(239,68,68,0.8)' : 'rgba(234,179,8,0.8)'}`,
                              `0 0 5px ${aiEval.recommendation === 'approve' ? 'rgba(34,197,94,0.5)' : aiEval.recommendation === 'deny' ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.5)'}`,
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-2 h-2 rounded-full ${
                            aiEval.recommendation === 'approve' ? 'bg-green-500' :
                            aiEval.recommendation === 'deny' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400 font-mono">{Math.round(aiEval.confidence * 100)}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600">Pending</span>
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <motion.svg
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>

      {/* Summary Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3">
        <StatCard
          label="At Risk"
          value={`$${stats.atRiskAmount.toLocaleString()}`}
          accent="red"
          delay={0.2}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Recovered (30d)"
          value={`$${stats.recovered30d.toLocaleString()}`}
          accent="emerald"
          delay={0.25}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="AI Accuracy"
          value={`${stats.aiAccuracy}%`}
          accent="purple"
          delay={0.3}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDispute}
        onClose={() => setSelectedDispute(null)}
        title={selectedDispute?.id?.slice(0, 13) || ''}
        subtitle={selectedDispute ? `${categoryLabels[selectedDispute.category] || selectedDispute.category} • ${selectedDispute.buyer_id?.slice(0, 12)}...` : ''}
        footer={
          selectedDispute?.status !== 'resolved' ? (
            <>
              <GlowButton variant="danger" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Reject'}
              </GlowButton>
              {!selectedDispute?.ai_evaluation && (
                <GlowButton variant="secondary" onClick={handleEvaluate} disabled={actionLoading}>
                  {actionLoading ? 'Analyzing...' : 'AI Evaluate'}
                </GlowButton>
              )}
              <GlowButton variant="secondary" onClick={() => setSelectedDispute(null)}>
                Respond
              </GlowButton>
              <GlowButton onClick={handleAccept} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Accept'}
              </GlowButton>
            </>
          ) : (
            <GlowButton variant="secondary" onClick={() => setSelectedDispute(null)}>
              Close
            </GlowButton>
          )
        }
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card accent="cyan" className="p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Amount</div>
                <div
                  className="text-lg font-mono font-bold text-white"
                  style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}
                >
                  ${(selectedDispute.amount || 0).toLocaleString()}
                </div>
              </Card>
              <Card accent="amber" className="p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Deadline</div>
                <div
                  className="text-lg font-bold text-white"
                  style={{ textShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}
                >
                  {formatDate(selectedDispute.merchant_response_deadline)}
                </div>
              </Card>
            </div>

            {/* Description */}
            {selectedDispute.description && (
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Claim Description</div>
                <p className="text-xs text-slate-300">{selectedDispute.description}</p>
              </div>
            )}

            {/* AI Analysis */}
            {selectedDispute.ai_evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-purple-500/40 rounded-tl" />
                <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-purple-500/40 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-purple-500/40 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-purple-500/40 rounded-br" />

                <div className="flex items-center gap-1.5 mb-2">
                  <motion.svg
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </motion.svg>
                  <span className="text-xs font-medium text-purple-400">AI Analysis</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Recommends to{' '}
                  <motion.span
                    animate={{
                      textShadow: [
                        `0 0 10px ${selectedDispute.ai_evaluation.recommendation === 'approve' ? 'rgba(34,197,94,0.5)' : selectedDispute.ai_evaluation.recommendation === 'deny' ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.5)'}`,
                        `0 0 20px ${selectedDispute.ai_evaluation.recommendation === 'approve' ? 'rgba(34,197,94,0.8)' : selectedDispute.ai_evaluation.recommendation === 'deny' ? 'rgba(239,68,68,0.8)' : 'rgba(234,179,8,0.8)'}`,
                        `0 0 10px ${selectedDispute.ai_evaluation.recommendation === 'approve' ? 'rgba(34,197,94,0.5)' : selectedDispute.ai_evaluation.recommendation === 'deny' ? 'rgba(239,68,68,0.5)' : 'rgba(234,179,8,0.5)'}`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`font-semibold ${
                      selectedDispute.ai_evaluation.recommendation === 'approve' ? 'text-green-400' :
                      selectedDispute.ai_evaluation.recommendation === 'deny' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  >
                    {selectedDispute.ai_evaluation.recommendation}
                  </motion.span>{' '}
                  with{' '}
                  <span className="font-mono text-purple-400">{Math.round(selectedDispute.ai_evaluation.confidence * 100)}%</span>{' '}
                  confidence.
                </p>
                {selectedDispute.ai_evaluation.reasoning && (
                  <p className="text-[10px] text-slate-400 italic">{selectedDispute.ai_evaluation.reasoning}</p>
                )}
              </motion.div>
            )}

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-slate-500 text-[10px] uppercase mb-1">Transaction ID</div>
                <div className="text-slate-300 font-mono">{selectedDispute.transaction_id || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase mb-1">Desired Resolution</div>
                <div className="text-slate-300">{selectedDispute.desired_resolution?.replace(/_/g, ' ') || 'Full refund'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
