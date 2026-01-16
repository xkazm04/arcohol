/**
 * Accounting Export Service
 * Export invoices to various formats for accounting systems
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ExportParams,
  ExportResult,
  ExportFormat,
  Invoice,
  InvoiceStatus,
  InvoicePayment,
} from '../types';

/**
 * Accounting Export Service - Singleton
 */
class AccountingExportService {
  private static instance: AccountingExportService;

  private constructor() {}

  static getInstance(): AccountingExportService {
    if (!AccountingExportService.instance) {
      AccountingExportService.instance = new AccountingExportService();
    }
    return AccountingExportService.instance;
  }

  /**
   * Export invoices to specified format
   */
  async exportInvoices(params: ExportParams): Promise<ExportResult> {
    const invoices = await this.fetchInvoicesForExport(params);

    if (invoices.length === 0) {
      return {
        success: true,
        recordCount: 0,
        generatedAt: new Date().toISOString(),
      };
    }

    let data: string;
    let contentType: string;
    let fileExtension: string;

    switch (params.format) {
      case 'csv':
        data = this.generateCSV(invoices, params);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;

      case 'excel':
        // For Excel, we generate CSV with Excel-specific formatting
        // In production, you'd use a library like exceljs
        data = this.generateExcelCSV(invoices, params);
        contentType = 'application/vnd.ms-excel';
        fileExtension = 'csv';
        break;

      case 'json':
        data = this.generateJSON(invoices, params);
        contentType = 'application/json';
        fileExtension = 'json';
        break;

      default:
        throw new Error(`Unsupported export format: ${params.format}`);
    }

    // Store in Supabase storage
    const fileName = this.generateFileName(params, fileExtension);
    const url = await this.storeExport(params.organizationId, fileName, data, contentType);

    return {
      success: true,
      url,
      fileName,
      recordCount: invoices.length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Export invoices to CSV format
   */
  async exportToCSV(params: ExportParams): Promise<string> {
    const invoices = await this.fetchInvoicesForExport(params);
    return this.generateCSV(invoices, params);
  }

  /**
   * Export invoices to Excel-compatible format
   */
  async exportToExcel(params: ExportParams): Promise<string> {
    const invoices = await this.fetchInvoicesForExport(params);
    return this.generateExcelCSV(invoices, params);
  }

  /**
   * Export invoices to JSON format
   */
  async exportToJSON(params: ExportParams): Promise<string> {
    const invoices = await this.fetchInvoicesForExport(params);
    return this.generateJSON(invoices, params);
  }

  /**
   * Generate an accounting summary report
   */
  async generateAccountingReport(params: {
    organizationId: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    summary: {
      totalInvoices: number;
      totalRevenue: number;
      totalTax: number;
      totalOutstanding: number;
      totalPaid: number;
    };
    byStatus: Record<InvoiceStatus, { count: number; amount: number }>;
    byMonth: Array<{ month: string; invoiced: number; collected: number }>;
  }> {
    const supabase = createAdminClient();

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', params.organizationId);

    if (params.fromDate) {
      query = query.gte('created_at', params.fromDate);
    }
    if (params.toDate) {
      query = query.lte('created_at', params.toDate);
    }

    const { data: invoices } = await query;

    if (!invoices || invoices.length === 0) {
      return {
        summary: {
          totalInvoices: 0,
          totalRevenue: 0,
          totalTax: 0,
          totalOutstanding: 0,
          totalPaid: 0,
        },
        byStatus: {} as Record<InvoiceStatus, { count: number; amount: number }>,
        byMonth: [],
      };
    }

    // Calculate summary
    const summary = {
      totalInvoices: invoices.length,
      totalRevenue: 0,
      totalTax: 0,
      totalOutstanding: 0,
      totalPaid: 0,
    };

    const byStatus: Record<string, { count: number; amount: number }> = {};
    const byMonthMap: Record<string, { invoiced: number; collected: number }> = {};

    for (const inv of invoices) {
      const amount = parseFloat(inv.amount) || 0;
      const taxAmount = parseFloat(inv.tax_amount) || 0;

      summary.totalRevenue += amount;
      summary.totalTax += taxAmount;

      if (inv.status === 'paid') {
        summary.totalPaid += amount;
      } else if (!['canceled', 'draft'].includes(inv.status)) {
        summary.totalOutstanding += amount;
      }

      // By status
      if (!byStatus[inv.status]) {
        byStatus[inv.status] = { count: 0, amount: 0 };
      }
      byStatus[inv.status].count++;
      byStatus[inv.status].amount += amount;

      // By month
      const month = inv.created_at.substring(0, 7); // YYYY-MM
      if (!byMonthMap[month]) {
        byMonthMap[month] = { invoiced: 0, collected: 0 };
      }
      byMonthMap[month].invoiced += amount;
      if (inv.status === 'paid') {
        byMonthMap[month].collected += amount;
      }
    }

    const byMonth = Object.entries(byMonthMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary,
      byStatus: byStatus as Record<InvoiceStatus, { count: number; amount: number }>,
      byMonth,
    };
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * Fetch invoices for export with optional joins
   */
  private async fetchInvoicesForExport(
    params: ExportParams
  ): Promise<Array<Record<string, unknown>>> {
    const supabase = createAdminClient();

    let selectFields = `
      *,
      customer:customers(company_name, contact_name, email)
    `;

    if (params.includePayments) {
      selectFields += `,
        payments:invoice_payments(*)
      `;
    }

    let query = supabase
      .from('invoices')
      .select(selectFields)
      .eq('organization_id', params.organizationId)
      .order('created_at', { ascending: false });

    if (params.fromDate) {
      query = query.gte('created_at', params.fromDate);
    }
    if (params.toDate) {
      query = query.lte('created_at', params.toDate);
    }
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AccountingExport] Failed to fetch invoices:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Generate CSV content
   */
  private generateCSV(
    invoices: Array<Record<string, unknown>>,
    params: ExportParams
  ): string {
    const headers = [
      'Invoice Number',
      'Reference',
      'Customer',
      'Customer Email',
      'Issue Date',
      'Due Date',
      'Status',
      'Subtotal',
      'Tax Amount',
      'Total Amount',
      'Currency',
      'Paid At',
    ];

    if (params.includeLineItems) {
      headers.push('Line Items');
    }

    if (params.includePayments) {
      headers.push('Payments');
    }

    const rows = invoices.map((inv) => {
      const customer = inv.customer as { company_name?: string; email?: string } | null;

      const row = [
        inv.invoice_number || inv.reference,
        inv.reference,
        customer?.company_name || '',
        customer?.email || '',
        this.formatDate(inv.created_at as string),
        this.formatDate(inv.due_date as string),
        inv.status,
        this.formatAmount(inv.subtotal as number),
        this.formatAmount(inv.tax_amount as number),
        this.formatAmount(inv.amount as number),
        inv.currency || 'USDC',
        inv.paid_at ? this.formatDate(inv.paid_at as string) : '',
      ];

      if (params.includeLineItems) {
        const lineItems = inv.line_items as Array<{ description: string; quantity: number; unitPrice: number }>;
        row.push(
          lineItems
            ?.map((li) => `${li.description} (${li.quantity} x ${li.unitPrice})`)
            .join('; ') || ''
        );
      }

      if (params.includePayments) {
        const payments = inv.payments as Array<{ amount: number; paid_at: string; tx_hash?: string }>;
        row.push(
          payments
            ?.map((p) => `${this.formatAmount(p.amount)} on ${this.formatDate(p.paid_at)}`)
            .join('; ') || ''
        );
      }

      return row;
    });

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Generate Excel-compatible CSV (UTF-8 BOM for proper encoding)
   */
  private generateExcelCSV(
    invoices: Array<Record<string, unknown>>,
    params: ExportParams
  ): string {
    const csv = this.generateCSV(invoices, params);
    // Add UTF-8 BOM for Excel compatibility
    return '\uFEFF' + csv;
  }

  /**
   * Generate JSON content
   */
  private generateJSON(
    invoices: Array<Record<string, unknown>>,
    params: ExportParams
  ): string {
    const exportData = invoices.map((inv) => {
      const customer = inv.customer as { company_name?: string; email?: string } | null;

      const record: Record<string, unknown> = {
        invoiceNumber: inv.invoice_number || inv.reference,
        reference: inv.reference,
        customer: {
          name: customer?.company_name,
          email: customer?.email,
        },
        issueDate: inv.created_at,
        dueDate: inv.due_date,
        status: inv.status,
        subtotal: inv.subtotal,
        taxAmount: inv.tax_amount,
        totalAmount: inv.amount,
        currency: inv.currency || 'USDC',
        paidAt: inv.paid_at,
      };

      if (params.includeLineItems) {
        record.lineItems = inv.line_items;
      }

      if (params.includePayments) {
        record.payments = inv.payments;
      }

      return record;
    });

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        parameters: {
          fromDate: params.fromDate,
          toDate: params.toDate,
          status: params.status,
        },
        count: exportData.length,
        invoices: exportData,
      },
      null,
      2
    );
  }

  /**
   * Convert array to CSV string
   */
  private arrayToCSV(data: Array<Array<string | number>>): string {
    return data
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');
  }

  /**
   * Format date for export
   */
  private formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  /**
   * Format amount for export
   */
  private formatAmount(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '0.00';
    return (typeof amount === 'number' ? amount : parseFloat(String(amount))).toFixed(2);
  }

  /**
   * Generate file name for export
   */
  private generateFileName(params: ExportParams, extension: string): string {
    const parts = ['invoices'];

    if (params.fromDate) {
      parts.push(`from-${params.fromDate.split('T')[0]}`);
    }
    if (params.toDate) {
      parts.push(`to-${params.toDate.split('T')[0]}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    parts.push(timestamp);

    return `${parts.join('-')}.${extension}`;
  }

  /**
   * Store export file in Supabase storage
   */
  private async storeExport(
    organizationId: string,
    fileName: string,
    data: string,
    contentType: string
  ): Promise<string> {
    const supabase = createAdminClient();

    const path = `exports/${organizationId}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(path, data, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('[AccountingExport] Failed to store export:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }
}

// Export singleton instance
export const accountingExport = AccountingExportService.getInstance();

// Export class for testing
export { AccountingExportService };
