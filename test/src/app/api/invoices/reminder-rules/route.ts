import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reminderScheduler } from '@/features/invoices';
import type { CreateReminderRuleParams } from '@/features/invoices';

// GET - List reminder rules
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const rules = await reminderScheduler.listRules(userData.organization_id);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('[API] List reminder rules error:', error);
    return NextResponse.json(
      { error: 'Failed to list reminder rules' },
      { status: 500 }
    );
  }
}

// POST - Create reminder rule
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = (await request.json()) as CreateReminderRuleParams;

    // Validate required fields
    if (!body.name || !body.reminderDays || body.reminderDays.length === 0) {
      return NextResponse.json(
        { error: 'name and reminderDays are required' },
        { status: 400 }
      );
    }

    const rule = await reminderScheduler.createRule(userData.organization_id, body);

    if (!rule) {
      return NextResponse.json(
        { error: 'Failed to create reminder rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('[API] Create reminder rule error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder rule' },
      { status: 500 }
    );
  }
}
