import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { researchTrendingTopics } from '@/lib/blog-ai';

export async function POST(request: Request) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const { query } = body;

    const topics = await researchTrendingTopics(query);
    return NextResponse.json({ success: true, topics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
