import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface CreditsContext {
  accountId: string;
  externalCustomerId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionId: string;
}

export interface CreditProtectedRequest extends NextRequest {
  credits?: CreditsContext;
}

type Handler = (
  req: NextRequest,
  context: { params?: Record<string, string>; credits: CreditsContext }
) => Promise<NextResponse>;

interface WithCreditsConfig {
  getCustomerId?: (req: NextRequest) => string | null | undefined;
  topUpUrl?: string;
  logUsage?: boolean;
}

/**
 * Middleware wrapper for protecting API endpoints with credit-based billing.
 *
 * Usage:
 * ```typescript
 * export const POST = withCredits()(async (req, { credits }) => {
 *   // Your handler - credits are already deducted
 *   console.log(`Charged ${credits.amount} credits`);
 *   return NextResponse.json({ data: 'result' });
 * });
 * ```
 */
export function withCredits(config: WithCreditsConfig = {}) {
  const {
    getCustomerId = (req) => req.headers.get('x-customer-id'),
    topUpUrl = '/dashboard/billing',
    logUsage = true,
  } = config;

  return (handler: Handler) => {
    return async (req: NextRequest, routeContext?: { params?: Record<string, string> }): Promise<NextResponse> => {
      const supabase = await createClient();

      // Get user's organization
      const { data: { user } } = await supabase.auth.getUser();

      // For API routes, we need to identify the organization from API key or header
      const apiKey = req.headers.get('x-api-key');
      const customerId = getCustomerId(req);

      if (!customerId) {
        return NextResponse.json({
          error: 'Customer identification required',
          code: 'CUSTOMER_ID_REQUIRED',
          message: 'Please provide x-customer-id header or configure API key mapping',
        }, { status: 400 });
      }

      // Get organization ID from API key or authenticated user
      let organizationId: string | null = null;

      if (apiKey) {
        const { data: keyData } = await supabase
          .from('api_keys')
          .select('organization_id, credit_account_id')
          .eq('key_hash', hashApiKey(apiKey))
          .single();

        organizationId = keyData?.organization_id || null;
      } else if (user) {
        const { data: profile } = await supabase
          .from('org_profiles')
          .select('current_organization_id')
          .eq('id', user.id)
          .single();

        organizationId = profile?.current_organization_id || null;
      }

      if (!organizationId) {
        return NextResponse.json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          message: 'Valid API key or authentication required',
        }, { status: 401 });
      }

      // Get endpoint pricing
      const path = req.nextUrl.pathname;
      const method = req.method;

      const { data: endpoint } = await supabase
        .from('api_credit_endpoints')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('active', true)
        .or(`method.eq.${method},method.eq.*`)
        .order('path', { ascending: false });

      // Find matching endpoint (support wildcards)
      const matchingEndpoint = endpoint?.find(ep => matchPath(ep.path, path));

      if (!matchingEndpoint) {
        return NextResponse.json({
          error: 'Endpoint not configured for billing',
          code: 'ENDPOINT_NOT_CONFIGURED',
          message: 'This endpoint is not configured for credit-based billing',
        }, { status: 400 });
      }

      const price = matchingEndpoint.price_per_call;

      // Get or create customer credit account
      let { data: account } = await supabase
        .from('api_credit_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('external_customer_id', customerId)
        .single();

      if (!account) {
        // Auto-create account
        const { data: newAccount, error: createError } = await supabase
          .from('api_credit_accounts')
          .insert({
            organization_id: organizationId,
            external_customer_id: customerId,
            balance: 0,
            currency: 'USDC',
          })
          .select()
          .single();

        if (createError) {
          return NextResponse.json({
            error: 'Failed to create credit account',
            code: 'ACCOUNT_CREATION_FAILED',
          }, { status: 500 });
        }

        account = newAccount;
      }

      // Check balance
      if (account.balance < price) {
        return NextResponse.json({
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          balance: account.balance,
          required: price,
          currency: account.currency,
          topUpUrl: topUpUrl,
        }, { status: 402 });
      }

      // Deduct credits using the database function
      const { data: deductionResult, error: deductionError } = await supabase
        .rpc('deduct_api_credits', {
          p_account_id: account.id,
          p_amount: price,
          p_endpoint_id: matchingEndpoint.id,
          p_request_id: crypto.randomUUID(),
          p_description: `API call to ${method} ${path}`,
          p_metadata: {
            path,
            method,
            endpoint_name: matchingEndpoint.name,
          },
        });

      if (deductionError || !deductionResult?.[0]?.success) {
        return NextResponse.json({
          error: deductionResult?.[0]?.error_message || 'Failed to deduct credits',
          code: 'DEDUCTION_FAILED',
        }, { status: 500 });
      }

      const result = deductionResult[0];

      // Log usage if enabled
      if (logUsage) {
        await supabase
          .from('api_usage_logs')
          .insert({
            organization_id: organizationId,
            account_id: account.id,
            endpoint_id: matchingEndpoint.id,
            request_id: crypto.randomUUID(),
            path,
            method,
            credits_charged: price,
            response_status: 200, // Will be updated if handler fails
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
          });
      }

      // Call the actual handler with credits context
      const creditsContext: CreditsContext = {
        accountId: account.id,
        externalCustomerId: customerId,
        amount: price,
        balanceBefore: result.balance_before,
        balanceAfter: result.balance_after,
        transactionId: result.transaction_id,
      };

      try {
        const response = await handler(req, {
          params: routeContext?.params,
          credits: creditsContext,
        });

        return response;
      } catch (error) {
        // Note: credits are already deducted, consider refund logic if needed
        console.error('Handler error:', error);
        throw error;
      }
    };
  };
}

// Helper to match paths with wildcards
function matchPath(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  if (pattern === '*' || pattern === '/*') return true;

  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/:[^/]+/g, '[^/]+');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

// Simple API key hashing (in production, use a proper hash)
function hashApiKey(key: string): string {
  // This is a placeholder - in production, use SHA-256 or similar
  return key;
}
