import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List all automation rules
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

    // Get automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('usdy_automation_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (rulesError) {
      throw rulesError;
    }

    // Transform to frontend format
    const formattedRules = (rules || []).map((rule) => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      type: rule.type,
      enabled: rule.enabled,
      config: rule.config,
      percentage: rule.config?.percentage,
      threshold: rule.config?.threshold,
      schedule: rule.config?.schedule,
      sourceAccount: rule.config?.sourceAccount,
      totalDeposited: parseFloat(rule.total_deposited || '0'),
      executionCount: rule.execution_count,
      lastTriggeredAt: rule.last_triggered_at,
      nextScheduledAt: rule.next_scheduled_at,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at,
    }));

    return NextResponse.json({ rules: formattedRules });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation rules' },
      { status: 500 }
    );
  }
}

// POST: Create a new automation rule
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, description, type, config } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['percentage', 'threshold', 'scheduled'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid rule type' },
        { status: 400 }
      );
    }

    // Validate config based on type
    if (type === 'percentage' && (!config?.percentage || config.percentage <= 0 || config.percentage > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (type === 'threshold' && (!config?.threshold || config.threshold <= 0)) {
      return NextResponse.json(
        { error: 'Threshold must be a positive number' },
        { status: 400 }
      );
    }

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

    // Get treasury ID
    const { data: treasury } = await supabase
      .from('treasury_accounts')
      .select('id')
      .eq('organization_id', organizationId)
      .single();

    // Create the rule
    const { data: rule, error: createError } = await supabase
      .from('usdy_automation_rules')
      .insert({
        organization_id: organizationId,
        treasury_id: treasury?.id,
        name,
        description: description || '',
        type,
        config: config || {},
        enabled: true,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({
      rule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        enabled: rule.enabled,
        config: rule.config,
        percentage: rule.config?.percentage,
        threshold: rule.config?.threshold,
        schedule: rule.config?.schedule,
        sourceAccount: rule.config?.sourceAccount,
        totalDeposited: 0,
        executionCount: 0,
        createdAt: rule.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}
