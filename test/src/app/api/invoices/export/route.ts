import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { accountingExport } from '@/features/invoices';
import type { ExportParams, InvoiceStatus } from '@/features/invoices';

// GET - Export invoices
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

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel' | 'json';
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const statusParam = searchParams.get('status');
    const status = statusParam ? (statusParam.split(',') as InvoiceStatus[]) : undefined;
    const includePayments = searchParams.get('includePayments') === 'true';
    const includeLineItems = searchParams.get('includeLineItems') !== 'false'; // default true

    const params: ExportParams = {
      organizationId: userData.organization_id,
      format,
      fromDate,
      toDate,
      status,
      includePayments,
      includeLineItems,
    };

    const result = await accountingExport.exportInvoices(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Export invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    );
  }
}

// POST - Generate accounting report
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

    const body = await request.json();

    const report = await accountingExport.generateAccountingReport({
      organizationId: userData.organization_id,
      fromDate: body.fromDate,
      toDate: body.toDate,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('[API] Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
