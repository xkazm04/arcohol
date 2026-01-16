/**
 * Tax Calculator Service
 * Multi-jurisdiction tax calculation for invoices
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  TaxCalculation,
  TaxConfiguration,
  CustomerTaxSettings,
  CalculateTaxParams,
  TaxBreakdownItem,
  TaxType,
  InvoiceLineItem,
} from '../types';

/**
 * Common tax region codes
 */
export const TAX_REGIONS = {
  US: 'US',
  EU: 'EU',
  GB: 'GB',
  AU: 'AU',
  CA: 'CA',
  IN: 'IN',
  JP: 'JP',
  SG: 'SG',
} as const;

/**
 * Default US state tax rates (simplified)
 */
const DEFAULT_US_STATE_RATES: Record<string, number> = {
  CA: 7.25,
  NY: 8.0,
  TX: 6.25,
  FL: 6.0,
  WA: 6.5,
  // Add more as needed
};

/**
 * EU VAT rates by country code
 */
const EU_VAT_RATES: Record<string, number> = {
  DE: 19,
  FR: 20,
  IT: 22,
  ES: 21,
  NL: 21,
  BE: 21,
  AT: 20,
  PL: 23,
  PT: 23,
  SE: 25,
  // Add more as needed
};

/**
 * Tax Calculator Service - Singleton
 */
class TaxCalculatorService {
  private static instance: TaxCalculatorService;

  private constructor() {}

  static getInstance(): TaxCalculatorService {
    if (!TaxCalculatorService.instance) {
      TaxCalculatorService.instance = new TaxCalculatorService();
    }
    return TaxCalculatorService.instance;
  }

  /**
   * Calculate tax for an invoice
   */
  async calculateTax(params: CalculateTaxParams): Promise<TaxCalculation> {
    const supabase = createAdminClient();

    // Get customer tax settings
    const customerTaxSettings = await this.getCustomerTaxSettings(params.customerId);

    // Check for tax exemption
    if (customerTaxSettings?.taxExempt) {
      const isExemptionValid = this.isExemptionValid(customerTaxSettings);
      if (isExemptionValid) {
        return {
          taxAmount: 0,
          taxRate: 0,
          taxType: 'sales_tax',
          breakdown: [],
          reverseCharge: false,
          exemptReason: 'Customer is tax exempt',
        };
      }
    }

    // Get organization's tax configuration for the customer's region
    const taxRegion = customerTaxSettings?.taxRegion || 'US';
    const taxConfig = await this.getTaxConfigForRegion(params.organizationId, taxRegion);

    if (!taxConfig || !taxConfig.enabled) {
      // No tax configuration, return zero tax
      return {
        taxAmount: 0,
        taxRate: 0,
        taxType: 'sales_tax',
        breakdown: [],
        reverseCharge: false,
      };
    }

    // Check for reverse charge (B2B in EU)
    if (taxConfig.reverseChargeEnabled && customerTaxSettings?.taxId) {
      const isValidTaxId = await this.validateTaxId(customerTaxSettings.taxId, taxRegion);
      if (isValidTaxId) {
        return {
          taxAmount: 0,
          taxRate: 0,
          taxType: taxConfig.taxType,
          breakdown: [],
          reverseCharge: true,
          exemptReason: 'Reverse charge applies (valid tax ID)',
        };
      }
    }

    // Calculate tax based on region and configuration
    const taxRate = await this.getTaxRateForAddress(
      taxConfig,
      params.shippingAddress
    );

    const taxAmount = this.roundCurrency(params.subtotal * (taxRate / 100));

    // Build breakdown
    const breakdown: TaxBreakdownItem[] = [
      {
        name: this.getTaxName(taxConfig.taxType, taxRegion),
        rate: taxRate,
        amount: taxAmount,
      },
    ];

    return {
      taxAmount,
      taxRate,
      taxType: taxConfig.taxType,
      breakdown,
      reverseCharge: false,
    };
  }

  /**
   * Get customer tax settings
   */
  async getCustomerTaxSettings(customerId: string): Promise<CustomerTaxSettings | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('customer_tax_settings')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      customerId: data.customer_id,
      taxRegion: data.tax_region,
      taxId: data.tax_id,
      taxIdValidated: data.tax_id_validated,
      taxIdValidatedAt: data.tax_id_validated_at,
      taxExempt: data.tax_exempt,
      exemptionCertificateUrl: data.exemption_certificate_url,
      exemptionExpiresAt: data.exemption_expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Update customer tax settings
   */
  async updateCustomerTaxSettings(
    customerId: string,
    settings: Partial<CustomerTaxSettings>
  ): Promise<CustomerTaxSettings | null> {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (settings.taxRegion !== undefined) updateData.tax_region = settings.taxRegion;
    if (settings.taxId !== undefined) {
      updateData.tax_id = settings.taxId;
      updateData.tax_id_validated = false; // Reset validation when ID changes
    }
    if (settings.taxExempt !== undefined) updateData.tax_exempt = settings.taxExempt;
    if (settings.exemptionCertificateUrl !== undefined) {
      updateData.exemption_certificate_url = settings.exemptionCertificateUrl;
    }
    if (settings.exemptionExpiresAt !== undefined) {
      updateData.exemption_expires_at = settings.exemptionExpiresAt;
    }

    const { data, error } = await supabase
      .from('customer_tax_settings')
      .upsert(
        {
          customer_id: customerId,
          ...updateData,
        },
        {
          onConflict: 'customer_id',
        }
      )
      .select()
      .single();

    if (error || !data) return null;

    return this.getCustomerTaxSettings(customerId);
  }

  /**
   * Get tax configuration for a region
   */
  async getTaxConfigForRegion(
    organizationId: string,
    regionCode: string
  ): Promise<TaxConfiguration | null> {
    const supabase = createAdminClient();

    // Try to find exact region match
    let { data, error } = await supabase
      .from('tax_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('region_code', regionCode)
      .eq('enabled', true)
      .single();

    // If not found, try default configuration
    if (error || !data) {
      const { data: defaultConfig } = await supabase
        .from('tax_configurations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_default', true)
        .eq('enabled', true)
        .single();

      data = defaultConfig;
    }

    if (!data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      regionCode: data.region_code,
      taxType: data.tax_type as TaxType,
      defaultRate: parseFloat(data.default_rate),
      regionalRates: data.regional_rates,
      reverseChargeEnabled: data.reverse_charge_enabled,
      reverseChargeThreshold: data.reverse_charge_threshold
        ? parseFloat(data.reverse_charge_threshold)
        : undefined,
      isDefault: data.is_default,
      enabled: data.enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Get tax rate for a specific address
   */
  async getTaxRateForAddress(
    taxConfig: TaxConfiguration,
    address?: { country: string; state?: string; city?: string; postalCode?: string }
  ): Promise<number> {
    if (!address) {
      return taxConfig.defaultRate;
    }

    // Check for regional rate
    if (taxConfig.regionalRates && address.state) {
      const stateRate = taxConfig.regionalRates[address.state];
      if (stateRate !== undefined) {
        return stateRate;
      }
    }

    // Check for country-specific EU VAT
    if (taxConfig.regionCode === 'EU' && address.country) {
      const euRate = EU_VAT_RATES[address.country];
      if (euRate !== undefined) {
        return euRate;
      }
    }

    return taxConfig.defaultRate;
  }

  /**
   * Validate a tax ID (VAT number, EIN, etc.)
   * This is a simplified implementation - production would use VIES API for EU VAT validation
   */
  async validateTaxId(taxId: string, region: string): Promise<boolean> {
    // Basic format validation
    if (!taxId || taxId.length < 5) {
      return false;
    }

    // EU VAT number format validation
    if (region === 'EU' || EU_VAT_RATES[region]) {
      // EU VAT format: 2-letter country code + 2-12 alphanumeric characters
      const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,12}$/;
      if (!vatRegex.test(taxId.replace(/\s/g, '').toUpperCase())) {
        return false;
      }

      // In production, you would call the VIES API here
      // For now, we assume format-valid IDs are valid
      return true;
    }

    // US EIN format: XX-XXXXXXX
    if (region === 'US') {
      const einRegex = /^\d{2}-\d{7}$/;
      return einRegex.test(taxId);
    }

    // UK VAT format: GB + 9 or 12 digits
    if (region === 'GB') {
      const ukVatRegex = /^GB\d{9}(\d{3})?$/;
      return ukVatRegex.test(taxId.replace(/\s/g, '').toUpperCase());
    }

    // Default: accept if it has reasonable length
    return taxId.length >= 5 && taxId.length <= 20;
  }

  /**
   * Mark a tax ID as validated
   */
  async markTaxIdValidated(customerId: string): Promise<void> {
    const supabase = createAdminClient();

    await supabase
      .from('customer_tax_settings')
      .update({
        tax_id_validated: true,
        tax_id_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customerId);
  }

  /**
   * Check if a tax exemption is still valid
   */
  isExemptionValid(settings: CustomerTaxSettings): boolean {
    if (!settings.taxExempt) return false;

    if (settings.exemptionExpiresAt) {
      const expirationDate = new Date(settings.exemptionExpiresAt);
      if (expirationDate < new Date()) {
        return false; // Exemption has expired
      }
    }

    return true;
  }

  /**
   * Get a human-readable tax name
   */
  getTaxName(taxType: TaxType, region: string): string {
    switch (taxType) {
      case 'vat':
        return region === 'GB' ? 'UK VAT' : 'VAT';
      case 'gst':
        return 'GST';
      case 'sales_tax':
      default:
        return 'Sales Tax';
    }
  }

  /**
   * Round to 2 decimal places (currency rounding)
   */
  private roundCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * List all tax configurations for an organization
   */
  async listTaxConfigurations(organizationId: string): Promise<TaxConfiguration[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('tax_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      regionCode: row.region_code,
      taxType: row.tax_type as TaxType,
      defaultRate: parseFloat(row.default_rate),
      regionalRates: row.regional_rates,
      reverseChargeEnabled: row.reverse_charge_enabled,
      reverseChargeThreshold: row.reverse_charge_threshold
        ? parseFloat(row.reverse_charge_threshold)
        : undefined,
      isDefault: row.is_default,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Create a new tax configuration
   */
  async createTaxConfiguration(
    organizationId: string,
    config: Omit<TaxConfiguration, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
  ): Promise<TaxConfiguration | null> {
    const supabase = createAdminClient();

    // If this is set as default, unset other defaults
    if (config.isDefault) {
      await supabase
        .from('tax_configurations')
        .update({ is_default: false })
        .eq('organization_id', organizationId);
    }

    const { data, error } = await supabase
      .from('tax_configurations')
      .insert({
        organization_id: organizationId,
        name: config.name,
        region_code: config.regionCode,
        tax_type: config.taxType,
        default_rate: config.defaultRate,
        regional_rates: config.regionalRates || null,
        reverse_charge_enabled: config.reverseChargeEnabled,
        reverse_charge_threshold: config.reverseChargeThreshold || null,
        is_default: config.isDefault,
        enabled: config.enabled,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      regionCode: data.region_code,
      taxType: data.tax_type as TaxType,
      defaultRate: parseFloat(data.default_rate),
      regionalRates: data.regional_rates,
      reverseChargeEnabled: data.reverse_charge_enabled,
      reverseChargeThreshold: data.reverse_charge_threshold
        ? parseFloat(data.reverse_charge_threshold)
        : undefined,
      isDefault: data.is_default,
      enabled: data.enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Update a tax configuration
   */
  async updateTaxConfiguration(
    configId: string,
    updates: Partial<TaxConfiguration>
  ): Promise<TaxConfiguration | null> {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.regionCode !== undefined) updateData.region_code = updates.regionCode;
    if (updates.taxType !== undefined) updateData.tax_type = updates.taxType;
    if (updates.defaultRate !== undefined) updateData.default_rate = updates.defaultRate;
    if (updates.regionalRates !== undefined) updateData.regional_rates = updates.regionalRates;
    if (updates.reverseChargeEnabled !== undefined) {
      updateData.reverse_charge_enabled = updates.reverseChargeEnabled;
    }
    if (updates.reverseChargeThreshold !== undefined) {
      updateData.reverse_charge_threshold = updates.reverseChargeThreshold;
    }
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;

    const { data, error } = await supabase
      .from('tax_configurations')
      .update(updateData)
      .eq('id', configId)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      regionCode: data.region_code,
      taxType: data.tax_type as TaxType,
      defaultRate: parseFloat(data.default_rate),
      regionalRates: data.regional_rates,
      reverseChargeEnabled: data.reverse_charge_enabled,
      reverseChargeThreshold: data.reverse_charge_threshold
        ? parseFloat(data.reverse_charge_threshold)
        : undefined,
      isDefault: data.is_default,
      enabled: data.enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Delete a tax configuration
   */
  async deleteTaxConfiguration(configId: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('tax_configurations')
      .delete()
      .eq('id', configId);

    return !error;
  }
}

// Export singleton instance
export const taxCalculator = TaxCalculatorService.getInstance();

// Export class for testing
export { TaxCalculatorService };
