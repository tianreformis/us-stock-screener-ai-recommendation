'use server';

import { prisma } from '@/lib/prisma';
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';

export type AuthError =
  | 'missingFields'
  | 'invalidEmail'
  | 'weakPassword'
  | 'emailTaken'
  | 'invalidCredentials'
  | 'generic';

export type AuthResult = { ok: true } | { ok: false; error: AuthError };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signUpAction(input: {
  name: string;
  email: string;
  password: string;
  language?: string;
}): Promise<AuthResult> {
  try {
    const name = input.name?.trim() || '';
    const email = input.email?.trim().toLowerCase() || '';
    const password = input.password || '';

    if (!name || !email || !password) {
      return { ok: false, error: 'missingFields' };
    }
    if (!isValidEmail(email)) {
      return { ok: false, error: 'invalidEmail' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'weakPassword' };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: 'emailTaken' };
    }

    const { hash, salt } = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        saltHash: salt,
        language: input.language === 'en' ? 'en' : 'id',
      },
    });

    await createSession(user.id);
    return { ok: true };
  } catch (e) {
    console.error('Sign up error:', e);
    return { ok: false, error: 'generic' };
  }
}

export async function logInAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const email = input.email?.trim().toLowerCase() || '';
    const password = input.password || '';

    if (!email || !password) {
      return { ok: false, error: 'missingFields' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: false, error: 'invalidCredentials' };
    }

    const valid = verifyPassword(password, user.passwordHash, user.saltHash);
    if (!valid) {
      return { ok: false, error: 'invalidCredentials' };
    }

    await createSession(user.id);
    return { ok: true };
  } catch (e) {
    console.error('Log in error:', e);
    return { ok: false, error: 'generic' };
  }
}

export async function logOutAction(): Promise<{ ok: true }> {
  try {
    await destroySession();
  } catch (e) {
    console.error('Log out error:', e);
  }
  return { ok: true };
}
