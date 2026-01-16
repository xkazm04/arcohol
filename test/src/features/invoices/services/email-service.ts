import { getResendClient, DEFAULT_FROM_EMAIL, isResendConfigured } from '@/lib/email/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { pdfGenerator } from './pdf-generator';
import { magicLinkService } from './magic-link';
import { generateInvoiceSentEmail } from '../templates/emails/invoice-sent';
import { generateInvoiceReminderEmail } from '../templates/emails/invoice-reminder';
import { generatePaymentReceivedEmail } from '../templates/emails/payment-received';
import type { Invoice, InvoicePayment, SendInvoiceParams, SendReminderParams } from '../types';

interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Service for sending invoice-related emails
 */
export class EmailService {
  private supabase = createAdminClient();

  /**
   * Send invoice to customer
   */
  async sendInvoice(
    invoiceId: string,
    params?: SendInvoiceParams
  ): Promise<DeliveryResult> {
    if (!isResendConfigured()) {
      console.warn('[Email] Resend not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { invoice, organization } = await this.fetchInvoiceData(invoiceId);
      const recipientEmail = params?.email || invoice.customer?.email;

      if (!recipientEmail) {
        return { success: false, error: 'No recipient email address' };
      }

      // Generate portal link
      const portalLink = await magicLinkService.createPortalLink(
        invoiceId,
        invoice.organizationId,
        invoice.customerId || ''
      );

      // Generate PDF URL
      const pdfUrl = await pdfGenerator.getPDFUrl(invoiceId);

      // Generate email content
      const emailContent = generateInvoiceSentEmail({
        invoice,
        organizationName: organization.name,
        portalUrl: portalLink.url,
        pdfUrl,
        personalMessage: params?.personalMessage,
      });

      // Send email
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `${organization.name} <${DEFAULT_FROM_EMAIL}>`,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        console.error('[Email] Send failed:', error);
        await this.updateDeliveryStatus(invoiceId, 'failed', recipientEmail, error.message);
        return { success: false, error: error.message };
      }

      // Update invoice status and delivery tracking
      await this.updateDeliveryStatus(invoiceId, 'sent', recipientEmail);
      await this.updateInvoiceStatus(invoiceId, 'sent', portalLink.url, pdfUrl);

      console.log(`[Email] Invoice ${invoiceId} sent to ${recipientEmail}`);

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[Email] Send invoice error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send invoice reminder
   */
  async sendReminder(
    invoiceId: string,
    params?: SendReminderParams
  ): Promise<DeliveryResult> {
    if (!isResendConfigured()) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { invoice, organization } = await this.fetchInvoiceData(invoiceId);
      const recipientEmail = params?.email || invoice.customer?.email;

      if (!recipientEmail) {
        return { success: false, error: 'No recipient email address' };
      }

      // Check if invoice is already paid
      if (invoice.status === 'paid') {
        return { success: false, error: 'Invoice already paid' };
      }

      // Get current reminder count
      const { data: invoiceRecord } = await this.supabase
        .from('invoices')
        .select('reminder_count, portal_url, pdf_url')
        .eq('id', invoiceId)
        .single();

      const reminderCount = (invoiceRecord?.reminder_count || 0) + 1;
      const portalUrl = invoiceRecord?.portal_url || '';
      const pdfUrl = invoiceRecord?.pdf_url || undefined;

      // Check if overdue
      const isOverdue = invoice.dueDate
        ? new Date(invoice.dueDate) < new Date()
        : false;

      // Generate email content
      const emailContent = generateInvoiceReminderEmail({
        invoice,
        organizationName: organization.name,
        portalUrl,
        pdfUrl,
        personalMessage: params?.personalMessage,
        reminderNumber: reminderCount,
        isOverdue,
      });

      // Send email
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `${organization.name} <${DEFAULT_FROM_EMAIL}>`,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        console.error('[Email] Reminder send failed:', error);
        return { success: false, error: error.message };
      }

      // Update reminder count
      await this.supabase
        .from('invoices')
        .update({
          reminder_count: reminderCount,
          last_reminder_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      console.log(`[Email] Reminder ${reminderCount} sent for invoice ${invoiceId}`);

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[Email] Send reminder error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send payment received confirmation
   */
  async sendPaymentConfirmation(
    invoiceId: string,
    payment: InvoicePayment
  ): Promise<DeliveryResult> {
    if (!isResendConfigured()) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { invoice, organization } = await this.fetchInvoiceData(invoiceId);
      const recipientEmail = invoice.customer?.email;

      if (!recipientEmail) {
        return { success: false, error: 'No recipient email address' };
      }

      // Get portal URL
      const { data: invoiceRecord } = await this.supabase
        .from('invoices')
        .select('portal_url')
        .eq('id', invoiceId)
        .single();

      // Generate email content
      const emailContent = generatePaymentReceivedEmail({
        invoice,
        payment,
        organizationName: organization.name,
        portalUrl: invoiceRecord?.portal_url,
      });

      // Send email
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from: `${organization.name} <${DEFAULT_FROM_EMAIL}>`,
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        console.error('[Email] Payment confirmation send failed:', error);
        return { success: false, error: error.message };
      }

      console.log(`[Email] Payment confirmation sent for invoice ${invoiceId}`);

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[Email] Send payment confirmation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch invoice and organization data
   */
  private async fetchInvoiceData(
    invoiceId: string
  ): Promise<{ invoice: Invoice; organization: { id: string; name: string } }> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(
        `
        *,
        customer:customers(id, company_name, contact_name, email, wallet_address),
        organization:organizations(id, name)
      `
      )
      .eq('id', invoiceId)
      .single();

    if (error || !data) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    const invoice: Invoice = {
      id: data.id,
      organizationId: data.organization_id,
      customerId: data.customer_id,
      customer: data.customer
        ? {
            id: data.customer.id,
            companyName: data.customer.company_name,
            contactName: data.customer.contact_name,
            email: data.customer.email,
            walletAddress: data.customer.wallet_address,
          }
        : undefined,
      reference: data.reference,
      subtotal: parseFloat(data.subtotal || '0'),
      taxAmount: parseFloat(data.tax_amount || '0'),
      discountAmount: parseFloat(data.discount_amount || '0'),
      amount: parseFloat(data.amount || '0'),
      feeRate: parseFloat(data.fee_rate || '0'),
      feeAmount: parseFloat(data.fee_amount || '0'),
      netAmount: parseFloat(data.net_amount || '0'),
      currency: data.currency || 'USDC',
      status: data.status,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      viewedAt: data.viewed_at,
      paidAt: data.paid_at,
      paymentUrl: data.payment_url,
      qrCode: data.qr_code,
      lineItems: data.line_items || [],
      notes: data.notes,
      terms: data.terms,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      invoice,
      organization: data.organization || { id: data.organization_id, name: 'Unknown' },
    };
  }

  /**
   * Update delivery status tracking
   */
  private async updateDeliveryStatus(
    invoiceId: string,
    status: 'sent' | 'delivered' | 'failed',
    recipientEmail: string,
    error?: string
  ): Promise<void> {
    await this.supabase
      .from('invoices')
      .update({
        delivery_status: status,
        ...(status === 'sent' && { sent_at: new Date().toISOString() }),
        ...(status === 'failed' && { delivery_error: error }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);
  }

  /**
   * Update invoice status after sending
   */
  private async updateInvoiceStatus(
    invoiceId: string,
    status: 'sent',
    portalUrl: string,
    pdfUrl: string
  ): Promise<void> {
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .single();

    // Only update status if currently draft
    if (invoice?.status === 'draft') {
      await this.supabase
        .from('invoices')
        .update({
          status,
          portal_url: portalUrl,
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);
    } else {
      // Just update URLs
      await this.supabase
        .from('invoices')
        .update({
          portal_url: portalUrl,
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
