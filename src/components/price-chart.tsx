'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PriceChart } from '@/components/price-chart-recharts';
import type { ChartData } from '@/types';

interface PriceChartToggleProps {
  data: ChartData[];
  symbol: string;
  height?: number;
}

export function PriceChartToggle({ data, symbol, height = 400 }: PriceChartToggleProps) {
  const [period, setPeriod] = useState('1Y');

  const filterDataByPeriod = (period: string) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1D':
        startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
      default:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return data.filter((d) => new Date(d.time) >= startDate);
  };

  const filteredData = filterDataByPeriod(period);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <div className="flex gap-1">
          {['1D', '1W', '1M', '3M', '6M', '1Y'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <PriceChart data={filteredData} symbol={symbol} height={height} />
    </div>
  );
}