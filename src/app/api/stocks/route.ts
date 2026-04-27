import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchQuote, fetchBasicFinancials, fetchCompanyProfile } from '@/lib/finnhub';
import { getCache, setCache } from '@/lib/cache';
import { SECTORS } from '@/lib/constants';
import type { ScreenerParams, PaginatedResponse, Stock } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sector = searchParams.get('sector') || undefined;
  const sortBy = searchParams.get('sortBy') || 'marketCap';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const minMarketCap = searchParams.get('minMarketCap')
    ? parseFloat(searchParams.get('minMarketCap')!)
    : undefined;
  const maxMarketCap = searchParams.get('maxMarketCap')
    ? parseFloat(searchParams.get('maxMarketCap')!)
    : undefined;
  const minPE = searchParams.get('minPE')
    ? parseFloat(searchParams.get('minPE')!)
    : undefined;
  const maxPE = searchParams.get('maxPE')
    ? parseFloat(searchParams.get('maxPE')!)
    : undefined;
  const search = searchParams.get('search') || undefined;

  const cacheKey = `stocks:${JSON.stringify({ page, limit, sector, sortBy, sortOrder, minMarketCap, maxMarketCap, minPE, maxPE, search })}`;

  const cached = await getCache<PaginatedResponse<Stock>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const where: Record<string, unknown> = {};

    if (sector) {
      where.sector = sector;
    }

    if (search) {
      where.OR = [
        { symbol: { contains: search.toUpperCase(), mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stocks = await prisma.stock.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    let filtered = [...stocks];

    if (minMarketCap !== undefined) {
      filtered = filtered.filter((s) => (s.marketCap || 0) >= minMarketCap);
    }

    if (maxMarketCap !== undefined) {
      filtered = filtered.filter((s) => (s.marketCap || 0) <= maxMarketCap);
    }

    if (minPE !== undefined) {
      filtered = filtered.filter((s) => (s.pe || 0) >= minPE);
    }

    if (maxPE !== undefined) {
      filtered = filtered.filter((s) => (s.pe || 0) <= maxPE);
    }

    const quotePromises = filtered.map((stock) =>
      fetchQuote(stock.symbol).catch(() => null)
    );
    const quotes = await Promise.all(quotePromises);

    const enrichedStocks: any[] = filtered.map((stock, index) => {
      const quote = quotes[index];
      return {
        ...stock,
        price: quote?.c || stock.price || null,
        change: quote?.d || null,
        changePercent: quote?.dp || null,
        volume: stock.volume,
      };
    });

    const total = enrichedStocks.length;
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      data: enrichedStocks,
      total,
      page,
      limit,
      totalPages,
    };

    await setCache(cacheKey, response, 5 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Stocks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    );
  }
}