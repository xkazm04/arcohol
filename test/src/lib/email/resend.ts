import { Resend } from 'resend';

/**
 * Resend client singleton
 */
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Default sender email address
 */
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'invoices@arcpay.io';

/**
 * Check if Resend is configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
