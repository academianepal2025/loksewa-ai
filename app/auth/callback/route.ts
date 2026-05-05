import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getURL } from '@/lib/utils';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If this is a password recovery flow, redirect to the reset password page
  if (type === 'recovery') {
    return NextResponse.redirect(`${getURL()}auth/reset-password`);
  }

  // Default: redirect to dashboard after sign in
  return NextResponse.redirect(`${getURL()}dashboard`);
}
