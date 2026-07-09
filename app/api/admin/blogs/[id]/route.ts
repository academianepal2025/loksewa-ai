import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, supabase } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const { data, error: dbError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, supabase } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      author,
      read_time,
      is_published,
      seo_title,
      seo_description,
      seo_keywords
    } = body;

    // Check if item exists
    const { data: existing, error: checkError } = await supabase
      .from('blog_posts')
      .select('is_published')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    }

    const updates: any = {
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      excerpt,
      content,
      image_url: image_url || null,
      category,
      author,
      read_time,
      is_published: !!is_published,
      seo_title,
      seo_description,
      seo_keywords
    };

    // If publishing now and was not published before, set published_at
    if (is_published && !existing.is_published) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error: dbError } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, supabase } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const { error: dbError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
