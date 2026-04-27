import { prisma } from './prisma';

const DEFAULT_TTL = 5 * 60 * 1000;

export async function getCache<T>(key: string): Promise<T | null> {
  const entry = await prisma.cacheEntry.findUnique({
    where: { key },
  });

  if (!entry || entry.expiresAt < new Date()) {
    if (entry) {
      await prisma.cacheEntry.delete({ where: { key } }).catch(() => {});
    }
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlMs: number = DEFAULT_TTL
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.cacheEntry.upsert({
    where: { key },
    update: {
      value: JSON.stringify(value),
      expiresAt,
    },
    create: {
      key,
      value: JSON.stringify(value),
      expiresAt,
    },
  });
}

export async function deleteCache(key: string): Promise<void> {
  await prisma.cacheEntry.delete({ where: { key } }).catch(() => {});
}

export async function cleanupExpiredCache(): Promise<void> {
  await prisma.cacheEntry.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}

export const cache = {
  get: getCache,
  set: setCache,
  del: deleteCache,
  cleanup: cleanupExpiredCache,
};

export default cache;