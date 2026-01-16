import { NextRequest, NextResponse } from 'next/server';
import { magicLinkService } from '@/features/invoices/services/magic-link';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// Session cookie name and duration
const SESSION_COOKIE = 'portal_session';
const SESSION_DURATION_DAYS = 7;

/**
 * GET: Verify a magic link token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token
    const session = await magicLinkService.verifyToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Create session cookie
    const sessionToken = createSessionToken(session.organizationId, session.customerId);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return NextResponse.json({
      success: true,
      organizationId: session.organizationId,
      customerId: session.customerId,
      invoiceId: session.invoiceId,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Portal auth verify error:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}

/**
 * POST: Verify session cookie (for client-side auth check)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = parseSessionToken(sessionCookie.value);

    if (!session) {
      // Clear invalid cookie
      cookieStore.delete(SESSION_COOKIE);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      organizationId: session.organizationId,
      customerId: session.customerId,
    });
  } catch (error) {
    console.error('Portal session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

/**
 * DELETE: Logout (clear session)
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portal logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

// Simple session token format: base64(orgId:customerId:expiry:signature)
function createSessionToken(organizationId: string, customerId: string): string {
  const secret = process.env.SESSION_SECRET || 'arcpay-portal-session-secret';
  const expiry = Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const data = `${organizationId}:${customerId}:${expiry}`;
  const signature = createHash('sha256')
    .update(data + secret)
    .digest('hex')
    .slice(0, 16);
  return Buffer.from(`${data}:${signature}`).toString('base64url');
}

function parseSessionToken(
  token: string
): { organizationId: string; customerId: string } | null {
  try {
    const secret = process.env.SESSION_SECRET || 'arcpay-portal-session-secret';
    const decoded = Buffer.from(token, 'base64url').toString();
    const [organizationId, customerId, expiryStr, signature] = decoded.split(':');

    if (!organizationId || !customerId || !expiryStr || !signature) {
      return null;
    }

    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      return null;
    }

    const data = `${organizationId}:${customerId}:${expiryStr}`;
    const expectedSignature = createHash('sha256')
      .update(data + secret)
      .digest('hex')
      .slice(0, 16);

    if (signature !== expectedSignature) {
      return null;
    }

    return { organizationId, customerId };
  } catch {
    return null;
  }
}
