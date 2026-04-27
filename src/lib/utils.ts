import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | undefined, decimals: number = 2): string {
  if (num === undefined || num === null) return 'N/A';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  num: number | undefined,
  currency: string = 'USD'
): string {
  if (num === undefined || num === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function formatMarketCap(num: number | undefined): string {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export function formatPercent(num: number | undefined): string {
  if (num === undefined || num === null) return 'N/A';
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
}

export function formatVolume(num: number | undefined): string {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toString();
}

export function formatDate(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function paginate<T>(
  array: T[],
  page: number,
  limit: number
): { data: T[]; total: number; totalPages: number } {
  const total = array.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = array.slice(offset, offset + limit);

  return {
    data,
    total,
    totalPages,
  };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateSearchParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}