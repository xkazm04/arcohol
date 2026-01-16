import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reminderScheduler } from '@/features/invoices';
import type { UpdateReminderRuleParams } from '@/features/invoices';

// GET - Get single reminder rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rule = await reminderScheduler.getRule(id);

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('[API] Get reminder rule error:', error);
    return NextResponse.json(
      { error: 'Failed to get reminder rule' },
      { status: 500 }
    );
  }
}

// PATCH - Update reminder rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as UpdateReminderRuleParams;
    const rule = await reminderScheduler.updateRule(id, body);

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error('[API] Update reminder rule error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder rule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete reminder rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await reminderScheduler.deleteRule(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete reminder rule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder rule' },
      { status: 500 }
    );
  }
}
