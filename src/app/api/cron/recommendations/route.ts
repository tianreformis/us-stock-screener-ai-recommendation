import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote, fetchBasicFinancials, fetchNews, fetchStockCandles } from '@/lib/finnhub';
import { generateRecommendation } from '@/lib/mistral';
import { prisma } from '@/lib/prisma';
import { calculateTechnicalIndicators } from '@/lib/indicators';
import { TOP_US_STOCKS } from '@/lib/constants';

const CRON_SECRET = process.env.CRON_SECRET;

async function generateRecommendationForStock(symbol: string): Promise<{
  success: boolean;
  symbol: string;
  recommendation?: string;
  error?: string;
}> {
  try {
    const [quote, financials, newsData, candleData]: [any, any, any, any] = await Promise.all([
      fetchQuote(symbol).catch(() => null),
      fetchBasicFinancials(symbol).catch(() => null),
      fetchNews(symbol).catch(() => []),
      fetchStockCandles(symbol, 'D', Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60, Math.floor(Date.now() / 1000)).catch(() => null),
    ]);

    if (!quote) {
      return { success: false, symbol, error: 'Failed to fetch quote' };
    }

    const prices: number[] = candleData?.c || [];
    const chartData = prices.map((close: number, i: number) => ({
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

    const priceStr = `Current: $${quote.c} (${quote.d > 0 ? '+' : ''}${quote.d}, ${quote.dp}%)
High: $${quote.h} | Low: ${quote.l} | Open: ${quote.o}`;

    const news: any[] = newsData.slice(0, 5).map((n: any) => `- ${n.headling}`).join('\n');

    const prompt = `You are a professional Wall Street quantitative analyst.

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
- P/E Ratio: ${financials?.peRatio || 'N/A'}
- EPS: ${financials?.eps || 'N/A'}
- Revenue Growth: ${financials?.revenueQuarterlyGrwth ? financials?.revenueQuarterlyGrwth.toFixed(2) + '%' : 'N/A'}
- Market Cap: ${financials?.marketCapitalization ? '$' + (financials?.marketCapitalization / 1e9).toFixed(2) + 'B' : 'N/A'}

Latest News:
${news || 'No recent news available'}

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

    const aiResult = await generateRecommendation(prompt);

    const rec = await prisma.recommendation.create({
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

    return {
      success: true,
      symbol,
      recommendation: rec.recommendation,
    };
  } catch (error) {
    console.error(`Failed to generate recommendation for ${symbol}:`, error);
    return { success: false, symbol, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { symbols = TOP_US_STOCKS.slice(0, 100).map((s) => s.symbol) } = body;

    const results: Array<{
      success: boolean;
      symbol: string;
      recommendation?: string;
      error?: string;
    }> = [];

    for (const symbol of symbols) {
      const result = await generateRecommendationForStock(symbol);
      results.push(result);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      processed: symbols.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error('CRON job error:', error);
    return NextResponse.json(
      { error: 'Failed to process CRON job' },
      { status: 500 }
    );
  }
}