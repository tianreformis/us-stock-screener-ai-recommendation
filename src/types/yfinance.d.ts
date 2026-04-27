declare module 'yahoo-finance2' {
  interface QuoteModule {
    symbol: string;
    shortName?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketOpen?: number;
    previousClose?: number;
    regularMarketPreviousClose?: number;
    regularMarketVolume?: number;
    marketCap?: number;
    trailingPE?: number;
    epsTrailingTwelveMonths?: number;
    totalRevenue?: number;
    profitMargins?: number;
    returnOnEquity?: number;
    revenueGrowth?: number;
    netIncomeToCommon?: number;
    grossProfits?: number;
    ebitda?: number;
    dividendYield?: number;
    dividendRate?: number;
    beta?: number;
    bookValue?: number;
    priceToBook?: number;
    pegRatioFiveYearExpected?: number;
    sector?: string;
    industry?: string;
  }

  interface HistoricalModule {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
  }

  class YahooFinance {
    quote(symbol: string): Promise<QuoteModule>;
    historical(symbol: string, options?: { period1?: Date; period2?: Date }): Promise<HistoricalModule[]>;
  }

  export default YahooFinance;
}