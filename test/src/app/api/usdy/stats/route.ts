import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the organization from the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = userData.organization_id;

    // Get treasury account with USDY balance
    const { data: treasury, error: treasuryError } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    // Get current APY from history
    const { data: apyData } = await supabase
      .from('usdy_apy_history')
      .select('apy_rate')
      .eq('chain', 'arc')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    // Get yield accruals for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyAccruals } = await supabase
      .from('usdy_yield_accruals')
      .select('yield_amount')
      .eq('organization_id', organizationId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    // Get all-time yield
    const { data: allTimeAccruals } = await supabase
      .from('usdy_yield_accruals')
      .select('yield_amount')
      .eq('organization_id', organizationId);

    // Get automation stats
    const { data: automationRules } = await supabase
      .from('usdy_automation_rules')
      .select('enabled, total_deposited')
      .eq('organization_id', organizationId);

    // Calculate stats
    const totalBalance = treasury?.reserve_balance || 0;
    const currentApy = apyData?.apy_rate || 0.052; // Default 5.2%
    const earnedThisMonth = monthlyAccruals?.reduce((sum, a) => sum + parseFloat(a.yield_amount), 0) || 0;
    const earnedAllTime = allTimeAccruals?.reduce((sum, a) => sum + parseFloat(a.yield_amount), 0) || 0;
    const automatedDeposits = automationRules?.reduce((sum, r) => sum + parseFloat(r.total_deposited || '0'), 0) || 0;
    const activeRulesCount = automationRules?.filter(r => r.enabled).length || 0;

    // Calculate daily yield estimate
    const dailyYield = (totalBalance * currentApy) / 365;

    // Calculate projected monthly yield
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projectedMonthlyYield = dailyYield * daysInMonth;

    return NextResponse.json({
      totalBalance,
      currentApy: currentApy * 100, // Convert to percentage
      earnedThisMonth,
      earnedAllTime,
      dailyYield,
      projectedMonthlyYield,
      automatedDeposits,
      activeRulesCount,
      pendingDeposits: 0, // TODO: Calculate from pending transactions
      chain: 'arc',
      currency: 'USDY',
    });
  } catch (error) {
    console.error('Error fetching USDY stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch USDY stats' },
      { status: 500 }
    );
  }
}
