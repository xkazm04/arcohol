import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/credits/accounts/[id] - Get single credit account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('api_credit_accounts')
      .select(`
        *,
        customer:customers(id, company_name, contact_name, email, wallet_address)
      `)
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting credit account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/credits/accounts/[id] - Update credit account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.customerId !== undefined) updates.customer_id = body.customerId;
    if (body.lowBalanceThreshold !== undefined) updates.low_balance_threshold = body.lowBalanceThreshold;
    if (body.autoTopupEnabled !== undefined) updates.auto_topup_enabled = body.autoTopupEnabled;
    if (body.autoTopupAmount !== undefined) updates.auto_topup_amount = body.autoTopupAmount;
    if (body.autoTopupTrigger !== undefined) updates.auto_topup_trigger = body.autoTopupTrigger;
    if (body.autoTopupWallet !== undefined) updates.auto_topup_wallet = body.autoTopupWallet;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const { data, error } = await supabase
      .from('api_credit_accounts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating credit account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/credits/accounts/[id] - Suspend credit account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('org_profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.current_organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || 'Suspended by administrator';

    const { error } = await supabase
      .from('api_credit_accounts')
      .update({
        active: false,
        suspended_at: new Date().toISOString(),
        suspended_reason: reason,
      })
      .eq('id', id)
      .eq('organization_id', profile.current_organization_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error suspending credit account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
