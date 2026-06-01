'use client';

import { useState, useEffect, useCallback } from 'react';

export type Strategy = 'all' | 'scalping' | 'swing' | 'momentum' | 'fundamental' | 'custom';

export interface CustomFilters {
  minPrice: number;
  maxPrice: number;
  minMarketCap: number; // in Billions
  maxMarketCap: number; // in Billions
  minPE: number;
  maxPE: number;
  minRsi: number;
  maxRsi: number;
  minVolume: number; // in Millions
  maxVolume: number; // in Millions
  sector: string;
}

export const initialFilters: CustomFilters = {
  minPrice: 0,
  maxPrice: 1000,
  minMarketCap: 0,
  maxMarketCap: 3500, // 3.5 Trillion
  minPE: 0,
  maxPE: 200,
  minRsi: 0,
  maxRsi: 100,
  minVolume: 0,
  maxVolume: 50, // 50 Million
  sector: 'all',
};

export function useStocks() {
  const [strategy, setStrategy] = useState<Strategy>('all');
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [customFilters, setCustomFilters] = useState<CustomFilters>(initialFilters);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist state (stored in localStorage)
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('screener_watchlist');
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse watchlist', e);
        }
      }
    }
  }, []);

  // Save watchlist on change
  const toggleWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker];
      localStorage.setItem('screener_watchlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('strategy', strategy);
      if (search) params.set('search', search);
      
      // If we are NOT in custom mode, we can still use the sector dropdown in the main header
      if (strategy !== 'custom' && sector !== 'all') {
        params.set('sector', sector);
      }

      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      // If custom strategy is active, serialize custom filters to query parameters
      if (strategy === 'custom') {
        params.set('minPrice', customFilters.minPrice.toString());
        params.set('maxPrice', customFilters.maxPrice.toString());
        params.set('minMarketCap', (customFilters.minMarketCap * 1e9).toString());
        params.set('maxMarketCap', (customFilters.maxMarketCap * 1e9).toString());
        params.set('minPE', customFilters.minPE.toString());
        params.set('maxPE', customFilters.maxPE.toString());
        params.set('minRsi', customFilters.minRsi.toString());
        params.set('maxRsi', customFilters.maxRsi.toString());
        params.set('minVolume', (customFilters.minVolume * 1e6).toString());
        params.set('maxVolume', (customFilters.maxVolume * 1e6).toString());
        if (customFilters.sector !== 'all') {
          params.set('sector', customFilters.sector);
        }
      }

      const res = await fetch(`/api/stocks?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch stocks');
      }
      const data = await res.json();
      setStocks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching stocks');
    } finally {
      setLoading(false);
    }
  }, [strategy, search, sector, sortBy, sortOrder, customFilters]);

  // Fetch stocks on changes
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const resetFilters = useCallback(() => {
    setCustomFilters(initialFilters);
    setSector('all');
    setSearch('');
  }, []);

  return {
    strategy,
    setStrategy,
    search,
    setSearch,
    sector,
    setSector,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    customFilters,
    setCustomFilters,
    stocks,
    loading,
    error,
    watchlist,
    toggleWatchlist,
    refresh: fetchStocks,
    resetFilters,
  };
}
