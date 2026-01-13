import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Time period helpers
function getDateRange(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getMonthStart(monthsAgo: number = 0): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const orgId = orgMember.organization_id;

    // Fetch all disputes with relations
    const { data: disputes, error: disputesError } = await supabase
      .from('disputes')
      .select(`
        id,
        status,
        category,
        amount,
        currency,
        created_at,
        filed_at,
        resolved_at,
        merchant_response_deadline,
        resolution_deadline,
        ai_evaluations (
          recommendation,
          confidence,
          overridden
        ),
        dispute_resolutions (
          outcome,
          refund_amount
        )
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (disputesError) {
      throw disputesError;
    }

    const allDisputes = disputes || [];
    const now = new Date();
    const thirtyDaysAgo = getDateRange(30);
    const sevenDaysAgo = getDateRange(7);

    // ============ CORE METRICS ============
    const openStatuses = ['filed', 'under_review', 'awaiting_merchant_response', 'merchant_responded', 'escalated'];
    const openDisputes = allDisputes.filter((d) => openStatuses.includes(d.status));
    const resolvedDisputes = allDisputes.filter((d) => d.status === 'resolved');

    // Disputes in last 30 days
    const disputes30d = allDisputes.filter((d) => new Date(d.created_at) >= thirtyDaysAgo);
    const disputes7d = allDisputes.filter((d) => new Date(d.created_at) >= sevenDaysAgo);

    // Previous 30 days for comparison (30-60 days ago)
    const sixtyDaysAgo = getDateRange(60);
    const disputesPrev30d = allDisputes.filter(
      (d) => new Date(d.created_at) >= sixtyDaysAgo && new Date(d.created_at) < thirtyDaysAgo
    );

    // Dispute rate change
    const disputeRateChange =
      disputesPrev30d.length > 0
        ? ((disputes30d.length - disputesPrev30d.length) / disputesPrev30d.length) * 100
        : 0;

    // ============ AMOUNTS ============
    const totalAmount = allDisputes.reduce((sum, d) => sum + (d.amount || 0), 0);
    const openAmount = openDisputes.reduce((sum, d) => sum + (d.amount || 0), 0);

    // At risk (AI recommends approve = buyer wins)
    const atRiskDisputes = openDisputes.filter((d) => d.ai_evaluations?.[0]?.recommendation === 'approve');
    const atRiskAmount = atRiskDisputes.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Recovered (resolved in last 30d with merchant win)
    const resolved30d = resolvedDisputes.filter((d) => d.resolved_at && new Date(d.resolved_at) >= thirtyDaysAgo);
    const recoveredDisputes = resolved30d.filter(
      (d) => d.dispute_resolutions?.[0]?.outcome === 'merchant_wins' || d.ai_evaluations?.[0]?.recommendation === 'deny'
    );
    const recoveredAmount = recoveredDisputes.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Lost amount (buyer wins)
    const lostDisputes = resolved30d.filter(
      (d) => d.dispute_resolutions?.[0]?.outcome === 'buyer_wins' || d.ai_evaluations?.[0]?.recommendation === 'approve'
    );
    const lostAmount = lostDisputes.reduce((sum, d) => sum + (d.amount || 0), 0);

    // ============ WIN RATE ============
    const resolvedWithOutcome = resolvedDisputes.filter(
      (d) => d.dispute_resolutions?.[0]?.outcome || d.ai_evaluations?.[0]?.recommendation
    );
    const merchantWins = resolvedWithOutcome.filter(
      (d) => d.dispute_resolutions?.[0]?.outcome === 'merchant_wins' || d.ai_evaluations?.[0]?.recommendation === 'deny'
    );
    const winRate = resolvedWithOutcome.length > 0 ? (merchantWins.length / resolvedWithOutcome.length) * 100 : 0;

    // Previous period win rate
    const resolvedPrev30d = resolvedDisputes.filter(
      (d) => d.resolved_at && new Date(d.resolved_at) >= sixtyDaysAgo && new Date(d.resolved_at) < thirtyDaysAgo
    );
    const prevMerchantWins = resolvedPrev30d.filter(
      (d) => d.dispute_resolutions?.[0]?.outcome === 'merchant_wins' || d.ai_evaluations?.[0]?.recommendation === 'deny'
    );
    const prevWinRate = resolvedPrev30d.length > 0 ? (prevMerchantWins.length / resolvedPrev30d.length) * 100 : 0;
    const winRateChange = winRate - prevWinRate;

    // ============ RESOLUTION TIME ============
    const resolutionTimes = resolvedDisputes
      .filter((d) => d.resolved_at && d.filed_at)
      .map((d) => {
        const filed = new Date(d.filed_at!).getTime();
        const resolved = new Date(d.resolved_at!).getTime();
        return (resolved - filed) / (1000 * 60 * 60 * 24);
      });
    const avgResolutionDays = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;

    // ============ AI METRICS ============
    const disputesWithAI = allDisputes.filter((d) => d.ai_evaluations?.[0]);
    const aiOverrides = disputesWithAI.filter((d) => d.ai_evaluations?.[0]?.overridden);
    const aiAccuracy = disputesWithAI.length > 0 ? ((disputesWithAI.length - aiOverrides.length) / disputesWithAI.length) * 100 : 94;

    const avgConfidence =
      disputesWithAI.length > 0
        ? disputesWithAI.reduce((sum, d) => sum + (d.ai_evaluations?.[0]?.confidence || 0), 0) / disputesWithAI.length
        : 0;

    // AI recommendation distribution
    const aiRecommendations = {
      approve: disputesWithAI.filter((d) => d.ai_evaluations?.[0]?.recommendation === 'approve').length,
      deny: disputesWithAI.filter((d) => d.ai_evaluations?.[0]?.recommendation === 'deny').length,
      escalate: disputesWithAI.filter((d) => d.ai_evaluations?.[0]?.recommendation === 'escalate').length,
    };

    // ============ CATEGORY BREAKDOWN ============
    const categories = ['not_received', 'not_as_described', 'duplicate_charge', 'quality_issue', 'unauthorized', 'other'];
    const categoryBreakdown = categories.map((cat) => {
      const catDisputes = allDisputes.filter((d) => d.category === cat);
      const catResolved = catDisputes.filter((d) => d.status === 'resolved');
      const catMerchantWins = catResolved.filter(
        (d) => d.dispute_resolutions?.[0]?.outcome === 'merchant_wins' || d.ai_evaluations?.[0]?.recommendation === 'deny'
      );
      return {
        category: cat,
        count: catDisputes.length,
        percentage: allDisputes.length > 0 ? (catDisputes.length / allDisputes.length) * 100 : 0,
        amount: catDisputes.reduce((sum, d) => sum + (d.amount || 0), 0),
        winRate: catResolved.length > 0 ? (catMerchantWins.length / catResolved.length) * 100 : 0,
      };
    });

    // ============ STATUS BREAKDOWN ============
    const statusBreakdown = {
      filed: allDisputes.filter((d) => d.status === 'filed').length,
      under_review: allDisputes.filter((d) => d.status === 'under_review').length,
      awaiting_merchant_response: allDisputes.filter((d) => d.status === 'awaiting_merchant_response').length,
      merchant_responded: allDisputes.filter((d) => d.status === 'merchant_responded').length,
      escalated: allDisputes.filter((d) => d.status === 'escalated').length,
      resolved: resolvedDisputes.length,
    };

    // ============ MONTHLY TREND (Last 6 months) ============
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = getMonthStart(i);
      const monthEnd = getMonthStart(i - 1);
      const monthDisputes = allDisputes.filter((d) => {
        const created = new Date(d.created_at);
        return created >= monthStart && (i === 0 || created < monthEnd);
      });
      const monthResolved = monthDisputes.filter((d) => d.status === 'resolved');
      const monthMerchantWins = monthResolved.filter(
        (d) => d.dispute_resolutions?.[0]?.outcome === 'merchant_wins' || d.ai_evaluations?.[0]?.recommendation === 'deny'
      );

      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        monthLabel: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        count: monthDisputes.length,
        amount: monthDisputes.reduce((sum, d) => sum + (d.amount || 0), 0),
        resolved: monthResolved.length,
        winRate: monthResolved.length > 0 ? (monthMerchantWins.length / monthResolved.length) * 100 : 0,
      });
    }

    // ============ TOP ISSUES (Root causes) ============
    const topIssues = categoryBreakdown
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ============ RESPONSE METRICS ============
    const disputesWithResponse = allDisputes.filter((d) => d.merchant_response_deadline);
    const overdueResponses = disputesWithResponse.filter(
      (d) => openStatuses.includes(d.status) && new Date(d.merchant_response_deadline!) < now
    );

    const analytics = {
      // Summary metrics
      summary: {
        totalDisputes: allDisputes.length,
        openDisputes: openDisputes.length,
        resolvedDisputes: resolvedDisputes.length,
        disputes30d: disputes30d.length,
        disputes7d: disputes7d.length,
        disputeRateChange: Math.round(disputeRateChange * 10) / 10,
      },

      // Financial metrics
      financial: {
        totalAmount,
        openAmount,
        atRiskAmount,
        recoveredAmount,
        lostAmount,
        avgDisputeAmount: allDisputes.length > 0 ? totalAmount / allDisputes.length : 0,
      },

      // Performance metrics
      performance: {
        winRate: Math.round(winRate * 10) / 10,
        winRateChange: Math.round(winRateChange * 10) / 10,
        avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
        overdueResponses: overdueResponses.length,
      },

      // AI metrics
      ai: {
        accuracy: Math.round(aiAccuracy * 10) / 10,
        avgConfidence: Math.round(avgConfidence * 100),
        overrideRate: disputesWithAI.length > 0 ? Math.round((aiOverrides.length / disputesWithAI.length) * 100 * 10) / 10 : 0,
        recommendations: aiRecommendations,
        totalEvaluated: disputesWithAI.length,
      },

      // Breakdowns
      categoryBreakdown,
      statusBreakdown,
      monthlyTrend,
      topIssues,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching dispute analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
