import { NextRequest, NextResponse } from 'next/server';
import { withCredits } from '@/lib/credits';

/**
 * Example credit-protected AI generation endpoint.
 *
 * This demonstrates a more expensive operation (higher credit cost)
 * that would typically be priced at $0.10 or more per request.
 */
export const POST = withCredits({
  // Optional: custom customer ID extraction
  getCustomerId: (req) => {
    // Check x-customer-id header first, then fall back to query param
    return req.headers.get('x-customer-id') || req.nextUrl.searchParams.get('customerId');
  },
  // Optional: custom top-up URL
  topUpUrl: '/dashboard/x402?action=deposit',
  // Optional: disable usage logging for this endpoint
  logUsage: true,
})(async (req, { credits }) => {
  try {
    const body = await req.json();
    const { prompt, maxTokens = 100 } = body;

    if (!prompt) {
      return NextResponse.json({
        error: 'Prompt is required',
        code: 'MISSING_PROMPT',
      }, { status: 400 });
    }

    // Simulate AI content generation
    // In production, this would call OpenAI, Anthropic, or similar
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time

    const generatedContent = {
      text: `Generated response for: "${prompt.slice(0, 50)}..."`,
      tokens: Math.min(maxTokens, 100),
      model: 'mock-gpt-4',
    };

    return NextResponse.json({
      success: true,
      data: generatedContent,
      billing: {
        transactionId: credits.transactionId,
        amount: credits.amount,
        currency: 'USDC',
        accountId: credits.accountId,
        balanceAfter: credits.balanceAfter,
      },
      usage: {
        promptTokens: prompt.split(/\s+/).length,
        completionTokens: generatedContent.tokens,
        totalTokens: prompt.split(/\s+/).length + generatedContent.tokens,
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({
      error: 'Generation failed',
      code: 'GENERATION_ERROR',
    }, { status: 500 });
  }
});

// GET method for endpoint documentation (not charged)
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/generate',
    method: 'POST',
    description: 'Generate AI content based on prompts',
    pricing: 'Check dashboard for current pricing (typically $0.10/request)',
    requiredHeaders: ['x-customer-id'],
    body: {
      prompt: 'string (required) - The prompt for generation',
      maxTokens: 'number (optional) - Maximum tokens to generate (default: 100)',
    },
    response: {
      text: 'string - Generated content',
      tokens: 'number - Tokens used',
      model: 'string - Model used for generation',
    },
  });
}
