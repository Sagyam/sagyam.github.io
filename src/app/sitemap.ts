import type { MetadataRoute } from 'next';
import { posts } from '#site/content';
import { books, metadata as siteMetadata } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteMetadata.siteUrl.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.published)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slugAsParams}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const bookRoutes: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${baseUrl}/books/${book.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...bookRoutes];
}
