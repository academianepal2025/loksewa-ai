import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const supabaseAdmin = createAdminClient();
    const url = new URL(req.url);

    const search = url.searchParams.get('search') || '';
    const filter = url.searchParams.get('filter') || 'all';
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build profiles query
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, created_at', { count: 'exact' });

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

    const { data: profiles, count, error: profilesError } = await query;
    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: { users: [], total: 0, page, limit }
      });
    }

    const userIds = profiles.map((p: any) => p.id);

    // Fetch subscriptions + usage counts in parallel
    const [subsRes, docsRes, chatsRes, quizzesRes, notesRes] = await Promise.all([
      supabaseAdmin.from('subscriptions')
        .select('user_id, plan, status, expires_at, started_at')
        .in('user_id', userIds),
      supabaseAdmin.from('documents')
        .select('user_id')
        .in('user_id', userIds),
      supabaseAdmin.from('chat_messages')
        .select('user_id')
        .in('user_id', userIds),
      supabaseAdmin.from('quiz_attempts')
        .select('user_id')
        .in('user_id', userIds),
      supabaseAdmin.from('study_notes')
        .select('user_id')
        .in('user_id', userIds)
    ]);

    // Build maps
    const subMap = new Map<string, any>();
    (subsRes.data || []).forEach((s: any) => {
      const existing = subMap.get(s.user_id);
      // Keep the most recent / active subscription
      if (!existing || s.status === 'active') {
        subMap.set(s.user_id, s);
      }
    });

    const countMap = (data: any[]) => {
      const map: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        map[row.user_id] = (map[row.user_id] || 0) + 1;
      });
      return map;
    };

    const docCounts = countMap(docsRes.data || []);
    const chatCounts = countMap(chatsRes.data || []);
    const quizCounts = countMap(quizzesRes.data || []);
    const noteCounts = countMap(notesRes.data || []);

    // Assemble users
    let users = profiles.map((p: any) => {
      const sub = subMap.get(p.id);
      const now = new Date();
      let planStatus = 'free';
      let daysRemaining = null;

      if (sub) {
        if (sub.status === 'active' && new Date(sub.expires_at) > now) {
          planStatus = 'active';
          daysRemaining = Math.ceil((new Date(sub.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          planStatus = 'expired';
        }
      }

      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        plan: sub?.plan || null,
        plan_status: planStatus,
        expires_at: sub?.expires_at || null,
        started_at: sub?.started_at || null,
        days_remaining: daysRemaining,
        documents: docCounts[p.id] || 0,
        chats: chatCounts[p.id] || 0,
        quizzes: quizCounts[p.id] || 0,
        notes: noteCounts[p.id] || 0
      };
    });

    // Filter by plan type
    if (filter !== 'all') {
      if (filter === 'free') {
        users = users.filter((u: any) => u.plan_status === 'free');
      } else if (filter === 'expired') {
        users = users.filter((u: any) => u.plan_status === 'expired');
      } else {
        users = users.filter((u: any) => u.plan === filter && u.plan_status === 'active');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        users,
        total: count || 0,
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Admin Users Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
