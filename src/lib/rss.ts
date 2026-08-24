import { posts } from '#site/content';
import { metadata as siteMetadata } from '@/lib/data';
import type { BlogPost } from './types/blog';

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const publishedPosts = posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const sliced = limit ? publishedPosts.slice(0, limit) : publishedPosts;

  return sliced.map((post) => ({
    id: post.slugAsParams,
    title: post.title,
    summary: post.description || '',
    link: `/blog/${post.slugAsParams}`,
    publication: post.publishedAt,
    tech: post.tech,
    imageId: post.slugAsParams,
    imageUrl: post.coverImage,
  }));
}

export function generateRssXml(): string {
  const baseUrl = siteMetadata.siteUrl.replace(/\/$/, '');
  const publishedPosts = posts
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const itemsXml = publishedPosts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slugAsParams}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      const categoriesXml = (post.tech || [])
        .map((tag) => `      <category><![CDATA[${tag}]]></category>`)
        .join('\n');

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
${categoriesXml}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteMetadata.siteTitle}]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[${siteMetadata.siteDescription}]]></description>
    <language>${siteMetadata.locale || 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}
