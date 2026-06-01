'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Settings, Check, Palette, Type, ShieldAlert } from 'lucide-react';

export type ThemeName = 'dark' | 'light' | 'terminal' | 'midnight';
export type FontName = 'sans' | 'mono' | 'serif';

interface AppearanceContextType {
  theme: ThemeName;
  font: FontName;
  setTheme: (theme: ThemeName) => void;
  setFont: (font: FontName) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const AppearanceContext = React.createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [theme, setThemeState] = React.useState<ThemeName>('dark');
  const [font, setFontState] = React.useState<FontName>('sans');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // 1. Load preferences on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('terminal_pref_theme') as ThemeName;
      const savedFont = localStorage.getItem('terminal_pref_font') as FontName;
      if (savedTheme) setThemeState(savedTheme);
      if (savedFont) setFontState(savedFont);
    }
  }, []);

  // 2. Apply theme classes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;

    // Reset themes
    body.classList.remove('theme-light', 'theme-terminal', 'theme-midnight');
    if (theme !== 'dark') {
      body.classList.add(`theme-${theme}`);
    }

    // Persist
    localStorage.setItem('terminal_pref_theme', theme);
  }, [theme]);

  // 3. Apply font classes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;

    // Reset fonts
    body.classList.remove('font-sans-active', 'font-mono-active', 'font-serif-active');
    body.classList.add(`font-${font}-active`);

    // Persist
    localStorage.setItem('terminal_pref_font', font);
  }, [font]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    const themeTitles: Record<ThemeName, string> = {
      dark: 'Sleek Charcoal Dark',
      light: 'Crisp Light',
      terminal: 'Bloomberg Terminal Green',
      midnight: 'Midnight Blue Ocean',
    };
    toast({
      title: 'Theme Applied',
      description: `Switched visual workspace theme to ${themeTitles[newTheme]}.`,
      variant: 'success',
    });
  };

  const setFont = (newFont: FontName) => {
    setFontState(newFont);
    const fontTitles: Record<FontName, string> = {
      sans: 'Inter Sans-Serif',
      mono: 'Terminal Monospace',
      serif: 'Executive Georgia Serif',
    };
    toast({
      title: 'Typography Updated',
      description: `Active interface typeface set to ${fontTitles[newFont]}.`,
      variant: 'success',
    });
  };

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        font,
        setTheme,
        setFont,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
      <AppearanceModal />
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = React.useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}

function AppearanceModal() {
  const { theme, font, setTheme, setFont, isSettingsOpen, setIsSettingsOpen } = useAppearance();

  const themes = [
    {
      id: 'dark' as ThemeName,
      name: 'Charcoal Dark',
      description: 'Default Slate/Zinc financial palette. Best for medium light environments.',
      colors: ['bg-zinc-950', 'bg-zinc-900', 'border-zinc-800', 'text-emerald-400'],
    },
    {
      id: 'light' as ThemeName,
      name: 'Crisp Light',
      description: 'Clean day trading canvas. Ideal for high luminosity office set-ups.',
      colors: ['bg-zinc-50', 'bg-zinc-200', 'border-zinc-300', 'text-emerald-600'],
    },
    {
      id: 'terminal' as ThemeName,
      name: 'Bloomberg Terminal',
      description: 'Authentic retro financial interface. Highly efficient green screen matrix.',
      colors: ['bg-black', 'bg-zinc-950', 'border-green-900', 'text-green-500'],
    },
    {
      id: 'midnight' as ThemeName,
      name: 'Midnight Navy',
      description: 'Soothing slate-blue midnight backdrop. Reduces digital fatigue.',
      colors: ['bg-slate-950', 'bg-slate-900', 'border-slate-800', 'text-sky-400'],
    },
  ];

  const fonts = [
    {
      id: 'sans' as FontName,
      name: 'Modern Sans-Serif',
      className: 'font-sans',
      description: 'Clean, proportional geometric lettering optimized for visual grids.',
    },
    {
      id: 'mono' as FontName,
      name: 'Terminal Monospace',
      className: 'font-mono',
      description: 'Equal-width mechanical spacing designed for absolute tabular precision.',
    },
    {
      id: 'serif' as FontName,
      name: 'Executive Serif',
      className: 'font-serif',
      description: 'Elegant editorial typography for a sophisticated financial report look.',
    },
  ];

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="max-w-md bg-card border-border text-foreground p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100 font-bold">
            <Settings className="h-5 w-5 text-emerald-500" />
            <span>Terminal Appearance Controls</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Personalize your workspace layout, colors, and tabular typography. Preferences are cached locally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* THEME SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              <Palette className="h-4 w-4 text-emerald-400" />
              <span>Workspace Themes</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-start text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                        : 'border-border bg-background hover:bg-muted/30'
                    }`}
                  >
                    {/* Visual Swatch */}
                    <div className="flex gap-1 mr-3 mt-0.5 border border-border rounded p-1 bg-zinc-950">
                      <div className={`h-4.5 w-4.5 rounded ${t.colors[0]}`} />
                      <div className={`h-4.5 w-4.5 rounded ${t.colors[1]}`} />
                      <div className={`h-4.5 w-4.5 rounded ${t.colors[2]}`} />
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold text-zinc-100`}>
                          {t.name}
                        </span>
                        {isActive && <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {t.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FONT SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
              <Type className="h-4 w-4 text-emerald-400" />
              <span>Tabular Typography</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {fonts.map((f) => {
                const isActive = font === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                        : 'border-border bg-background hover:bg-muted/30'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold text-zinc-100 ${f.className}`}>
                        {f.name}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {f.description}
                      </p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={() => setIsSettingsOpen(false)}
            className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800"
          >
            Apply & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
