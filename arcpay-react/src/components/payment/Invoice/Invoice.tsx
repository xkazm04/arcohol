import React, { useState, useMemo, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../../../theme';
import { Card } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { Modal } from '../../primitives/Modal';
import { InvoiceHeader, InvoiceBillTo } from './InvoiceHeader';
import { LineItems, InvoiceTotals } from './LineItems';
import { Checkout } from '../Checkout';
import type { InvoiceProps, InvoiceData } from './types';
import type { PaymentResult } from '../Checkout/types';

/**
 * Main Invoice component
 */
export function Invoice({
  invoiceId,
  invoice: invoiceData,
  branding,
  showPdfDownload = true,
  showPrint = true,
  showPayButton = true,
  showQRCode = false,
  recipient,
  onPaid,
  onDownload,
  onPrint,
  className,
  style,
  testMode = false,
}: InvoiceProps) {
  const { theme } = useTheme();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // In real implementation, would fetch invoice by ID if provided
  const invoice = invoiceData;

  // Calculate totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    if (!invoice) return { subtotal: 0, taxAmount: 0, total: 0 };

    if (invoice.total !== undefined) {
      return {
        subtotal: invoice.subtotal ?? invoice.total,
        taxAmount: invoice.taxAmount ?? 0,
        total: invoice.total,
      };
    }

    const sub = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = invoice.items.reduce((sum, item) => {
      if (item.taxRate) {
        return sum + item.amount * (item.taxRate / 100);
      }
      return sum;
    }, 0);

    return {
      subtotal: sub,
      taxAmount: tax,
      total: sub + tax,
    };
  }, [invoice]);

  // Handle payment success
  const handlePaymentSuccess = useCallback(
    (payment: PaymentResult) => {
      setIsPaid(true);
      setIsPayModalOpen(false);
      onPaid?.(payment);
    },
    [onPaid]
  );

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
    onPrint?.();
  }, [onPrint]);

  // Handle download (placeholder - would need PDF library)
  const handleDownload = useCallback(() => {
    // In real implementation, would generate PDF
    console.log('PDF download requested');
    onDownload?.();
  }, [onDownload]);

  if (!invoice) {
    return (
      <Card className={className} style={style} padding="lg">
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.textMuted,
          }}
        >
          {invoiceId ? 'Loading invoice...' : 'No invoice data provided'}
        </div>
      </Card>
    );
  }

  const isPaidStatus = isPaid || invoice.status === 'paid';

  // Payment QR code URL (would be actual payment link in production)
  const paymentUrl = recipient
    ? `ethereum:${recipient}?value=${total}&data=${invoice.reference}`
    : '';

  return (
    <>
      <Card
        className={className}
        style={{
          maxWidth: 800,
          margin: '0 auto',
          ...style,
        }}
        padding="lg"
      >
        {/* Action buttons */}
        <div
          className="arcpay-invoice-actions no-print"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
          }}
        >
          {showPrint && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print
            </Button>
          )}
          {showPdfDownload && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              Download PDF
            </Button>
          )}
          {showPayButton && !isPaidStatus && recipient && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPayModalOpen(true)}
            >
              Pay Now
            </Button>
          )}
        </div>

        {/* Invoice header */}
        <InvoiceHeader
          branding={branding}
          reference={invoice.reference}
          issuedDate={invoice.issuedDate}
          dueDate={invoice.dueDate}
          status={isPaidStatus ? 'paid' : invoice.status}
        />

        {/* Bill to */}
        <InvoiceBillTo customer={invoice.customer} />

        {/* Line items */}
        <LineItems items={invoice.items} currency={invoice.currency} />

        {/* Totals */}
        <InvoiceTotals
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          currency={invoice.currency}
          amountPaid={isPaidStatus ? total : undefined}
        />

        {/* Notes and terms */}
        {(invoice.notes || invoice.terms) && (
          <div
            style={{
              marginTop: theme.spacing.xl,
              paddingTop: theme.spacing.lg,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            {invoice.notes && (
              <div style={{ marginBottom: theme.spacing.md }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Notes
                </p>
                <p
                  style={{
                    margin: `${theme.spacing.xs} 0 0`,
                    fontSize: theme.fontSizes.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Terms & Conditions
                </p>
                <p
                  style={{
                    margin: `${theme.spacing.xs} 0 0`,
                    fontSize: theme.fontSizes.sm,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* QR Code */}
        {showQRCode && !isPaidStatus && paymentUrl && (
          <div
            style={{
              marginTop: theme.spacing.xl,
              textAlign: 'center',
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
            }}
          >
            <p
              style={{
                margin: `0 0 ${theme.spacing.md}`,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.textSecondary,
              }}
            >
              Scan to pay
            </p>
            <QRCodeSVG
              value={paymentUrl}
              size={160}
              level="M"
              includeMargin
              style={{
                padding: theme.spacing.sm,
                backgroundColor: '#fff',
                borderRadius: theme.borderRadius.md,
              }}
            />
          </div>
        )}

        {/* Test mode indicator */}
        {testMode && (
          <p
            style={{
              marginTop: theme.spacing.lg,
              textAlign: 'center',
              fontSize: theme.fontSizes.xs,
              color: theme.colors.warning,
            }}
          >
            Test Mode - No real transactions
          </p>
        )}
      </Card>

      {/* Payment modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Pay Invoice ${invoice.reference}`}
        size="md"
      >
        <Checkout
          items={[
            {
              name: `Invoice ${invoice.reference}`,
              price: total,
              quantity: 1,
            },
          ]}
          recipient={recipient || ''}
          currency={invoice.currency}
          branding={branding}
          showSummary={false}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setIsPayModalOpen(false)}
          testMode={testMode}
        />
      </Modal>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default Invoice;
