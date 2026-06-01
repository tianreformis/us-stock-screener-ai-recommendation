'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';
import { SECTORS } from '@/lib/constants';
import { CustomFilters } from '@/hooks/useStocks';

interface CustomFilterFormProps {
  filters: CustomFilters;
  onChange: (filters: CustomFilters) => void;
  onReset: () => void;
}

export function CustomFilterForm({ filters, onChange, onReset }: CustomFilterFormProps) {
  const updateFilter = (key: keyof CustomFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
          <h3 className="font-semibold text-zinc-100 text-sm">Advanced Filter Controls</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Price Slider & Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-zinc-400 font-medium">Max Price ($)</Label>
            <span className="font-mono text-emerald-500 font-semibold">${filters.maxPrice}</span>
          </div>
          <Slider
            min={0}
            max={1000}
            step={5}
            value={[filters.maxPrice]}
            onValueChange={(val) => updateFilter('maxPrice', val[0])}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Min Price</Label>
              <Input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || 0)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Max Price</Label>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || 1000)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Market Cap Slider & Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-zinc-400 font-medium">Max Market Cap ($B)</Label>
            <span className="font-mono text-emerald-500 font-semibold">${filters.maxMarketCap}B</span>
          </div>
          <Slider
            min={0}
            max={3500}
            step={50}
            value={[filters.maxMarketCap]}
            onValueChange={(val) => updateFilter('maxMarketCap', val[0])}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Min Cap ($B)</Label>
              <Input
                type="number"
                value={filters.minMarketCap}
                onChange={(e) => updateFilter('minMarketCap', parseFloat(e.target.value) || 0)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Max Cap ($B)</Label>
              <Input
                type="number"
                value={filters.maxMarketCap}
                onChange={(e) => updateFilter('maxMarketCap', parseFloat(e.target.value) || 3500)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* RSI Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-zinc-400 font-medium">RSI Range (14)</Label>
            <span className="font-mono text-emerald-500 font-semibold">
              {filters.minRsi} - {filters.maxRsi}
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[filters.maxRsi]}
            onValueChange={(val) => updateFilter('maxRsi', val[0])}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Min RSI</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={filters.minRsi}
                onChange={(e) => updateFilter('minRsi', parseFloat(e.target.value) || 0)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Max RSI</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={filters.maxRsi}
                onChange={(e) => updateFilter('maxRsi', parseFloat(e.target.value) || 100)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* P/E Ratio Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-zinc-400 font-medium">Max P/E Ratio</Label>
            <span className="font-mono text-emerald-500 font-semibold">{filters.maxPE}x</span>
          </div>
          <Slider
            min={0}
            max={200}
            step={2}
            value={[filters.maxPE]}
            onValueChange={(val) => updateFilter('maxPE', val[0])}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Min P/E</Label>
              <Input
                type="number"
                value={filters.minPE}
                onChange={(e) => updateFilter('minPE', parseFloat(e.target.value) || 0)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Max P/E</Label>
              <Input
                type="number"
                value={filters.maxPE}
                onChange={(e) => updateFilter('maxPE', parseFloat(e.target.value) || 200)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <Label className="text-zinc-400 font-medium">Max Volume ($M)</Label>
            <span className="font-mono text-emerald-500 font-semibold">{filters.maxVolume}M</span>
          </div>
          <Slider
            min={0}
            max={50}
            step={1}
            value={[filters.maxVolume]}
            onValueChange={(val) => updateFilter('maxVolume', val[0])}
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Min Vol (M)</Label>
              <Input
                type="number"
                value={filters.minVolume}
                onChange={(e) => updateFilter('minVolume', parseFloat(e.target.value) || 0)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-[10px] text-zinc-500">Max Vol (M)</Label>
              <Input
                type="number"
                value={filters.maxVolume}
                onChange={(e) => updateFilter('maxVolume', parseFloat(e.target.value) || 50)}
                className="h-8 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Sector Select */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs font-medium">Sector Selection</Label>
          <div className="pt-1.5">
            <Select
              value={filters.sector}
              onValueChange={(val) => updateFilter('sector', val)}
            >
              <SelectTrigger className="h-9 bg-zinc-950 border-zinc-800 text-zinc-300 text-xs">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Sectors</SelectItem>
                {SECTORS.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-3">
            <Filter className="h-3 w-3 text-emerald-500" />
            <span>Filters are auto-applied on adjustment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
