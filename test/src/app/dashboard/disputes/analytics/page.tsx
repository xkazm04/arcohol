'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  StatCard,
  Card,
  CardHeader,
  GlowButton,
  LoadingSpinner,
  EmptyState,
  BarChart,
  TrendLine,
  DonutChart,
  ProgressBar,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import { useDisputeAnalytics } from '@/features/disputes';

// Category labels
const categoryLabels: Record<string, string> = {
  not_received: 'Not Received',
  not_as_described: 'Not As Described',
  duplicate_charge: 'Duplicate',
  quality_issue: 'Quality',
  unauthorized: 'Unauthorized',
  other: 'Other',
};

// Category colors
const categoryColors: Record<string, string> = {
  not_received: '#f97316',
  not_as_described: '#06b6d4',
  duplicate_charge: '#a855f7',
  quality_issue: '#f59e0b',
  unauthorized: '#ef4444',
  other: '#64748b',
};

export default function DisputeAnalyticsPage() {
  const { analytics, isLoading, error, refetch } = useDisputeAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <LoadingSpinner size="lg" label="Loading analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="Unable to load analytics"
          description={error || 'Please try again'}
          action={<GlowButton onClick={refetch}>Retry</GlowButton>}
        />
      </div>
    );
  }

  const { summary, financial, performance, ai, categoryBreakdown, statusBreakdown, monthlyTrend, topIssues } = analytics;

  // Prepare chart data
  const trendData = monthlyTrend.map((m) => ({
    label: m.monthLabel,
    value: m.count,
  }));

  const categoryChartData = categoryBreakdown
    .filter((c) => c.count > 0)
    .map((c) => ({
      label: categoryLabels[c.category] || c.category,
      value: c.count,
      color: categoryColors[c.category] || '#64748b',
    }));

  const aiRecommendationData = [
    { label: 'Approve', value: ai.recommendations.approve, color: '#10b981' },
    { label: 'Deny', value: ai.recommendations.deny, color: '#ef4444' },
    { label: 'Escalate', value: ai.recommendations.escalate, color: '#f59e0b' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl pb-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/disputes">
            <GlowButton variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </GlowButton>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">Dispute Analytics</h1>
            <p className="text-xs text-slate-400">Insights and performance metrics</p>
          </div>
        </div>
        <GlowButton variant="secondary" size="sm" onClick={refetch}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </GlowButton>
      </motion.div>

      {/* Key Metrics Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Dispute Rate (30d)"
          value={summary.disputes30d.toString()}
          subValue="disputes"
          accent="orange"
          delay={0}
          trend={{
            value: `${summary.disputeRateChange >= 0 ? '+' : ''}${summary.disputeRateChange}%`,
            positive: summary.disputeRateChange <= 0,
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatCard
          label="Win Rate"
          value={`${performance.winRate}%`}
          accent="emerald"
          delay={0.05}
          trend={{
            value: `${performance.winRateChange >= 0 ? '+' : ''}${performance.winRateChange}%`,
            positive: performance.winRateChange >= 0,
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Resolution"
          value={`${performance.avgResolutionDays}d`}
          subValue="days"
          accent="cyan"
          delay={0.1}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="AI Accuracy"
          value={`${ai.accuracy}%`}
          accent="purple"
          delay={0.15}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </motion.div>

      {/* Financial Summary Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="At Risk"
          value={`$${financial.atRiskAmount.toLocaleString()}`}
          subValue={`${summary.openDisputes} open`}
          accent="red"
          delay={0.2}
        />
        <StatCard
          label="Recovered (30d)"
          value={`$${financial.recoveredAmount.toLocaleString()}`}
          accent="emerald"
          delay={0.25}
        />
        <StatCard
          label="Lost (30d)"
          value={`$${financial.lostAmount.toLocaleString()}`}
          accent="amber"
          delay={0.3}
        />
        <StatCard
          label="Avg Dispute"
          value={`$${Math.round(financial.avgDisputeAmount).toLocaleString()}`}
          accent="cyan"
          delay={0.35}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Trend Chart */}
        <motion.div variants={listItem} className="col-span-8">
          <Card accent="orange" delay={0.4}>
            <CardHeader title="Dispute Trend" subtitle="Last 6 months" />
            <div className="p-4">
              <TrendLine data={trendData} height={160} accent="orange" />
              <div className="mt-4 grid grid-cols-6 gap-2">
                {monthlyTrend.map((m, i) => (
                  <div key={m.month} className="text-center">
                    <div className="text-xs font-mono text-white">{m.count}</div>
                    <div className="text-[9px] text-slate-500">disputes</div>
                    <div className="text-[9px] text-emerald-400 mt-1">{Math.round(m.winRate)}% win</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div variants={listItem} className="col-span-4">
          <Card accent="cyan" delay={0.45}>
            <CardHeader title="Status Breakdown" />
            <div className="p-4 space-y-3">
              <ProgressBar
                label="Filed"
                value={statusBreakdown.filed}
                max={summary.totalDisputes || 1}
                accent="orange"
                size="sm"
              />
              <ProgressBar
                label="Under Review"
                value={statusBreakdown.under_review}
                max={summary.totalDisputes || 1}
                accent="cyan"
                size="sm"
              />
              <ProgressBar
                label="Awaiting Response"
                value={statusBreakdown.awaiting_merchant_response}
                max={summary.totalDisputes || 1}
                accent="amber"
                size="sm"
              />
              <ProgressBar
                label="Responded"
                value={statusBreakdown.merchant_responded}
                max={summary.totalDisputes || 1}
                accent="purple"
                size="sm"
              />
              <ProgressBar
                label="Escalated"
                value={statusBreakdown.escalated}
                max={summary.totalDisputes || 1}
                accent="red"
                size="sm"
              />
              <ProgressBar
                label="Resolved"
                value={statusBreakdown.resolved}
                max={summary.totalDisputes || 1}
                accent="emerald"
                size="sm"
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Category & AI Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Category Breakdown */}
        <motion.div variants={listItem} className="col-span-6">
          <Card accent="purple" delay={0.5}>
            <CardHeader title="Category Breakdown" subtitle="By dispute type" />
            <div className="p-4">
              {categoryChartData.length > 0 ? (
                <DonutChart
                  data={categoryChartData}
                  size={140}
                  centerValue={summary.totalDisputes.toString()}
                  centerLabel="Total"
                />
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">No dispute data</div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={listItem} className="col-span-6">
          <Card accent="emerald" delay={0.55}>
            <CardHeader title="AI Recommendations" subtitle="Distribution of AI decisions" />
            <div className="p-4">
              <DonutChart
                data={aiRecommendationData}
                size={140}
                centerValue={`${ai.avgConfidence}%`}
                centerLabel="Avg Confidence"
              />
              <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{ai.totalEvaluated}</div>
                  <div className="text-[10px] text-slate-500">Evaluated</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{ai.overrideRate}%</div>
                  <div className="text-[10px] text-slate-500">Override Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{ai.accuracy}%</div>
                  <div className="text-[10px] text-slate-500">Accuracy</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Issues */}
      <motion.div variants={listItem}>
        <Card accent="amber" delay={0.6}>
          <CardHeader title="Top Dispute Reasons" subtitle="Most common categories by count" />
          <div className="p-4">
            {topIssues.length > 0 ? (
              <div className="space-y-3">
                {topIssues.map((issue, index) => (
                  <div key={issue.category} className="flex items-center gap-4">
                    <div className="w-6 text-center">
                      <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                    </div>
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: categoryColors[issue.category] || '#64748b' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white">{categoryLabels[issue.category] || issue.category}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {issue.count} ({Math.round(issue.percentage)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${issue.percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: categoryColors[issue.category] || '#64748b' }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-xs font-mono text-white">${issue.amount.toLocaleString()}</div>
                      <div className="text-[9px] text-emerald-400">{Math.round(issue.winRate)}% win</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">No dispute data available</div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats Footer */}
      <motion.div variants={listItem} className="grid grid-cols-5 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{summary.totalDisputes}</div>
          <div className="text-[10px] text-slate-500">Total Disputes</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-400">{summary.openDisputes}</div>
          <div className="text-[10px] text-slate-500">Open</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{summary.resolvedDisputes}</div>
          <div className="text-[10px] text-slate-500">Resolved</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-amber-400">{performance.overdueResponses}</div>
          <div className="text-[10px] text-slate-500">Overdue</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-cyan-400">{summary.disputes7d}</div>
          <div className="text-[10px] text-slate-500">Last 7 Days</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
