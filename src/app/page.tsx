import { StockTable } from '@/components/stock-table';

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">US Stock Screener</h1>
        <p className="text-muted-foreground mt-2">
          Screen and analyze US stocks with AI-powered recommendations
        </p>
      </div>
      <StockTable />
    </div>
  );
}