import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

import { auth } from '@/auth';

export type OturumKullanicisi = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** Oturum açmış kullanıcıyı döndürür; yoksa giriş sayfasına yönlendirir. */
export async function kullaniciGerekli(): Promise<OturumKullanicisi> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    role: session.user.role,
  };
}

/** Yalnızca öğretmen erişebilir. */
export async function ogretmenGerekli(): Promise<OturumKullanicisi> {
  const kullanici = await kullaniciGerekli();
  if (kullanici.role !== Role.TEACHER) redirect('/forbidden');
  return kullanici;
}

/** Yalnızca öğrenci erişebilir. */
export async function ogrenciGerekli(): Promise<OturumKullanicisi> {
  const kullanici = await kullaniciGerekli();
  if (kullanici.role !== Role.STUDENT) redirect('/forbidden');
  return kullanici;
}
