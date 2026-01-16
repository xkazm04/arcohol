import { createAdminClient } from '@/lib/supabase/admin';
import { createHash, randomBytes } from 'crypto';

interface PortalLink {
  url: string;
  token: string;
  expiresAt: Date;
}

interface PortalSession {
  organizationId: string;
  customerId: string;
  invoiceId?: string;
  expiresAt: Date;
}

/**
 * Service for generating and verifying magic link tokens for buyer portal access
 */
export class MagicLinkService {
  private supabase = createAdminClient();

  // Token validity period (7 days)
  private readonly TOKEN_EXPIRY_DAYS = 7;

  /**
   * Create a portal access link for an invoice
   */
  async createPortalLink(
    invoiceId: string,
    organizationId: string,
    customerId: string
  ): Promise<PortalLink> {
    // Generate secure token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.TOKEN_EXPIRY_DAYS);

    // Get organization slug for URL
    const { data: org } = await this.supabase
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single();

    const orgSlug = org?.slug || organizationId;

    // Store token in database
    const { error } = await this.supabase.from('portal_access_tokens').insert({
      organization_id: organizationId,
      customer_id: customerId,
      token_hash: tokenHash,
      invoice_id: invoiceId,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error('Error creating portal access token:', error);
      throw new Error('Failed to create portal link');
    }

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.arcpay.io';
    const url = `${baseUrl}/portal/${orgSlug}/invoices/${invoiceId}?token=${token}`;

    return {
      url,
      token,
      expiresAt,
    };
  }

  /**
   * Create a general portal access link for a customer (view all invoices)
   */
  async createCustomerPortalLink(
    organizationId: string,
    customerId: string
  ): Promise<PortalLink> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.TOKEN_EXPIRY_DAYS);

    // Get organization slug
    const { data: org } = await this.supabase
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single();

    const orgSlug = org?.slug || organizationId;

    // Store token
    const { error } = await this.supabase.from('portal_access_tokens').insert({
      organization_id: organizationId,
      customer_id: customerId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      throw new Error('Failed to create portal link');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.arcpay.io';
    const url = `${baseUrl}/portal/${orgSlug}?token=${token}`;

    return {
      url,
      token,
      expiresAt,
    };
  }

  /**
   * Verify a portal access token
   */
  async verifyToken(token: string): Promise<PortalSession | null> {
    const tokenHash = this.hashToken(token);

    const { data, error } = await this.supabase
      .from('portal_access_tokens')
      .select('id, organization_id, customer_id, invoice_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    // Mark as used (but allow multiple uses within expiry period)
    if (!data.used_at) {
      await this.supabase
        .from('portal_access_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);
    }

    return {
      organizationId: data.organization_id,
      customerId: data.customer_id,
      invoiceId: data.invoice_id,
      expiresAt,
    };
  }

  /**
   * Request a new magic link via email
   */
  async requestMagicLink(
    email: string,
    organizationSlug: string
  ): Promise<{ success: boolean; error?: string }> {
    // Find customer by email and organization
    const { data: org } = await this.supabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .single();

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    const { data: customer } = await this.supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .eq('organization_id', org.id)
      .single();

    if (!customer) {
      // Don't reveal if customer exists or not
      // Still return success to prevent email enumeration
      return { success: true };
    }

    // Create portal link
    const link = await this.createCustomerPortalLink(org.id, customer.id);

    // Send email with magic link (uses email service)
    // This will be called from the portal auth API route
    console.log(`[MagicLink] Created portal link for ${email}: ${link.url}`);

    return { success: true };
  }

  /**
   * Revoke all tokens for a customer
   */
  async revokeCustomerTokens(
    organizationId: string,
    customerId: string
  ): Promise<void> {
    await this.supabase
      .from('portal_access_tokens')
      .delete()
      .eq('organization_id', organizationId)
      .eq('customer_id', customerId);
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const { count } = await this.supabase
      .from('portal_access_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('*', { count: 'exact', head: true });

    return count || 0;
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Hash a token for storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

// Export singleton instance
export const magicLinkService = new MagicLinkService();
