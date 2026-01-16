import type { Invoice, InvoicePayment } from '../../types';

interface PaymentReceivedEmailProps {
  invoice: Invoice;
  payment: InvoicePayment;
  organizationName: string;
  portalUrl?: string;
}

export function generatePaymentReceivedEmail({
  invoice,
  payment,
  organizationName,
  portalUrl,
}: PaymentReceivedEmailProps): { subject: string; html: string; text: string } {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateHash = (hash?: string) => {
    if (!hash) return '-';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const explorerUrl = payment.txHash
    ? getExplorerUrl(payment.chain, payment.txHash)
    : null;

  const subject = `Payment Received - Invoice ${invoice.reference}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payment Received</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Thank you for your payment!
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">Amount Paid</p>
                    <p style="margin: 8px 0 0 0; color: #15803d; font-size: 32px; font-weight: 700;">${formatCurrency(payment.amount)}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Invoice</span>
                    <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 16px; font-weight: 600;">#${invoice.reference}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Payment Date</span>
                    <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 14px;">${formatDate(payment.paidAt)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Network</span>
                    <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 14px;">${capitalizeChain(payment.chain)}</p>
                  </td>
                </tr>
                ${payment.txHash ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 13px;">Transaction</span>
                    <p style="margin: 4px 0 0 0;">
                      <code style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #0f172a;">${truncateHash(payment.txHash)}</code>
                      ${explorerUrl ? `
                      <a href="${explorerUrl}" style="color: #0891b2; font-size: 12px; text-decoration: none; margin-left: 8px;">View →</a>
                      ` : ''}
                    </p>
                  </td>
                </tr>
                ` : ''}
              </table>

              ${portalUrl ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${portalUrl}" style="display: inline-block; background-color: #0891b2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                      View Receipt
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                Payment processed by ${organizationName} via <a href="https://arcpay.io" style="color: #0891b2; text-decoration: none;">ArcPay</a>
              </p>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                This is a receipt for your records. Thank you for your business!
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
PAYMENT RECEIVED

Thank you for your payment!

Amount Paid: ${formatCurrency(payment.amount)}

Invoice: #${invoice.reference}
Payment Date: ${formatDate(payment.paidAt)}
Network: ${capitalizeChain(payment.chain)}
${payment.txHash ? `Transaction: ${payment.txHash}` : ''}
${explorerUrl ? `View transaction: ${explorerUrl}` : ''}
${portalUrl ? `View receipt: ${portalUrl}` : ''}

---
Payment processed by ${organizationName} via ArcPay.
This is a receipt for your records. Thank you for your business!
  `.trim();

  return { subject, html, text };
}

function capitalizeChain(chain: string): string {
  const chainNames: Record<string, string> = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
    base: 'Base',
    avalanche: 'Avalanche',
    sepolia: 'Ethereum Sepolia',
    'polygon-amoy': 'Polygon Amoy',
    'arbitrum-sepolia': 'Arbitrum Sepolia',
    'base-sepolia': 'Base Sepolia',
    'arc-testnet': 'ArcPay Testnet',
  };
  return chainNames[chain] || chain.charAt(0).toUpperCase() + chain.slice(1);
}

function getExplorerUrl(chain: string, txHash: string): string | null {
  const explorers: Record<string, string> = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    optimism: 'https://optimistic.etherscan.io/tx/',
    base: 'https://basescan.org/tx/',
    avalanche: 'https://snowtrace.io/tx/',
    sepolia: 'https://sepolia.etherscan.io/tx/',
    'polygon-amoy': 'https://amoy.polygonscan.com/tx/',
    'arbitrum-sepolia': 'https://sepolia.arbiscan.io/tx/',
    'base-sepolia': 'https://sepolia.basescan.org/tx/',
  };
  const baseUrl = explorers[chain];
  return baseUrl ? `${baseUrl}${txHash}` : null;
}
