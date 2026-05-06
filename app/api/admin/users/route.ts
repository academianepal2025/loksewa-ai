import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

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
      .select('id, full_name, email, phone, photo_url, created_at', { count: 'exact' });

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

    // Pagination
    query = query.range(offset, offset + limit - 1);

    console.log('[admin/users] Fetching profiles...');
    const { data: profiles, count, error: profilesError } = await query;
    
    if (profilesError) {
      console.error('[admin/users] Profiles Fetch Error:', profilesError);
      return NextResponse.json({ error: `Profiles: ${profilesError.message}` }, { status: 500 });
    }

    console.log(`[admin/users] Found ${profiles?.length || 0} profiles.`);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: { users: [], total: 0, page, limit }
      });
    }

    const userIds = profiles.map((p: any) => p.id);

    // Fetch related data with individual error handling
    console.log('[admin/users] Fetching related data for IDs:', userIds.length);
    
    const fetchTable = async (table: string, select: string) => {
      try {
        const { data, error } = await supabaseAdmin.from(table).select(select).in('user_id', userIds);
        if (error) {
          console.error(`[admin/users] Error fetching ${table}:`, error.message);
          return [];
        }
        return data || [];
      } catch (err: any) {
        console.error(`[admin/users] Exception fetching ${table}:`, err.message);
        return [];
      }
    };

    const [subs, docs, chats, quizzes, notes] = await Promise.all([
      fetchTable('subscriptions', 'user_id, plan, status, expires_at'),
      fetchTable('documents', 'user_id'),
      fetchTable('chat_messages', 'user_id'),
      fetchTable('quiz_attempts', 'user_id'),
      fetchTable('study_notes', 'user_id')
    ]);

    console.log(`[admin/users] Data fetched - Subs: ${subs.length}, Docs: ${docs.length}, Chats: ${chats.length}`);

    // Build maps
    const subMap = new Map();
    subs.forEach((s: any) => {
      const existing = subMap.get(s.user_id);
      if (!existing || s.status === 'active') subMap.set(s.user_id, s);
    });

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

    // Assemble users
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
        days_remaining: daysRemaining,
        documents: docCounts[p.id] || 0,
        chats: chatCounts[p.id] || 0,
        quizzes: quizCounts[p.id] || 0,
        notes: noteCounts[p.id] || 0
      };
    });

    // Filter
    if (filter !== 'all') {
      if (filter === 'free') users = users.filter((u: any) => u.plan_status === 'free');
      else if (filter === 'expired') users = users.filter((u: any) => u.plan_status === 'expired');
      else users = users.filter((u: any) => u.plan === filter && u.plan_status === 'active');
    }

    console.log(`[admin/users] Returning ${users.length} users.`);

    return NextResponse.json({
      success: true,
      data: { users, total: count || 0, page, limit }
    });
  } catch (error: any) {
    console.error('[admin/users] FATAL ERROR:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
