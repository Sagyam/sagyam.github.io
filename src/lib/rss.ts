import { parseStringPromise } from 'xml2js';
import type { BlogPost } from './data';

const RSS_URL = 'https://blog.sagyamthapa.com.np/rss.xml';

type RssItem = {
  title: string[];
  description: string[];
  link: string[];
  category: string[];
  'hashnode:coverImage': string[];
  pubDate: string[];
};

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const response = await fetch(RSS_URL, {
      next: { revalidate: 86400 }, // Revalidate once a day (24 * 60 * 60 seconds)
    });

    if (!response.ok) {
      console.error('Failed to fetch RSS feed:', response.statusText);
      return [];
    }

    const xml = await response.text();
    const result = await parseStringPromise(xml);

    const items: RssItem[] = result.rss.channel[0].item;
    
    const blogPosts = items.map((item, index) => {
        const categories = Array.isArray(item.category) ? item.category : [item.category].filter(Boolean);
        return {
            id: item.link[0],
            title: item.title[0],
            summary: item.description[0],
            link: item.link[0],
            publication: '', // publication is no longer used
            tech: categories,
            imageId: `blog-${index}`, // using index for a semi-stable ID
            imageUrl: item['hashnode:coverImage'] ? item['hashnode:coverImage'][0] : `https://picsum.photos/seed/blog${index}/600/400`,
        };
    });

    if (limit) {
      return blogPosts.slice(0, limit);
    }

    return blogPosts;
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return [];
  }
}
