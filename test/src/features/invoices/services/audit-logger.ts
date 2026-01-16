/**
 * Audit Logger Service
 * Provides immutable audit trail for all invoice changes
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  AuditLogEntry,
  AuditLogParams,
  AuditEventType,
  AuditActor,
  Invoice,
  InvoiceStatus,
} from '../types';

/**
 * Compute changes between two invoice states
 */
function computeChanges(
  previous: Partial<Invoice> | undefined,
  current: Partial<Invoice> | undefined
): Record<string, { from: unknown; to: unknown }> | undefined {
  if (!previous || !current) return undefined;

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of allKeys) {
    const prevValue = previous[key as keyof Invoice];
    const currValue = current[key as keyof Invoice];

    // Skip metadata fields
    if (['createdAt', 'updatedAt'].includes(key)) continue;

    // Compare values (simple JSON stringify for objects)
    const prevStr = JSON.stringify(prevValue);
    const currStr = JSON.stringify(currValue);

    if (prevStr !== currStr) {
      changes[key] = { from: prevValue, to: currValue };
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}

/**
 * Audit Logger Service - Singleton
 */
class AuditLoggerService {
  private static instance: AuditLoggerService;

  private constructor() {}

  static getInstance(): AuditLoggerService {
    if (!AuditLoggerService.instance) {
      AuditLoggerService.instance = new AuditLoggerService();
    }
    return AuditLoggerService.instance;
  }

  /**
   * Log an audit event for an invoice
   */
  async log(params: AuditLogParams): Promise<AuditLogEntry | null> {
    const supabase = createAdminClient();

    const changes = computeChanges(params.previousState, params.newState);

    const { data, error } = await supabase
      .from('invoice_audit_log')
      .insert({
        invoice_id: params.invoiceId,
        event_type: params.eventType,
        actor_type: params.actor.type,
        actor_id: params.actor.id || null,
        actor_email: params.actor.email || null,
        previous_state: params.previousState || null,
        new_state: params.newState || null,
        changes: changes || null,
        ip_address: params.actor.ipAddress || null,
        user_agent: params.actor.userAgent || null,
        metadata: params.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[AuditLogger] Failed to log event:', error);
      // Don't throw - audit logging should not break the main flow
      return null;
    }

    return this.transformEntry(data);
  }

  /**
   * Log invoice creation
   */
  async logCreated(
    invoiceId: string,
    invoice: Partial<Invoice>,
    actor: AuditActor
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'created',
      actor,
      newState: invoice,
    });
  }

  /**
   * Log invoice update
   */
  async logUpdated(
    invoiceId: string,
    previousInvoice: Partial<Invoice>,
    newInvoice: Partial<Invoice>,
    actor: AuditActor
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'updated',
      actor,
      previousState: previousInvoice,
      newState: newInvoice,
    });
  }

  /**
   * Log invoice sent
   */
  async logSent(
    invoiceId: string,
    actor: AuditActor,
    metadata?: { recipientEmail?: string; portalUrl?: string }
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'sent',
      actor,
      metadata,
    });
  }

  /**
   * Log invoice viewed
   */
  async logViewed(
    invoiceId: string,
    actor: AuditActor
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'viewed',
      actor,
    });
  }

  /**
   * Log payment received
   */
  async logPaymentReceived(
    invoiceId: string,
    actor: AuditActor,
    metadata: { amount: number; txHash?: string; payerAddress?: string }
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'payment_received',
      actor,
      metadata,
    });
  }

  /**
   * Log invoice paid (fully)
   */
  async logPaid(
    invoiceId: string,
    actor: AuditActor,
    metadata?: { txHash?: string; payerAddress?: string }
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'paid',
      actor,
      metadata,
    });
  }

  /**
   * Log invoice canceled
   */
  async logCanceled(
    invoiceId: string,
    actor: AuditActor,
    reason?: string
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'canceled',
      actor,
      metadata: reason ? { reason } : undefined,
    });
  }

  /**
   * Log reminder sent
   */
  async logReminderSent(
    invoiceId: string,
    actor: AuditActor,
    metadata?: { reminderNumber?: number; recipientEmail?: string }
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'reminder_sent',
      actor,
      metadata,
    });
  }

  /**
   * Log status change
   */
  async logStatusChanged(
    invoiceId: string,
    previousStatus: InvoiceStatus,
    newStatus: InvoiceStatus,
    actor: AuditActor
  ): Promise<AuditLogEntry | null> {
    return this.log({
      invoiceId,
      eventType: 'status_changed',
      actor,
      previousState: { status: previousStatus },
      newState: { status: newStatus },
    });
  }

  /**
   * Get audit history for an invoice
   */
  async getAuditHistory(invoiceId: string): Promise<AuditLogEntry[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoice_audit_log')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AuditLogger] Failed to get audit history:', error);
      return [];
    }

    return (data || []).map(this.transformEntry);
  }

  /**
   * Export audit report for compliance
   */
  async exportAuditReport(params: {
    organizationId: string;
    fromDate: Date;
    toDate: Date;
    format: 'csv' | 'json';
  }): Promise<{ data: string; contentType: string; fileName: string }> {
    const supabase = createAdminClient();

    // Get all invoices for the organization in the date range
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('organization_id', params.organizationId)
      .gte('created_at', params.fromDate.toISOString())
      .lte('created_at', params.toDate.toISOString());

    if (!invoices || invoices.length === 0) {
      return {
        data: params.format === 'json' ? '[]' : '',
        contentType: params.format === 'json' ? 'application/json' : 'text/csv',
        fileName: `audit-report-${params.fromDate.toISOString().split('T')[0]}.${params.format}`,
      };
    }

    const invoiceIds = invoices.map((inv) => inv.id);

    // Get all audit entries for these invoices
    const { data: auditEntries } = await supabase
      .from('invoice_audit_log')
      .select('*')
      .in('invoice_id', invoiceIds)
      .gte('created_at', params.fromDate.toISOString())
      .lte('created_at', params.toDate.toISOString())
      .order('created_at', { ascending: true });

    const entries = (auditEntries || []).map(this.transformEntry);

    if (params.format === 'json') {
      return {
        data: JSON.stringify(entries, null, 2),
        contentType: 'application/json',
        fileName: `audit-report-${params.fromDate.toISOString().split('T')[0]}.json`,
      };
    }

    // CSV format
    const headers = [
      'Timestamp',
      'Invoice ID',
      'Event Type',
      'Actor Type',
      'Actor Email',
      'Changes',
      'IP Address',
    ];
    const rows = entries.map((entry) => [
      entry.createdAt,
      entry.invoiceId,
      entry.eventType,
      entry.actorType,
      entry.actorEmail || '',
      entry.changes ? JSON.stringify(entry.changes) : '',
      entry.ipAddress || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return {
      data: csv,
      contentType: 'text/csv',
      fileName: `audit-report-${params.fromDate.toISOString().split('T')[0]}.csv`,
    };
  }

  /**
   * Transform database row to AuditLogEntry
   */
  private transformEntry(row: Record<string, unknown>): AuditLogEntry {
    return {
      id: row.id as string,
      invoiceId: row.invoice_id as string,
      eventType: row.event_type as AuditEventType,
      actorType: row.actor_type as AuditLogEntry['actorType'],
      actorId: row.actor_id as string | undefined,
      actorEmail: row.actor_email as string | undefined,
      previousState: row.previous_state as Partial<Invoice> | undefined,
      newState: row.new_state as Partial<Invoice> | undefined,
      changes: row.changes as Record<string, { from: unknown; to: unknown }> | undefined,
      ipAddress: row.ip_address as string | undefined,
      userAgent: row.user_agent as string | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.created_at as string,
    };
  }
}

// Export singleton instance
export const auditLogger = AuditLoggerService.getInstance();

// Export class for testing
export { AuditLoggerService };
