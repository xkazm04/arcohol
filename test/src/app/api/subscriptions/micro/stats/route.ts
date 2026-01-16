import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET: Get micropayment subscription statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({
        stats: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          totalRevenue: '0',
          totalCharges: 0,
          avgChargeAmount: '0',
          revenueByDay: [],
        },
      });
    }

    // Get subscription counts
    const { data: subscriptions, error: subError } = await supabase
      .from('micro_subscriptions')
      .select('id, status, total_charged, charge_count')
      .eq('organization_id', profile.current_organization_id);

    if (subError && subError.code !== '42P01') {
      throw subError;
    }

    const totalSubscriptions = subscriptions?.length || 0;
    const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active').length || 0;

    // Calculate totals
    let totalRevenue = 0;
    let totalCharges = 0;
    (subscriptions || []).forEach((sub: any) => {
      totalRevenue += parseFloat(sub.total_charged || '0');
      totalCharges += sub.charge_count || 0;
    });

    const avgChargeAmount = totalCharges > 0 ? totalRevenue / totalCharges : 0;

    // Get 30-day charge history for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: charges, error: chargeError } = await supabase
      .from('micro_charges')
      .select('amount, created_at, micro_subscription:micro_subscriptions!inner(organization_id)')
      .eq('micro_subscription.organization_id', profile.current_organization_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const revenueByDay: Record<string, { revenue: number; charges: number }> = {};
    (charges || []).forEach((charge: any) => {
      const date = charge.created_at.split('T')[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, charges: 0 };
      }
      revenueByDay[date].revenue += parseFloat(charge.amount || '0');
      revenueByDay[date].charges += 1;
    });

    const revenueByDayArray = Object.entries(revenueByDay)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue.toFixed(6),
        charges: data.charges,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue: totalRevenue.toFixed(6),
        totalCharges,
        avgChargeAmount: avgChargeAmount.toFixed(6),
        revenueByDay: revenueByDayArray,
      },
    });
  } catch (error) {
    console.error('Error fetching micro subscription stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
