import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingEngine } from '@/features/billing';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Retry a failed billing job
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: jobId } = await params;
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

    // Verify the job belongs to the user's organization
    const job = await billingEngine.getBillingJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Billing job not found' }, { status: 404 });
    }

    if (job.organizationId !== userData.organization_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: `Cannot retry job with status: ${job.status}` },
        { status: 400 }
      );
    }

    console.log('[Billing] Retry requested:', { jobId, userId: user.id });

    // Retry the billing job
    const result = await billingEngine.retryBillingJob(jobId);

    return NextResponse.json({
      success: result.status === 'completed',
      job: result,
    });
  } catch (error) {
    console.error('[Billing] Retry error:', error);
    return NextResponse.json(
      { error: 'Failed to retry billing job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
