import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ orgSlug: string }>;
}

/**
 * GET: Get organization info for portal
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgSlug } = await params;
    const supabase = createAdminClient();

    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, name, slug, settings')
      .eq('slug', orgSlug)
      .single();

    if (error || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        name: org.name,
        slug: org.slug,
        brandColor: org.settings?.brandColor,
      },
    });
  } catch (error) {
    console.error('Portal org info error:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
}
