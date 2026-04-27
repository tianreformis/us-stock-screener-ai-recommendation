import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote, fetchCompanyProfile, fetchBasicFinancials, fetchStockCandles, fetchNews } from '@/lib/finnhub';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';

import type { Stock, StockQuote, StockFundamentals, StockPrice, ChartData } from '@/types';

interface StockDetailResponse {
  stock: Stock & { change?: number; changePercent?: number };
  quote?: StockQuote;
  profile?: StockFundamentals;
  candles?: ChartData[];
  news?: Array<{
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const cacheKey = `stock:${symbol}`;
  const cached = await getCache<StockDetailResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    let [quote, profile, financials]: [any, any, any] = await Promise.all([
      fetchQuote(symbol).catch(() => null),
      fetchCompanyProfile(symbol).catch(() => null),
      fetchBasicFinancials(symbol).catch(() => null),
    ]);

    const now = Math.floor(Date.now() / 1000);
    const oneMonthAgo = now - 30 * 24 * 60 * 60;
    const oneYearAgo = now - 365 * 24 * 60 * 60;

    let candles: ChartData[] = [];

    try {
      const candleData = await fetchStockCandles(symbol, 'D', oneYearAgo, now);
      if (candleData.s === 'ok' && candleData.c.length > 0) {
        candles = candleData.t.map((timestamp, index) => ({
          time: new Date(timestamp * 1000).toISOString().split('T')[0],
          open: candleData.o[index],
          high: candleData.h[index],
          low: candleData.l[index],
          close: candleData.c[index],
          volume: candleData.v[index],
        }));
      }
    } catch {
      console.error('Failed to fetch candles for', symbol);
    }

    let news: StockDetailResponse['news'] = [];
    try {
      const newsData = await fetchNews(symbol);
      news = newsData.slice(0, 10).map((n) => ({
        id: n.id,
        headline: n.headling,
        summary: n.summary,
        source: n.source,
        url: n.url,
        datetime: n.datetime,
      }));
    } catch {
      console.error('Failed to fetch news for', symbol);
    }

    let dbStock: Stock | null = null;
    try {
      dbStock = await prisma.stock.findUnique({
        where: { symbol },
      }) as any;
    } catch {
      console.error('Failed to fetch stock from DB');
    }

    const stock: Stock & { change?: number; changePercent?: number } = {
      symbol: dbStock?.symbol || symbol,
      name: profile?.name || dbStock?.name || symbol,
      sector: profile?.sector || financials?.sector || dbStock?.sector || undefined,
      industry: financials?.industry || dbStock?.industry || undefined,
      marketCap: profile?.marketCapitalization || dbStock?.marketCap || undefined,
      exchange: profile?.exchange || dbStock?.exchange || undefined,
      price: quote?.c || dbStock?.price || null,
      pe: financials?.peRatio || dbStock?.pe || undefined,
      eps: financials?.eps || dbStock?.eps || undefined,
      change: quote?.d || undefined,
      changePercent: quote?.dp || undefined,
    };

    const response: StockDetailResponse = {
      stock,
      quote: quote || undefined,
      profile: financials as StockFundamentals | undefined,
      candles: candles.length > 0 ? candles : undefined,
      news: news.length > 0 ? news : undefined,
    };

    await setCache(cacheKey, response, 15 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Stock detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock detail' },
      { status: 500 }
    );
  }
}