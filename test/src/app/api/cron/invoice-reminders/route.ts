import { NextRequest, NextResponse } from 'next/server';
import { reminderScheduler, templateService } from '@/features/invoices';

/**
 * Cron endpoint for processing invoice reminders and scheduled sends
 * Configure in vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/invoice-reminders", "schedule": "0 9 * * *" }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting invoice reminders processing...');

    // Process pending reminders
    const reminderResult = await reminderScheduler.processPendingReminders();
    console.log('[Cron] Reminders processed:', reminderResult);

    // Process scheduled sends
    const sendResult = await reminderScheduler.processScheduledSends();
    console.log('[Cron] Scheduled sends processed:', sendResult);

    // Process recurring templates
    const templateResult = await templateService.processRecurringTemplates();
    console.log('[Cron] Recurring templates processed:', templateResult);

    // Process escalations
    const escalationResult = await reminderScheduler.processEscalations();
    console.log('[Cron] Escalations processed:', escalationResult);

    return NextResponse.json({
      success: true,
      reminders: reminderResult,
      scheduledSends: sendResult,
      recurringTemplates: templateResult,
      escalations: escalationResult,
    });
  } catch (error) {
    console.error('[Cron] Invoice reminders error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'invoice-reminders-cron',
    description: 'Processes pending reminders, scheduled sends, and recurring templates',
  });
}
