import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/usage - Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const endpointId = searchParams.get('endpointId');
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    // Build query
    let query = supabase
      .from('api_usage_logs')
      .select('price_charged, response_status, response_time_ms, endpoint_id, created_at')
      .eq('organization_id', profile.current_organization_id)
      .gte('created_at', startDate.toISOString());

    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    if (endpointId) {
      query = query.eq('endpoint_id', endpointId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const logs = data || [];

    // Calculate aggregates
    const totalRequests = logs.length;
    const totalRevenue = logs.reduce((sum, log) => sum + Number(log.price_charged), 0);
    const responseTimes = logs.filter(l => l.response_time_ms).map(l => l.response_time_ms!);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    const successCount = logs.filter(l => l.response_status && l.response_status >= 200 && l.response_status < 300).length;
    const errorCount = logs.filter(l => l.response_status && l.response_status >= 400).length;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 100;

    // Group by day for chart
    const byDay: Record<string, { requests: number; revenue: number }> = {};
    for (const log of logs) {
      const day = log.created_at.split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { requests: 0, revenue: 0 };
      }
      byDay[day].requests++;
      byDay[day].revenue += Number(log.price_charged);
    }

    const dailyData = Object.entries(byDay)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group by endpoint
    const byEndpoint: Record<string, { requests: number; revenue: number }> = {};
    for (const log of logs) {
      const key = log.endpoint_id || 'unknown';
      if (!byEndpoint[key]) {
        byEndpoint[key] = { requests: 0, revenue: 0 };
      }
      byEndpoint[key].requests++;
      byEndpoint[key].revenue += Number(log.price_charged);
    }

    // Get endpoint details
    const endpointIds = Object.keys(byEndpoint).filter(id => id !== 'unknown');
    let endpointDetails: Record<string, { path: string; method: string }> = {};

    if (endpointIds.length > 0) {
      const { data: endpoints } = await supabase
        .from('api_credit_endpoints')
        .select('id, path, method')
        .in('id', endpointIds);

      for (const ep of endpoints || []) {
        endpointDetails[ep.id] = { path: ep.path, method: ep.method };
      }
    }

    const endpointStats = Object.entries(byEndpoint).map(([id, stats]) => ({
      endpointId: id,
      path: endpointDetails[id]?.path || 'Unknown',
      method: endpointDetails[id]?.method || '-',
      ...stats,
    }));

    return NextResponse.json({
      period,
      summary: {
        totalRequests,
        totalRevenue,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate * 10) / 10,
        successCount,
        errorCount,
      },
      daily: dailyData,
      byEndpoint: endpointStats,
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
