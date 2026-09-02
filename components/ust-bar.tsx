import Link from 'next/link';

import { auth, signOut } from '@/auth';

/**
 * Panel sayfalarında kullanılan üst bar. Oturum bilgisini sunucuda okur.
 */
export default async function UstBar() {
  const session = await auth();
  const kullanici = session?.user;

  const anaLink = kullanici?.role === 'TEACHER' ? '/teacher' : '/student';

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={anaLink} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            S
          </span>
          <span className="text-lg font-semibold text-slate-900">SözlüAI</span>
        </Link>

        {kullanici ? (
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-slate-800">{kullanici.name}</p>
              <p className="text-xs text-slate-500">
                {kullanici.role === 'TEACHER' ? 'Öğretmen' : 'Öğrenci'}
              </p>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button type="submit" className="btn-ikincil">
                Çıkış Yap
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="btn-birincil">
            Giriş Yap
          </Link>
        )}
      </div>
    </header>
  );
}
