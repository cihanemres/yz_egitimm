import { PrismaClient } from '@prisma/client';

// Vercel'in Prisma/Postgres entegrasyonu bağlantıyı POSTGRES_URL veya
// PRISMA_DATABASE_URL adıyla ekler; şema ise DATABASE_URL bekler.
// DATABASE_URL tanımlı değilse bunlardan birine geri dönülür.
if (!process.env.DATABASE_URL) {
  const yedek = process.env.POSTGRES_URL ?? process.env.PRISMA_DATABASE_URL;
  if (yedek) process.env.DATABASE_URL = yedek;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
