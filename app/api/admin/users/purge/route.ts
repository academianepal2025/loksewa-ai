import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) return authError;

    const supabaseAdmin = createAdminClient();
    const body = await req.json();
    const { userIds, purgeBatch, batchSize = 50 } = body;

    let targetIds: string[] = [];

    const now = new Date();
    const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    if (Array.isArray(userIds) && userIds.length > 0) {
      targetIds = userIds;
    } else if (purgeBatch) {
      // Find oldest inactive users: created > 30d ago, no activity in 30d, no active subscription, not admin
      const { data: candidateProfiles, error: candErr } = await supabaseAdmin
        .from('profiles')
        .select('id, created_at, is_admin')
        .eq('is_admin', false)
        .lt('created_at', thirtyDaysAgoIso)
        .order('created_at', { ascending: true })
        .limit(200);

      if (candErr) {
        return NextResponse.json({ error: candErr.message }, { status: 500 });
      }

      if (!candidateProfiles || candidateProfiles.length === 0) {
        return NextResponse.json({ success: true, count: 0, message: 'No inactive users found to purge.' });
      }

      const candidateIds = candidateProfiles.map(p => p.id);

      // Check active subscriptions
      const { data: activeSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')
        .gt('expires_at', now.toISOString())
        .in('user_id', candidateIds);

      const activeSubSet = new Set((activeSubs || []).map(s => s.user_id));

      // Check recent activity in last 30 days
      const [recentChats, recentDocs, recentQuizzes, recentActivity] = await Promise.all([
        supabaseAdmin.from('chat_messages').select('user_id').gte('created_at', thirtyDaysAgoIso).in('user_id', candidateIds),
        supabaseAdmin.from('documents').select('user_id').gte('created_at', thirtyDaysAgoIso).in('user_id', candidateIds),
        supabaseAdmin.from('quiz_attempts').select('user_id').gte('created_at', thirtyDaysAgoIso).in('user_id', candidateIds),
        supabaseAdmin.from('activity_logs').select('user_id').gte('activity_date', thirtyDaysAgoIso.split('T')[0]).in('user_id', candidateIds)
      ]);

      const activeIn30d = new Set<string>();
      (recentChats.data || []).forEach(r => r.user_id && activeIn30d.add(r.user_id));
      (recentDocs.data || []).forEach(r => r.user_id && activeIn30d.add(r.user_id));
      (recentQuizzes.data || []).forEach(r => r.user_id && activeIn30d.add(r.user_id));
      (recentActivity.data || []).forEach(r => r.user_id && activeIn30d.add(r.user_id));

      targetIds = candidateIds
        .filter(id => !activeSubSet.has(id) && !activeIn30d.has(id))
        .slice(0, Math.min(batchSize, 100));
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No valid inactive users selected.' });
    }

    // STRICT SAFEGUARD: Verify none of targetIds are admin or active subscribers
    const [adminCheck, subCheck] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, email, is_admin').in('id', targetIds).eq('is_admin', true),
      supabaseAdmin.from('subscriptions').select('user_id').in('user_id', targetIds).eq('status', 'active').gt('expires_at', now.toISOString())
    ]);

    const protectedAdminIds = new Set((adminCheck.data || []).map(p => p.id));
    const protectedSubIds = new Set((subCheck.data || []).map(s => s.user_id));

    const safeToPurge = targetIds.filter(id => !protectedAdminIds.has(id) && !protectedSubIds.has(id));

    if (safeToPurge.length === 0) {
      return NextResponse.json({ error: 'Selected users are protected (Admins or Active Paid Subscribers) and cannot be purged.' }, { status: 400 });
    }

    let deletedDocsCount = 0;
    let deletedFilesCount = 0;

    // Purge each safe user in dependency order
    for (const userId of safeToPurge) {
      try {
        // 1. Get documents to delete storage files
        const { data: userDocs } = await supabaseAdmin
          .from('documents')
          .select('id, file_url')
          .eq('user_id', userId);

        const docIds = (userDocs || []).map(d => d.id);
        deletedDocsCount += docIds.length;

        // Clean document chunks first
        if (docIds.length > 0) {
          await supabaseAdmin.from('document_chunks').delete().in('document_id', docIds);
        }

        // Clean storage files from user-documents bucket
        try {
          const { data: files } = await supabaseAdmin.storage.from('user-documents').list(userId);
          if (files && files.length > 0) {
            const paths = files.map(file => `${userId}/${file.name}`);
            await supabaseAdmin.storage.from('user-documents').remove(paths);
            deletedFilesCount += paths.length;
          }
          const { data: pFiles } = await supabaseAdmin.storage.from('profile-photos').list(userId);
          if (pFiles && pFiles.length > 0) {
            const pPaths = pFiles.map(file => `${userId}/${file.name}`);
            await supabaseAdmin.storage.from('profile-photos').remove(pPaths);
          }
        } catch (storageErr) {
          console.warn(`[purge] Storage file cleanup error for user ${userId}:`, storageErr);
        }

        // 2. Cascade delete records from all tables
        await Promise.all([
          supabaseAdmin.from('documents').delete().eq('user_id', userId),
          supabaseAdmin.from('chat_messages').delete().eq('user_id', userId),
          supabaseAdmin.from('study_notes').delete().eq('user_id', userId),
          supabaseAdmin.from('study_plans').delete().eq('user_id', userId),
          supabaseAdmin.from('quiz_attempts').delete().eq('user_id', userId),
          supabaseAdmin.from('flashcards').delete().eq('user_id', userId),
          supabaseAdmin.from('weekly_feedback').delete().eq('user_id', userId),
          supabaseAdmin.from('study_progress').delete().eq('user_id', userId),
          supabaseAdmin.from('mock_test_submissions').delete().eq('user_id', userId),
          supabaseAdmin.from('syllabus_analysis').delete().eq('user_id', userId),
          supabaseAdmin.from('user_exams').delete().eq('user_id', userId),
          supabaseAdmin.from('activity_logs').delete().eq('user_id', userId),
          supabaseAdmin.from('ai_usage_logs').delete().eq('user_id', userId),
          supabaseAdmin.from('daily_usage').delete().eq('user_id', userId),
          supabaseAdmin.from('payment_requests').delete().eq('user_id', userId),
          supabaseAdmin.from('user_preferences').delete().eq('user_id', userId),
          supabaseAdmin.from('subscriptions').delete().eq('user_id', userId)
        ]);

        // 3. Delete Profile
        await supabaseAdmin.from('profiles').delete().eq('id', userId);

        // 4. Delete Auth User from auth.users
        await supabaseAdmin.auth.admin.deleteUser(userId).catch(e => {
          console.warn(`[purge] Auth user deletion warning for ${userId}:`, e);
        });

      } catch (userPurgeErr) {
        console.error(`[purge] Error purging user ${userId}:`, userPurgeErr);
      }
    }

    return NextResponse.json({
      success: true,
      count: safeToPurge.length,
      deletedDocsCount,
      deletedFilesCount,
      message: `Successfully purged ${safeToPurge.length} inactive user(s), ${deletedDocsCount} document(s), and cleaned storage.`
    });

  } catch (error: any) {
    console.error('[purge] API Fatal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
