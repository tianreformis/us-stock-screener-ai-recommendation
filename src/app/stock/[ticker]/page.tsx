import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceChartToggle } from '@/components/price-chart';
import { FundamentalPanel } from '@/components/fundamental-panel';
import { NewsFeed } from '@/components/news-feed';
import { AIRecommendation } from '@/components/ai-recommendation';
import { fetchQuote, fetchCompanyProfile, fetchBasicFinancials, fetchStockCandles, fetchNews } from '@/lib/finnhub';
import { prisma } from '@/lib/prisma';

async function getStockData(ticker: string) {
  const symbol = ticker.toUpperCase();
  
  const [quote, profile, financials]: [any, any, any] = await Promise.all([
    fetchQuote(symbol).catch(() => null),
    fetchCompanyProfile(symbol).catch(() => null),
    fetchBasicFinancials(symbol).catch(() => null),
  ]);

  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;

  let candles: any[] = [];
  try {
    const candleData = await fetchStockCandles(symbol, 'D', oneYearAgo, now);
    if (candleData.s === 'ok' && candleData.c && candleData.c.length > 0) {
      candles = candleData.t.map((timestamp: any, index: any) => ({
        time: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: candleData.o[index],
        high: candleData.h[index],
        low: candleData.l[index],
        close: candleData.c[index],
        volume: candleData.v[index],
      }));
    }
  } catch (e) {
    console.error('Failed to fetch candles', e);
  }

  let news: any[] = [];
  try {
    const newsData = await fetchNews(symbol);
    if (newsData && newsData.length > 0) {
      news = newsData.slice(0, 10).map((n: any) => ({
        id: n.id,
        headline: n.title,
        summary: n.summary,
        source: n.source,
        url: n.url,
        datetime: n.published_at,
      }));
    }
  } catch (e) {
    console.error('Failed to fetch news', e);
  }

  let dbStock = null;
  try {
    dbStock = await prisma.stock.findUnique({
      where: { symbol },
    }) as any;
  } catch (e) {
    console.error('Failed to fetch stock from DB', e);
  }

  return {
    stock: {
      symbol: dbStock?.symbol || symbol,
      name: dbStock?.name || symbol,
      sector: profile?.sector || financials?.sector || dbStock?.sector || undefined,
      industry: financials?.industry || dbStock?.industry || undefined,
      marketCap: profile?.marketCapitalization || dbStock?.marketCap || undefined,
      exchange: profile?.exchange || dbStock?.exchange || undefined,
      price: quote?.c || dbStock?.price || null,
      pe: financials?.peRatio || dbStock?.pe || undefined,
      eps: financials?.eps || dbStock?.eps || undefined,
    },
    quote,
    financials,
    candles,
    news,
  };
}

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const { stock, quote, financials, candles, news } = await getStockData(ticker);

  if (!stock) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Screener
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-bold">{stock.symbol}</h1>
              <span className="text-xl text-muted-foreground">{stock.name}</span>
            </div>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-2xl font-semibold">
                {quote?.c ? `$${quote.c.toFixed(2)}` : '-'}
              </span>
              <span className={
                quote?.d && quote.d > 0 ? 'text-green-500' : 
                quote?.d && quote.d < 0 ? 'text-red-500' : 'text-muted-foreground'
              }>
                {quote?.d ? `$${quote.d.toFixed(2)}` : '-'} ({quote?.dp ? `${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%` : '-'})
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{stock.sector || 'N/A'}</span>
              <span>•</span>
              <span>{stock.exchange || 'N/A'}</span>
              <span>•</span>
              <span>{stock.marketCap ? `$${(stock.marketCap / 1e9).toFixed(1)}B` : 'N/A'}</span>
            </div>
          </div>

          {candles && candles.length > 0 && (
            <div>
              <PriceChartToggle data={candles} symbol={symbol} height={400} />
            </div>
          )}

          <Tabs defaultValue="fundamentals">
            <TabsList>
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
            <TabsContent value="fundamentals" className="mt-4">
              <FundamentalPanel fundamentals={financials} />
            </TabsContent>
            <TabsContent value="news" className="mt-4">
              <NewsFeed news={news} symbol={symbol} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <AIRecommendation symbol={symbol} />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P/E Ratio</span>
                  <span className="font-medium">{financials?.peRatio ? financials.peRatio.toFixed(1) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">EPS</span>
                  <span className="font-medium">{financials?.eps ? `$${financials.eps.toFixed(2)}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{stock.marketCap ? `$${(stock.marketCap / 1e9).toFixed(1)}B` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">{financials?.revenue ? `$${(financials.revenue / 1e9).toFixed(1)}B` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className="font-medium">
                    {financials?.profitMargin ? `${(financials.profitMargin * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ROE</span>
                  <span className="font-medium">{financials?.roe ? `${financials.roe.toFixed(1)}%` : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}