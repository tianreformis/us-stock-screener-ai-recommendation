import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceChartToggle } from '@/components/price-chart';
import { TechnicalPanel } from '@/components/technical-panel';
import { FundamentalPanel } from '@/components/fundamental-panel';
import { NewsFeed } from '@/components/news-feed';
import { AIRecommendation } from '@/components/ai-recommendation';
import { formatCurrency, formatMarketCap, formatPercent, cn } from '@/lib/utils';
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

  let candles = null;
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
    console.error('Failed to fetch candles');
  }

  let news: any[] = [];
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
    console.error('Failed to fetch news');
  }

  let dbStock = null;
  try {
    dbStock = await prisma.stock.findUnique({
      where: { symbol },
    });
  } catch {
    console.error('Failed to fetch stock from DB');
  }

  return {
    stock: {
      symbol: dbStock?.symbol || symbol,
      name: profile?.name || dbStock?.name || symbol,
      sector: profile?.finnhubIndustry || financials?.sector || dbStock?.sector || undefined,
      industry: financials?.industry || dbStock?.industry || undefined,
      marketCap: profile?.marketCapitalization || dbStock?.marketCap || undefined,
      exchange: profile?.exchange || dbStock?.exchange || undefined,
      price: quote?.c || dbStock?.price || null,
      pe: financials?.peRatio || dbStock?.pe || undefined,
      eps: financials?.eps || dbStock?.eps || undefined,
    },
    quote,
    profile,
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
                {quote?.c ? formatCurrency(quote.c) : '-'}
              </span>
              <span className={cn(
                'text-sm',
                quote?.d && quote.d > 0 ? 'text-green-500' : 
                quote?.d && quote.d < 0 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {quote?.d ? formatCurrency(quote.d) : '-'} ({quote?.dp ? formatPercent(quote.dp) : '-'})
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{stock.sector || 'N/A'}</span>
              <span>•</span>
              <span>{stock.exchange || 'N/A'}</span>
              <span>•</span>
              <span>{stock.marketCap ? formatMarketCap(stock.marketCap) : 'N/A'}</span>
            </div>
          </div>

          <div>
            {candles && candles.length > 0 ? (
              <PriceChartToggle data={candles} symbol={symbol} height={400} />
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            )}
          </div>

          <Tabs defaultValue="technicals">
            <TabsList>
              <TabsTrigger value="technicals">Technical Indicators</TabsTrigger>
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>
            <TabsContent value="technicals" className="mt-4">
              <TechnicalPanel indicators={null} />
            </TabsContent>
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
                  <span className="font-medium">{financials?.eps ? formatCurrency(financials.eps) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{stock.marketCap ? formatMarketCap(stock.marketCap) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">{financials?.revenue ? formatMarketCap(financials.revenue) : 'N/A'}</span>
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