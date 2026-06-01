import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchQuote } from '@/lib/yahoo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const strategy = searchParams.get('strategy') || 'all';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'marketCap';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const sector = searchParams.get('sector') || 'all';

  // Custom filters (parsed from query parameters)
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const minMarketCap = searchParams.get('minMarketCap') ? parseFloat(searchParams.get('minMarketCap')!) : undefined;
  const maxMarketCap = searchParams.get('maxMarketCap') ? parseFloat(searchParams.get('maxMarketCap')!) : undefined;
  const minPE = searchParams.get('minPE') ? parseFloat(searchParams.get('minPE')!) : undefined;
  const maxPE = searchParams.get('maxPE') ? parseFloat(searchParams.get('maxPE')!) : undefined;
  const minRsi = searchParams.get('minRsi') ? parseFloat(searchParams.get('minRsi')!) : undefined;
  const maxRsi = searchParams.get('maxRsi') ? parseFloat(searchParams.get('maxRsi')!) : undefined;
  const minVolume = searchParams.get('minVolume') ? parseFloat(searchParams.get('minVolume')!) : undefined;
  const maxVolume = searchParams.get('maxVolume') ? parseFloat(searchParams.get('maxVolume')!) : undefined;

  try {
    // 1. Fetch current stocks in DB
    const dbStocks = await prisma.stock.findMany();

    // 2. Fetch real-time quotes in parallel from Yahoo Finance to update our SQLite database
    const allStocks = await Promise.all(
      dbStocks.map(async (stock) => {
        try {
          const liveQuote = await fetchQuote(stock.ticker);
          if (liveQuote) {
            // Update the record in SQLite so that strategies calculate on real-time prices
            const updatedStock = await prisma.stock.update({
              where: { ticker: stock.ticker },
              data: {
                price: liveQuote.c || stock.price,
                change: liveQuote.d || stock.change,
                changePercent: liveQuote.dp || stock.changePercent,
              },
            });
            return updatedStock;
          }
        } catch (e) {
          console.error(`Failed to synchronize real-time quote for ${stock.ticker}:`, e);
        }
        return stock; // fallback to DB record on network/API failure
      })
    );

    // 3. Filter by search (Ticker or Company Name)
    let filtered = allStocks.filter((stock) => {
      const matchSearch =
        stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase());
      
      const matchSector = sector === 'all' || stock.sector === sector;

      return matchSearch && matchSector;
    });

    // 4. Filter by Strategy using the freshly synced real-time data
    if (strategy === 'scalping') {
      // Scalping Strategy:
      // Volume > 1,000,000 AND Beta > 1.3 AND Price >= $5 AND (Change Percent > 2% OR Change Percent < -2%)
      filtered = filtered.filter((s) => {
        const meetsVol = s.volume > 1000000;
        const meetsBeta = s.beta > 1.3;
        const meetsPrice = s.price >= 5;
        const meetsChange = s.changePercent > 2 || s.changePercent < -2;
        return meetsVol && meetsBeta && meetsPrice && meetsChange;
      });
    } else if (strategy === 'swing') {
      // Swing Trading Strategy:
      // Price > SMA_50 AND SMA_50 > SMA_200 AND RSI_14 BETWEEN 40 AND 60 AND Volume > 500,000
      filtered = filtered.filter((s) => {
        const meetsPriceSma = s.price > s.sma50;
        const meetsSmaSma = s.sma50 > s.sma200;
        const meetsRsi = s.rsi14 >= 40 && s.rsi14 <= 60;
        const meetsVol = s.volume > 500000;
        return meetsPriceSma && meetsSmaSma && meetsRsi && meetsVol;
      });
    } else if (strategy === 'momentum') {
      // Momentum Play Strategy:
      // Price > SMA_20 AND Price > SMA_50 AND Price > SMA_200 AND RSI_14 > 65 AND Price >= (0.95 * 52_Week_High)
      filtered = filtered.filter((s) => {
        const meetsSmas = s.price > s.sma20 && s.price > s.sma50 && s.price > s.sma200;
        const meetsRsi = s.rsi14 > 65;
        const meetsHigh52 = s.price >= 0.95 * s.high52Week;
        return meetsSmas && meetsRsi && meetsHigh52;
      });
    } else if (strategy === 'fundamental') {
      // Fundamental Play Strategy:
      // P_E BETWEEN 0 AND 25 AND Market Cap > 10,000,000,000 AND EPS > 0 AND Price > SMA_200
      filtered = filtered.filter((s) => {
        const meetsPe = s.pe >= 0 && s.pe <= 25;
        const meetsCap = s.marketCap > 10000000000;
        const meetsEps = s.eps > 0;
        const meetsPriceSma = s.price > s.sma200;
        return meetsPe && meetsCap && meetsEps && meetsPriceSma;
      });
    } else if (strategy === 'custom') {
      // Custom Advanced Screener
      filtered = filtered.filter((s) => {
        if (minPrice !== undefined && s.price < minPrice) return false;
        if (maxPrice !== undefined && s.price > maxPrice) return false;
        if (minMarketCap !== undefined && s.marketCap < minMarketCap) return false;
        if (maxMarketCap !== undefined && s.marketCap > maxMarketCap) return false;
        if (minPE !== undefined && s.pe < minPE) return false;
        if (maxPE !== undefined && s.pe > maxPE) return false;
        if (minRsi !== undefined && s.rsi14 < minRsi) return false;
        if (maxRsi !== undefined && s.rsi14 > maxRsi) return false;
        if (minVolume !== undefined && s.volume < minVolume) return false;
        if (maxVolume !== undefined && s.volume > maxVolume) return false;
        return true;
      });
    }

    // 5. Sorting
    filtered.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Special handling for Relative Volume in Scalping Strategy
      if (sortBy === 'relativeVolume') {
        valA = a.volume / (a.avgVolume3M || 1);
        valB = b.volume / (b.avgVolume3M || 1);
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Screener API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screener stocks' },
      { status: 500 }
    );
  }
}
