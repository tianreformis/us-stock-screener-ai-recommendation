'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateTime } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import type { FinnhubNews } from '@/types';

interface NewsFeedProps {
  news: Array<{
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
  }>;
  symbol?: string;
  loading?: boolean;
}

export function NewsFeed({ news, symbol, loading }: NewsFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{symbol ? `${symbol} News` : 'Market News'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{symbol ? `${symbol} News` : 'Market News'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No news available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{symbol ? `${symbol} News` : 'Market News'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-2">{article.headline}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(new Date(article.datetime * 1000))}</span>
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}