import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { magicLinkService } from '@/features/invoices/services/magic-link';
import { getResendClient, DEFAULT_FROM_EMAIL, isResendConfigured } from '@/lib/email/resend';

/**
 * POST: Request a magic link for portal access
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizationSlug } = body as {
      email: string;
      organizationSlug: string;
    };

    if (!email || !organizationSlug) {
      return NextResponse.json(
        { error: 'Email and organization slug are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('slug', organizationSlug)
      .single();

    if (!org) {
      // Don't reveal if org exists - return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a magic link has been sent.',
      });
    }

    // Find customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('organization_id', org.id)
      .single();

    if (!customer) {
      // Don't reveal if customer exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a magic link has been sent.',
      });
    }

    // Create magic link
    const link = await magicLinkService.createCustomerPortalLink(org.id, customer.id);

    // Send email with magic link
    if (isResendConfigured()) {
      const resend = getResendClient();
      await resend.emails.send({
        from: `${org.name} <${DEFAULT_FROM_EMAIL}>`,
        to: email,
        subject: `Your login link for ${org.name} portal`,
        html: generateMagicLinkEmail(org.name, link.url, link.expiresAt),
        text: `Your login link for ${org.name} portal:\n\n${link.url}\n\nThis link expires on ${link.expiresAt.toLocaleDateString()}.`,
      });
    } else {
      // Log for development
      console.log(`[Portal Auth] Magic link for ${email}: ${link.url}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a magic link has been sent.',
    });
  } catch (error) {
    console.error('Portal auth request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

function generateMagicLinkEmail(orgName: string, url: string, expiresAt: Date): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="500" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px 0; color: #0f172a; font-size: 24px; font-weight: 600;">
                Sign in to ${orgName} Portal
              </h1>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Click the button below to securely access your invoices and subscriptions.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #0891b2; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">
                This link expires on ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; text-align: center;">
                Powered by <a href="https://arcpay.io" style="color: #0891b2; text-decoration: none;">ArcPay</a>
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
}
