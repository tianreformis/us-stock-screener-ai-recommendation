'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ChartData } from '@/types';

interface PriceChartProps {
  data: ChartData[];
  symbol: string;
  height?: number;
}

export function PriceChart({ data, symbol, height = 400 }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => ({
      date: d.time,
      price: Number(d.close),
      index: i,
    }));
  }, [data]);

  const priceChange = chartData.length > 1 ? chartData[chartData.length - 1].price - chartData[0].price : 0;
  const isPositive = priceChange >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center bg-muted/20 rounded-lg" style={{ height }}>
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
          interval={Math.floor(chartData.length / 8)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
          domain={['dataMin - 5', 'dataMax + 5']}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: any) => [`$${(value ?? 0).toFixed(2)}`, 'Price']}
          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}