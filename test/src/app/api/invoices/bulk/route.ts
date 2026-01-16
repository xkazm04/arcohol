import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { accountingExport, auditLogger } from '@/features/invoices';
import type { BulkActionRequest, BulkActionResult } from '@/features/invoices';

// POST - Execute bulk action
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

    const body = (await request.json()) as BulkActionRequest;

    // Validate request
    if (!body.invoiceIds || body.invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'invoiceIds is required' },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const result: BulkActionResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    // Verify all invoices belong to the organization
    const { data: invoices, error: invoicesError } = await adminSupabase
      .from('invoices')
      .select('id, status, customer_id')
      .in('id', body.invoiceIds)
      .eq('organization_id', userData.organization_id);

    if (invoicesError || !invoices) {
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    const validInvoiceIds = invoices.map((inv) => inv.id);
    const actor = { type: 'user' as const, id: user.id, email: user.email };

    switch (body.action) {
      case 'send': {
        // Import email service
        const { emailService } = await import('@/features/invoices/services/email-service');

        for (const invoice of invoices) {
          if (invoice.status !== 'draft') {
            result.errors?.push({
              invoiceId: invoice.id,
              error: 'Can only send draft invoices',
            });
            result.failed++;
            continue;
          }

          try {
            const sendResult = await emailService.sendInvoice(invoice.id);
            if (sendResult.success) {
              result.processed++;
            } else {
              result.errors?.push({
                invoiceId: invoice.id,
                error: sendResult.error || 'Failed to send',
              });
              result.failed++;
            }
          } catch (err) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            result.failed++;
          }
        }
        break;
      }

      case 'remind': {
        const { emailService } = await import('@/features/invoices/services/email-service');

        for (const invoice of invoices) {
          if (['draft', 'paid', 'canceled'].includes(invoice.status)) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: 'Cannot send reminder for this invoice status',
            });
            result.failed++;
            continue;
          }

          try {
            const sendResult = await emailService.sendReminder(invoice.id);
            if (sendResult.success) {
              result.processed++;
            } else {
              result.errors?.push({
                invoiceId: invoice.id,
                error: sendResult.error || 'Failed to send reminder',
              });
              result.failed++;
            }
          } catch (err) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            result.failed++;
          }
        }
        break;
      }

      case 'cancel': {
        const reason = body.options?.reason || 'Bulk canceled';

        for (const invoice of invoices) {
          if (['paid', 'canceled'].includes(invoice.status)) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: 'Cannot cancel this invoice',
            });
            result.failed++;
            continue;
          }

          try {
            await adminSupabase
              .from('invoices')
              .update({ status: 'canceled' })
              .eq('id', invoice.id);

            await auditLogger.logCanceled(invoice.id, actor, reason);
            result.processed++;
          } catch (err) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            result.failed++;
          }
        }
        break;
      }

      case 'delete': {
        for (const invoice of invoices) {
          if (invoice.status !== 'draft') {
            result.errors?.push({
              invoiceId: invoice.id,
              error: 'Can only delete draft invoices',
            });
            result.failed++;
            continue;
          }

          try {
            await adminSupabase.from('invoices').delete().eq('id', invoice.id);
            result.processed++;
          } catch (err) {
            result.errors?.push({
              invoiceId: invoice.id,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            result.failed++;
          }
        }
        break;
      }

      case 'export': {
        const format = body.options?.format || 'csv';

        try {
          // Get full invoice data
          const { data: fullInvoices } = await adminSupabase
            .from('invoices')
            .select(`
              *,
              customer:customers(company_name, email),
              payments:invoice_payments(*)
            `)
            .in('id', validInvoiceIds);

          if (!fullInvoices) {
            return NextResponse.json(
              { error: 'Failed to fetch invoices for export' },
              { status: 500 }
            );
          }

          const exportResult = await accountingExport.exportInvoices({
            organizationId: userData.organization_id,
            format: format as 'csv' | 'excel' | 'json',
            includePayments: true,
            includeLineItems: true,
          });

          result.processed = fullInvoices.length;
          result.exportUrl = exportResult.url;
        } catch (err) {
          result.success = false;
          result.errors?.push({
            invoiceId: 'bulk-export',
            error: err instanceof Error ? err.message : 'Export failed',
          });
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${body.action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute bulk action' },
      { status: 500 }
    );
  }
}
