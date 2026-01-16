import type { Invoice } from '../../types';

interface InvoiceSentEmailProps {
  invoice: Invoice;
  organizationName: string;
  portalUrl: string;
  pdfUrl?: string;
  personalMessage?: string;
}

export function generateInvoiceSentEmail({
  invoice,
  organizationName,
  portalUrl,
  pdfUrl,
  personalMessage,
}: InvoiceSentEmailProps): { subject: string; html: string; text: string } {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const subject = `Invoice ${invoice.reference} from ${organizationName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 32px 40px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Invoice from ${organizationName}</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Invoice #${invoice.reference}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${personalMessage ? `
              <div style="background-color: #f0f9ff; border-left: 4px solid #0891b2; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #0c4a6e; font-size: 14px;">${personalMessage}</p>
              </div>
              ` : ''}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Amount Due</span>
                    <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 28px; font-weight: 700;">${formatCurrency(invoice.amount)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Due Date</span>
                    <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 16px; font-weight: 600;">${formatDate(invoice.dueDate)}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${portalUrl}" style="display: inline-block; background-color: #0891b2; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      View &amp; Pay Invoice
                    </a>
                  </td>
                </tr>
              </table>

              ${pdfUrl ? `
              <p style="text-align: center; margin: 0;">
                <a href="${pdfUrl}" style="color: #0891b2; font-size: 14px; text-decoration: none;">Download PDF</a>
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                This invoice was sent by ${organizationName} via <a href="https://arcpay.io" style="color: #0891b2; text-decoration: none;">ArcPay</a>
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                If you have questions about this invoice, please contact ${organizationName} directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Invoice from ${organizationName}

Invoice #${invoice.reference}

${personalMessage ? `Message: ${personalMessage}\n` : ''}
Amount Due: ${formatCurrency(invoice.amount)}
Due Date: ${formatDate(invoice.dueDate)}

View and pay your invoice: ${portalUrl}
${pdfUrl ? `Download PDF: ${pdfUrl}` : ''}

---
This invoice was sent by ${organizationName} via ArcPay.
  `.trim();

  return { subject, html, text };
}
