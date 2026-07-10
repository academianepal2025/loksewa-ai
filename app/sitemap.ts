import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://loksewaai.com';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let blogPosts: any[] = [];
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, published_at, created_at')
      .eq('is_published', true);
    blogPosts = data || [];
  } catch (err) {
    console.error('Failed to fetch blog posts for sitemap:', err);
  }

  // Core static paths
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic blog post paths
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Fallback posts if database is empty/inaccessible
  const fallbackSlugs = [
    'how-to-use-loksewa-ai',
    'how-to-prepare-loksewa-with-ai',
    'common-loksewa-mistakes-ai-fix',
  ];

  if (blogRoutes.length === 0) {
    fallbackSlugs.forEach((slug) => {
      routes.push({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } else {
    // Add dynamic posts
    routes.push(...blogRoutes);
  }

  return routes;
}

