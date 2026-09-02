'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { Role } from '@prisma/client';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';

export type GirisDurumu = { hata?: string } | undefined;

const girisSemasi = z.object({
  email: z
    .string({ required_error: 'E-posta zorunludur.' })
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi girin.'),
  password: z.string({ required_error: 'Şifre zorunludur.' }).min(1, 'Şifre zorunludur.'),
});

export async function girisYap(_onceki: GirisDurumu, formData: FormData): Promise<GirisDurumu> {
  const sonuc = girisSemasi.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!sonuc.success) {
    return { hata: sonuc.error.errors[0]?.message ?? 'Girilen bilgiler geçersiz.' };
  }

  const { email, password } = sonuc.data;

  // Role göre yönlendirebilmek için kullanıcının rolünü önceden okuyoruz.
  // Kimlik doğrulaması yine signIn içinde yapılır.
  const kullanici = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  const hedef = kullanici?.role === Role.TEACHER ? '/teacher' : '/student';

  try {
    await signIn('credentials', { email, password, redirectTo: hedef });
  } catch (hata) {
    if (hata instanceof AuthError) {
      return { hata: 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.' };
    }
    // NextAuth yönlendirmesi (NEXT_REDIRECT) buradan geçmelidir.
    throw hata;
  }
}
