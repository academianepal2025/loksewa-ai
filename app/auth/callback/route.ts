import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getURL } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${getURL()}auth/reset-password`);
      }
      const redirectPath = next.startsWith('/') ? next.slice(1) : next;
      return NextResponse.redirect(`${getURL()}${redirectPath}`);
    }
    
    console.error('Exchange code error:', error.message);
  }

  return NextResponse.redirect(`${getURL()}auth/signin?error=oauth_callback_failed`);
}
