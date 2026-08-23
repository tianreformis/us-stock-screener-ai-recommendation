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
import { useToast } from '@/components/ui/toast';
import { Check, Palette, Type, Settings2, Languages, Moon, Sun } from 'lucide-react';
import {
  translations,
  tf,
  type Language,
  type TranslationDict,
} from '@/lib/translations';

export type ThemeName = 'dark' | 'light' | 'terminal' | 'midnight';
export type FontName = 'sans' | 'mono' | 'serif';

interface AppearanceContextType {
  theme: ThemeName;
  font: FontName;
  lang: Language;
  t: TranslationDict;
  setTheme: (theme: ThemeName) => void;
  setFont: (font: FontName) => void;
  setLang: (lang: Language) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const AppearanceContext = React.createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [theme, setThemeState] = React.useState<ThemeName>('dark');
  const [font, setFontState] = React.useState<FontName>('sans');
  const [lang, setLangState] = React.useState<Language>('id'); // Bahasa Indonesia default
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const t = translations[lang];

  // 1. Load preferences on mount (after hydration to avoid mismatch)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('terminal_pref_theme') as ThemeName;
      const savedFont = localStorage.getItem('terminal_pref_font') as FontName;
      const savedLang = localStorage.getItem('terminal_pref_lang') as Language;
      if (savedTheme) setThemeState(savedTheme);
      if (savedFont) setFontState(savedFont);
      if (savedLang === 'id' || savedLang === 'en') setLangState(savedLang);
    }
  }, []);

  // 2. Apply theme classes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    body.classList.remove('theme-light', 'theme-terminal', 'theme-midnight');
    if (theme !== 'dark') {
      body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('terminal_pref_theme', theme);
  }, [theme]);

  // 3. Apply font classes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    body.classList.remove('font-sans-active', 'font-mono-active', 'font-serif-active');
    body.classList.add(`font-${font}-active`);
    localStorage.setItem('terminal_pref_font', font);
  }, [font]);

  // 4. Persist language
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('terminal_pref_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    toast({
      title: t.settings.toastThemeTitle,
      description: tf(t.settings.toastThemeDesc, { theme: t.settings.themeNames[newTheme] }),
      variant: 'success',
    });
  };

  const setFont = (newFont: FontName) => {
    setFontState(newFont);
    toast({
      title: t.settings.toastFontTitle,
      description: tf(t.settings.toastFontDesc, { font: t.settings.fontNames[newFont] }),
      variant: 'success',
    });
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    toast({
      title: translations[newLang].settings.toastLangTitle,
      description: translations[newLang].settings.toastLangDesc,
      variant: 'success',
    });
  };

  return (
    <AppearanceContext.Provider
      value={{ theme, font, lang, t, setTheme, setFont, setLang, isSettingsOpen, setIsSettingsOpen }}
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
  const { theme, font, lang, t, setTheme, setFont, setLang, isSettingsOpen, setIsSettingsOpen } =
    useAppearance();

  const advancedThemes = [
    {
      id: 'terminal' as ThemeName,
      name: t.settings.themes.terminalName,
      description: t.settings.themes.terminalDesc,
      colors: ['bg-black', 'bg-zinc-950', 'border-green-900', 'text-green-500'],
    },
    {
      id: 'midnight' as ThemeName,
      name: t.settings.themes.midnightName,
      description: t.settings.themes.midnightDesc,
      colors: ['bg-slate-950', 'bg-slate-900', 'border-slate-800', 'text-sky-400'],
    },
  ];

  const fonts = [
    {
      id: 'sans' as FontName,
      name: t.settings.fonts.sansName,
      className: 'font-sans',
      description: t.settings.fonts.sansDesc,
    },
    {
      id: 'mono' as FontName,
      name: t.settings.fonts.monoName,
      className: 'font-mono',
      description: t.settings.fonts.monoDesc,
    },
    {
      id: 'serif' as FontName,
      name: t.settings.fonts.serifName,
      className: 'font-serif',
      description: t.settings.fonts.serifDesc,
    },
  ];

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-6 rounded-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100 font-bold text-base">
            <Settings2 className="h-5 w-5 text-emerald-500" />
            <span>{t.settings.title}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {t.settings.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* LIGHT / DARK MODE SEGMENTED CONTROL */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              <Sun className="h-4 w-4 text-emerald-400" />
              <span>{t.settings.modeSection}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  theme !== 'light'
                    ? 'bg-zinc-950 border border-emerald-500/40 text-emerald-400 shadow'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                {t.settings.darkMode}
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white border border-emerald-500/40 text-emerald-700 shadow'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                {t.settings.lightMode}
              </button>
            </div>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              <Languages className="h-4 w-4 text-emerald-400" />
              <span>{t.settings.languageSection}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              <button
                onClick={() => setLang('id')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'id'
                    ? 'bg-zinc-950 border border-emerald-500/40 text-emerald-400 shadow'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                🇮🇩 <span className="flex-1 text-left ml-2">Bahasa Indonesia</span>
                {lang === 'id' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-zinc-950 border border-emerald-500/40 text-emerald-400 shadow'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                🇺🇸 <span className="flex-1 text-left ml-2">English</span>
                {lang === 'en' && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* ADVANCED THEMES */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              <Palette className="h-4 w-4 text-emerald-400" />
              <span>{t.settings.moreThemes}</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {advancedThemes.map((th) => {
                const isActive = theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`flex items-start text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex gap-1 mr-3 mt-0.5 border border-zinc-800 rounded p-1 bg-black">
                      <div className={`h-4 w-4 rounded ${th.colors[0]}`} />
                      <div className={`h-4 w-4 rounded ${th.colors[1]}`} />
                      <div className={`h-4 w-4 rounded ${th.colors[2]} border`} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-100">{th.name}</span>
                        {isActive && <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{th.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FONT SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              <Type className="h-4 w-4 text-emerald-400" />
              <span>{t.settings.typographySection}</span>
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
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold text-zinc-100 ${f.className}`}>
                        {f.name}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-normal">{f.description}</p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <Button
            size="sm"
            onClick={() => setIsSettingsOpen(false)}
            className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800"
          >
            {t.settings.applyClose}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
