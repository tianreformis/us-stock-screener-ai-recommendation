import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchQuote, fetchStockCandles } from '@/lib/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const symbol = ticker.toUpperCase();

    // Fetch the stock with relations from the local DB
    const stock = await prisma.stock.findUnique({
      where: { ticker: symbol },
      include: {
        recommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        newsArticles: {
          orderBy: { datetime: 'desc' },
          take: 5,
        },
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: `Stock ${symbol} not found` },
        { status: 404 }
      );
    }

    // Fetch live quote and historical daily candles in parallel from Yahoo Finance
    const [liveQuote, liveCandles] = await Promise.all([
      fetchQuote(symbol).catch(() => null),
      fetchStockCandles(symbol, 'D', 0, 0).catch(() => null),
    ]);

    // Format candles for Recharts. Try Yahoo Finance first, fallback to DB
    let candles = [];
    if (liveCandles && liveCandles.s === 'ok' && liveCandles.c && liveCandles.c.length > 0) {
      candles = liveCandles.t.map((timestamp: number, index: number) => ({
        time: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: liveCandles.o[index],
        high: liveCandles.h[index],
        low: liveCandles.l[index],
        close: liveCandles.c[index],
        volume: liveCandles.v[index],
      })).slice(-30); // Grab the most recent 30 trading days
    } else {
      // Fallback to seeded database prices if Yahoo historical is offline
      const dbPrices = await prisma.stockPrice.findMany({
        where: { symbol },
        orderBy: { date: 'asc' },
      });
      candles = dbPrices.map((p) => ({
        time: p.date.toISOString().split('T')[0],
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
        volume: p.volume,
      }));
    }

    // Prepare real-time quotes, falling back to DB values if liveQuote is null
    const price = liveQuote?.c || stock.price;
    const change = liveQuote?.d || stock.change;
    const changePercent = liveQuote?.dp || stock.changePercent;

    // Optional: Sync the newly fetched real-time price back to the DB in background
    if (liveQuote) {
      prisma.stock.update({
        where: { ticker: symbol },
        data: { price, change, changePercent },
      }).catch((e) => console.error(`Error background-syncing stock price for ${symbol}:`, e));
    }

    const response = {
      stock: {
        ticker: stock.ticker,
        symbol: stock.ticker, // Compatibility
        name: stock.name,
        sector: stock.sector,
        industry: stock.industry,
        price,
        change,
        changePercent,
        volume: stock.volume,
        avgVolume3M: stock.avgVolume3M,
        marketCap: stock.marketCap,
        pe: stock.pe,
        forwardPe: stock.forwardPe,
        eps: stock.eps,
        rsi14: stock.rsi14,
        sma20: stock.sma20,
        sma50: stock.sma50,
        sma200: stock.sma200,
        macdLine: stock.macdLine,
        macdSignal: stock.macdSignal,
        atr: stock.atr,
        beta: stock.beta,
        high52Week: stock.high52Week,
        low52Week: stock.low52Week,
      },
      candles,
      recommendation: stock.recommendations[0] || null,
      news: stock.newsArticles.map((n) => ({
        id: n.id,
        headline: n.headline,
        summary: n.summary,
        source: n.source,
        url: n.url,
        datetime: n.datetime.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Individual stock fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch individual stock data' },
      { status: 500 }
    );
  }
}
