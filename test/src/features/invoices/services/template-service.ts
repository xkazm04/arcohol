/**
 * Invoice Template Service
 * Manage invoice templates and generate invoices from templates
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { invoiceNumbering } from './invoice-numbering';
import { reminderScheduler } from './reminder-scheduler';
import { auditLogger } from './audit-logger';
import type {
  InvoiceTemplate,
  CreateTemplateParams,
  UpdateTemplateParams,
  Invoice,
  InvoiceLineItem,
  RecurrenceInterval,
} from '../types';

/**
 * Invoice Template Service - Singleton
 */
class InvoiceTemplateService {
  private static instance: InvoiceTemplateService;

  private constructor() {}

  static getInstance(): InvoiceTemplateService {
    if (!InvoiceTemplateService.instance) {
      InvoiceTemplateService.instance = new InvoiceTemplateService();
    }
    return InvoiceTemplateService.instance;
  }

  /**
   * Create a new invoice template
   */
  async createTemplate(
    organizationId: string,
    params: CreateTemplateParams
  ): Promise<InvoiceTemplate | null> {
    const supabase = createAdminClient();

    // Calculate line items with totals
    const lineItems: InvoiceLineItem[] = params.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        organization_id: organizationId,
        name: params.name,
        customer_id: params.customerId || null,
        line_items: lineItems,
        notes: params.notes || null,
        terms: params.terms || null,
        tax_rate: params.taxRate ?? 0,
        currency: params.currency || 'USDC',
        recurrence_enabled: params.recurrenceEnabled ?? false,
        recurrence_interval: params.recurrenceInterval || null,
        recurrence_day: params.recurrenceDay || null,
        next_invoice_date: params.nextInvoiceDate || null,
        auto_send: params.autoSend ?? false,
        days_until_due: params.daysUntilDue ?? 30,
        reminder_rule_id: params.reminderRuleId || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[TemplateService] Failed to create template:', error);
      return null;
    }

    return this.transformTemplate(data);
  }

  /**
   * Get a template by ID
   */
  async getTemplate(templateId: string): Promise<InvoiceTemplate | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_templates')
      .select(`
        *,
        customer:customers(id, company_name, email)
      `)
      .eq('id', templateId)
      .single();

    if (error || !data) return null;

    return this.transformTemplate(data);
  }

  /**
   * List all templates for an organization
   */
  async listTemplates(organizationId: string): Promise<InvoiceTemplate[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_templates')
      .select(`
        *,
        customer:customers(id, company_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.transformTemplate);
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    params: UpdateTemplateParams
  ): Promise<InvoiceTemplate | null> {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.customerId !== undefined) updateData.customer_id = params.customerId;
    if (params.lineItems !== undefined) {
      updateData.line_items = params.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));
    }
    if (params.notes !== undefined) updateData.notes = params.notes;
    if (params.terms !== undefined) updateData.terms = params.terms;
    if (params.taxRate !== undefined) updateData.tax_rate = params.taxRate;
    if (params.currency !== undefined) updateData.currency = params.currency;
    if (params.recurrenceEnabled !== undefined) {
      updateData.recurrence_enabled = params.recurrenceEnabled;
    }
    if (params.recurrenceInterval !== undefined) {
      updateData.recurrence_interval = params.recurrenceInterval;
    }
    if (params.recurrenceDay !== undefined) {
      updateData.recurrence_day = params.recurrenceDay;
    }
    if (params.nextInvoiceDate !== undefined) {
      updateData.next_invoice_date = params.nextInvoiceDate;
    }
    if (params.autoSend !== undefined) updateData.auto_send = params.autoSend;
    if (params.daysUntilDue !== undefined) {
      updateData.days_until_due = params.daysUntilDue;
    }
    if (params.reminderRuleId !== undefined) {
      updateData.reminder_rule_id = params.reminderRuleId;
    }

    const { data, error } = await supabase
      .from('invoice_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error || !data) return null;

    return this.transformTemplate(data);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', templateId);

    return !error;
  }

  /**
   * Generate an invoice from a template
   */
  async generateInvoice(
    templateId: string,
    options?: {
      customerId?: string;
      dueDate?: Date;
      autoSend?: boolean;
    }
  ): Promise<Invoice | null> {
    const supabase = createAdminClient();

    // Get the template
    const template = await this.getTemplate(templateId);
    if (!template) {
      console.error('[TemplateService] Template not found:', templateId);
      return null;
    }

    // Determine customer
    const customerId = options?.customerId || template.customerId;
    if (!customerId) {
      console.error('[TemplateService] No customer specified for invoice');
      return null;
    }

    // Get customer details
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (!customer) {
      console.error('[TemplateService] Customer not found:', customerId);
      return null;
    }

    // Calculate due date
    const dueDate =
      options?.dueDate ||
      new Date(Date.now() + template.daysUntilDue * 24 * 60 * 60 * 1000);

    // Calculate amounts
    const lineItems = template.lineItems;
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = template.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const amount = subtotal + taxAmount;
    const feeRate = 0.001; // 0.1%
    const feeAmount = amount * feeRate;
    const netAmount = amount - feeAmount;

    // Get invoice number
    const invoiceNumber = await invoiceNumbering.getNextInvoiceNumber(
      template.organizationId
    );

    // Create the invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        organization_id: template.organizationId,
        customer_id: customerId,
        reference: invoiceNumber,
        invoice_number: invoiceNumber,
        buyer: {
          company: customer.company_name,
          name: customer.contact_name,
          email: customer.email,
          walletAddress: customer.wallet_address,
        },
        line_items: lineItems,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        amount,
        fee_rate: feeRate,
        fee_amount: feeAmount,
        net_amount: netAmount,
        currency: template.currency,
        status: 'draft',
        due_date: dueDate.toISOString(),
        notes: template.notes,
        terms: template.terms,
        auto_send_reminders: true,
        reminder_rule_id: template.reminderRuleId,
        metadata: {
          templateId: template.id,
          templateName: template.name,
        },
      })
      .select()
      .single();

    if (error || !invoice) {
      console.error('[TemplateService] Failed to create invoice:', error);
      return null;
    }

    // Log audit event
    await auditLogger.logCreated(
      invoice.id,
      { reference: invoiceNumber, amount },
      { type: 'system' }
    );

    // Auto-send if requested
    const shouldAutoSend = options?.autoSend ?? template.autoSend;
    if (shouldAutoSend) {
      // Import email service lazily to avoid circular dependency
      const { emailService } = await import('./email-service');
      await emailService.sendInvoice(invoice.id);
    }

    return this.transformInvoice(invoice);
  }

  /**
   * Process recurring templates that are due
   * This should be called by a cron job
   */
  async processRecurringTemplates(): Promise<{
    processed: number;
    generated: number;
    failed: number;
  }> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    const result = { processed: 0, generated: 0, failed: 0 };

    // Get templates with recurrence enabled and next_invoice_date <= today
    const { data: templates, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('recurrence_enabled', true)
      .lte('next_invoice_date', today);

    if (error || !templates) {
      console.error('[TemplateService] Failed to fetch recurring templates:', error);
      return result;
    }

    for (const template of templates) {
      result.processed++;

      try {
        // Generate invoice
        const invoice = await this.generateInvoice(template.id, {
          autoSend: template.auto_send,
        });

        if (invoice) {
          result.generated++;

          // Calculate next invoice date
          const nextDate = this.calculateNextInvoiceDate(
            new Date(template.next_invoice_date),
            template.recurrence_interval as RecurrenceInterval,
            template.recurrence_day
          );

          // Update template with next date
          await supabase
            .from('invoice_templates')
            .update({
              next_invoice_date: nextDate.toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            })
            .eq('id', template.id);
        } else {
          result.failed++;
        }
      } catch (err) {
        console.error('[TemplateService] Failed to process template:', template.id, err);
        result.failed++;
      }
    }

    return result;
  }

  /**
   * Calculate the next invoice date based on recurrence settings
   */
  calculateNextInvoiceDate(
    currentDate: Date,
    interval: RecurrenceInterval,
    day?: number
  ): Date {
    const next = new Date(currentDate);

    switch (interval) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;

      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        if (day) {
          // Set to specific day, handling month end
          const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          next.setDate(Math.min(day, lastDay));
        }
        break;

      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        if (day) {
          const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          next.setDate(Math.min(day, lastDay));
        }
        break;

      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        if (day) {
          const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          next.setDate(Math.min(day, lastDay));
        }
        break;
    }

    return next;
  }

  /**
   * Clone a template
   */
  async cloneTemplate(
    templateId: string,
    newName: string
  ): Promise<InvoiceTemplate | null> {
    const template = await this.getTemplate(templateId);
    if (!template) return null;

    return this.createTemplate(template.organizationId, {
      name: newName,
      customerId: template.customerId,
      lineItems: template.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      notes: template.notes,
      terms: template.terms,
      taxRate: template.taxRate,
      currency: template.currency,
      recurrenceEnabled: template.recurrenceEnabled,
      recurrenceInterval: template.recurrenceInterval,
      recurrenceDay: template.recurrenceDay,
      autoSend: template.autoSend,
      daysUntilDue: template.daysUntilDue,
      reminderRuleId: template.reminderRuleId,
    });
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Transform database row to InvoiceTemplate
   */
  private transformTemplate(row: Record<string, unknown>): InvoiceTemplate {
    const customer = row.customer as { id: string; company_name?: string; email: string } | null;

    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      name: row.name as string,
      customerId: row.customer_id as string | undefined,
      customer: customer
        ? {
            id: customer.id,
            companyName: customer.company_name,
            email: customer.email,
          }
        : undefined,
      lineItems: row.line_items as InvoiceLineItem[],
      notes: row.notes as string | undefined,
      terms: row.terms as string | undefined,
      taxRate: parseFloat(row.tax_rate as string) || 0,
      currency: row.currency as string,
      recurrenceEnabled: row.recurrence_enabled as boolean,
      recurrenceInterval: row.recurrence_interval as RecurrenceInterval | undefined,
      recurrenceDay: row.recurrence_day as number | undefined,
      nextInvoiceDate: row.next_invoice_date as string | undefined,
      autoSend: row.auto_send as boolean,
      daysUntilDue: row.days_until_due as number,
      reminderRuleId: row.reminder_rule_id as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  /**
   * Transform database row to Invoice (simplified)
   */
  private transformInvoice(row: Record<string, unknown>): Invoice {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      customerId: row.customer_id as string,
      reference: row.reference as string,
      buyer: row.buyer as Invoice['buyer'],
      subtotal: parseFloat(row.subtotal as string) || 0,
      taxAmount: parseFloat(row.tax_amount as string) || 0,
      discountAmount: parseFloat(row.discount_amount as string) || 0,
      amount: parseFloat(row.amount as string) || 0,
      feeRate: parseFloat(row.fee_rate as string) || 0,
      feeAmount: parseFloat(row.fee_amount as string) || 0,
      netAmount: parseFloat(row.net_amount as string) || 0,
      currency: row.currency as string,
      status: row.status as Invoice['status'],
      issueDate: row.created_at as string,
      dueDate: row.due_date as string | undefined,
      lineItems: row.line_items as InvoiceLineItem[],
      notes: row.notes as string | undefined,
      terms: row.terms as string | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

// Export singleton instance
export const templateService = InvoiceTemplateService.getInstance();

// Export class for testing
export { InvoiceTemplateService };
