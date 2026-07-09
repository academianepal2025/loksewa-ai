import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { generateBlogPost } from '@/lib/blog-ai';

export async function POST(request: Request) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { topic, category } = body;

    if (!topic || !category) {
      return NextResponse.json({ success: false, error: 'Topic and category are required' }, { status: 400 });
    }

    const draft = await generateBlogPost(topic, category);
    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
