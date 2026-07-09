import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(request: Request) {
  const { error, supabase } = await verifyAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isPublished = searchParams.get('is_published');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublished !== null && isPublished !== undefined && isPublished !== '') {
      query = query.eq('is_published', isPublished === 'true');
    }

    const { data, count, error: dbError } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      data,
      count,
      page,
      limit
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error, supabase } = await verifyAdmin();
  if (error) return error;

  try {
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

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Insert new blog post
    const { data, error: dbError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
        excerpt: excerpt || '',
        content,
        image_url: image_url || null,
        category,
        author: author || 'Loksewa AI Team',
        read_time: read_time || '5 min read',
        is_published: !!is_published,
        seo_title: seo_title || title,
        seo_description: seo_description || excerpt || '',
        seo_keywords: seo_keywords || [],
        published_at: is_published ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
