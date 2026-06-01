import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockStocks = [
  // --- STRATEGY 1: SCALPING (High Volatility, Beta > 1.3, Vol > 1M, Change % > 2% or < -2%, Price >= 5) ---
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    price: 242.50,
    change: 8.24,
    changePercent: 3.52,
    volume: 18450000,
    avgVolume3M: 12500000,
    marketCap: 760000000000,
    pe: 58.4,
    forwardPe: 45.2,
    eps: 4.15,
    rsi14: 62.4,
    sma20: 231.20,
    sma50: 224.50,
    sma200: 205.10,
    macdLine: 3.24,
    macdSignal: 2.10,
    atr: 8.50,
    beta: 1.65,
    high52Week: 299.29,
    low52Week: 138.80,
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Technology',
    industry: 'Semiconductors',
    price: 168.40,
    change: -4.80,
    changePercent: -2.77,
    volume: 12500000,
    avgVolume3M: 9200000,
    marketCap: 272000000000,
    pe: 182.5,
    forwardPe: 35.6,
    eps: 0.92,
    rsi14: 44.2,
    sma20: 172.10,
    sma50: 164.20,
    sma200: 158.40,
    macdLine: -0.85,
    macdSignal: -0.40,
    atr: 6.20,
    beta: 1.72,
    high52Week: 227.30,
    low52Week: 93.11,
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Technologies Inc.',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    price: 43.15,
    change: 1.85,
    changePercent: 4.48,
    volume: 14200000,
    avgVolume3M: 7800000,
    marketCap: 96000000000,
    pe: 124.2,
    forwardPe: 82.5,
    eps: 0.35,
    rsi14: 68.1,
    sma20: 38.50,
    sma50: 34.20,
    sma200: 26.80,
    macdLine: 2.45,
    macdSignal: 1.95,
    atr: 2.10,
    beta: 1.55,
    high52Week: 45.00,
    low52Week: 14.68,
  },

  // --- STRATEGY 2: SWING TRADING (Price > SMA50 > SMA200, RSI between 40 and 60, Vol > 500k) ---
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    price: 188.50,
    change: 0.45,
    changePercent: 0.24,
    volume: 4500000,
    avgVolume3M: 5200000,
    marketCap: 2950000000000,
    pe: 29.5,
    forwardPe: 26.1,
    eps: 6.39,
    rsi14: 51.5, // pullback zone
    sma20: 191.20,
    sma50: 185.40, // Price > SMA50
    sma200: 178.20, // SMA50 > SMA200
    macdLine: 0.12,
    macdSignal: 0.35,
    atr: 3.40,
    beta: 1.22,
    high52Week: 199.62,
    low52Week: 164.08,
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    price: 178.20,
    change: -1.10,
    changePercent: -0.61,
    volume: 3800000,
    avgVolume3M: 4100000,
    marketCap: 1850000000000,
    pe: 41.2,
    forwardPe: 33.5,
    eps: 4.32,
    rsi14: 48.7, // pullback zone
    sma20: 182.40,
    sma50: 175.10, // Price > SMA50
    sma200: 162.80, // SMA50 > SMA200
    macdLine: -0.25,
    macdSignal: -0.05,
    atr: 3.80,
    beta: 1.15,
    high52Week: 191.70,
    low52Week: 118.35,
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Communication Services',
    industry: 'Entertainment',
    price: 615.40,
    change: 3.20,
    changePercent: 0.52,
    volume: 1800000,
    avgVolume3M: 2200000,
    marketCap: 265000000000,
    pe: 42.1,
    forwardPe: 32.4,
    eps: 14.62,
    rsi14: 54.2, // pullback zone
    sma20: 622.10,
    sma50: 605.80, // Price > SMA50
    sma200: 554.20, // SMA50 > SMA200
    macdLine: 1.15,
    macdSignal: 1.30,
    atr: 12.40,
    beta: 1.28,
    high52Week: 639.00,
    low52Week: 344.73,
  },

  // --- STRATEGY 3: MOMENTUM PLAY (Price > SMA20/50/200, RSI > 65, Price >= 0.95 * 52W High) ---
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    price: 915.20,
    change: 22.10,
    changePercent: 2.47,
    volume: 14500000,
    avgVolume3M: 11200000,
    marketCap: 2280000000000,
    pe: 74.8,
    forwardPe: 48.2,
    eps: 12.23,
    rsi14: 78.5, // strong trend
    sma20: 885.30, // Price > SMA20
    sma50: 820.40, // Price > SMA50
    sma200: 680.10, // Price > SMA200
    macdLine: 18.40,
    macdSignal: 14.20,
    atr: 28.50,
    beta: 1.85,
    high52Week: 950.00, // 0.95 * 950 = 902.5. Price 915.2 >= 902.5 (Momentum breakout)
    low52Week: 373.56,
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    price: 425.80,
    change: 5.15,
    changePercent: 1.22,
    volume: 3200000,
    avgVolume3M: 2800000,
    marketCap: 3160000000000,
    pe: 36.2,
    forwardPe: 31.5,
    eps: 11.75,
    rsi14: 67.2, // RSI > 65
    sma20: 418.50, // Price > SMA20
    sma50: 410.20, // Price > SMA50
    sma200: 382.40, // Price > SMA200
    macdLine: 4.80,
    macdSignal: 3.90,
    atr: 7.20,
    beta: 1.12,
    high52Week: 430.82, // 0.95 * 430.82 = 409.2. Price 425.8 >= 409.2
    low52Week: 315.18,
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    price: 504.60,
    change: 8.40,
    changePercent: 1.69,
    volume: 2900000,
    avgVolume3M: 3100000,
    marketCap: 1280000000000,
    pe: 28.8,
    forwardPe: 22.4,
    eps: 17.52,
    rsi14: 69.4, // RSI > 65
    sma20: 494.20, // Price > SMA20
    sma50: 482.50, // Price > SMA50
    sma200: 420.80, // Price > SMA200
    macdLine: 7.10,
    macdSignal: 5.80,
    atr: 11.50,
    beta: 1.35,
    high52Week: 531.49, // 0.95 * 531.49 = 504.9. Wait, 504.6 is extremely close, let's bump price to 506.00
    low52Week: 265.40,
  },

  // --- STRATEGY 4: FUNDAMENTAL PLAY (PE between 0 and 25, Market Cap > 10B, EPS > 0, Price > SMA200) ---
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial',
    industry: 'Banks - Diverse',
    price: 198.50,
    change: 1.25,
    changePercent: 0.63,
    volume: 1100000,
    avgVolume3M: 1400000,
    marketCap: 570000000000,
    pe: 12.4, // Value play
    forwardPe: 11.5,
    eps: 16.00, // EPS > 0
    rsi14: 58.5,
    sma20: 195.40,
    sma50: 191.20,
    sma200: 175.40, // Price > SMA200
    macdLine: 1.24,
    macdSignal: 1.10,
    atr: 3.10,
    beta: 1.08,
    high52Week: 205.88,
    low52Week: 123.11,
  },
  {
    ticker: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Consumer Defensive',
    industry: 'Discount Stores',
    price: 60.40,
    change: -0.15,
    changePercent: -0.25,
    volume: 1600000,
    avgVolume3M: 1900000,
    marketCap: 485000000000,
    pe: 24.1, // Value/Stable PE < 25
    forwardPe: 22.4,
    eps: 2.50, // EPS > 0
    rsi14: 50.2,
    sma20: 61.20,
    sma50: 59.80,
    sma200: 54.60, // Price > SMA200
    macdLine: 0.25,
    macdSignal: 0.30,
    atr: 0.95,
    beta: 0.49,
    high52Week: 63.45,
    low52Week: 48.12,
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    industry: 'Oil & Gas Integrated',
    price: 115.80,
    change: 0.85,
    changePercent: 0.74,
    volume: 14500000,
    avgVolume3M: 16500000,
    marketCap: 462000000000,
    pe: 13.5, // PE < 25
    forwardPe: 11.8,
    eps: 8.58, // EPS > 0
    rsi14: 55.4,
    sma20: 114.20,
    sma50: 112.50,
    sma200: 108.20, // Price > SMA200
    macdLine: 0.45,
    macdSignal: 0.35,
    atr: 2.20,
    beta: 0.95,
    high52Week: 123.75,
    low52Week: 95.77,
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    price: 172.50,
    change: -2.10,
    changePercent: -1.20,
    volume: 2400000,
    avgVolume3M: 2600000,
    marketCap: 2150000000000,
    pe: 23.8, // PE < 25
    forwardPe: 19.5,
    eps: 7.24, // EPS > 0
    rsi14: 46.8,
    sma20: 175.40,
    sma50: 170.10,
    sma200: 154.20, // Price > SMA200
    macdLine: -0.15,
    macdSignal: 0.10,
    atr: 3.10,
    beta: 1.10,
    high52Week: 191.85,
    low52Week: 115.35,
  },

  // --- OTHERS: FOR DIVERSITY & TESTING ---
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    sector: 'Consumer Defensive',
    industry: 'Beverages - Non-Alcoholic',
    price: 61.20,
    change: 0.12,
    changePercent: 0.20,
    volume: 1200000,
    avgVolume3M: 1400000,
    marketCap: 264000000000,
    pe: 25.5,
    forwardPe: 23.4,
    eps: 2.40,
    rsi14: 52.3,
    sma20: 60.90,
    sma50: 60.10,
    sma200: 58.20,
    macdLine: 0.10,
    macdSignal: 0.08,
    atr: 0.80,
    beta: 0.58,
    high52Week: 64.20,
    low52Week: 51.55,
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    industry: 'Drug Manufacturers - General',
    price: 155.40,
    change: -0.85,
    changePercent: -0.54,
    volume: 980000,
    avgVolume3M: 1100000,
    marketCap: 374000000000,
    pe: 15.8,
    forwardPe: 14.1,
    eps: 9.84,
    rsi14: 38.2, // Oversold territory
    sma20: 158.20,
    sma50: 160.40,
    sma200: 162.10,
    macdLine: -1.20,
    macdSignal: -0.90,
    atr: 2.20,
    beta: 0.54,
    high52Week: 175.97,
    low52Week: 143.13,
  },
  {
    ticker: 'ABBV',
    name: 'AbbVie Inc.',
    sector: 'Healthcare',
    industry: 'Drug Manufacturers - General',
    price: 168.90,
    change: 2.45,
    changePercent: 1.47,
    volume: 850000,
    avgVolume3M: 950000,
    marketCap: 298000000000,
    pe: 22.4,
    forwardPe: 15.2,
    eps: 7.54,
    rsi14: 57.8,
    sma20: 165.40,
    sma50: 161.20,
    sma200: 152.40,
    macdLine: 1.85,
    macdSignal: 1.40,
    atr: 2.80,
    beta: 0.62,
    high52Week: 182.89,
    low52Week: 130.96,
  },
  {
    ticker: 'BA',
    name: 'The Boeing Company',
    sector: 'Industrials',
    industry: 'Aerospace & Defense',
    price: 174.50,
    change: -3.40,
    changePercent: -1.91,
    volume: 2400000,
    avgVolume3M: 2900000,
    marketCap: 106000000000,
    pe: -35.2, // Negative PE
    forwardPe: 45.8,
    eps: -4.95, // Negative EPS
    rsi14: 32.5, // Weak indicators
    sma20: 180.20,
    sma50: 188.40,
    sma200: 202.50,
    macdLine: -4.20,
    macdSignal: -3.50,
    atr: 5.50,
    beta: 1.45,
    high52Week: 267.54,
    low52Week: 159.70,
  },
  {
    ticker: 'CAT',
    name: 'Caterpillar Inc.',
    sector: 'Industrials',
    industry: 'Farm & Heavy Construction Machinery',
    price: 345.20,
    change: 4.12,
    changePercent: 1.21,
    volume: 750000,
    avgVolume3M: 880000,
    marketCap: 172000000000,
    pe: 16.4,
    forwardPe: 15.2,
    eps: 21.05,
    rsi14: 61.2,
    sma20: 338.40,
    sma50: 328.10,
    sma200: 292.50,
    macdLine: 5.10,
    macdSignal: 4.20,
    atr: 6.80,
    beta: 1.15,
    high52Week: 365.00,
    low52Week: 223.42,
  },
  {
    ticker: 'SCHW',
    name: 'Charles Schwab Corp.',
    sector: 'Financial',
    industry: 'Capital Markets',
    price: 72.80,
    change: -1.15,
    changePercent: -1.56,
    volume: 1200000,
    avgVolume3M: 1500000,
    marketCap: 132000000000,
    pe: 25.1,
    forwardPe: 18.2,
    eps: 2.90,
    rsi14: 49.5,
    sma20: 74.20,
    sma50: 71.80,
    sma200: 66.40,
    macdLine: -0.10,
    macdSignal: 0.15,
    atr: 1.95,
    beta: 1.42,
    high52Week: 79.41,
    low52Week: 50.15,
  }
];

// Complete the META record's high52Week adjustments
const metaRecord = mockStocks.find(s => s.ticker === 'META');
if (metaRecord) {
  // Let's ensure META matches Momentum perfectly: Price 504.60 >= (0.95 * 531.00 = 504.45)
  metaRecord.high52Week = 531.00;
}

// Generate past 30 days price history for a given base price and trend
function generateHistory(basePrice: number, changePercent: number) {
  const history = [];
  const now = new Date();
  let currentPrice = basePrice;
  // daily trend is rough approximation
  const dailyVolatility = Math.abs(changePercent) > 1.5 ? Math.abs(changePercent) / 100 : 0.015;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // don't include weekends
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const change = currentPrice * (Math.random() - 0.48) * dailyVolatility;
    const close = currentPrice - change;
    const open = close - (close * (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) + (Math.max(open, close) * Math.random() * 0.008);
    const low = Math.min(open, close) - (Math.min(open, close) * Math.random() * 0.008);
    const volume = 500000 + Math.floor(Math.random() * 2000000);

    history.push({
      date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(0)),
    });
    currentPrice = close;
  }
  // Reverse the generation sequence to make it ascending chronological
  return history.reverse();
}

async function main() {
  console.log('Seeding SQLite database with US stock screener mock data...');

  // Delete all old records (Cascade will clean up prices, recommendations, and articles)
  await prisma.stock.deleteMany({});
  await prisma.cacheEntry.deleteMany({});

  for (const stock of mockStocks) {
    try {
      console.log(`Inserting stock: ${stock.ticker} - ${stock.name}`);
      const createdStock = await prisma.stock.create({
        data: {
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          industry: stock.industry,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
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
      });

      // Seed historical prices for the chart
      const history = generateHistory(stock.price, stock.changePercent);
      await prisma.stockPrice.createMany({
        data: history.map((p) => ({
          symbol: createdStock.ticker,
          date: p.date,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume,
        })),
      });

      // Create a mock recommendation explaining why it fits or its outlook
      let recType = 'HOLD';
      let confidence = 70;
      let summary = `${stock.name} is showing consolidated price action near the $${stock.price} level.`;
      
      if (stock.rsi14 > 65 && stock.price > stock.sma20) {
        recType = 'STRONG BUY';
        confidence = 90;
        summary = `${stock.name} is experiencing strong momentum and is breaking out towards new highs, supported by key moving averages and elevated RSI.`;
      } else if (stock.pe > 0 && stock.pe < 25 && stock.eps > 0) {
        recType = 'BUY';
        confidence = 85;
        summary = `${stock.name} presents a solid fundamental profile with attractive valuation metrics (P/E: ${stock.pe}) and robust profitability.`;
      } else if (stock.rsi14 < 40) {
        recType = 'ACCUMULATE';
        confidence = 75;
        summary = `${stock.name} is currently in oversold territory (RSI: ${stock.rsi14}) indicating potential for a near-term mean reversion.`;
      }

      await prisma.recommendation.create({
        data: {
          symbol: createdStock.ticker,
          recommendation: recType,
          confidence: confidence,
          technical: `RSI(14) is at ${stock.rsi14}. Trading above SMA(200) by ${((stock.price - stock.sma200)/stock.sma200 * 100).toFixed(1)}%. Average volatility (ATR) is $${stock.atr}.`,
          fundamental: `P/E Ratio is ${stock.pe} and Forward P/E is ${stock.forwardPe}. Generates strong earnings with EPS of $${stock.eps}. Total market capitalization of $${(stock.marketCap / 1e9).toFixed(1)}B.`,
          sentiment: 'Bullish options flow and strong institutional accumulation recorded over the past month.',
          summary: summary,
        },
      });

      // Create a mock news article for context
      await prisma.newsArticle.create({
        data: {
          symbol: createdStock.ticker,
          headline: `${stock.name} Reports Strong Growth Indicators; Analysts Revise Forecasts`,
          summary: `Shares of ${stock.name} (${stock.ticker}) moved on heavy volume today as institutional reports highlight positive market demand and key moving average supports.`,
          source: 'MarketWire',
          url: 'https://example.com/finance/news',
          datetime: new Date(),
        },
      });

    } catch (error) {
      console.error(`Failed to seed ${stock.ticker}:`, error);
    }
  }

  console.log('Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
