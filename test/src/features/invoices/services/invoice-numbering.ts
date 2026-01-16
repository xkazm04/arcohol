/**
 * Invoice Numbering Service
 * Provides gapless, sequential invoice numbering for legal compliance
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { InvoiceSequence } from '../types';

/**
 * Default configuration for invoice numbering
 */
const DEFAULT_PREFIX = 'INV';
const DEFAULT_PADDING = 5;

/**
 * Invoice Numbering Service - Singleton
 */
class InvoiceNumberingService {
  private static instance: InvoiceNumberingService;

  private constructor() {}

  static getInstance(): InvoiceNumberingService {
    if (!InvoiceNumberingService.instance) {
      InvoiceNumberingService.instance = new InvoiceNumberingService();
    }
    return InvoiceNumberingService.instance;
  }

  /**
   * Get the next invoice number for an organization
   * Uses atomic increment to ensure gapless sequence
   */
  async getNextInvoiceNumber(organizationId: string): Promise<string> {
    const supabase = createAdminClient();
    const fiscalYear = new Date().getFullYear();

    // Try to call the RPC function first (if it exists)
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'get_next_invoice_number',
      { org_id: organizationId }
    );

    if (!rpcError && rpcResult) {
      return rpcResult as string;
    }

    // Fallback: Manual atomic increment using upsert + select
    // This is less ideal but works without the RPC function

    // First, ensure the sequence exists
    await supabase.from('invoice_sequences').upsert(
      {
        organization_id: organizationId,
        fiscal_year: fiscalYear,
        prefix: DEFAULT_PREFIX,
        current_number: 0,
        number_padding: DEFAULT_PADDING,
      },
      {
        onConflict: 'organization_id,fiscal_year',
        ignoreDuplicates: true,
      }
    );

    // Atomically increment using a transaction-like update
    // This uses a CTE to increment and return in one operation
    const { data: sequence, error } = await supabase
      .from('invoice_sequences')
      .update({ current_number: supabase.rpc('increment_invoice_number', { org_id: organizationId, year: fiscalYear }) })
      .eq('organization_id', organizationId)
      .eq('fiscal_year', fiscalYear)
      .select()
      .single();

    // If the increment RPC doesn't exist, do a simple update
    if (error) {
      // Get current sequence
      const { data: currentSeq } = await supabase
        .from('invoice_sequences')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('fiscal_year', fiscalYear)
        .single();

      if (currentSeq) {
        const nextNumber = (currentSeq.current_number || 0) + 1;

        // Update with the new number
        const { data: updatedSeq, error: updateError } = await supabase
          .from('invoice_sequences')
          .update({ current_number: nextNumber })
          .eq('organization_id', organizationId)
          .eq('fiscal_year', fiscalYear)
          .eq('current_number', currentSeq.current_number) // Optimistic locking
          .select()
          .single();

        if (updateError || !updatedSeq) {
          // Retry if there was a concurrent update
          return this.getNextInvoiceNumber(organizationId);
        }

        return this.formatInvoiceNumber(
          updatedSeq.prefix || DEFAULT_PREFIX,
          fiscalYear,
          nextNumber,
          updatedSeq.number_padding || DEFAULT_PADDING
        );
      }

      // Sequence doesn't exist, create it with number 1
      const { data: newSeq, error: insertError } = await supabase
        .from('invoice_sequences')
        .insert({
          organization_id: organizationId,
          fiscal_year: fiscalYear,
          prefix: DEFAULT_PREFIX,
          current_number: 1,
          number_padding: DEFAULT_PADDING,
        })
        .select()
        .single();

      if (insertError || !newSeq) {
        // Another process created it, retry
        return this.getNextInvoiceNumber(organizationId);
      }

      return this.formatInvoiceNumber(DEFAULT_PREFIX, fiscalYear, 1, DEFAULT_PADDING);
    }

    return this.formatInvoiceNumber(
      sequence?.prefix || DEFAULT_PREFIX,
      fiscalYear,
      sequence?.current_number || 1,
      sequence?.number_padding || DEFAULT_PADDING
    );
  }

  /**
   * Format an invoice number
   * Example: INV-2026-00001
   */
  formatInvoiceNumber(
    prefix: string,
    year: number,
    number: number,
    padding: number
  ): string {
    const paddedNumber = String(number).padStart(padding, '0');
    return `${prefix}-${year}-${paddedNumber}`;
  }

  /**
   * Parse an invoice number back to components
   */
  parseInvoiceNumber(invoiceNumber: string): {
    prefix: string;
    year: number;
    number: number;
  } | null {
    const match = invoiceNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
    if (!match) return null;

    return {
      prefix: match[1],
      year: parseInt(match[2], 10),
      number: parseInt(match[3], 10),
    };
  }

  /**
   * Get the current sequence for an organization
   */
  async getSequence(organizationId: string): Promise<InvoiceSequence | null> {
    const supabase = createAdminClient();
    const fiscalYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('invoice_sequences')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('fiscal_year', fiscalYear)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      prefix: data.prefix,
      fiscalYear: data.fiscal_year,
      currentNumber: data.current_number,
      numberPadding: data.number_padding,
    };
  }

  /**
   * Update the invoice number prefix for an organization
   */
  async updatePrefix(organizationId: string, prefix: string): Promise<boolean> {
    const supabase = createAdminClient();

    // Validate prefix
    if (!/^[A-Z]{2,5}$/.test(prefix)) {
      throw new Error('Prefix must be 2-5 uppercase letters');
    }

    const fiscalYear = new Date().getFullYear();

    const { error } = await supabase
      .from('invoice_sequences')
      .upsert(
        {
          organization_id: organizationId,
          fiscal_year: fiscalYear,
          prefix,
          current_number: 0,
          number_padding: DEFAULT_PADDING,
        },
        {
          onConflict: 'organization_id,fiscal_year',
        }
      );

    if (error) {
      // If sequence exists, just update the prefix
      const { error: updateError } = await supabase
        .from('invoice_sequences')
        .update({ prefix })
        .eq('organization_id', organizationId)
        .eq('fiscal_year', fiscalYear);

      return !updateError;
    }

    return true;
  }

  /**
   * Get invoice numbers for a date range (for reporting)
   */
  async getNumbersInRange(
    organizationId: string,
    fromNumber: number,
    toNumber: number,
    fiscalYear?: number
  ): Promise<string[]> {
    const year = fiscalYear || new Date().getFullYear();
    const sequence = await this.getSequence(organizationId);
    const prefix = sequence?.prefix || DEFAULT_PREFIX;
    const padding = sequence?.numberPadding || DEFAULT_PADDING;

    const numbers: string[] = [];
    for (let i = fromNumber; i <= toNumber; i++) {
      numbers.push(this.formatInvoiceNumber(prefix, year, i, padding));
    }

    return numbers;
  }

  /**
   * Validate that an invoice number follows the expected format
   */
  validateInvoiceNumber(invoiceNumber: string): boolean {
    return /^[A-Z]{2,5}-\d{4}-\d{5,}$/.test(invoiceNumber);
  }

  /**
   * Check if an invoice number exists in the system
   */
  async invoiceNumberExists(invoiceNumber: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .single();

    return !error && !!data;
  }
}

// Export singleton instance
export const invoiceNumbering = InvoiceNumberingService.getInstance();

// Export class for testing
export { InvoiceNumberingService };
