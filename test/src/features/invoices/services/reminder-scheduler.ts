/**
 * Reminder Scheduler Service
 * Manages automatic invoice reminder sequences
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { emailService } from './email-service';
import { auditLogger } from './audit-logger';
import type {
  ReminderRule,
  ScheduledReminder,
  CreateReminderRuleParams,
  UpdateReminderRuleParams,
  ReminderType,
  ScheduledReminderStatus,
  Invoice,
} from '../types';

/**
 * Default reminder rule configuration
 */
const DEFAULT_REMINDER_DAYS = [-3, 0, 3, 7, 14]; // Days relative to due date
const DEFAULT_ESCALATE_AFTER_DAYS = 30;

/**
 * Reminder Scheduler Service - Singleton
 */
class ReminderSchedulerService {
  private static instance: ReminderSchedulerService;

  private constructor() {}

  static getInstance(): ReminderSchedulerService {
    if (!ReminderSchedulerService.instance) {
      ReminderSchedulerService.instance = new ReminderSchedulerService();
    }
    return ReminderSchedulerService.instance;
  }

  // ============================================================
  // Reminder Rules Management
  // ============================================================

  /**
   * Create a new reminder rule
   */
  async createRule(
    organizationId: string,
    params: CreateReminderRuleParams
  ): Promise<ReminderRule | null> {
    const supabase = createAdminClient();

    // If setting as default, unset other defaults
    if (params.isDefault) {
      await supabase
        .from('invoice_reminder_rules')
        .update({ is_default: false })
        .eq('organization_id', organizationId);
    }

    const { data, error } = await supabase
      .from('invoice_reminder_rules')
      .insert({
        organization_id: organizationId,
        name: params.name,
        is_default: params.isDefault ?? false,
        enabled: params.enabled ?? true,
        reminder_days: params.reminderDays,
        escalate_after_days: params.escalateAfterDays ?? DEFAULT_ESCALATE_AFTER_DAYS,
        escalation_action: params.escalationAction ?? 'none',
        include_pdf: params.includePdf ?? true,
        cc_internal_email: params.ccInternalEmail ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[ReminderScheduler] Failed to create rule:', error);
      return null;
    }

    return this.transformRule(data);
  }

  /**
   * Get a reminder rule by ID
   */
  async getRule(ruleId: string): Promise<ReminderRule | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_reminder_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error || !data) return null;

    return this.transformRule(data);
  }

  /**
   * Get the default reminder rule for an organization
   */
  async getDefaultRule(organizationId: string): Promise<ReminderRule | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_reminder_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_default', true)
      .eq('enabled', true)
      .single();

    if (error || !data) return null;

    return this.transformRule(data);
  }

  /**
   * List all reminder rules for an organization
   */
  async listRules(organizationId: string): Promise<ReminderRule[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_reminder_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(this.transformRule);
  }

  /**
   * Update a reminder rule
   */
  async updateRule(
    ruleId: string,
    params: UpdateReminderRuleParams
  ): Promise<ReminderRule | null> {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.name !== undefined) updateData.name = params.name;
    if (params.isDefault !== undefined) updateData.is_default = params.isDefault;
    if (params.enabled !== undefined) updateData.enabled = params.enabled;
    if (params.reminderDays !== undefined) updateData.reminder_days = params.reminderDays;
    if (params.escalateAfterDays !== undefined) {
      updateData.escalate_after_days = params.escalateAfterDays;
    }
    if (params.escalationAction !== undefined) {
      updateData.escalation_action = params.escalationAction;
    }
    if (params.includePdf !== undefined) updateData.include_pdf = params.includePdf;
    if (params.ccInternalEmail !== undefined) {
      updateData.cc_internal_email = params.ccInternalEmail;
    }

    const { data, error } = await supabase
      .from('invoice_reminder_rules')
      .update(updateData)
      .eq('id', ruleId)
      .select()
      .single();

    if (error || !data) return null;

    return this.transformRule(data);
  }

  /**
   * Delete a reminder rule
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    const supabase = createAdminClient();

    // First, remove all scheduled reminders using this rule
    await supabase
      .from('invoice_scheduled_reminders')
      .update({ rule_id: null })
      .eq('rule_id', ruleId);

    const { error } = await supabase
      .from('invoice_reminder_rules')
      .delete()
      .eq('id', ruleId);

    return !error;
  }

  // ============================================================
  // Scheduled Reminders Management
  // ============================================================

  /**
   * Schedule reminders for an invoice based on a rule
   */
  async scheduleReminders(
    invoiceId: string,
    ruleId?: string
  ): Promise<ScheduledReminder[]> {
    const supabase = createAdminClient();

    // Get the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, organization_id')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('[ReminderScheduler] Invoice not found:', invoiceId);
      return [];
    }

    if (!invoice.due_date) {
      console.warn('[ReminderScheduler] Invoice has no due date:', invoiceId);
      return [];
    }

    // Get the rule (use provided rule, or default for org)
    let rule: ReminderRule | null = null;
    if (ruleId) {
      rule = await this.getRule(ruleId);
    } else {
      rule = await this.getDefaultRule(invoice.organization_id);
    }

    // Use default reminder days if no rule found
    const reminderDays = rule?.reminderDays || DEFAULT_REMINDER_DAYS;
    const dueDate = new Date(invoice.due_date);

    // Cancel any existing pending reminders
    await this.cancelReminders(invoiceId);

    // Create scheduled reminders for each day offset
    const reminders: ScheduledReminder[] = [];

    for (const daysOffset of reminderDays) {
      const scheduledFor = new Date(dueDate);
      scheduledFor.setDate(scheduledFor.getDate() + daysOffset);

      // Skip if scheduled date is in the past
      if (scheduledFor < new Date()) {
        continue;
      }

      const reminderType: ReminderType =
        daysOffset < 0 ? 'before_due' : daysOffset === 0 ? 'on_due' : 'overdue';

      const { data, error } = await supabase
        .from('invoice_scheduled_reminders')
        .insert({
          invoice_id: invoiceId,
          rule_id: rule?.id || null,
          scheduled_for: scheduledFor.toISOString(),
          reminder_type: reminderType,
          days_offset: daysOffset,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        reminders.push(this.transformReminder(data));
      }
    }

    // Log audit event
    await auditLogger.log({
      invoiceId,
      eventType: 'reminder_scheduled',
      actor: { type: 'system' },
      metadata: {
        reminderCount: reminders.length,
        ruleId: rule?.id,
        ruleName: rule?.name,
      },
    });

    return reminders;
  }

  /**
   * Cancel all pending reminders for an invoice
   */
  async cancelReminders(invoiceId: string): Promise<number> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_scheduled_reminders')
      .update({ status: 'skipped' })
      .eq('invoice_id', invoiceId)
      .eq('status', 'pending')
      .select();

    if (error) {
      console.error('[ReminderScheduler] Failed to cancel reminders:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Reschedule reminders when due date changes
   */
  async rescheduleReminders(
    invoiceId: string,
    newDueDate: Date
  ): Promise<ScheduledReminder[]> {
    const supabase = createAdminClient();

    // Get current pending reminders to determine the rule
    const { data: currentReminders } = await supabase
      .from('invoice_scheduled_reminders')
      .select('rule_id')
      .eq('invoice_id', invoiceId)
      .eq('status', 'pending')
      .limit(1);

    const ruleId = currentReminders?.[0]?.rule_id;

    // Cancel existing and schedule new
    await this.cancelReminders(invoiceId);

    // Update invoice due date first (so scheduleReminders reads correct date)
    // This assumes the due date is already updated in the invoice
    return this.scheduleReminders(invoiceId, ruleId);
  }

  /**
   * Process all pending reminders that are due
   * This should be called by a cron job
   */
  async processPendingReminders(): Promise<{
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const result = { sent: 0, failed: 0, skipped: 0 };

    // Get all pending reminders that are due
    const { data: reminders, error } = await supabase
      .from('invoice_scheduled_reminders')
      .select(`
        *,
        invoice:invoices(id, status, organization_id, customer_id)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(100); // Process in batches

    if (error || !reminders) {
      console.error('[ReminderScheduler] Failed to fetch pending reminders:', error);
      return result;
    }

    for (const reminder of reminders) {
      const invoice = reminder.invoice as unknown as { id: string; status: string };

      // Skip if invoice is no longer eligible for reminders
      if (!invoice || ['paid', 'canceled', 'draft'].includes(invoice.status)) {
        await this.updateReminderStatus(reminder.id, 'skipped');
        result.skipped++;
        continue;
      }

      try {
        // Send the reminder
        const sendResult = await emailService.sendReminder(invoice.id);

        if (sendResult.success) {
          await this.updateReminderStatus(reminder.id, 'sent');
          result.sent++;
        } else {
          await this.updateReminderStatus(reminder.id, 'failed', sendResult.error);
          result.failed++;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await this.updateReminderStatus(reminder.id, 'failed', errorMessage);
        result.failed++;
      }
    }

    console.log(
      `[ReminderScheduler] Processed ${reminders.length} reminders:`,
      result
    );

    return result;
  }

  /**
   * Process scheduled invoice sends
   * For invoices with scheduled_send_at that are due
   */
  async processScheduledSends(): Promise<{
    sent: number;
    failed: number;
  }> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const result = { sent: 0, failed: 0 };

    // Get draft invoices with scheduled_send_at that's past
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, organization_id, auto_send_reminders, reminder_rule_id')
      .eq('status', 'draft')
      .not('scheduled_send_at', 'is', null)
      .lte('scheduled_send_at', now)
      .limit(50);

    if (error || !invoices) {
      console.error('[ReminderScheduler] Failed to fetch scheduled sends:', error);
      return result;
    }

    for (const invoice of invoices) {
      try {
        // Send the invoice
        const sendResult = await emailService.sendInvoice(invoice.id);

        if (sendResult.success) {
          result.sent++;

          // Schedule reminders if auto_send_reminders is enabled
          if (invoice.auto_send_reminders) {
            await this.scheduleReminders(invoice.id, invoice.reminder_rule_id);
          }
        } else {
          result.failed++;
        }
      } catch (err) {
        console.error('[ReminderScheduler] Failed to send scheduled invoice:', err);
        result.failed++;
      }
    }

    return result;
  }

  /**
   * Process escalations for overdue invoices
   */
  async processEscalations(): Promise<{
    paused: number;
    marked_uncollectible: number;
  }> {
    const supabase = createAdminClient();
    const result = { paused: 0, marked_uncollectible: 0 };

    // Get rules with escalation configured
    const { data: rules } = await supabase
      .from('invoice_reminder_rules')
      .select('*')
      .eq('enabled', true)
      .neq('escalation_action', 'none');

    if (!rules) return result;

    for (const rule of rules) {
      const escalateAfterDays = rule.escalate_after_days || DEFAULT_ESCALATE_AFTER_DAYS;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - escalateAfterDays);

      // Get invoices that are overdue past the escalation threshold
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('organization_id', rule.organization_id)
        .in('status', ['sent', 'viewed', 'overdue'])
        .lt('due_date', cutoffDate.toISOString());

      if (!invoices) continue;

      for (const invoice of invoices) {
        if (rule.escalation_action === 'mark_uncollectible') {
          await supabase
            .from('invoices')
            .update({ status: 'canceled' })
            .eq('id', invoice.id);

          await auditLogger.logCanceled(invoice.id, { type: 'system' }, 'Auto-escalation: marked uncollectible');
          result.marked_uncollectible++;
        } else if (rule.escalation_action === 'pause') {
          // For pause, we just stop sending reminders (already handled by skipping)
          result.paused++;
        }
      }
    }

    return result;
  }

  /**
   * Get scheduled reminders for an invoice
   */
  async getRemindersForInvoice(invoiceId: string): Promise<ScheduledReminder[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_scheduled_reminders')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('scheduled_for', { ascending: true });

    if (error || !data) return [];

    return data.map(this.transformReminder);
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Update reminder status
   */
  private async updateReminderStatus(
    reminderId: string,
    status: ScheduledReminderStatus,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { status };
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await supabase
      .from('invoice_scheduled_reminders')
      .update(updateData)
      .eq('id', reminderId);
  }

  /**
   * Transform database row to ReminderRule
   */
  private transformRule(row: Record<string, unknown>): ReminderRule {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      name: row.name as string,
      isDefault: row.is_default as boolean,
      enabled: row.enabled as boolean,
      reminderDays: row.reminder_days as number[],
      escalateAfterDays: row.escalate_after_days as number,
      escalationAction: row.escalation_action as ReminderRule['escalationAction'],
      includePdf: row.include_pdf as boolean,
      ccInternalEmail: row.cc_internal_email as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  /**
   * Transform database row to ScheduledReminder
   */
  private transformReminder(row: Record<string, unknown>): ScheduledReminder {
    return {
      id: row.id as string,
      invoiceId: row.invoice_id as string,
      ruleId: row.rule_id as string | undefined,
      scheduledFor: row.scheduled_for as string,
      reminderType: row.reminder_type as ReminderType,
      daysOffset: row.days_offset as number,
      status: row.status as ScheduledReminderStatus,
      sentAt: row.sent_at as string | undefined,
      errorMessage: row.error_message as string | undefined,
      createdAt: row.created_at as string,
    };
  }
}

// Export singleton instance
export const reminderScheduler = ReminderSchedulerService.getInstance();

// Export class for testing
export { ReminderSchedulerService };
