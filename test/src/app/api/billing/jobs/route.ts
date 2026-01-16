import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingEngine, type BillingJobStatus } from '@/features/billing';

/**
 * List billing jobs endpoint
 */
export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as BillingJobStatus | null;
    const subscriptionId = searchParams.get('subscriptionId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch billing jobs
    const { jobs, total } = await billingEngine.listBillingJobs({
      status: status || undefined,
      subscriptionId: subscriptionId || undefined,
      organizationId,
      limit,
      offset,
    });

    return NextResponse.json({
      jobs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Billing] List jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to list billing jobs' },
      { status: 500 }
    );
  }
}
