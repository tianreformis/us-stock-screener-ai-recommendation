import { NextRequest, NextResponse } from 'next/server';
import { fetchNews } from '@/lib/finnhub';
import { getCache, setCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker')?.toUpperCase();

  const cacheKey = ticker ? `news:${ticker}` : 'news:market';

  const cached = await getCache<Array<{
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
  }>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const news = ticker
      ? await fetchNews(ticker).catch(() => [])
      : await fetchNews().catch(() => []);

    const response = news.slice(0, 20).map((n: any) => ({
      id: n.id,
      headline: n.headling,
      summary: n.summary,
      source: n.source,
      url: n.url,
      datetime: n.datetime,
      image: n.image,
      related: n.related,
    }));

    const ttl = ticker ? 30 * 60 * 1000 : 5 * 60 * 1000;
    await setCache(cacheKey, response, ttl);

    return NextResponse.json(response);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}