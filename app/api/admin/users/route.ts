import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('[admin/users] GET request started');
    const { error: authError, user: adminUser } = await verifyAdmin();
    if (authError) {
      console.warn('[admin/users] Admin verification failed');
      return authError;
    }

    const supabaseAdmin = createAdminClient();
    const url = new URL(req.url);

    const search = url.searchParams.get('search') || '';
    const filter = url.searchParams.get('filter') || 'all';
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log(`[admin/users] Params - Search: "${search}", Filter: "${filter}", Page: ${page}`);

    // Build profiles query
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, photo_url, created_at');

    // Search
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Sort
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'alpha') {
      query = query.order('full_name', { ascending: true });
    }

    console.log('[admin/users] Fetching profiles...');
    const { data: profiles, error: profilesError } = await query;
    
    if (profilesError) {
      console.error('[admin/users] Profiles Fetch Error:', profilesError);
      return NextResponse.json({ error: `Profiles: ${profilesError.message}` }, { status: 500 });
    }

    console.log(`[admin/users] Found ${profiles?.length || 0} profiles matching search.`);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: { users: [], total: 0, page, limit }
      });
    }

    const allUserIds = profiles.map((p: any) => p.id);

    // Fetch subscriptions only for these matching profiles
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan, status, expires_at')
      .in('user_id', allUserIds);

    if (subsError) {
      console.error('[admin/users] Subscriptions Fetch Error:', subsError);
      return NextResponse.json({ error: `Subscriptions: ${subsError.message}` }, { status: 500 });
    }

    // Build subscriptions map
    const subMap = new Map();
    subs?.forEach((s: any) => {
      const existing = subMap.get(s.user_id);
      if (!existing || s.status === 'active') subMap.set(s.user_id, s);
    });

    // Assemble full user objects for filtering
    const now = new Date();
    let users = profiles.map((p: any) => {
      const sub = subMap.get(p.id);
      let planStatus = 'free';
      let daysRemaining = null;

      if (sub) {
        if (sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) > now) {
          planStatus = 'active';
          daysRemaining = Math.ceil((new Date(sub.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          planStatus = 'expired';
        }
      }

      return {
        id: p.id,
        full_name: p.full_name || 'No Name',
        email: p.email || 'No Email',
        phone: p.phone || '—',
        avatar_url: p.photo_url || null,
        created_at: p.created_at,
        plan: sub?.plan || null,
        plan_status: planStatus,
        expires_at: sub?.expires_at || null,
        days_remaining: daysRemaining
      };
    });

    // Filter in memory
    if (filter !== 'all') {
      if (filter === 'free') {
        users = users.filter((u: any) => u.plan_status === 'free');
      } else if (filter === 'expired') {
        users = users.filter((u: any) => u.plan_status === 'expired');
      } else {
        users = users.filter((u: any) => u.plan === filter && u.plan_status === 'active');
      }
    }

    const totalFiltered = users.length;

    // Paginate in memory
    const paginatedUsers = users.slice(offset, offset + limit);

    console.log(`[admin/users] Paginated to ${paginatedUsers.length} users out of ${totalFiltered} total filtered.`);

    // Fetch related usage statistics only for the paginated users (max 20)
    let finalUsers = [];
    if (paginatedUsers.length > 0) {
      const paginatedUserIds = paginatedUsers.map((u: any) => u.id);

      const fetchTableCounts = async (table: string) => {
        try {
          const { data, error } = await supabaseAdmin.from(table).select('user_id').in('user_id', paginatedUserIds);
          if (error) {
            console.error(`[admin/users] Error fetching counts from ${table}:`, error.message);
            return [];
          }
          return data || [];
        } catch (err: any) {
          console.error(`[admin/users] Exception fetching counts from ${table}:`, err.message);
          return [];
        }
      };

      const [docs, chats, quizzes, notes] = await Promise.all([
        fetchTableCounts('documents'),
        fetchTableCounts('chat_messages'),
        fetchTableCounts('quiz_attempts'),
        fetchTableCounts('study_notes')
      ]);

      const countMap = (data: any[]) => {
        const map: Record<string, number> = {};
        data.forEach((row: any) => {
          if (row.user_id) map[row.user_id] = (map[row.user_id] || 0) + 1;
        });
        return map;
      };

      const docCounts = countMap(docs);
      const chatCounts = countMap(chats);
      const quizCounts = countMap(quizzes);
      const noteCounts = countMap(notes);

      finalUsers = paginatedUsers.map((u: any) => ({
        ...u,
        documents: docCounts[u.id] || 0,
        chats: chatCounts[u.id] || 0,
        quizzes: quizCounts[u.id] || 0,
        notes: noteCounts[u.id] || 0
      }));
    }

    return NextResponse.json({
      success: true,
      data: { users: finalUsers, total: totalFiltered, page, limit }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('[admin/users] FATAL ERROR:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
