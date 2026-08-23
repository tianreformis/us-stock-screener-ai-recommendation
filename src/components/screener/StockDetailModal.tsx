'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppearance } from '@/components/screener/AppearanceContext';
import { formatCurrency, formatMarketCap, formatPercent, formatNumber } from '@/lib/utils';
import { tf } from '@/lib/translations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Calendar,
  Sparkles,
  Newspaper,
  Volume2,
} from 'lucide-react';

interface StockDetailModalProps {
  ticker: string | null;
  isOpen: boolean;
  onClose: () => void;
  activeStrategy: string;
}

export function StockDetailModal({ ticker, isOpen, onClose, activeStrategy }: StockDetailModalProps) {
  const { t } = useAppearance();
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen || !ticker) {
      setData(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stocks/${ticker}`);
        if (!res.ok) {
          throw new Error('Failed to load stock details');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, ticker]);

  if (!isOpen) return null;

  const stock = data?.stock;
  const candles = data?.candles || [];
  const recommendation = data?.recommendation;
  const news = data?.news || [];

  const isPositive = stock?.changePercent >= 0;

  // Determine why it fits the specific active strategy
  const getStrategyExplanation = () => {
    if (!stock) return '';

    switch (activeStrategy) {
      case 'scalping':
        return tf(t.detail.explanations.scalping, {
          beta: stock.beta,
          volume: formatMarketCap(stock.volume),
          change: formatPercent(stock.changePercent),
        });
      case 'swing':
        return tf(t.detail.explanations.swing, {
          sma50: stock.sma50.toFixed(2),
          sma200: stock.sma200.toFixed(2),
          rsi: stock.rsi14,
        });
      case 'momentum':
        return tf(t.detail.explanations.momentum, {
          rsi: stock.rsi14,
          price: stock.price,
          high52: stock.high52Week,
        });
      case 'fundamental':
        return tf(t.detail.explanations.fundamental, {
          cap: `${(stock.marketCap / 1e9).toFixed(1)}B`,
          pe: stock.pe,
          eps: stock.eps,
        });
      default:
        return (
          recommendation?.summary ||
          tf(t.detail.explanations.default, {
            price: stock.price,
            rsi: stock.rsi14,
            atr: stock.atr,
          })
        );
    }
  };

  // Custom tooltips for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl font-mono text-xs text-zinc-100">
          <p className="text-zinc-500 mb-1">{payload[0].payload.time}</p>
          <p className="flex justify-between gap-6">
            <span>{t.detail.priceLabel}</span>
            <span className="font-semibold text-emerald-400">${payload[0].value.toFixed(2)}</span>
          </p>
          <p className="flex justify-between gap-6 text-[10px] text-zinc-400">
            <span>{t.detail.volumeLabel}</span>
            <span>{formatNumber(payload[0].payload.volume)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogTitle className="sr-only">{t.detail.srTitle} - {ticker}</DialogTitle>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            <p className="text-sm text-zinc-400 font-mono">{t.detail.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4 p-6 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs">
              {t.detail.closeWindow}
            </button>
          </div>
        ) : !stock ? (
          <div className="p-8 text-center text-zinc-500">No stock loaded.</div>
        ) : (
          <>
            {/* Header section with stock summary */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-black tracking-tight font-mono text-zinc-50">
                    {stock.ticker}
                  </span>
                  <span className="text-zinc-400 font-medium text-sm">
                    {stock.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800 font-mono">
                    {stock.sector}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800 font-mono">
                    {stock.industry}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3">
                  <span>{t.detail.atrLabel} ${stock.atr}</span>
                  <span>•</span>
                  <span>{t.detail.betaShort} {stock.beta}</span>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                <div className="text-2xl font-black font-mono text-zinc-100">
                  {formatCurrency(stock.price)}
                </div>
                <div
                  className={`flex items-center gap-1 font-mono text-sm font-semibold ${
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                  <span>({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            {/* Scrollable content area */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* AI / Strategy fit summary banner */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 h-fit">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
                        {t.detail.strategyAnalysis}
                      </span>
                      {recommendation && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] h-fit">
                          {recommendation.recommendation} ({recommendation.confidence}% {t.detail.confidence})
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {getStrategyExplanation()}
                    </p>
                  </div>
                </div>

                {/* 30-Day Historical Price Chart */}
                <div className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-mono">
                        {t.detail.chartTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{t.detail.chartNote}</span>
                  </div>
                  <div className="h-64 w-full">
                    {mounted && candles.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={candles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                          <XAxis
                            dataKey="time"
                            stroke="#52525b"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis
                            domain={['auto', 'auto']}
                            stroke="#52525b"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dx={-5}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="close"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            strokeWidth={1.5}
                            fillOpacity={1}
                            fill="url(#chartGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
                        {t.detail.chartUnavailable}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical vs Fundamental split tabs */}
                <Tabs defaultValue="technicals" className="w-full">
                  <TabsList className="bg-zinc-900 border border-zinc-800 w-full justify-start p-1 rounded-lg overflow-x-auto">
                    <TabsTrigger value="technicals" className="text-xs font-mono text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                      <Activity className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
                      {t.detail.technicalsTab}
                    </TabsTrigger>
                    <TabsTrigger value="fundamentals" className="text-xs font-mono text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
                      {t.detail.fundamentalsTab}
                    </TabsTrigger>
                    <TabsTrigger value="news" className="text-xs font-mono text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                      <Newspaper className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
                      {t.detail.newsTab} ({news.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Technicals Panel */}
                  <TabsContent value="technicals" className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{t.detail.movingAverages}</span>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.sma20}</span>
                          <span className={stock.price > stock.sma20 ? 'text-emerald-500' : 'text-red-500'}>
                            ${stock.sma20.toFixed(2)} ({stock.price > stock.sma20 ? t.detail.bullish : t.detail.bearish})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.sma50}</span>
                          <span className={stock.price > stock.sma50 ? 'text-emerald-500' : 'text-red-500'}>
                            ${stock.sma50.toFixed(2)} ({stock.price > stock.sma50 ? t.detail.bullish : t.detail.bearish})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.sma200}</span>
                          <span className={stock.price > stock.sma200 ? 'text-emerald-500' : 'text-red-500'}>
                            ${stock.sma200.toFixed(2)} ({stock.price > stock.sma200 ? t.detail.bullish : t.detail.bearish})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{t.detail.momentumVolatility}</span>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.rsi14}</span>
                          <span className={stock.rsi14 > 70 ? 'text-amber-500 font-bold' : stock.rsi14 < 30 ? 'text-purple-500 font-bold' : 'text-zinc-300'}>
                            {stock.rsi14.toFixed(1)} ({stock.rsi14 > 70 ? t.detail.overbought : stock.rsi14 < 30 ? t.detail.oversold : t.detail.neutral})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.macdLine}</span>
                          <span className={stock.macdLine > stock.macdSignal ? 'text-emerald-500' : 'text-red-500'}>
                            {stock.macdLine.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.macdSignal}</span>
                          <span className="text-zinc-300">{stock.macdSignal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 font-mono text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-500" />
                        <span>{t.detail.week52Range}</span>
                        <span className="font-semibold text-zinc-200">${stock.low52Week.toFixed(2)}</span>
                        <span className="text-zinc-600">{t.detail.to}</span>
                        <span className="font-semibold text-zinc-200">${stock.high52Week.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-zinc-500" />
                        <span>{t.detail.avgVol3m}</span>
                        <span className="font-semibold text-zinc-200">{formatMarketCap(stock.avgVolume3M)} {t.detail.shares}</span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Fundamentals Panel */}
                  <TabsContent value="fundamentals" className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{t.detail.valuationRatios}</span>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.trailingPe}</span>
                          <span className="font-semibold text-zinc-200">
                            {stock.pe > 0 ? `${stock.pe.toFixed(1)}x` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.forwardPe}</span>
                          <span className="font-semibold text-zinc-200">
                            {stock.forwardPe > 0 ? `${stock.forwardPe.toFixed(1)}x` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.eps}</span>
                          <span className={stock.eps > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            ${stock.eps.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{t.detail.shareholderMetrics}</span>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.marketCapitalization}</span>
                          <span className="font-semibold text-zinc-200">
                            {formatMarketCap(stock.marketCap)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.beta}</span>
                          <span className="font-semibold text-zinc-200">{stock.beta.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">{t.detail.averageVolume3m}</span>
                          <span className="font-semibold text-zinc-200">
                            {formatNumber(stock.avgVolume3M)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* News Panel */}
                  <TabsContent value="news" className="pt-4 space-y-3">
                    {news.length > 0 ? (
                      news.map((item: any) => (
                        <div key={item.id} className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors rounded-xl p-4 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                            <span>{item.source}</span>
                            <span>{new Date(item.datetime).toLocaleDateString()}</span>
                          </div>
                          <h5 className="font-semibold text-xs text-zinc-200 leading-snug hover:text-emerald-400 cursor-pointer">
                            {item.headline}
                          </h5>
                          {item.summary && (
                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-500 text-xs font-mono bg-zinc-900/20 border border-zinc-900 rounded-xl">
                        {t.detail.noNews} {stock.ticker}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
