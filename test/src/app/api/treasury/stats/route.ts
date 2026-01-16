import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain') || 'arc-testnet';

    // Get the organization from the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = profile.current_organization_id;

    // Check if user has an API key for this chain
    const { data: apiKeys, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, wallet_address, chain')
      .eq('organization_id', organizationId)
      .eq('chain', chain)
      .is('revoked_at', null);

    if (apiKeyError) {
      console.error('Error fetching API keys:', apiKeyError);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    // If no API key exists for this chain, return noApiKey response
    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        noApiKey: true,
        chain,
        message: `No API key configured for ${chain}. Create an API key to view treasury stats.`,
      });
    }

    // Get treasury account data
    const { data: treasury } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    // Get current APY (default 5.2% if not found)
    const { data: apyData } = await supabase
      .from('usdy_apy_history')
      .select('apy_rate')
      .eq('chain', chain.replace('arc-', ''))
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    const currentApy = apyData?.apy_rate ? apyData.apy_rate * 100 : 5.2;

    // Calculate balances
    const operatingBalance = treasury?.operating_balance || 0;
    const yieldReserve = treasury?.reserve_balance || 0;
    const totalAssets = operatingBalance + yieldReserve;

    // Calculate yield projections
    const dailyYield = (yieldReserve * (currentApy / 100)) / 365;
    const projectedAnnual = yieldReserve * (currentApy / 100);

    // Get today's earned yield
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAccrual } = await supabase
      .from('usdy_yield_accruals')
      .select('yield_amount')
      .eq('organization_id', organizationId)
      .eq('date', today)
      .single();

    // Get YTD yield
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const { data: ytdAccruals } = await supabase
      .from('usdy_yield_accruals')
      .select('yield_amount')
      .eq('organization_id', organizationId)
      .gte('date', startOfYear);

    const earnedToday = todayAccrual?.yield_amount ? parseFloat(todayAccrual.yield_amount) : dailyYield;
    const earnedYtd = ytdAccruals?.reduce((sum, a) => sum + parseFloat(a.yield_amount), 0) || 0;

    return NextResponse.json({
      totalAssets,
      operatingBalance,
      yieldReserve,
      pendingStake: treasury?.operating_pending || 0,
      pendingUnstake: treasury?.reserve_pending || 0,
      currentApy,
      earnedToday,
      earnedYtd,
      projectedAnnual,
      accountId: apiKeys[0].id,
      chain,
      status: treasury?.status || 'active',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching treasury stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treasury stats' },
      { status: 500 }
    );
  }
}
