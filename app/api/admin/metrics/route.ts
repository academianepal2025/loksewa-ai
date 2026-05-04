import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['shahrammy131@gmail.com'];

export async function GET(req: Request) {
  try {
    // 1. Verify User Session using the normal authenticated client
    const supabaseUserClient = await createServerClient();
    const { data: { session } } = await supabaseUserClient.auth.getSession();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Initialize Supabase Admin Client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // WARNING: If SUPABASE_SERVICE_ROLE_KEY is not set, this will fall back to anon key
    // which will only return data for the authenticated user due to RLS.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Fetch Metrics
    
    // a. Total Users & Signups
    // Note: If using anon key, auth.admin will throw an error, so we wrap in try/catch.
    let totalUsers = 0;
    let recentSignups: any[] = [];
    try {
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (!usersError && usersData?.users) {
        totalUsers = usersData.users.length;
        recentSignups = usersData.users
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at
          }));
      }
    } catch (e) {
      console.warn("Could not fetch auth users (likely missing SERVICE_ROLE_KEY).", e);
    }

    // b. Documents Processed Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayDocs } = await supabaseAdmin
      .from('documents')
      .select('id, file_name, processing_status, doc_type, created_at')
      .gte('created_at', today.toISOString());

    const docsTodayCount = todayDocs ? todayDocs.length : 0;
    
    // Approximate API calls: 
    // Usually 1 document = ~12 chunk embed calls + 1 parsing call
    const approxApiCallsToday = docsTodayCount * 13;

    // c. Failed Documents
    const { data: failedDocs } = await supabaseAdmin
      .from('documents')
      .select('id, file_name, created_at, user_id')
      .eq('processing_status', 'failed')
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        paidUsers: 0, // Placeholder
        freeUsers: totalUsers, // Placeholder
        docsTodayCount,
        approxApiCallsToday,
        recentSignups,
        failedDocs: failedDocs || []
      }
    });

  } catch (error: any) {
    console.error('Admin Metrics API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
