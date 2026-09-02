"use server";

import { prisma } from "@/utils/prisma";

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "TEACHER" | "STUDENT";

  if (!email || !password || !role) {
    return { error: "Lütfen tüm zorunlu alanları doldurun." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." };
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password, // In real app, hash password!
        role
      }
    });

    return { success: true };
  } catch (error) {
    return { error: "Kayıt olurken bir hata oluştu." };
  }
}
