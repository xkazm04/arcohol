import { renderToBuffer, renderToStream } from '@react-pdf/renderer';
import { createAdminClient } from '@/lib/supabase/admin';
import { InvoicePDF } from '../templates/InvoicePDF';
import type { Invoice } from '../types';

interface Organization {
  id: string;
  name: string;
  settings?: {
    email?: string;
    address?: string;
    taxId?: string;
    brandColor?: string;
  };
}

/**
 * Service for generating invoice PDFs
 */
export class PDFGenerator {
  private supabase = createAdminClient();

  /**
   * Generate PDF buffer for an invoice
   */
  async generatePDF(invoiceId: string): Promise<Buffer> {
    const { invoice, organization } = await this.fetchInvoiceData(invoiceId);

    const pdfBuffer = await renderToBuffer(
      InvoicePDF({
        invoice,
        organization: {
          name: organization.name,
          email: organization.settings?.email,
          address: organization.settings?.address,
          taxId: organization.settings?.taxId,
        },
        portalUrl: this.generatePortalUrl(invoice, organization),
      }) as React.ReactElement
    );

    return pdfBuffer as Buffer;
  }

  /**
   * Generate PDF stream for an invoice (for streaming response)
   */
  async generatePDFStream(invoiceId: string): Promise<NodeJS.ReadableStream> {
    const { invoice, organization } = await this.fetchInvoiceData(invoiceId);

    const stream = await renderToStream(
      InvoicePDF({
        invoice,
        organization: {
          name: organization.name,
          email: organization.settings?.email,
          address: organization.settings?.address,
          taxId: organization.settings?.taxId,
        },
        portalUrl: this.generatePortalUrl(invoice, organization),
      }) as React.ReactElement
    );

    return stream;
  }

  /**
   * Generate and store PDF, returning the URL
   */
  async generateAndStorePDF(invoiceId: string): Promise<string> {
    const buffer = await this.generatePDF(invoiceId);

    // Upload to Supabase Storage
    const fileName = `invoices/${invoiceId}/${Date.now()}.pdf`;
    const { error } = await this.supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to store PDF');
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update invoice with PDF URL
    await this.supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
      .eq('id', invoiceId);

    return pdfUrl;
  }

  /**
   * Get existing PDF URL or generate new one
   */
  async getPDFUrl(invoiceId: string, regenerate = false): Promise<string> {
    if (!regenerate) {
      // Check for existing PDF
      const { data: invoice } = await this.supabase
        .from('invoices')
        .select('pdf_url')
        .eq('id', invoiceId)
        .single();

      if (invoice?.pdf_url) {
        return invoice.pdf_url;
      }
    }

    return this.generateAndStorePDF(invoiceId);
  }

  /**
   * Fetch invoice and organization data
   */
  private async fetchInvoiceData(
    invoiceId: string
  ): Promise<{ invoice: Invoice; organization: Organization }> {
    const { data: invoiceData, error: invoiceError } = await this.supabase
      .from('invoices')
      .select(
        `
        *,
        customer:customers(id, company_name, contact_name, email, wallet_address),
        organization:organizations(id, name, settings)
      `
      )
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoiceData) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    // Transform to Invoice type
    const invoice: Invoice = {
      id: invoiceData.id,
      organizationId: invoiceData.organization_id,
      customerId: invoiceData.customer_id,
      customer: invoiceData.customer
        ? {
            id: invoiceData.customer.id,
            companyName: invoiceData.customer.company_name,
            contactName: invoiceData.customer.contact_name,
            email: invoiceData.customer.email,
            walletAddress: invoiceData.customer.wallet_address,
          }
        : undefined,
      reference: invoiceData.reference,
      subtotal: parseFloat(invoiceData.subtotal || '0'),
      taxAmount: parseFloat(invoiceData.tax_amount || '0'),
      discountAmount: parseFloat(invoiceData.discount_amount || '0'),
      amount: parseFloat(invoiceData.amount || '0'),
      feeRate: parseFloat(invoiceData.fee_rate || '0'),
      feeAmount: parseFloat(invoiceData.fee_amount || '0'),
      netAmount: parseFloat(invoiceData.net_amount || '0'),
      currency: invoiceData.currency || 'USDC',
      status: invoiceData.status,
      issueDate: invoiceData.issue_date,
      dueDate: invoiceData.due_date,
      viewedAt: invoiceData.viewed_at,
      paidAt: invoiceData.paid_at,
      paymentUrl: invoiceData.payment_url,
      qrCode: invoiceData.qr_code,
      lineItems: invoiceData.line_items || [],
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      metadata: invoiceData.metadata,
      createdAt: invoiceData.created_at,
      updatedAt: invoiceData.updated_at,
    };

    const organization: Organization = invoiceData.organization || {
      id: invoiceData.organization_id,
      name: 'Unknown Organization',
    };

    return { invoice, organization };
  }

  /**
   * Generate portal URL for the invoice
   */
  private generatePortalUrl(invoice: Invoice, organization: Organization): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.arcpay.io';
    // This will be replaced with actual portal URL generation in magic-link service
    return `${baseUrl}/portal/${organization.id}/invoices/${invoice.id}`;
  }

  /**
   * Get filename for PDF download
   */
  getFileName(invoice: Invoice): string {
    const sanitizedRef = invoice.reference.replace(/[^a-zA-Z0-9-]/g, '_');
    return `Invoice-${sanitizedRef}.pdf`;
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGenerator();
