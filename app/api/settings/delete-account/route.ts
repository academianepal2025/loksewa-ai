import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, confirmationString } = body;

    // 1. Validate inputs
    if (confirmationString !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ error: 'Confirmation string does not match' }, { status: 400 });
    }

    // 2. Re-authenticate by signing in with password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Invalid password. Account deletion aborted.' }, { status: 401 });
    }

    // 3. Wipe all database data using RPC
    const { error: rpcError } = await supabase.rpc('delete_user_all_data', { p_user_id: user.id });
    if (rpcError) {
      console.error('Data wipe RPC failed:', rpcError);
      return NextResponse.json({ error: 'Failed to wipe account data' }, { status: 500 });
    }

    // 4. Delete files from Storage (user-documents)
    try {
      const { data: files } = await supabase.storage.from('user-documents').list(user.id);
      if (files && files.length > 0) {
        const paths = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage.from('user-documents').remove(paths);
      }
      
      // Also delete profile photos
      const { data: profileFiles } = await supabase.storage.from('profile-photos').list(user.id);
      if (profileFiles && profileFiles.length > 0) {
        const pPaths = profileFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage.from('profile-photos').remove(pPaths);
      }
    } catch (storageErr) {
      console.warn('Storage cleanup had errors:', storageErr);
    }

    // 5. Delete the Auth User via Admin Client
    const supabaseAdmin = createAdminClient();
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Auth user deletion failed:', deleteUserError);
      return NextResponse.json({ error: 'Failed to delete authentication account' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your account and all associated data have been permanently deleted.' 
    });

  } catch (error: any) {
    console.error('Delete Account API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
