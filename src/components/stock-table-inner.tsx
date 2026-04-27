'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatCurrency, formatMarketCap, formatPercent, formatNumber } from '@/lib/utils';
import { SECTORS } from '@/lib/constants';
import type { Stock, PaginatedResponse } from '@/types';

export function StockTableInner() {
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [sector, setSector] = useState(searchParams.get('sector') || 'all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '20');
        if (search) params.set('search', search);
        if (sector && sector !== 'all') params.set('sector', sector);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);

        const res = await fetch(`/api/stocks?${params}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search, sector, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const columns = [
    { key: 'symbol', label: 'Symbol', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'sector', label: 'Sector', sortable: false },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'change', label: 'Change', sortable: true },
    { key: 'marketCap', label: 'Market Cap', sortable: true },
    { key: 'pe', label: 'P/E', sortable: true },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle>US Stock Screener</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-[200px]"
              />
            </div>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="relative w-full overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'h-12 px-3 text-left align-middle font-medium text-muted-foreground text-sm',
                        col.sortable && 'cursor-pointer hover:text-foreground'
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortBy === col.key && (
                          sortOrder === 'asc'
                            ? <ChevronUp className="h-3 w-3" />
                            : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="h-24 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="h-24 text-center text-muted-foreground">
                      No stocks found
                    </td>
                  </tr>
                ) : (
                  data?.data.map((stock: any) => (
                    <tr
                      key={stock.symbol}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <Link
                          href={`/stock/${stock.symbol}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="p-3">{stock.name}</td>
                      <td className="p-3 text-muted-foreground">{stock.sector || '-'}</td>
                      <td className="p-3 font-medium">
                        {stock.price ? formatCurrency(stock.price) : '-'}
                      </td>
                      <td className={cn(
                        'p-3',
                        stock.change && stock.change > 0 ? 'text-green-500' :
                        stock.change && stock.change < 0 ? 'text-red-500' : 'text-muted-foreground'
                      )}>
                        {stock.change !== undefined ? formatPercent(stock.changePercent) : '-'}
                      </td>
                      <td className="p-3">
                        {stock.marketCap ? formatMarketCap(stock.marketCap) : '-'}
                      </td>
                      <td className="p-3">
                        {stock.pe ? formatNumber(stock.pe, 1) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} stocks
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}