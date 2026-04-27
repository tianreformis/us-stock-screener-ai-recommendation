'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import type { TechnicalIndicators } from '@/types';

interface TechnicalPanelProps {
  indicators: TechnicalIndicators | null;
  loading?: boolean;
}

export function TechnicalPanel({ indicators, loading }: TechnicalPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!indicators) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return 'text-red-500';
    if (rsi <= 30) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi >= 70) return 'Overbought';
    if (rsi <= 30) return 'Oversold';
    return 'Neutral';
  };

  const getMACDColor = (macd: number) => {
    if (macd > 0) return 'text-green-500';
    if (macd < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const indicatorItems = [
    {
      label: 'RSI (14)',
      value: formatNumber(indicators.rsi, 1),
      subValue: getRSILabel(indicators.rsi),
      color: getRSIColor(indicators.rsi),
    },
    {
      label: 'EMA 20',
      value: formatNumber(indicators.ema20, 2),
      color: 'text-foreground',
    },
    {
      label: 'EMA 50',
      value: formatNumber(indicators.ema50, 2),
      color: 'text-foreground',
    },
    {
      label: 'EMA 200',
      value: formatNumber(indicators.ema200, 2),
      color: 'text-foreground',
    },
    {
      label: 'MACD',
      value: formatNumber(indicators.macd.MACD, 2),
      subValue: `Signal: ${formatNumber(indicators.macd.signal, 2)}`,
      color: getMACDColor(indicators.macd.MACD),
    },
    {
      label: 'MACD Histogram',
      value: formatNumber(indicators.macd.histogram, 2),
      color: getMACDColor(indicators.macd.histogram),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {indicatorItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <div className="text-right">
                <span className={cn('font-medium', item.color)}>{item.value}</span>
                {item.subValue && (
                  <p className="text-xs text-muted-foreground">{item.subValue}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}