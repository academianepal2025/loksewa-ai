import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://loksewai.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/signin', '/auth/signup'],
      disallow: ['/dashboard/', '/admin/', '/api/', '/auth/callback'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
