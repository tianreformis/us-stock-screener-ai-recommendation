export interface Stock {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  exchange?: string;
  price?: number;
  pe?: number;
  eps?: number;
  volume?: number;
}

export interface StockPrice {
  id: string;
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface StockFundamentals {
  logo?: string;
  phone?: string;
  weburl?: string;
  ipo?: string;
  marketCapitalizationMktCap?: number;
  sharesOutstanding?: number;
  ticker?: string;
  currency?: string;
  cik?: string;
  isin?: string;
  cusip?: string;
  exchangeCountryISO?: string;
  exchange?: string;
  description?: string;
  sector?: string;
  industry?: string;
  employeeCount?: number;
  fiscalYearEnd?: number;
  latestQuarter?: string;
  peRatio?: number;
  pegRatio?: number;
  payoutRatio?: number;
  quickRatio?: number;
  cashRatio?: number;
  daysOfSalesOutstanding?: number;
  daysOfInventoryOutstanding?: number;
  operatingCycle?: number;
  preTaxProfitMargin?: number;
  netProfitMargin?: number;
  grossProfitMargin?: number;
  operatingProfitMargin?: number;
  pretaxReturnOnAssets?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  netIncomeToRevenue?: number;
  expenseToRevenue?: number;
  revenuePerShare?: number;
  eps?: number;
  epsDiluted?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  revenue?: number;
  grossProfits?: number;
  operatingIncome?: number;
  netIncome?: number;
  ebitda?: number;
  ebitdaMargins?: number;
  operatingMargins?: number;
  profitMargin?: number;
  freeCashflow?: number;
  operatingCashflow?: number;
  totalCash?: number;
  totalDebt?: number;
  netDebtToEBITDA?: number;
  totalDebtToEquity?: number;
  totalDebtToTotalCapital?: number;
  totalDebtToTotalAssets?: number;
  cashToDebt?: number;
  netDividendYield?: number;
  dividendsPerShare?: number;
  dividendYield?: number;
  dividendYieldRatio?: number;
}

export interface Recommendation {
  id: string;
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  technical: string;
  fundamental: string;
  sentiment: string;
  summary: string;
  createdAt: Date;
  source: 'cache' | 'fresh';
}

export interface NewsArticle {
  id: string;
  symbol: string;
  headline: string;
  summary?: string;
  source?: string;
  url?: string;
  datetime: Date;
}

export interface TechnicalIndicators {
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  macd: {
    MACD: number;
    signal: number;
    histogram: number;
  };
  sma20?: number;
  sma50?: number;
  sma200?: number;
}

export interface ScreenerFilters {
  sector?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  minRSI?: number;
  maxRSI?: number;
  minRevenueGrowth?: number;
  maxRevenueGrowth?: number;
  minVolume?: number;
  volumeSpike?: boolean;
}

export interface ScreenerParams extends ScreenerFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface FinnhubMetric {
  symbol: string;
  hasRemoteData: boolean;
  beta: number;
  bookValue: number;
  change: number;
  changePercent: number;
  churn: number;
  churnRate: number;
  companyName: string;
  country: string;
  currency: string;
  dcfDiff: number;
  dcfVal: number;
  depDebtToEq: number;
  deptEquityToCap: number;
  deptToAssets: number;
  div: number;
  divYield: number;
  dte: number;
  ebitda: number;
  ebitdaMargins: number;
  ebt: number;
  eltgToEq: number;
  eps: number;
  grossMargin: number;
  grossProfit: number;
  hasDivisions: number;
  hasExtraordinary: number;
  industry: string;
  interestCoverage: number;
  isEtf: number;
  isFund: number;
  isLoad: number;
  lastAnnualDividend: number;
  latestAnnualDividend: number;
  latestQuarter: number;
  marketCapitalization: number;
  marketCapitalization3YearAvg: number;
  marketCapitalization5YearAvg: number;
  netIncome: number;
  netMargin: number;
  numberOfAnalystOpinions: number;
  opMargin: number;
  ptoBook: number;
  ptoSales: number;
  returnOnAssets: number;
  returnOnEquity: number;
  revenue: number;
  revenue3YearAvgGrwth: number;
  revenue5YearAvgGrwth: number;
  revenuePerShare: number;
  revenueQuarterlyGrwth: number;
  roe: number;
  roic: number;
  sbuxAnalystRating: number;
  sector: string;
  sharesOutstanding: number;
  totalAssets: number;
  totalCash: number;
  totalDebt: number;
  totalDebtToEquity: number;
  volume10DayAvg: number;
  volume3MonthAvg: number;
  volume: number;
}

export interface FinnhubStockCandles {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string;
  t: number[];
  v: number[];
}

export interface FinnhubNews {
  category: string;
  datetime: number;
  headling: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface FinnhubInsider {
  name: string;
  price: number;
  relationship: string;
  sector: string;
  shares: number;
  transactionDate: string;
  transactionPrice: number;
  transactionShares: string;
  transactionType: string;
}

export interface MistralResponse {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  technical_analysis: string;
  fundamental_analysis: string;
  sentiment_analysis: string;
  summary: string;
}