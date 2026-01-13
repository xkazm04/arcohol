import { NextRequest, NextResponse } from 'next/server';
import { withCredits } from '@/lib/credits';

/**
 * Example credit-protected API endpoint.
 *
 * This endpoint demonstrates how to use the withCredits middleware
 * to automatically charge customers for API usage.
 *
 * To use this endpoint, clients must:
 * 1. Include `x-customer-id` header with their registered customer ID
 * 2. Have sufficient credits in their account
 *
 * Pricing is configured in the dashboard under API Monetization > Endpoints.
 */
export const POST = withCredits()(async (req, { credits }) => {
  // The credits have already been deducted at this point
  // credits.accountId - The credit account that was charged
  // credits.amount - Amount charged for this request
  // credits.balanceAfter - Remaining balance after charge

  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({
        error: 'Content is required',
        code: 'MISSING_CONTENT',
      }, { status: 400 });
    }

    // Simulate content analysis
    // In a real app, this would call an AI service, process data, etc.
    const analysis = {
      wordCount: content.split(/\s+/).length,
      charCount: content.length,
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      readability: Math.floor(Math.random() * 100),
      topics: ['technology', 'business'],
      creditsCharged: credits.amount,
      remainingBalance: credits.balanceAfter,
    };

    return NextResponse.json({
      success: true,
      data: analysis,
      billing: {
        transactionId: credits.transactionId,
        amount: credits.amount,
        currency: 'USDC',
        balanceAfter: credits.balanceAfter,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      code: 'ANALYSIS_ERROR',
    }, { status: 500 });
  }
});

// GET method for checking endpoint info (not charged)
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/analyze',
    method: 'POST',
    description: 'Analyze content using AI-powered analysis',
    pricing: 'Check dashboard for current pricing',
    requiredHeaders: ['x-customer-id'],
    body: {
      content: 'string (required) - The content to analyze',
    },
    response: {
      wordCount: 'number',
      charCount: 'number',
      sentiment: 'positive | neutral | negative',
      readability: 'number (0-100)',
      topics: 'string[]',
    },
  });
}
