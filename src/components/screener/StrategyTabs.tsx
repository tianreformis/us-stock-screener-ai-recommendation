'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Rocket, TrendingUp, Zap, Gem, Sliders, Globe } from 'lucide-react';
import { Strategy } from '@/hooks/useStocks';
import { useAppearance } from '@/components/screener/AppearanceContext';

interface StrategyTabsProps {
  activeStrategy: Strategy;
  onStrategyChange: (strategy: Strategy) => void;
  stocksCount: Record<Strategy, number>;
}

export function StrategyTabs({ activeStrategy, onStrategyChange, stocksCount }: StrategyTabsProps) {
  const { t } = useAppearance();

  const strategies = [
    {
      id: 'all' as Strategy,
      name: t.strategies.all.name,
      description: t.strategies.all.description,
      icon: Globe,
      badgeColor: 'default',
      accentColor: 'border-zinc-700 bg-zinc-900 text-zinc-100',
    },
    {
      id: 'scalping' as Strategy,
      name: t.strategies.scalping.name,
      description: t.strategies.scalping.description,
      icon: Rocket,
      badgeColor: 'warning' as const,
      accentColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
    {
      id: 'swing' as Strategy,
      name: t.strategies.swing.name,
      description: t.strategies.swing.description,
      icon: TrendingUp,
      badgeColor: 'info' as const,
      accentColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
    {
      id: 'momentum' as Strategy,
      name: t.strategies.momentum.name,
      description: t.strategies.momentum.description,
      icon: Zap,
      badgeColor: 'success' as const,
      accentColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'fundamental' as Strategy,
      name: t.strategies.fundamental.name,
      description: t.strategies.fundamental.description,
      icon: Gem,
      badgeColor: 'purple' as const,
      accentColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    },
    {
      id: 'custom' as Strategy,
      name: t.strategies.custom.name,
      description: t.strategies.custom.description,
      icon: Sliders,
      badgeColor: 'outline' as const,
      accentColor: 'border-zinc-700 bg-zinc-900 text-zinc-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {strategies.map((strat) => {
        const Icon = strat.icon;
        const isActive = activeStrategy === strat.id;
        const count = stocksCount[strat.id] ?? 0;

        return (
          <button
            key={strat.id}
            onClick={() => onStrategyChange(strat.id)}
            className={cn(
              'group relative flex flex-col text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden',
              isActive
                ? `shadow-lg border-zinc-700 bg-zinc-900 ring-1 ring-zinc-800`
                : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700/80 hover:bg-zinc-900/20'
            )}
          >
            {/* Top Row with Icon and Count */}
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={cn(
                  'p-2 rounded-lg border transition-all duration-300',
                  isActive ? strat.accentColor : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 group-hover:text-zinc-200'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <Badge
                variant={(strat.badgeColor === 'outline' ? 'outline' : strat.badgeColor) as any}
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5',
                  strat.badgeColor === 'outline' && 'text-zinc-400 border-zinc-800 bg-zinc-900/20'
                )}
              >
                {count} {count === 1 ? t.strategies.stockCount : t.strategies.stocksCount}
              </Badge>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h4
                className={cn(
                  'font-semibold text-xs transition-colors',
                  isActive ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-100'
                )}
              >
                {strat.name}
              </h4>
              <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                {strat.description}
              </p>
            </div>

            {/* Underline accent on active tab */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
