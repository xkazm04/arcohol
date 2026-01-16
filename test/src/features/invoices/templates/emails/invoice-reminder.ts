import type { Invoice } from '../../types';

interface InvoiceReminderEmailProps {
  invoice: Invoice;
  organizationName: string;
  portalUrl: string;
  pdfUrl?: string;
  personalMessage?: string;
  reminderNumber: number;
  isOverdue: boolean;
}

export function generateInvoiceReminderEmail({
  invoice,
  organizationName,
  portalUrl,
  pdfUrl,
  personalMessage,
  reminderNumber,
  isOverdue,
}: InvoiceReminderEmailProps): { subject: string; html: string; text: string } {
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

  const daysOverdue = invoice.dueDate
    ? Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const urgencyColor = isOverdue ? '#dc2626' : '#f59e0b';
  const urgencyBg = isOverdue ? '#fef2f2' : '#fffbeb';

  const subject = isOverdue
    ? `OVERDUE: Invoice ${invoice.reference} requires immediate attention`
    : `Reminder: Invoice ${invoice.reference} from ${organizationName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Reminder from ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${urgencyColor}; padding: 32px 40px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${isOverdue ? 'Invoice Overdue' : 'Invoice Reminder'}
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Invoice #${invoice.reference} from ${organizationName}
              </p>
            </td>
          </tr>

          <!-- Urgency Banner -->
          ${isOverdue ? `
          <tr>
            <td style="background-color: ${urgencyBg}; padding: 16px 40px; border-bottom: 1px solid #fecaca;">
              <p style="margin: 0; color: ${urgencyColor}; font-size: 14px; font-weight: 600; text-align: center;">
                ⚠️ This invoice is ${daysOverdue} days overdue. Please pay immediately.
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${personalMessage ? `
              <div style="background-color: #f0f9ff; border-left: 4px solid #0891b2; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #0c4a6e; font-size: 14px;">${personalMessage}</p>
              </div>
              ` : `
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                ${isOverdue
                  ? `This is a reminder that your invoice is now overdue. Please make payment as soon as possible to avoid any service interruptions.`
                  : `This is a friendly reminder that your invoice is due soon. Please review and pay at your earliest convenience.`
                }
              </p>
              `}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Amount Due</span>
                    <p style="margin: 4px 0 0 0; color: ${isOverdue ? urgencyColor : '#0f172a'}; font-size: 28px; font-weight: 700;">${formatCurrency(invoice.amount)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">${isOverdue ? 'Was Due' : 'Due Date'}</span>
                    <p style="margin: 4px 0 0 0; color: ${isOverdue ? urgencyColor : '#0f172a'}; font-size: 16px; font-weight: 600;">${formatDate(invoice.dueDate)}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${portalUrl}" style="display: inline-block; background-color: ${isOverdue ? urgencyColor : '#0891b2'}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Pay Now
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
                Reminder ${reminderNumber} • Sent by ${organizationName} via <a href="https://arcpay.io" style="color: #0891b2; text-decoration: none;">ArcPay</a>
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                If you have already paid this invoice, please disregard this reminder.
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
${isOverdue ? 'INVOICE OVERDUE' : 'INVOICE REMINDER'}

Invoice #${invoice.reference} from ${organizationName}

${isOverdue ? `⚠️ This invoice is ${daysOverdue} days overdue. Please pay immediately.\n` : ''}
${personalMessage ? `Message: ${personalMessage}\n` : ''}

Amount Due: ${formatCurrency(invoice.amount)}
${isOverdue ? 'Was Due' : 'Due Date'}: ${formatDate(invoice.dueDate)}

Pay your invoice: ${portalUrl}
${pdfUrl ? `Download PDF: ${pdfUrl}` : ''}

---
Reminder ${reminderNumber} • Sent by ${organizationName} via ArcPay
If you have already paid this invoice, please disregard this reminder.
  `.trim();

  return { subject, html, text };
}
