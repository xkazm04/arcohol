import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Session exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Get user error:', userError);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('org_profiles')
      .select('id, onboarding_completed, current_organization_id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it (fallback for when trigger fails)
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating...');

      const { error: insertError } = await supabase
        .from('org_profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          onboarding_completed: false,
        });

      if (insertError) {
        console.error('Profile creation error:', insertError);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to create profile: ' + insertError.message)}`);
      }

      // New user - redirect to onboarding
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(profileError.message)}`);
    }

    // Check if user needs onboarding
    if (!profile.onboarding_completed || !profile.current_organization_id) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    // Returning user - redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
