import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.exroast.buzz';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/template',
    '/pricing',
    '/how-it-works',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/template' || route === '/pricing' ? 0.9 : 0.7,
  }));
}

