import { NextRequest, NextResponse } from 'next/server';
import { billingEngine, dunningService } from '@/features/billing';

/**
 * Vercel Cron endpoint for billing
 * Configured in vercel.json to run daily at 00:00 UTC
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (set in Vercel environment)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting billing cycle...');

    // Run billing cycle
    const billingResult = await billingEngine.runBillingCycle();

    console.log('[Cron] Billing cycle complete:', {
      total: billingResult.totalProcessed,
      successful: billingResult.successful,
      failed: billingResult.failed,
      skipped: billingResult.skipped,
    });

    // Process dunning escalations
    console.log('[Cron] Processing dunning escalations...');
    const dunningResult = await dunningService.processDunningEscalations();

    console.log('[Cron] Dunning complete:', dunningResult);

    return NextResponse.json({
      success: true,
      billing: {
        cycleId: billingResult.cycleId,
        startedAt: billingResult.startedAt,
        completedAt: billingResult.completedAt,
        totalProcessed: billingResult.totalProcessed,
        successful: billingResult.successful,
        failed: billingResult.failed,
        skipped: billingResult.skipped,
      },
      dunning: dunningResult,
    });
  } catch (error) {
    console.error('[Cron] Billing cron error:', error);
    return NextResponse.json(
      { error: 'Billing cron failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'billing-cron',
    nextRun: 'Configured in vercel.json',
  });
}
