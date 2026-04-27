'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import type { Recommendation } from '@/types';

interface AIRecommendationProps {
  symbol: string;
}

export function AIRecommendation({ symbol }: AIRecommendationProps) {
  const [recommendation, setRecommendation] = useState<Recommendation & { source: 'cache' | 'fresh' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/recommendation`);
        if (!res.ok) {
          throw new Error('Failed to fetch recommendation');
        }
        const data = await res.json();
        setRecommendation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [symbol]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'bg-green-500';
      case 'SELL':
        return 'bg-red-500';
      case 'HOLD':
      default:
        return 'bg-yellow-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-500';
    if (confidence >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || 'No recommendation available'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setRecommendation(null)}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>AI Recommendation</CardTitle>
          <div className="flex items-center gap-2">
            {recommendation.source === 'cache' && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Cached
              </span>
            )}
            {recommendation.source === 'fresh' && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                Fresh
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-3 py-1 rounded-md text-white font-semibold text-sm',
                  getRecommendationColor(recommendation.recommendation)
                )}
              >
                {recommendation.recommendation}
              </span>
              <span className="text-muted-foreground text-sm">Confidence</span>
            </div>
            <span className={cn('text-2xl font-bold', getConfidenceColor(recommendation.confidence))}>
              {recommendation.confidence}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Technical Analysis</h4>
              <p className="text-sm">{recommendation.technical}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Fundamental Analysis</h4>
              <p className="text-sm">{recommendation.fundamental}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Sentiment Analysis</h4>
              <p className="text-sm">{recommendation.sentiment}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium">{recommendation.summary}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generated {formatDateTime(recommendation.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}