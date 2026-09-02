/**
 * Dağıtım öncesi veritabanı hazırlığı.
 *
 * - Bağlantı adresini DATABASE_URL / POSTGRES_URL / PRISMA_DATABASE_URL
 *   sırasıyla arar (Vercel'in Prisma entegrasyonu son ikisini otomatik ekler).
 * - Tabloları oluşturur (prisma migrate deploy).
 * - Hazır verileri yükler (idempotent; başarısız olursa dağıtımı durdurmaz).
 *
 * Vercel'de migration başarısız olursa build durur; yerelde yalnızca uyarır,
 * böylece veritabanına erişimi olmayan bir makinede de `npm run build` çalışır.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const vercelde = Boolean(process.env.VERCEL);

// Yerelde .env dosyasını oku (Vercel'de değişkenler zaten ortamda tanımlıdır).
if (!vercelde && existsSync('.env')) {
  const satirlar = readFileSync('.env', 'utf8').split('\n');
  for (const ham of satirlar) {
    const satir = ham.trim();
    if (!satir || satir.startsWith('#')) continue;
    const ayirac = satir.indexOf('=');
    if (ayirac === -1) continue;
    const ad = satir.slice(0, ayirac).trim();
    if (!ad || process.env[ad]) continue;
    let deger = satir.slice(ayirac + 1).trim();
    if (
      (deger.startsWith('"') && deger.endsWith('"')) ||
      (deger.startsWith("'") && deger.endsWith("'"))
    ) {
      deger = deger.slice(1, -1);
    }
    process.env[ad] = deger;
  }
}

const url =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;

if (!url) {
  const mesaj =
    'DATABASE_URL bulunamadı (POSTGRES_URL / PRISMA_DATABASE_URL de yok). Veritabanı hazırlığı atlandı.';
  if (vercelde) {
    console.error('HATA: ' + mesaj);
    process.exit(1);
  }
  console.warn('UYARI: ' + mesaj);
  process.exit(0);
}

process.env.DATABASE_URL = url;

// npx --no-install: yerel node_modules/.bin içinden çözer, ağdan indirmeye
// çalışmaz. Böylece betik doğrudan `node` ile de çalıştırılabilir.
function calistir(komut) {
  execSync('npx --no-install ' + komut, { stdio: 'inherit', env: process.env });
}

try {
  console.log('> prisma migrate deploy');
  calistir('prisma migrate deploy');
} catch {
  const mesaj = 'Veritabanı migration işlemi başarısız oldu.';
  if (vercelde) {
    console.error('HATA: ' + mesaj);
    process.exit(1);
  }
  console.warn('UYARI: ' + mesaj + ' Yerel build devam ediyor.');
  process.exit(0);
}

try {
  console.log('> prisma/seed.ts');
  calistir('tsx prisma/seed.ts');
} catch {
  // Seed kritik değil: tablolar hazırsa uygulama çalışır.
  console.warn('UYARI: Hazır veriler yüklenemedi, atlandı.');
}
