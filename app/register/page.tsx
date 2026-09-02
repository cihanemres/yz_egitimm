import Link from 'next/link';

import KayitFormu from './kayit-formu';

export const metadata = { title: 'Kayıt Ol — SözlüAI' };

export default function KayitSayfasi() {
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
          <h1 className="text-lg font-semibold text-slate-900">Hesap oluştur</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rolünüzü seçerek birkaç saniyede kayıt olabilirsiniz.
          </p>

          <div className="mt-5">
            <KayitFormu />
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
