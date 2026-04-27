import axios from 'axios';
import type {
  FinnhubQuote,
  FinnhubCompanyProfile,
  FinnhubMetric,
  FinnhubStockCandles,
  FinnhubNews,
} from '@/types';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const response = await axios.get(`${FINNHUB_BASE_URL}${endpoint}`, {
      params: {
        token: this.apiKey,
        ...params,
      },
    });
    return response.data;
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    return this.fetch<FinnhubQuote>('/quote', { symbol });
  }

  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
    return this.fetch<FinnhubCompanyProfile>('/stock/profile2', { symbol });
  }

  async getCompanyBasicFinancials(symbol: string): Promise<FinnhubMetric> {
    return this.fetch<FinnhubMetric>('/stock/metric', { symbol });
  }

  async getStockCandles(
    symbol: string,
    resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
    from: number,
    to: number
  ): Promise<FinnhubStockCandles> {
    return this.fetch<FinnhubStockCandles>('/stock/candle', {
      symbol,
      resolution,
      from: String(from),
      to: String(to),
    });
  }

  async getNews(symbol?: string, from?: string, to?: string): Promise<FinnhubNews[]> {
    const params: Record<string, string> = {};
    if (symbol) params.symbol = symbol;
    if (from) params.from = from;
    if (to) params.to = to;
    return this.fetch<FinnhubNews[]>('/company-news', params);
  }

  async getMarketNews(): Promise<FinnhubNews[]> {
    return this.fetch<FinnhubNews[]>('/news', { category: 'general' });
  }

  async getSymbolSearch(query: string): Promise<{
    count: number;
    result: Array<{
      description: string;
      displaySymbol: string;
      symbol: string;
      type: string;
    }>;
  }> {
    return this.fetch('/search', { q: query });
  }

  async getStockSymbols(exchange: 'NASDAQ' | 'NYSE' | 'AMEX' = 'NASDAQ'): Promise<Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>> {
    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/symbol`, {
      params: {
        token: this.apiKey,
        exchange,
      },
    });
    return response.data;
  }
}

let finnhubClient: FinnhubClient | null = null;

export function getFinnhubClient(): FinnhubClient {
  if (!finnhubClient) {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY is not set');
    }
    finnhubClient = new FinnhubClient(apiKey);
  }
  return finnhubClient;
}

export async function fetchQuote(symbol: string) {
  return getFinnhubClient().getQuote(symbol);
}

export async function fetchCompanyProfile(symbol: string) {
  return getFinnhubClient().getCompanyProfile(symbol);
}

export async function fetchBasicFinancials(symbol: string) {
  return getFinnhubClient().getCompanyBasicFinancials(symbol);
}

export async function fetchStockCandles(
  symbol: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
  from: number,
  to: number
) {
  return getFinnhubClient().getStockCandles(symbol, resolution, from, to);
}

export async function fetchNews(symbol?: string) {
  return getFinnhubClient().getNews(symbol);
}