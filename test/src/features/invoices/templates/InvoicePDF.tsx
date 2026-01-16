import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Invoice } from '../types';

// Register fonts (using system fonts for now)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#0891b2',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
    marginBottom: 6,
  },
  valueBold: {
    fontSize: 10,
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: 6,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 600,
    color: '#0f172a',
  },
  descriptionCol: { flex: 4 },
  qtyCol: { flex: 1, textAlign: 'center' },
  priceCol: { flex: 2, textAlign: 'right' },
  totalCol: { flex: 2, textAlign: 'right' },
  totalsSection: {
    marginTop: 24,
    marginLeft: 'auto',
    width: 200,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  totalsValue: {
    fontSize: 10,
    color: '#0f172a',
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#0891b2',
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
  },
  totalsFinalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0891b2',
  },
  paymentSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#78350f',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
});

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#f1f5f9', text: '#64748b' },
  sent: { bg: '#dbeafe', text: '#1d4ed8' },
  viewed: { bg: '#e0e7ff', text: '#4338ca' },
  paid: { bg: '#dcfce7', text: '#16a34a' },
  partially_paid: { bg: '#fef3c7', text: '#d97706' },
  overdue: { bg: '#fee2e2', text: '#dc2626' },
  canceled: { bg: '#f1f5f9', text: '#64748b' },
};

interface InvoicePDFProps {
  invoice: Invoice;
  organization: {
    name: string;
    email?: string;
    address?: string;
    taxId?: string;
  };
  portalUrl?: string;
}

export function InvoicePDF({ invoice, organization, portalUrl }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const statusStyle = statusColors[invoice.status] || statusColors.draft;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>#{invoice.reference}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.brandName}>{organization.name}</Text>
            {organization.email && (
              <Text style={styles.subtitle}>{organization.email}</Text>
            )}
            {organization.address && (
              <Text style={styles.subtitle}>{organization.address}</Text>
            )}
          </View>
        </View>

        {/* Bill To / Invoice Info */}
        <View style={[styles.section, styles.row]}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            {invoice.customer?.companyName && (
              <Text style={styles.valueBold}>{invoice.customer.companyName}</Text>
            )}
            {invoice.customer?.contactName && (
              <Text style={styles.value}>{invoice.customer.contactName}</Text>
            )}
            {invoice.customer?.email && (
              <Text style={styles.value}>{invoice.customer.email}</Text>
            )}
            {invoice.customer?.walletAddress && (
              <Text style={[styles.value, { fontSize: 8, fontFamily: 'Courier' }]}>
                {invoice.customer.walletAddress}
              </Text>
            )}
          </View>
          <View style={[styles.column, { alignItems: 'flex-end' }]}>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {invoice.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.valueBold}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.descriptionCol]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.qtyCol]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.priceCol]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, styles.totalCol]}>Total</Text>
            </View>

            {/* Table Rows */}
            {invoice.lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.descriptionCol]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.qtyCol]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.priceCol]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCellBold, styles.totalCol]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
          )}
          {invoice.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{formatCurrency(invoice.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.totalsFinal}>
            <Text style={styles.totalsFinalLabel}>Total Due</Text>
            <Text style={styles.totalsFinalValue}>{formatCurrency(invoice.amount)}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.column}>
              <Text style={styles.label}>Accepted Payment</Text>
              <Text style={styles.value}>{invoice.currency || 'USDC'} (Stablecoin)</Text>
              {invoice.paymentUrl && (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>Payment URL</Text>
                  <Text style={[styles.value, { fontSize: 8 }]}>{invoice.paymentUrl}</Text>
                </>
              )}
            </View>
            {portalUrl && (
              <View style={[styles.column, { alignItems: 'flex-end' }]}>
                <Text style={styles.label}>Pay Online</Text>
                <Text style={[styles.value, { fontSize: 8 }]}>{portalUrl}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.value}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business! • Powered by ArcPay
          </Text>
        </View>
      </Page>
    </Document>
  );
}
