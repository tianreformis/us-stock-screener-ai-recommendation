'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAppearance } from '@/components/screener/AppearanceContext';
import { logInAction, signUpAction, logOutAction } from '@/app/actions/auth';
import type { AuthError } from '@/app/actions/auth';
import { LogIn, LogOut, UserPlus, Loader2, ShieldCheck } from 'lucide-react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  language: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoadingUser: boolean;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (name: string, email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);

  const refreshUser = React.useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const json = await res.json();
      setUser(json.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

  const handleResult = async (
    result: { ok: true } | { ok: false; error: AuthError },
    onSuccess: () => void
  ): Promise<AuthError | null> => {
    if (result.ok) {
      await refreshUser();
      onSuccess();
      return null;
    }
    return result.error;
  };

  const signIn = async (email: string, password: string) => {
    const result = await logInAction({ email, password });
    return handleResult(result, () => {});
  };

  const signUp = async (name: string, email: string, password: string) => {
    // Read current language preference to store with the new account
    let language = 'id';
    try {
      language = localStorage.getItem('terminal_pref_lang') || 'id';
    } catch {}
    const result = await signUpAction({ name, email, password, language });
    return handleResult(result, () => {});
  };

  const signOut = async () => {
    await logOutAction();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUser, isAuthOpen, openAuth, closeAuth, signIn, signUp, signOut }}
    >
      {children}
      <AuthDialog />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthDialog() {
  const { t } = useAppearance();
  const { toast } = useToast();
  const { isAuthOpen, closeAuth, signIn, signUp } = useAuth();

  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState<'signin' | 'signup' | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const tfName = (template: string, fallback: string) =>
    template.replace('{name}', fallback);

  // Reset the form each time the dialog opens
  React.useEffect(() => {
    if (isAuthOpen) {
      setError(null);
      setPending(null);
    }
  }, [isAuthOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signin') {
      setPending('signin');
      const err = await signIn(email, password);
      setPending(null);
      if (err) {
        setError(t.auth.errors[err]);
        return;
      }
      toast({
        title: t.auth.signInSuccess,
        description: tfName(t.auth.signInSuccessDesc, email),
        variant: 'success',
      });
      closeAuth();
    } else {
      setPending('signup');
      const err = await signUp(name, email, password);
      setPending(null);
      if (err) {
        setError(t.auth.errors[err]);
        return;
      }
      toast({
        title: t.auth.signUpSuccess,
        description: tfName(t.auth.signUpSuccessDesc, name || email),
        variant: 'success',
      });
      closeAuth();
    }

    setPassword('');
  };

  return (
    <Dialog open={isAuthOpen} onOpenChange={(open) => !open && closeAuth()}>
      <DialogContent className="max-w-sm bg-zinc-950 border-zinc-800 text-zinc-100 p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100 font-bold text-base">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>{mode === 'signin' ? t.auth.dialogSignInTitle : t.auth.dialogSignUpTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {t.auth.dialogSubtitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as 'signin' | 'signup');
            setError(null);
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            <TabsTrigger
              value="signin"
              className="text-xs font-semibold data-[state=active]:bg-zinc-950 data-[state=active]:text-emerald-400"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              {t.auth.signIn}
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="text-xs font-semibold data-[state=active]:bg-zinc-950 data-[state=active]:text-emerald-400"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {t.auth.signUp}
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name" className="text-xs text-zinc-400">
                  {t.auth.nameLabel}
                </Label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  autoComplete="name"
                  className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs text-zinc-400">
                {t.auth.emailLabel}
              </Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                autoComplete="email"
                required
                className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs text-zinc-400">
                {t.auth.passwordLabel}
              </Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className="h-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs"
              />
            </div>

            {error && (
              <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={pending !== null}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              {pending !== null ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t.auth.processing}
                </>
              ) : mode === 'signin' ? (
                t.auth.submitSignIn
              ) : (
                t.auth.submitSignUp
              )}
            </Button>
          </form>
        </Tabs>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          className="w-full text-center text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer pt-1"
        >
          {mode === 'signin' ? (
            <>
              {t.auth.switchToSignUp}{' '}
              <span className="font-semibold underline">{t.auth.switchToSignUpLink}</span>
            </>
          ) : (
            <>
              {t.auth.switchToSignIn}{' '}
              <span className="font-semibold underline">{t.auth.switchToSignInLink}</span>
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function SignOutButton() {
  const { t } = useAppearance();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t.auth.signOutSuccess,
      description: t.auth.signOutSuccessDesc,
      variant: 'default',
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer w-full border border-transparent hover:border-red-500/20"
    >
      <LogOut className="h-4 w-4" />
      <span>{t.auth.signOut}</span>
    </button>
  );
}
