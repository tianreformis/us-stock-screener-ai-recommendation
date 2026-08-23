'use client';

import * as React from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { useStocks, Strategy } from '@/hooks/useStocks';
import { StrategyTabs } from '@/components/screener/StrategyTabs';
import { CustomFilterForm } from '@/components/screener/CustomFilterForm';
import { ScreenerTable } from '@/components/screener/ScreenerTable';
import { StockDetailModal } from '@/components/screener/StockDetailModal';
import { formatMarketCap } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { AppearanceProvider, useAppearance } from '@/components/screener/AppearanceContext';
import { AuthProvider, useAuth, SignOutButton } from '@/components/screener/AuthContext';
import {
  LayoutDashboard,
  Filter,
  Star,
  LineChart as ChartIcon,
  Search,
  Clock,
  TrendingUp,
  Percent,
  Settings,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Home() {
  return (
    <ToastProvider>
      <AppearanceProvider>
        <AuthProvider>
          <MainDashboard />
        </AuthProvider>
      </AppearanceProvider>
    </ToastProvider>
  );
}

function MainDashboard() {
  const { t } = useAppearance();
  const { user, isLoadingUser, openAuth } = useAuth();
  const { setIsSettingsOpen } = useAppearance();
  const [activeTab, setActiveTab] = React.useState<'screener' | 'dashboard' | 'watchlist' | 'overview'>('screener');
  const [selectedStock, setSelectedStock] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const {
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
    watchlist,
    toggleWatchlist,
    resetFilters,
  } = useStocks();

  // Handle row/card clicks
  const handleSelectStock = (ticker: string) => {
    setSelectedStock(ticker);
    setIsModalOpen(true);
  };

  // Determine current market status (Eastern Time 9:30 AM - 4:00 PM, Mon-Fri)
  const [marketIsOpen, setMarketIsOpen] = React.useState(false);

  React.useEffect(() => {
    const checkMarketHours = () => {
      // Calculate Eastern Standard Time
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const day = estTime.getDay();
      const hours = estTime.getHours();
      const minutes = estTime.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpenTime = totalMinutes >= 9.5 * 60 && totalMinutes < 16 * 60; // 9:30 AM to 4:00 PM

      setMarketIsOpen(isWeekday && isOpenTime);
    };

    checkMarketHours();
    const interval = setInterval(checkMarketHours, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute stock counts for each strategy tab
  const getStrategyCounts = React.useMemo(() => {
    const counts: Record<Strategy, number> = {
      all: stocks.length,
      scalping: 0,
      swing: 0,
      momentum: 0,
      fundamental: 0,
      custom: 0,
    };

    stocks.forEach((s) => {
      // Scalping
      if (s.volume > 1000000 && s.beta > 1.3 && s.price >= 5 && (s.changePercent > 2 || s.changePercent < -2)) {
        counts.scalping++;
      }
      // Swing
      if (s.price > s.sma50 && s.sma50 > s.sma200 && s.rsi14 >= 40 && s.rsi14 <= 60 && s.volume > 500000) {
        counts.swing++;
      }
      // Momentum
      if (s.price > s.sma20 && s.price > s.sma50 && s.price > s.sma200 && s.rsi14 > 65 && s.price >= 0.95 * s.high52Week) {
        counts.momentum++;
      }
      // Fundamental
      if (s.pe >= 0 && s.pe <= 25 && s.marketCap > 10000000000 && s.eps > 0 && s.price > s.sma200) {
        counts.fundamental++;
      }
    });

    counts.all = stocks.length;
    
    // Custom is filtered list when custom is active
    if (strategy === 'custom') {
      counts.custom = stocks.length;
    } else {
      counts.custom = stocks.length; // placeholder
    }

    return counts;
  }, [stocks, strategy]);

  // Sort and filter stocks for specialized lists
  const watchlistStocks = React.useMemo(() => {
    return stocks.filter((s) => watchlist.includes(s.ticker));
  }, [stocks, watchlist]);

  const topGainers = React.useMemo(() => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
  }, [stocks]);

  const topVolume = React.useMemo(() => {
    return [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 4);
  }, [stocks]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col">
          {/* Logo / Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-base">
              Ω
            </div>
            <div>
              <h2 className="font-black text-sm tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {t.brand.title}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono font-bold tracking-widest uppercase">
                {t.brand.subtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-zinc-900 text-zinc-50 font-bold border-l-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t.nav.dashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'screener'
                  ? 'bg-zinc-900 text-zinc-50 font-bold border-l-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>{t.nav.screener}</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'watchlist'
                  ? 'bg-zinc-900 text-zinc-50 font-bold border-l-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>{t.nav.watchlist}</span>
              {watchlist.length > 0 && (
                <span className="ml-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                  {watchlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 text-zinc-50 font-bold border-l-2 border-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
              }`}
            >
              <ChartIcon className="h-4 w-4" />
              <span>{t.nav.overview}</span>
            </button>
          </nav>
        </div>

        {/* User / Authentication Footer */}
        <div className="p-4 border-t border-zinc-900 text-xs text-zinc-500 font-mono space-y-3">
          {isLoadingUser ? (
            <div className="h-9 rounded-lg bg-zinc-900/60 animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-black text-zinc-950 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{t.auth.signedInAs} {user.email}</p>
                </div>
              </div>
              <SignOutButton />
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={openAuth}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t.auth.signIn}</span>
              </button>
              <button
                onClick={openAuth}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{t.auth.signUp}</span>
              </button>
            </div>
          )}
          <div className="pt-1 space-y-0.5">
            <p className="text-[10px]">{t.nav.dbEngine}</p>
            <p className="text-[10px]">{t.nav.orm}</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER AREA */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
          
          {/* Quick Search bar */}
          <div className="flex items-center gap-3 w-1/3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder={t.header.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-900 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:border-zinc-800 placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Center Title for Small Screens */}
          <h1 className="md:hidden font-black text-sm tracking-wide text-zinc-100 flex items-center gap-2">
            <span className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xs">Ω</span>
            US SCREENER
          </h1>

          {/* Right Header Status Bar */}
          <div className="flex items-center gap-4">
            
            {/* Market Status Indicator */}
            <div className="flex items-center gap-2.5 bg-zinc-900/40 border border-zinc-900 px-3 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <div className="flex items-center gap-1.5">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    marketIsOpen ? 'bg-emerald-400' : 'bg-red-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    marketIsOpen ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  {marketIsOpen ? t.header.marketOpen : t.header.marketClosed}
                </span>
              </div>
            </div>

            {/* Appearance Controls */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={t.header.appearanceSettings}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* VIEWPORTS */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-6 space-y-6">
          
          {/* MOBILE VIEW NAVIGATION COMPACT BAR */}
          <div className="flex md:hidden gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-900 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {t.nav.mobileDashboard}
            </button>
            <button
              onClick={() => setActiveTab('screener')}
              className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'screener' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {t.nav.mobileScreener}
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'watchlist' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {t.nav.mobileWatchlist} ({watchlist.length})
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 text-center py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
              }`}
            >
              {t.nav.mobileOverview}
            </button>
          </div>

          {/* VIEWPORT 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in-30">
              
              {/* Introduction Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-zinc-800 opacity-20 pointer-events-none text-9xl font-black font-mono select-none">
                  {t.dashboardView.indexWatermark}
                </div>
                <div className="max-w-2xl space-y-2">
                  <h2 className="text-xl font-bold text-zinc-50">{t.dashboardView.title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {t.dashboardView.welcome}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>{getStrategyCounts.momentum} {t.dashboardView.breakoutMatches}</span>
                    </div>
                    <span className="text-zinc-800">|</span>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>{getStrategyCounts.swing} {t.dashboardView.pullbackMatches}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Quick Stats / Top Gainers / Most Active */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Gainers Card */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300 font-mono">{t.dashboardView.topGainers}</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{t.dashboardView.topMoves}</span>
                  </div>
                  <div className="space-y-2">
                    {topGainers.map((s) => (
                      <div
                        key={s.ticker}
                        onClick={() => handleSelectStock(s.ticker)}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/10 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold font-mono text-zinc-100 text-xs w-12">{s.ticker}</span>
                          <span className="text-[10px] text-zinc-400 max-w-[120px] truncate">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-xs">
                          <span className="font-semibold text-zinc-300">${s.price.toFixed(2)}</span>
                          <span className="text-emerald-500 font-bold">+{s.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Volume / Most Active Card */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-500" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300 font-mono">{t.dashboardView.mostActive}</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{t.dashboardView.tradingActivity}</span>
                  </div>
                  <div className="space-y-2">
                    {topVolume.map((s) => (
                      <div
                        key={s.ticker}
                        onClick={() => handleSelectStock(s.ticker)}
                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/10 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold font-mono text-zinc-100 text-xs w-12">{s.ticker}</span>
                          <span className="text-[10px] text-zinc-400 max-w-[120px] truncate">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-xs">
                          <span className="font-semibold text-zinc-500">{formatMarketCap(s.volume)} {t.dashboardView.sharesSuffix}</span>
                          <span className={`font-bold ${s.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEWPORT 2: STRATEGY SCREENER */}
          {activeTab === 'screener' && (
            <div className="space-y-6 animate-in fade-in-30">
              
              {/* Quantitative strategy description header */}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-zinc-50">{t.screenerPage.title}</h2>
                <p className="text-xs text-zinc-400">
                  {t.screenerPage.subtitle}
                </p>
              </div>

              {/* Strategy Cards Tabs */}
              <StrategyTabs
                activeStrategy={strategy}
                onStrategyChange={setStrategy}
                stocksCount={getStrategyCounts}
              />

              {/* Custom Screener Advanced Controls */}
              {strategy === 'custom' && (
                <CustomFilterForm
                  filters={customFilters}
                  onChange={setCustomFilters}
                  onReset={resetFilters}
                />
              )}

              {/* Main Screener Table */}
              <ScreenerTable
                stocks={stocks}
                loading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(field) => {
                  if (sortBy === field) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(field);
                    setSortOrder('desc');
                  }
                }}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlist}
                onSelectStock={handleSelectStock}
              />
            </div>
          )}

          {/* VIEWPORT 3: WATCHLIST VIEW */}
          {activeTab === 'watchlist' && (
            <div className="space-y-6 animate-in fade-in-30">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-zinc-50">{t.watchlistView.title}</h2>
                <p className="text-xs text-zinc-400">
                  {t.watchlistView.subtitle}
                </p>
              </div>

              {watchlistStocks.length > 0 ? (
                <ScreenerTable
                  stocks={watchlistStocks}
                  loading={loading}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={(field) => {
                    if (sortBy === field) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(field);
                      setSortOrder('desc');
                    }
                  }}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                  onSelectStock={handleSelectStock}
                />
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-16 text-center space-y-4">
                  <Star className="h-12 w-12 text-zinc-700 mx-auto fill-transparent animate-pulse" />
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-sm font-bold text-zinc-300">{t.watchlistView.emptyTitle}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {t.watchlistView.emptyText}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('screener')}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    {t.watchlistView.openScreener}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEWPORT 4: MARKET OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in-30">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-zinc-50">{t.overviewView.title}</h2>
                <p className="text-xs text-zinc-400">
                  {t.overviewView.subtitle}
                </p>
              </div>

              {/* Major Indices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { symbol: 'SPY', name: 'S&P 500 Index', price: 520.40, change: 4.12, percent: 0.80, trend: [512, 514, 516, 515, 518, 520.4] },
                  { symbol: 'QQQ', name: 'Nasdaq 100 Index', price: 442.80, change: 6.85, percent: 1.57, trend: [430, 432, 435, 438, 440, 442.8] },
                  { symbol: 'DIA', name: 'Dow Jones 30', price: 391.20, change: -1.15, percent: -0.29, trend: [394, 393, 395, 392, 393, 391.2] },
                  { symbol: 'IWM', name: `Russell 2000 (${t.overviewView.smallCaps})`, price: 212.50, change: 2.15, percent: 1.02, trend: [208, 209, 210, 211, 210, 212.5] },
                ].map((idx) => {
                  const positive = idx.percent >= 0;
                  // Map trend array into charting object format
                  const dataTrend = idx.trend.map((val, index) => ({ id: index, val }));

                  return (
                    <div key={idx.symbol} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between h-36">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-sm text-zinc-100 font-mono">{idx.symbol}</span>
                          <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{idx.name}</p>
                        </div>
                        <div className={`text-right font-mono text-xs font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span>{positive ? '+' : ''}{idx.percent.toFixed(2)}%</span>
                        </div>
                      </div>
                      
                      {/* Mini Sparkline Chart */}
                      <div className="h-10 w-full opacity-60">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataTrend}>
                              <Line
                                type="monotone"
                                dataKey="val"
                                stroke={positive ? '#10b981' : '#ef4444'}
                                strokeWidth={1.5}
                                dot={false}
                              />
                              <YAxis domain={['auto', 'auto']} hide={true} />
                              <XAxis hide={true} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="flex justify-between items-end font-mono text-xs pt-2">
                        <span className="font-bold text-zinc-300">${idx.price.toFixed(2)}</span>
                        <span className={`text-[10px] ${positive ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                          {idx.change > 0 ? '+' : ''}{idx.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sector Performance Map */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-300 font-mono">{t.overviewView.sectorRankings}</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">{t.overviewView.heatIndex}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {[
                    { name: 'Technology', performance: 2.15, key: 'XLK' },
                    { name: 'Healthcare', performance: 0.85, key: 'XLV' },
                    { name: 'Consumer Cyclical', performance: 1.25, key: 'XLY' },
                    { name: 'Consumer Defensive', performance: -0.25, key: 'XLP' },
                    { name: 'Financial', performance: 0.63, key: 'XLF' },
                    { name: 'Energy', performance: 1.74, key: 'XLE' },
                    { name: 'Industrials', performance: -0.85, key: 'XLI' },
                    { name: 'Utilities', performance: -1.20, key: 'XLU' },
                    { name: 'Real Estate', performance: -0.55, key: 'XLRE' },
                  ].map((sec) => {
                    const pos = sec.performance >= 0;
                    return (
                      <div
                        key={sec.name}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          pos
                            ? 'bg-emerald-950/20 border-emerald-950 hover:bg-emerald-950/30 text-emerald-400'
                            : 'bg-red-950/20 border-red-950 hover:bg-red-950/30 text-red-400'
                        }`}
                      >
                        <span className="text-[10px] font-bold font-mono text-zinc-500">{sec.key}</span>
                        <h4 className="text-[11px] font-bold text-zinc-200 mt-1 truncate">{sec.name}</h4>
                        <p className="text-xs font-mono font-bold mt-1.5">
                          {pos ? '+' : ''}{sec.performance.toFixed(2)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. DETAILED ANALYSIS MODAL OVERLAY */}
      <StockDetailModal
        ticker={selectedStock}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStock(null);
        }}
        activeStrategy={strategy}
      />
    </div>
  );
}
