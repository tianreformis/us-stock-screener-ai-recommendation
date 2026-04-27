import type { StockPrice, TechnicalIndicators } from '@/types';

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return 50;
  }

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains: number[] = changes.map((c) => (c > 0 ? c : 0));
  const losses: number[] = changes.map((c) => (c < 0 ? -c : 0));

  let avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1] || 0;
  }

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

export interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (prices.length < slowPeriod + signalPeriod) {
    return { MACD: 0, signal: 0, histogram: 0 };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdLine = fastEMA - slowEMA;

  const macdValues: number[] = [];
  for (let i = slowPeriod; i < prices.length; i++) {
    const fast = calculateEMA(prices.slice(0, i + 1), fastPeriod);
    const slow = calculateEMA(prices.slice(0, i + 1), slowPeriod);
    macdValues.push(fast - slow);
  }

  const signal = calculateEMA(macdValues, signalPeriod);
  const histogram = macdLine - signal;

  return {
    MACD: macdLine,
    signal,
    histogram,
  };
}

export function calculateTechnicalIndicators(
  prices: StockPrice[]
): TechnicalIndicators {
  const closePrices = prices.map((p) => p.close);

  const rsi = calculateRSI(closePrices);
  const ema20 = calculateEMA(closePrices, 20);
  const ema50 = calculateEMA(closePrices, 50);
  const ema200 = closePrices.length >= 200 ? calculateEMA(closePrices, 200) : 0;
  const macd = calculateMACD(closePrices);
  const sma20 = calculateSMA(closePrices, 20);
  const sma50 = calculateSMA(closePrices, 50);
  const sma200 = closePrices.length >= 200 ? calculateSMA(closePrices, 200) : 0;

  return {
    rsi: Math.round(rsi * 100) / 100,
    ema20: Math.round(ema20 * 100) / 100,
    ema50: Math.round(ema50 * 100) / 100,
    ema200: Math.round(ema200 * 100) / 100,
    macd,
    sma20: sma20 ? Math.round(sma20 * 100) / 100 : undefined,
    sma50: sma50 ? Math.round(sma50 * 100) / 100 : undefined,
    sma200: sma200 ? Math.round(sma200 * 100) / 100 : undefined,
  };
}