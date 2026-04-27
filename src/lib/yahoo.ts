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
    
    const history = await yf.historical(symbol, { 
      period1: oneYearAgo,
    });
    
    const timestamps = history.map(d => Math.floor(d.date.getTime() / 1000));
    const closes = history.map(d => d.close);
    const opens = history.map(d => d.open);
    const highs = history.map(d => d.high);
    const lows = history.map(d => d.low);
    const volumes = history.map(d => d.volume);

    return {
      s: timestamps.length > 0 ? 'ok' : 'no_data',
      t: timestamps,
      o: opens,
      h: highs,
      l: lows,
      c: closes,
      v: volumes,
    };
  } catch (e) {
    console.error('Historical error:', e);
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