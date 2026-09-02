import Link from 'next/link';

import { auth } from '@/auth';

export const metadata = { title: 'Erişim Reddedildi — SözlüAI' };

export default async function YasakSayfasi() {
  const session = await auth();
  const rol = session?.user?.role;
  const panelLinki = rol === 'TEACHER' ? '/teacher' : rol === 'STUDENT' ? '/student' : '/login';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="kart w-full max-w-md text-center">
        <p className="text-3xl font-bold text-rose-300">403</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Bu sayfaya erişemezsiniz</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Bu bölüm{' '}
          {rol === 'TEACHER'
            ? 'yalnızca öğrenci hesapları'
            : rol === 'STUDENT'
              ? 'yalnızca öğretmen hesapları'
              : 'yetkili kullanıcılar'}{' '}
          içindir. Hesabınızın rolü bu sayfayı görüntülemeye uygun değil.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={panelLinki} className="btn-birincil">
            Kendi Panelime Git
          </Link>
          <Link href="/" className="btn-ikincil">
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
