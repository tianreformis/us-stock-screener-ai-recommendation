'use client';

import { Suspense } from 'react';
import { StockTableInner } from './stock-table-inner';

export function StockTable() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading stocks...</div>}>
      <StockTableInner />
    </Suspense>
  );
}