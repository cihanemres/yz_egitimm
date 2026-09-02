import Link from 'next/link';

import GirisFormu from './giris-formu';

export const metadata = { title: 'Giriş Yap — SözlüAI' };

export default function GirisSayfasi() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
            S
          </span>
          <span className="text-xl font-semibold text-slate-900">SözlüAI</span>
        </Link>

        <div className="kart">
          <h1 className="text-lg font-semibold text-slate-900">Giriş yap</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hesabınıza girerek testlerinize devam edin.
          </p>

          <div className="mt-5">
            <GirisFormu />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="mb-2 font-medium text-slate-700">Demo hesapları</p>
          <ul className="space-y-1">
            <li>Test (öğretmen): test@test.com / test123</li>
            <li>Öğretmen: ogretmen@test.com / 123456</li>
            <li>Öğrenci: ogrenci1@test.com / 123456</li>
            <li>Öğrenci: ogrenci2@test.com / 123456</li>
          </ul>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  );
}
