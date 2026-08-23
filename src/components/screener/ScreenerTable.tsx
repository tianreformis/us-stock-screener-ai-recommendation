'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAppearance } from '@/components/screener/AppearanceContext';
import { formatCurrency, formatMarketCap, formatNumber } from '@/lib/utils';
import { tf } from '@/lib/translations';
import { ChevronDown, ChevronUp, Star, ArrowUpDown } from 'lucide-react';
import { Strategy } from '@/hooks/useStocks';

interface ScreenerTableProps {
  stocks: any[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  watchlist: string[];
  onToggleWatchlist: (ticker: string) => void;
  onSelectStock: (ticker: string) => void;
}

export function ScreenerTable({
  stocks,
  loading,
  sortBy,
  sortOrder,
  onSort,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}: ScreenerTableProps) {
  const { toast } = useToast();
  const { t } = useAppearance();

  const handleWatchlistClick = (e: React.MouseEvent, ticker: string, name: string) => {
    e.stopPropagation(); // Avoid triggering row click modal
    const isNowWatched = !watchlist.includes(ticker);
    onToggleWatchlist(ticker);

    toast({
      title: isNowWatched ? t.toasts.watchAdded : t.toasts.watchRemoved,
      description: tf(t.toasts.watchDesc, {
        ticker,
        name,
        action: isNowWatched ? t.toasts.watchActionAdd : t.toasts.watchActionRemove,
      }),
      variant: 'success',
    });
  };

  // Dynamically determine all strategy matches for a stock to show colorful badges
  const getStrategyMatches = (
    s: any
  ): { id: Strategy; label: string; variant: 'success' | 'info' | 'purple' | 'warning' }[] => {
    const matches = [];

    // Scalping
    if (s.volume > 1000000 && s.beta > 1.3 && s.price >= 5 && (s.changePercent > 2 || s.changePercent < -2)) {
      matches.push({ id: 'scalping' as Strategy, label: t.table.badgeScalping, variant: 'warning' as const });
    }
    // Swing
    if (s.price > s.sma50 && s.sma50 > s.sma200 && s.rsi14 >= 40 && s.rsi14 <= 60 && s.volume > 500000) {
      matches.push({ id: 'swing' as Strategy, label: t.table.badgeSwing, variant: 'info' as const });
    }
    // Momentum
    if (s.price > s.sma20 && s.price > s.sma50 && s.price > s.sma200 && s.rsi14 > 65 && s.price >= 0.95 * s.high52Week) {
      matches.push({ id: 'momentum' as Strategy, label: t.table.badgeMomentum, variant: 'success' as const });
    }
    // Fundamental
    if (s.pe >= 0 && s.pe <= 25 && s.marketCap > 10000000000 && s.eps > 0 && s.price > s.sma200) {
      matches.push({ id: 'fundamental' as Strategy, label: t.table.badgeFundamental, variant: 'purple' as const });
    }

    return matches;
  };

  const headers = [
    { key: 'watchlist', label: '', sortable: false },
    { key: 'ticker', label: t.table.ticker, sortable: true },
    { key: 'name', label: t.table.company, sortable: true },
    { key: 'sector', label: t.table.sector, sortable: true },
    { key: 'price', label: t.table.price, sortable: true },
    { key: 'changePercent', label: t.table.changePercent, sortable: true },
    { key: 'volume', label: t.table.volume, sortable: true },
    { key: 'marketCap', label: t.table.marketCap, sortable: true },
    { key: 'pe', label: t.table.pe, sortable: true },
    { key: 'rsi14', label: t.table.rsi, sortable: true },
    { key: 'strategies', label: t.table.badges, sortable: false },
  ];

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 opacity-30 text-zinc-400 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-emerald-500 font-bold" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-emerald-500 font-bold" />
    );
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/60 border-b border-zinc-900">
            <TableRow className="border-b border-zinc-900 hover:bg-transparent">
              {headers.map((h) => (
                <TableHead
                  key={h.key}
                  className={`${
                    h.sortable ? 'cursor-pointer hover:text-zinc-100 group select-none' : ''
                  } text-zinc-400 h-11 text-[11px] font-bold uppercase tracking-wider py-3 px-4 font-mono`}
                  onClick={() => h.sortable && onSort(h.key)}
                >
                  <div className="flex items-center gap-1.5 justify-start">
                    <span>{h.label}</span>
                    {h.sortable && renderSortIndicator(h.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-b border-zinc-900 hover:bg-transparent">
                <TableCell colSpan={headers.length} className="h-56 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    <span className="text-zinc-500 font-mono text-xs">{t.table.loading}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : stocks.length === 0 ? (
              <TableRow className="border-b border-zinc-900 hover:bg-transparent">
                <TableCell colSpan={headers.length} className="h-56 text-center">
                  <div className="text-zinc-500 font-mono text-xs flex flex-col gap-2 items-center justify-center">
                    <span>{t.table.noResults}</span>
                    <span className="text-[10px] text-zinc-600">{t.table.noResultsHint}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => {
                const matches = getStrategyMatches(stock);
                const isPositive = stock.changePercent >= 0;
                const isWatched = watchlist.includes(stock.ticker);

                return (
                  <TableRow
                    key={stock.ticker}
                    onClick={() => onSelectStock(stock.ticker)}
                    className="border-b border-zinc-900 hover:bg-zinc-900/30 cursor-pointer transition-all duration-150"
                  >
                    {/* Watchlist Toggle */}
                    <TableCell className="py-2.5 px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleWatchlistClick(e, stock.ticker, stock.name)}
                        className={`h-8 w-8 rounded-full ${
                          isWatched ? 'text-amber-400 hover:text-amber-500' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </Button>
                    </TableCell>

                    {/* Ticker Symbol */}
                    <TableCell className="py-2.5 px-4 font-bold font-mono text-zinc-100 text-sm">
                      {stock.ticker}
                    </TableCell>

                    {/* Company Name */}
                    <TableCell className="py-2.5 px-4 font-medium text-zinc-300 text-xs max-w-[160px] truncate">
                      {stock.name}
                    </TableCell>

                    {/* Sector */}
                    <TableCell className="py-2.5 px-4 text-zinc-400 text-xs">
                      {stock.sector}
                    </TableCell>

                    {/* Current Price */}
                    <TableCell className="py-2.5 px-4 font-semibold font-mono text-zinc-200 text-xs">
                      {formatCurrency(stock.price)}
                    </TableCell>

                    {/* Percentage Change */}
                    <TableCell
                      className={`py-2.5 px-4 font-semibold font-mono text-xs ${
                        isPositive ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </TableCell>

                    {/* Volume */}
                    <TableCell className="py-2.5 px-4 text-zinc-300 font-mono text-xs">
                      {formatNumber(stock.volume)}
                    </TableCell>

                    {/* Market Cap */}
                    <TableCell className="py-2.5 px-4 text-zinc-300 font-mono text-xs">
                      {formatMarketCap(stock.marketCap)}
                    </TableCell>

                    {/* P/E Ratio */}
                    <TableCell className="py-2.5 px-4 text-zinc-300 font-mono text-xs">
                      {stock.pe > 0 ? `${stock.pe.toFixed(1)}x` : 'N/A'}
                    </TableCell>

                    {/* RSI (14) */}
                    <TableCell
                      className={`py-2.5 px-4 font-mono text-xs font-semibold ${
                        stock.rsi14 > 70
                          ? 'text-amber-500'
                          : stock.rsi14 < 30
                          ? 'text-purple-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {stock.rsi14.toFixed(1)}
                    </TableCell>

                    {/* Strategy Badges */}
                    <TableCell className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {matches.length > 0 ? (
                          matches.map((m) => (
                            <Badge
                              key={m.id}
                              variant={m.variant}
                              className="text-[9px] px-1.5 py-0.5 tracking-wide font-bold"
                            >
                              {m.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono italic">{t.table.noSetup}</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
