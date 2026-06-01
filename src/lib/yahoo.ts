import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function fetchQuote(symbol: string) {
  try {
    const quote = await yf.quote(symbol);
    
    return {
      c: quote.regularMarketPrice || 0,
      d: quote.regularMarketChange || 0,
      dp: quote.regularMarketChangePercent || 0,
      h: quote.regularMarketDayHigh || 0,
      l: quote.regularMarketDayLow || 0,
      o: quote.regularMarketOpen || 0,
      pc: quote.previousClose || quote.regularMarketPreviousClose || 0,
      t: Math.floor(Date.now() / 1000),
    };
  } catch (e) {
    console.error('Quote error:', e);
    return null;
  }
}

export async function fetchStockCandles(
  symbol: string,
  _resolution: string,
  _from: number,
  _to: number
) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Call chart() directly as suggested by the Yahoo Finance 2 library, casting to any for TypeScript definitions compatibility
    const result = await (yf as any).chart(symbol, { 
      period1: oneYearAgo.toISOString().split('T')[0], // format as YYYY-MM-DD
      period2: new Date().toISOString().split('T')[0],   // format as YYYY-MM-DD
      interval: '1d',
    });
    
    const quotes = result.quotes || [];
    const timestamps = quotes.map((d: any) => d.date ? Math.floor(new Date(d.date).getTime() / 1000) : 0);
    const closes = quotes.map((d: any) => d.close ?? 0);
    const opens = quotes.map((d: any) => d.open ?? 0);
    const highs = quotes.map((d: any) => d.high ?? 0);
    const lows = quotes.map((d: any) => d.low ?? 0);
    const volumes = quotes.map((d: any) => d.volume ?? 0);

    return {
      s: quotes.length > 0 ? 'ok' : 'no_data',
      t: timestamps,
      o: opens,
      h: highs,
      l: lows,
      c: closes,
      v: volumes,
    };
  } catch (e) {
    console.error('Historical chart error:', e);
    return { s: 'no_data', t: [], o: [], h: [], l: [], c: [], v: [] };
  }
}

export async function fetchCompanyProfile(symbol: string) {
  try {
    const quote = await yf.quote(symbol);
    return {
      name: quote.shortName || quote.longName || symbol,
      sector: quote.sector || null,
      industry: quote.industry || null,
      fullTimeEmployees: null,
      webUrl: null,
    };
  } catch (e) {
    console.error('Profile error:', e);
    return null;
  }
}

export async function fetchBasicFinancials(symbol: string) {
  try {
    const quote = await yf.quote(symbol);

    return {
      peRatio: quote.trailingPE || null,
      eps: quote.epsTrailingTwelveMonths || null,
      revenue: quote.totalRevenue || null,
      profitMargin: quote.profitMargins || null,
      roe: quote.returnOnEquity || null,
      marketCapitalization: quote.marketCap || null,
      revenueGrowth: quote.revenueGrowth || null,
      netIncome: quote.netIncomeToCommon || null,
      grossProfit: quote.grossProfits || null,
      ebitda: quote.ebitda || null,
      dividendYield: quote.dividendYield || null,
      dividendRate: quote.dividendRate || null,
      beta: quote.beta || null,
      bookValue: quote.bookValue || null,
      priceToBook: quote.priceToBook || null,
      pegRatio: quote.pegRatioFiveYearExpected || null,
    };
  } catch (e) {
    console.error('Fundamentals error:', e);
    return null;
  }
}

export async function fetchNews(_symbol?: string) {
  return [];
}