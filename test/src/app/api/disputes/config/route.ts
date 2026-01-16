import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Default configuration values
const DEFAULT_CONFIG = {
  enabled: false,
  reservePercentage: 2,
  reserveCap: 5000,
  reserveBalance: 0,
  autoApproveThreshold: 0.85,
  autoDenyThreshold: 0.75,
  responseWindowHours: 72,
  webhookUrl: null,
  alertEmail: null,
  webhookEvents: ['dispute.created', 'dispute.resolved'],
};

// GET - Fetch dispute protection configuration
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = profile.current_organization_id;

    // Check for API key (any chain)
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id')
      .eq('organization_id', organizationId)
      .is('revoked_at', null);

    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        noApiKey: true,
        message: 'No API key configured. Create an API key first.',
      });
    }

    // Try to get existing config
    const { data: config, error: configError } = await supabase
      .from('dispute_protection_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    // If no config exists, return default
    if (configError || !config) {
      return NextResponse.json({
        id: null,
        organizationId,
        ...DEFAULT_CONFIG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Return existing config with camelCase keys
    return NextResponse.json({
      id: config.id,
      organizationId: config.organization_id,
      enabled: config.enabled,
      reservePercentage: config.reserve_percentage,
      reserveCap: config.reserve_cap,
      reserveBalance: config.reserve_balance,
      autoApproveThreshold: config.auto_approve_threshold,
      autoDenyThreshold: config.auto_deny_threshold,
      responseWindowHours: config.response_window_hours,
      webhookUrl: config.webhook_url,
      alertEmail: config.alert_email,
      webhookEvents: config.webhook_events || DEFAULT_CONFIG.webhookEvents,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    });
  } catch (error) {
    console.error('Error fetching dispute config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute configuration' },
      { status: 500 }
    );
  }
}

// PATCH - Update dispute protection configuration
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = profile.current_organization_id;

    // Validate thresholds
    if (body.autoApproveThreshold !== undefined) {
      if (body.autoApproveThreshold < 0 || body.autoApproveThreshold > 1) {
        return NextResponse.json(
          { error: 'Auto-approve threshold must be between 0 and 1' },
          { status: 400 }
        );
      }
    }

    if (body.autoDenyThreshold !== undefined) {
      if (body.autoDenyThreshold < 0 || body.autoDenyThreshold > 1) {
        return NextResponse.json(
          { error: 'Auto-deny threshold must be between 0 and 1' },
          { status: 400 }
        );
      }
    }

    // Map camelCase to snake_case for database
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.enabled !== undefined) dbUpdates.enabled = body.enabled;
    if (body.reservePercentage !== undefined) dbUpdates.reserve_percentage = body.reservePercentage;
    if (body.reserveCap !== undefined) dbUpdates.reserve_cap = body.reserveCap;
    if (body.autoApproveThreshold !== undefined) dbUpdates.auto_approve_threshold = body.autoApproveThreshold;
    if (body.autoDenyThreshold !== undefined) dbUpdates.auto_deny_threshold = body.autoDenyThreshold;
    if (body.responseWindowHours !== undefined) dbUpdates.response_window_hours = body.responseWindowHours;
    if (body.webhookUrl !== undefined) dbUpdates.webhook_url = body.webhookUrl || null;
    if (body.alertEmail !== undefined) dbUpdates.alert_email = body.alertEmail || null;
    if (body.webhookEvents !== undefined) dbUpdates.webhook_events = body.webhookEvents;

    // Check if config exists
    const { data: existingConfig } = await supabase
      .from('dispute_protection_configs')
      .select('id')
      .eq('organization_id', organizationId)
      .single();

    let config;

    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from('dispute_protection_configs')
        .update(dbUpdates)
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      config = data;
    } else {
      // Create new config with defaults
      const { data, error } = await supabase
        .from('dispute_protection_configs')
        .insert({
          organization_id: organizationId,
          enabled: body.enabled ?? DEFAULT_CONFIG.enabled,
          reserve_percentage: body.reservePercentage ?? DEFAULT_CONFIG.reservePercentage,
          reserve_cap: body.reserveCap ?? DEFAULT_CONFIG.reserveCap,
          reserve_balance: DEFAULT_CONFIG.reserveBalance,
          auto_approve_threshold: body.autoApproveThreshold ?? DEFAULT_CONFIG.autoApproveThreshold,
          auto_deny_threshold: body.autoDenyThreshold ?? DEFAULT_CONFIG.autoDenyThreshold,
          response_window_hours: body.responseWindowHours ?? DEFAULT_CONFIG.responseWindowHours,
          webhook_url: body.webhookUrl || null,
          alert_email: body.alertEmail || null,
          webhook_events: body.webhookEvents ?? DEFAULT_CONFIG.webhookEvents,
        })
        .select()
        .single();

      if (error) throw error;
      config = data;
    }

    return NextResponse.json({
      id: config.id,
      organizationId: config.organization_id,
      enabled: config.enabled,
      reservePercentage: config.reserve_percentage,
      reserveCap: config.reserve_cap,
      reserveBalance: config.reserve_balance,
      autoApproveThreshold: config.auto_approve_threshold,
      autoDenyThreshold: config.auto_deny_threshold,
      responseWindowHours: config.response_window_hours,
      webhookUrl: config.webhook_url,
      alertEmail: config.alert_email,
      webhookEvents: config.webhook_events || DEFAULT_CONFIG.webhookEvents,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    });
  } catch (error) {
    console.error('Error updating dispute config:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute configuration' },
      { status: 500 }
    );
  }
}
