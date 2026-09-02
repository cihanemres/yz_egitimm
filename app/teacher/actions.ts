'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { ogretmenGerekli } from '@/lib/yetki';
import { generateQuestions, GeminiHatasi, type UretilenSoru } from '@/lib/gemini';

/* ------------------------------------------------------------------ */
/* Şemalar                                                             */
/* ------------------------------------------------------------------ */

const soruSemasi = z.object({
  text: z.string().trim().min(10, 'Soru metni en az 10 karakter olmalıdır.'),
  rubric: z.string().trim().min(10, 'Puanlama rubriği en az 10 karakter olmalıdır.'),
  maxScore: z.coerce.number().int().min(1, 'Tam puan en az 1 olmalıdır.').max(100),
});

const testSemasi = z.object({
  title: z.string().trim().min(3, 'Başlık en az 3 karakter olmalıdır.').max(120),
  topic: z.string().trim().min(2, 'Konu en az 2 karakter olmalıdır.').max(80),
  gradeLevel: z.string().trim().min(1, 'Sınıf düzeyi zorunludur.').max(40),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  publish: z.boolean(),
  questions: z.array(soruSemasi).min(1, 'En az bir soru eklemelisiniz.').max(20),
});

/* ------------------------------------------------------------------ */
/* Gemini ile soru üretimi                                             */
/* ------------------------------------------------------------------ */

export type UretimSonucu =
  | { ok: true; sorular: UretilenSoru[] }
  | { ok: false; hata: string };

export async function sorulariUret(
  topic: string,
  gradeLevel: string,
  count: number
): Promise<UretimSonucu> {
  await ogretmenGerekli();

  const girdi = z
    .object({
      topic: z.string().trim().min(2, 'Soru üretmek için önce konu girin.'),
      gradeLevel: z.string().trim().min(1, 'Soru üretmek için önce sınıf düzeyi seçin.'),
      count: z.coerce.number().int().min(1).max(10),
    })
    .safeParse({ topic, gradeLevel, count });

  if (!girdi.success) {
    return { ok: false, hata: girdi.error.errors[0]?.message ?? 'Girilen bilgiler geçersiz.' };
  }

  try {
    const sorular = await generateQuestions(
      girdi.data.topic,
      girdi.data.gradeLevel,
      girdi.data.count
    );
    return { ok: true, sorular };
  } catch (hata) {
    if (hata instanceof GeminiHatasi) return { ok: false, hata: hata.message };
    console.error('[sorulariUret] Beklenmeyen hata:', hata);
    return {
      ok: false,
      hata: 'Sorular üretilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    };
  }
}

/* ------------------------------------------------------------------ */
/* Test oluşturma                                                      */
/* ------------------------------------------------------------------ */

export type TestDurumu = { hata?: string } | undefined;

export async function testOlustur(_onceki: TestDurumu, formData: FormData): Promise<TestDurumu> {
  const ogretmen = await ogretmenGerekli();

  let hamSorular: unknown;
  try {
    hamSorular = JSON.parse(String(formData.get('questions') ?? '[]'));
  } catch {
    return { hata: 'Sorular okunamadı. Sayfayı yenileyip tekrar deneyin.' };
  }

  const sonuc = testSemasi.safeParse({
    title: formData.get('title'),
    topic: formData.get('topic'),
    gradeLevel: formData.get('gradeLevel'),
    description: formData.get('description') ?? '',
    publish: formData.get('publish') === '1',
    questions: hamSorular,
  });

  if (!sonuc.success) {
    return { hata: sonuc.error.errors[0]?.message ?? 'Girilen bilgiler geçersiz.' };
  }

  const { title, topic, gradeLevel, description, publish, questions } = sonuc.data;

  let testId: string;
  try {
    const test = await prisma.exam.create({
      data: {
        title,
        topic,
        gradeLevel,
        description: description ? description : null,
        isPublished: publish,
        teacherId: ogretmen.id,
        questions: {
          create: questions.map((s, i) => ({
            text: s.text,
            rubric: s.rubric,
            maxScore: s.maxScore,
            order: i + 1,
          })),
        },
      },
      select: { id: true },
    });
    testId = test.id;
  } catch (hata) {
    console.error('[testOlustur] Test oluşturulamadı:', hata);
    return { hata: 'Test kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/teacher');
  redirect(`/teacher/exams/${testId}`);
}

/* ------------------------------------------------------------------ */
/* Yayınlama durumunu değiştirme                                       */
/* ------------------------------------------------------------------ */

export async function yayinDurumunuDegistir(formData: FormData): Promise<void> {
  const ogretmen = await ogretmenGerekli();

  const examId = String(formData.get('examId') ?? '');
  const yayinla = formData.get('publish') === '1';
  if (!examId) return;

  const test = await prisma.exam.findUnique({
    where: { id: examId },
    select: { teacherId: true, _count: { select: { questions: true } } },
  });

  // Öğretmen yalnızca kendi testini değiştirebilir.
  if (!test || test.teacherId !== ogretmen.id) redirect('/forbidden');
  if (yayinla && test._count.questions === 0) return;

  await prisma.exam.update({
    where: { id: examId },
    data: { isPublished: yayinla },
  });

  revalidatePath('/teacher');
  revalidatePath(`/teacher/exams/${examId}`);
}

/* ------------------------------------------------------------------ */
/* Test silme                                                          */
/* ------------------------------------------------------------------ */

export async function testSil(formData: FormData): Promise<void> {
  const ogretmen = await ogretmenGerekli();

  const examId = String(formData.get('examId') ?? '');
  if (!examId) return;

  const test = await prisma.exam.findUnique({
    where: { id: examId },
    select: { teacherId: true },
  });

  if (!test || test.teacherId !== ogretmen.id) redirect('/forbidden');

  await prisma.exam.delete({ where: { id: examId } });

  revalidatePath('/teacher');
  redirect('/teacher');
}
