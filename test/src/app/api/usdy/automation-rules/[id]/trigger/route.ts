import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Manually trigger an automation rule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));
    const { amount: customAmount } = body;

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

    // Get the rule
    const { data: rule, error: ruleError } = await supabase
      .from('usdy_automation_rules')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (ruleError || !rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Get treasury
    const { data: treasury, error: treasuryError } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (treasuryError || !treasury) {
      return NextResponse.json({ error: 'Treasury not found' }, { status: 404 });
    }

    // Calculate amount to transfer based on rule type
    let transferAmount: number;
    const operatingBalance = parseFloat(treasury.operating_balance || '0');

    if (customAmount && customAmount > 0) {
      // Use custom amount if provided
      transferAmount = customAmount;
    } else if (rule.type === 'percentage') {
      // Calculate percentage of operating balance
      const percentage = rule.config?.percentage || 0;
      transferAmount = (operatingBalance * percentage) / 100;
    } else if (rule.type === 'threshold') {
      // Transfer amount above threshold
      const threshold = rule.config?.threshold || 0;
      const targetBalance = rule.config?.targetBalance || threshold;
      transferAmount = Math.max(0, operatingBalance - targetBalance);
    } else if (rule.type === 'scheduled') {
      // Use fixed amount or percentage
      if (rule.config?.fixedAmount) {
        transferAmount = rule.config.fixedAmount;
      } else {
        const percentage = rule.config?.percentage || 10;
        transferAmount = (operatingBalance * percentage) / 100;
      }
    } else {
      return NextResponse.json(
        { error: 'Unknown rule type' },
        { status: 400 }
      );
    }

    // Validate transfer amount
    if (transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Calculated transfer amount is zero or negative' },
        { status: 400 }
      );
    }

    if (transferAmount > operatingBalance) {
      return NextResponse.json(
        { error: 'Insufficient operating balance' },
        { status: 400 }
      );
    }

    // Create automation log (pending)
    const { data: log, error: logError } = await supabase
      .from('usdy_automation_logs')
      .insert({
        rule_id: rule.id,
        organization_id: organizationId,
        treasury_id: treasury.id,
        amount: transferAmount,
        currency: 'USDC',
        status: 'processing',
        trigger_type: 'manual',
        metadata: {
          rule_name: rule.name,
          rule_type: rule.type,
          operating_balance_before: operatingBalance,
        },
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    // Execute the transfer (mock)
    const newOperatingBalance = operatingBalance - transferAmount;
    const newReserveBalance = parseFloat(treasury.reserve_balance || '0') + transferAmount;

    // Update treasury balances
    const { error: updateError } = await supabase
      .from('treasury_accounts')
      .update({
        operating_balance: newOperatingBalance,
        reserve_balance: newReserveBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', treasury.id);

    if (updateError) {
      // Mark log as failed
      await supabase
        .from('usdy_automation_logs')
        .update({
          status: 'failed',
          error_message: updateError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', log.id);

      throw updateError;
    }

    // Create treasury transaction
    await supabase
      .from('treasury_transactions')
      .insert({
        organization_id: organizationId,
        treasury_id: treasury.id,
        type: 'transfer_to_reserve',
        amount: transferAmount,
        currency: 'USDC',
        from_fund: 'operating',
        to_fund: 'reserve',
        status: 'completed',
        description: `Automation: ${rule.name}`,
        metadata: {
          automation_rule_id: rule.id,
          automation_log_id: log.id,
          trigger_type: 'manual',
        },
      });

    // Update automation log to completed
    await supabase
      .from('usdy_automation_logs')
      .update({
        status: 'completed',
        resulting_balance: newReserveBalance,
        completed_at: new Date().toISOString(),
      })
      .eq('id', log.id);

    // Update rule stats
    await supabase
      .from('usdy_automation_rules')
      .update({
        total_deposited: parseFloat(rule.total_deposited || '0') + transferAmount,
        execution_count: (rule.execution_count || 0) + 1,
        last_triggered_at: new Date().toISOString(),
      })
      .eq('id', rule.id);

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        ruleId: rule.id,
        ruleName: rule.name,
        amount: transferAmount,
        status: 'completed',
        triggerType: 'manual',
        newReserveBalance,
        timestamp: new Date().toISOString(),
      },
      message: `Successfully deposited $${transferAmount.toFixed(2)} to USDY via "${rule.name}"`,
    });
  } catch (error) {
    console.error('Error triggering automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to trigger automation rule' },
      { status: 500 }
    );
  }
}
