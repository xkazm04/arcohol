import React from 'react';
import { useTheme } from '../../../theme';
import { Badge } from '../../primitives/Badge';
import type { InvoiceHeaderProps, InvoiceStatus } from './types';

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get status badge variant
 */
function getStatusVariant(status?: InvoiceStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'sent':
    case 'viewed':
      return 'info';
    case 'overdue':
      return 'error';
    case 'draft':
      return 'default';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Invoice header component
 */
export function InvoiceHeader({
  branding,
  reference,
  issuedDate,
  dueDate,
  status,
}: InvoiceHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className="arcpay-invoice-header">
      {/* Company branding */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.xl,
        }}
      >
        <div>
          {branding?.logo && (
            <img
              src={branding.logo}
              alt={branding.logoAlt || branding.companyName}
              style={{ height: 48, marginBottom: theme.spacing.md }}
            />
          )}
          {branding?.companyName && (
            <h2
              style={{
                margin: 0,
                fontSize: theme.fontSizes['2xl'],
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              {branding.companyName}
            </h2>
          )}
          {branding?.companyAddress && (
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
                whiteSpace: 'pre-line',
              }}
            >
              {branding.companyAddress}
            </p>
          )}
          {(branding?.companyEmail || branding?.companyPhone) && (
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
              }}
            >
              {branding.companyEmail}
              {branding.companyEmail && branding.companyPhone && ' | '}
              {branding.companyPhone}
            </p>
          )}
          {branding?.companyTaxId && (
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                color: theme.colors.textMuted,
                fontSize: theme.fontSizes.xs,
              }}
            >
              Tax ID: {branding.companyTaxId}
            </p>
          )}
        </div>

        {/* Invoice title and reference */}
        <div style={{ textAlign: 'right' }}>
          <h1
            style={{
              margin: 0,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: 700,
              color: theme.colors.text,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Invoice
          </h1>
          <p
            style={{
              margin: `${theme.spacing.xs} 0 0`,
              fontSize: theme.fontSizes.lg,
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.mono,
            }}
          >
            {reference}
          </p>
          {status && (
            <div style={{ marginTop: theme.spacing.sm }}>
              <Badge variant={getStatusVariant(status)} size="md">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
        }}
      >
        {issuedDate && (
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
              Issue Date
            </p>
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                fontSize: theme.fontSizes.md,
                color: theme.colors.text,
                fontWeight: 500,
              }}
            >
              {formatDate(issuedDate)}
            </p>
          </div>
        )}
        {dueDate && (
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
              Due Date
            </p>
            <p
              style={{
                margin: `${theme.spacing.xs} 0 0`,
                fontSize: theme.fontSizes.md,
                color: theme.colors.text,
                fontWeight: 500,
              }}
            >
              {formatDate(dueDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bill to section
 */
export function InvoiceBillTo({ customer }: { customer: InvoiceHeaderProps extends { customer: infer C } ? C : never } & { customer: { name: string; email?: string; address?: string; taxId?: string } }) {
  const { theme } = useTheme();

  return (
    <div
      className="arcpay-invoice-bill-to"
      style={{ marginTop: theme.spacing.xl }}
    >
      <p
        style={{
          margin: 0,
          fontSize: theme.fontSizes.xs,
          color: theme.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Bill To
      </p>
      <h3
        style={{
          margin: `${theme.spacing.xs} 0 0`,
          fontSize: theme.fontSizes.lg,
          fontWeight: 600,
          color: theme.colors.text,
        }}
      >
        {customer.name}
      </h3>
      {customer.email && (
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {customer.email}
        </p>
      )}
      {customer.address && (
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
            whiteSpace: 'pre-line',
          }}
        >
          {customer.address}
        </p>
      )}
      {customer.taxId && (
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textMuted,
          }}
        >
          Tax ID: {customer.taxId}
        </p>
      )}
    </div>
  );
}
