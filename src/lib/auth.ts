import { cookies } from 'next/headers';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'screener_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  language: string;
};

export function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt
    ? Buffer.from(existingSalt, 'hex')
    : randomBytes(16);
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt: salt.toString('hex') };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  try {
    const { hash: testHash } = hashPassword(password, salt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(testHash, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function toSafeUser(user: {
  id: string;
  email: string;
  name: string;
  language: string;
}): SafeUser {
  return { id: user.id, email: user.email, name: user.name, language: user.language };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { id: token, userId, expiresAt },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: token } }).catch(() => {});
    return null;
  }

  return toSafeUser(session.user);
}
