import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingEngine } from '@/features/billing';

/**
 * Manual billing run endpoint
 * Requires authentication and admin permissions
 */
export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json().catch(() => ({}));
    const { subscriptionIds, dryRun } = body as {
      subscriptionIds?: string[];
      dryRun?: boolean;
    };

    console.log('[Billing] Manual run requested:', {
      userId: user.id,
      subscriptionIds: subscriptionIds?.length ?? 'all',
      dryRun,
    });

    // Run billing cycle
    const result = await billingEngine.runBillingCycle({
      subscriptionIds,
      dryRun,
    });

    return NextResponse.json({
      success: true,
      cycleId: result.cycleId,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
      jobs: result.jobs,
    });
  } catch (error) {
    console.error('[Billing] Manual run error:', error);
    return NextResponse.json(
      { error: 'Billing run failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
