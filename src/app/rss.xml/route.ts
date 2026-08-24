import { generateRssXml } from '@/lib/rss';

export const dynamic = 'force-static';

export async function GET() {
  const feed = generateRssXml();

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
