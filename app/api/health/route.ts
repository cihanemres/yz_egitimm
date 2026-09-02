import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Teşhis ucu: hangi ortam değişkenlerinin sunucuya ulaştığını bildirir.
 * Yalnızca "tanımlı mı" bilgisini döndürür, değerleri ASLA sızdırmaz.
 */
export async function GET() {
  return NextResponse.json({
    authSecret: Boolean(process.env.AUTH_SECRET),
    nextauthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    postgresUrl: Boolean(process.env.POSTGRES_URL),
    prismaDatabaseUrl: Boolean(process.env.PRISMA_DATABASE_URL),
    geminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    authUrl: process.env.AUTH_URL ?? null,
    nextauthUrl: process.env.NEXTAUTH_URL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
