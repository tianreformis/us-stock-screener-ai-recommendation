'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatMarketCap, formatCurrency } from '@/lib/utils';

interface FundamentalPanelProps {
  fundamentals: any | null;
  loading?: boolean;
}

export function FundamentalPanel({ fundamentals, loading }: FundamentalPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundamental Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fundamentals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundamental Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { label: 'P/E Ratio', value: fundamentals.peRatio ? formatNumber(fundamentals.peRatio, 1) : 'N/A' },
    { label: 'EPS', value: fundamentals.eps ? formatCurrency(fundamentals.eps) : 'N/A' },
    { label: 'Revenue', value: fundamentals.revenue ? formatMarketCap(fundamentals.revenue) : 'N/A' },
    { label: 'Gross Profit', value: fundamentals.grossProfit ? formatMarketCap(fundamentals.grossProfit) : 'N/A' },
    { label: 'Net Income', value: fundamentals.netIncome ? formatMarketCap(fundamentals.netIncome) : 'N/A' },
    { label: 'EBITDA', value: fundamentals.ebitda ? formatMarketCap(fundamentals.ebitda) : 'N/A' },
    { label: 'Market Cap', value: fundamentals.marketCapitalization ? formatMarketCap(fundamentals.marketCapitalization) : 'N/A' },
    { label: 'Revenue Growth', value: fundamentals.revenueGrowth ? `${formatNumber(fundamentals.revenueGrowth, 1)}%` : 'N/A' },
    { label: 'Profit Margin', value: fundamentals.profitMargin ? `${formatNumber(fundamentals.profitMargin * 100, 1)}%` : 'N/A' },
    { label: 'ROE', value: fundamentals.roe ? `${formatNumber(fundamentals.roe, 1)}%` : 'N/A' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fundamental Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}