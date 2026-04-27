import axios from 'axios';

const TWELVEDATA_BASE_URL = 'https://api.twelvedata.com';

export class TwelveDataClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const response = await axios.get(`${TWELVEDATA_BASE_URL}${endpoint}`, {
      params: {
        apikey: this.apiKey,
        ...params,
      },
    });
    
    if (response.data.code && response.data.code !== 200) {
      throw new Error(response.data.message || 'API error');
    }
    
    return response.data;
  }

  async getQuote(symbol: string) {
    const data = await this.fetch<any>('/quote', { symbol: symbol.toUpperCase() });
    return {
      c: parseFloat(data.price) || 0,
      d: parseFloat(data.change) || 0,
      dp: parseFloat(data.change_percent) || 0,
      h: parseFloat(data.high) || 0,
      l: parseFloat(data.low) || 0,
      o: parseFloat(data.open) || 0,
      pc: parseFloat(data.previous_close) || 0,
      t: Math.floor(Date.now() / 1000),
    };
  }

  async getTimeSeries(
    symbol: string,
    interval: string = '1day',
    output_size: number = 5000
  ) {
    const data = await this.fetch<any>('/time_series', { 
      symbol: symbol.toUpperCase(), 
      interval,
      output_size,
    });
    
    const values = data.values || [];
    return {
      s: values.length > 0 ? 'ok' : 'no_data',
      t: values.map((v: any) => Math.floor(new Date(v.datetime).getTime() / 1000)),
      o: values.map((v: any) => parseFloat(v.open)),
      h: values.map((v: any) => parseFloat(v.high)),
      l: values.map((v: any) => parseFloat(v.low)),
      c: values.map((v: any) => parseFloat(v.close)),
      v: values.map((v: any) => parseInt(v.volume) || 0),
    };
  }

  async getStockProfile(symbol: string) {
    return this.fetch('/stock/profile', { symbol: symbol.toUpperCase() });
  }

  async getFundamentals(symbol: string) {
    const data = await this.fetch<any>('/fundamentals', { symbol: symbol.toUpperCase() });
    return {
      peRatio: data.pe_ratio || null,
      eps: data.eps || null,
      revenue: data.revenue || null,
      profitMargin: data.profit_margin || null,
      roe: data.roe || null,
      marketCapitalization: data.market_cap || null,
      revenueGrowth: data.revenue_growth || null,
      netIncome: data.net_income || null,
      grossProfit: data.gross_profit || null,
      ebitda: data.ebitda || null,
    };
  }

  async searchSymbols(query: string) {
    return this.fetch('/symbols_search', { symbol: query });
  }

  async getNews(symbol?: string) {
    const params: Record<string, string | number> = { limit: 20 };
    if (symbol) params.symbols = symbol.toUpperCase();
    const data = await this.fetch<{ data: any[] }>('/news', params);
    return data.data || [];
  }
}

let twelveDataClient: TwelveDataClient | null = null;

export function getTwelveDataClient(): TwelveDataClient {
  if (!twelveDataClient) {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (!apiKey) {
      throw new Error('TWELVEDATA_API_KEY is not set');
    }
    twelveDataClient = new TwelveDataClient(apiKey);
  }
  return twelveDataClient;
}

export async function fetchQuote(symbol: string) {
  return getTwelveDataClient().getQuote(symbol);
}

export async function fetchCompanyProfile(symbol: string) {
  return getTwelveDataClient().getStockProfile(symbol);
}

export async function fetchBasicFinancials(symbol: string) {
  return getTwelveDataClient().getFundamentals(symbol);
}

export async function fetchStockCandles(
  symbol: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
  _from: number,
  _to: number
) {
  const interval = resolution === 'D' ? '1day' : resolution === 'W' ? '1week' : resolution === 'M' ? '1month' : `${resolution}min`;
  return getTwelveDataClient().getTimeSeries(symbol, interval);
}

export async function fetchNews(symbol?: string) {
  return getTwelveDataClient().getNews(symbol);
}