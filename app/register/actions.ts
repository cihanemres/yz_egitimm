'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { AuthError } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { signIn } from '@/auth';

export type KayitDurumu = { hata?: string } | undefined;

const kayitSemasi = z.object({
  name: z
    .string({ required_error: 'Ad soyad zorunludur.' })
    .trim()
    .min(3, 'Ad soyad en az 3 karakter olmalıdır.')
    .max(80, 'Ad soyad en fazla 80 karakter olabilir.'),
  email: z
    .string({ required_error: 'E-posta zorunludur.' })
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi girin.'),
  password: z
    .string({ required_error: 'Şifre zorunludur.' })
    .min(6, 'Şifre en az 6 karakter olmalıdır.')
    .max(72, 'Şifre en fazla 72 karakter olabilir.'),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Lütfen bir rol seçin.' }) }),
});

export async function kayitOl(_onceki: KayitDurumu, formData: FormData): Promise<KayitDurumu> {
  const sonuc = kayitSemasi.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!sonuc.success) {
    return { hata: sonuc.error.errors[0]?.message ?? 'Girilen bilgiler geçersiz.' };
  }

  const { name, email, password, role } = sonuc.data;

  const mevcut = await prisma.user.findUnique({ where: { email } });
  if (mevcut) {
    return { hata: 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.' };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, passwordHash, role },
    });
  } catch (hata) {
    console.error('[kayitOl] Kullanıcı oluşturulamadı:', hata);
    return { hata: 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.' };
  }

  // Kayıt başarılı → otomatik giriş yap ve role göre yönlendir.
  const hedef = role === Role.TEACHER ? '/teacher' : '/student';

  try {
    await signIn('credentials', { email, password, redirectTo: hedef });
  } catch (hata) {
    // NextAuth yönlendirmeyi hata fırlatarak yapar; onu yukarı geçir.
    if (hata instanceof AuthError) {
      return { hata: 'Hesabınız oluşturuldu ancak otomatik giriş yapılamadı. Giriş sayfasından deneyin.' };
    }
    throw hata;
  }
}
