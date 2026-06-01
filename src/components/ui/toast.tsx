'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

type ToastContextType = {
  toasts: ToastMessage[];
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(({ title, description, variant = 'default' }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'p-4 rounded-lg shadow-lg border text-sm flex justify-between items-start gap-3 transition-all transform translate-y-0 scale-100 opacity-100 animate-in slide-in-from-bottom-5 pointer-events-auto',
              t.variant === 'destructive'
                ? 'bg-red-950 border-red-900 text-red-100'
                : t.variant === 'success'
                ? 'bg-zinc-900 border-emerald-500/30 text-zinc-50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-50'
            )}
          >
            <div className="flex-1">
              {t.title && <div className="font-semibold text-zinc-100 mb-1">{t.title}</div>}
              {t.description && <div className="text-xs text-zinc-400">{t.description}</div>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
