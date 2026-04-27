import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote, fetchBasicFinancials, fetchNews, fetchStockCandles } from '@/lib/finnhub';
import { generateRecommendation } from '@/lib/mistral';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache';
import { calculateTechnicalIndicators } from '@/lib/indicators';
import type { Recommendation, TechnicalIndicators, ChartData } from '@/types';

function buildPrompt(
  symbol: string,
  priceData: { c: number; d: number; dp: number; h: number; l: number; o: number },
  indicators: TechnicalIndicators,
  financials: {
    peRatio?: number;
    eps?: number;
    revenueGrowth?: number;
    marketCapitalization?: number;
  },
  news: Array<{ headline: string; summary: string }>
): string {
  const priceStr = `Current: $${priceData.c} (${priceData.d > 0 ? '+' : ''}${priceData.d}, ${priceData.dp}%)
High: $${priceData.h} | Low: $${priceData.l} | Open: ${priceData.o}`;

  const newsHeadlines = news.map((n) => `- ${n.headline}`).join('\n');

  return `You are a professional Wall Street quantitative analyst.

Analyze the following stock:

Ticker: ${symbol}
Price Data: ${priceStr}
Technical Indicators:
- RSI: ${indicators.rsi.toFixed(2)}
- EMA20: ${indicators.ema20}
- EMA50: ${indicators.ema50}
- EMA200: ${indicators.ema200}
- MACD: ${indicators.macd.MACD.toFixed(2)} (signal: ${indicators.macd.signal.toFixed(2)}, histogram: ${indicators.macd.histogram.toFixed(2)})

Fundamental Data:
- P/E Ratio: ${financials.peRatio || 'N/A'}
- EPS: ${financials.eps || 'N/A'}
- Revenue Growth: ${financials.revenueGrowth ? financials.revenueGrowth.toFixed(2) + '%' : 'N/A'}
- Market Cap: ${financials.marketCapitalization ? '$' + (financials.marketCapitalization / 1e9).toFixed(2) + 'B' : 'N/A'}

Latest News:
${newsHeadlines || 'No recent news available'}

Return JSON only with this format:
{
  "recommendation": "BUY | SELL | HOLD",
  "confidence": number,
  "technical_analysis": "...",
  "fundamental_analysis": "...",
  "sentiment_analysis": "...",
  "summary": "short explanation"
}

Be concise, data-driven, and avoid speculation.`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const cacheKey = `recommendation:${symbol}`;
  const cached = await getCache<Recommendation & { source: 'cache' | 'fresh' }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const existingRec = await prisma.recommendation.findFirst({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRec) {
      const createdAt = new Date(existingRec.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        const response: Recommendation & { source: 'cache' } = {
          id: existingRec.id,
          symbol: existingRec.symbol,
          recommendation: existingRec.recommendation as 'BUY' | 'SELL' | 'HOLD',
          confidence: existingRec.confidence,
          technical: existingRec.technical,
          fundamental: existingRec.fundamental,
          sentiment: existingRec.sentiment,
          summary: existingRec.summary,
          createdAt: existingRec.createdAt,
          source: 'cache',
        };

        await setCache(cacheKey, response, 24 * 60 * 60 * 1000);
        return NextResponse.json(response);
      }
    }

    const [quote, financials, newsData, candleData]: [any, any, any, any] = await Promise.all([
      fetchQuote(symbol).catch(() => null),
      fetchBasicFinancials(symbol).catch(() => null),
      fetchNews(symbol).catch(() => []),
      fetchStockCandles(symbol, 'D', Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60, Math.floor(Date.now() / 1000)).catch(() => null),
    ]);

    if (!quote) {
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }

    const prices: number[] = candleData?.c || [];
    const chartData: Array<{ date: Date; close: number }> = prices.map((close: number, i: number) => ({
      date: new Date((candleData?.t?.[i] || 0) * 1000),
      close,
    }));

    const indicators = calculateTechnicalIndicators(
      chartData.map((p) => ({
        id: '',
        symbol,
        date: p.date,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        close: p.close,
        volume: 0,
      }))
    );

    const news: any[] = newsData.map((n: any) => ({ headline: n.headling, summary: n.summary }));
    const prompt = buildPrompt(symbol, quote, indicators, {
      peRatio: financials?.peRatio,
      eps: financials?.eps,
      revenueGrowth: financials?.revenueQuarterlyGrwth,
      marketCapitalization: financials?.marketCapitalization,
    }, news);

    const aiResult = await generateRecommendation(prompt);

    const newRec = await prisma.recommendation.create({
      data: {
        symbol,
        recommendation: aiResult.recommendation,
        confidence: aiResult.confidence,
        technical: aiResult.technical_analysis,
        fundamental: aiResult.fundamental_analysis,
        sentiment: aiResult.sentiment_analysis,
        summary: aiResult.summary,
      },
    });

    const response: Recommendation & { source: 'fresh' } = {
      id: newRec.id,
      symbol: newRec.symbol,
      recommendation: newRec.recommendation as 'BUY' | 'SELL' | 'HOLD',
      confidence: newRec.confidence,
      technical: newRec.technical,
      fundamental: newRec.fundamental,
      sentiment: newRec.sentiment,
      summary: newRec.summary,
      createdAt: newRec.createdAt,
      source: 'fresh',
    };

    await setCache(cacheKey, response, 24 * 60 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}