'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { ogrenciGerekli } from '@/lib/yetki';
import {
  evaluateAnswer,
  generateOverallFeedback,
  GeminiHatasi,
  type Degerlendirme,
} from '@/lib/gemini';

export type TeslimDurumu = { hata?: string } | undefined;

const teslimSemasi = z.object({
  examId: z.string().min(1, 'Test bulunamadı.'),
});

/**
 * Öğrencinin tüm yanıtlarını alır, Gemini ile paralel değerlendirir,
 * sonuçları kaydeder ve sonuç sayfasına yönlendirir.
 */
export async function testiBitir(
  _onceki: TeslimDurumu,
  formData: FormData
): Promise<TeslimDurumu> {
  const ogrenci = await ogrenciGerekli();

  const girdi = teslimSemasi.safeParse({ examId: formData.get('examId') });
  if (!girdi.success) {
    return { hata: girdi.error.errors[0]?.message ?? 'Geçersiz istek.' };
  }

  const test = await prisma.exam.findUnique({
    where: { id: girdi.data.examId },
    include: { questions: { orderBy: { order: 'asc' } } },
  });

  if (!test) return { hata: 'Test bulunamadı.' };
  if (!test.isPublished) return { hata: 'Bu test şu anda yayında değil.' };
  if (test.questions.length === 0) return { hata: 'Bu testte hiç soru yok.' };

  // Form alanlarını soru kimliğine göre topla ve doğrula.
  const yanitSemasi = z.string().max(5000, 'Yanıt çok uzun (en fazla 5000 karakter).');

  const yanitlar: { soru: (typeof test.questions)[number]; metin: string }[] = [];
  for (const soru of test.questions) {
    const ham = formData.get(`answer-${soru.id}`);
    const sonuc = yanitSemasi.safeParse(typeof ham === 'string' ? ham : '');
    if (!sonuc.success) {
      return { hata: sonuc.error.errors[0]?.message ?? 'Yanıtlar geçersiz.' };
    }
    yanitlar.push({ soru, metin: sonuc.data.trim() });
  }

  // Değerlendirmeyi başlatmadan önce denemeyi oluştur.
  const deneme = await prisma.attempt.create({
    data: { examId: test.id, studentId: ogrenci.id },
    select: { id: true },
  });

  let degerlendirmeler: Degerlendirme[];
  try {
    // Tüm sorular paralel değerlendirilir.
    degerlendirmeler = await Promise.all(
      yanitlar.map((y) => evaluateAnswer(y.soru.text, y.soru.rubric, y.soru.maxScore, y.metin))
    );
  } catch (hata) {
    // Değerlendirme başarısızsa yarım kalan denemeyi temizle.
    await prisma.attempt.delete({ where: { id: deneme.id } }).catch(() => undefined);

    if (hata instanceof GeminiHatasi) return { hata: hata.message };
    console.error('[testiBitir] Değerlendirme başarısız:', hata);
    return {
      hata: 'Yanıtlar değerlendirilirken bir sorun oluştu. Lütfen birkaç saniye sonra tekrar deneyin.',
    };
  }

  const toplamPuan = degerlendirmeler.reduce((t, d) => t + d.score, 0);

  const genelGeriBildirim = await generateOverallFeedback(
    yanitlar.map((y, i) => ({
      question: y.soru.text,
      responseText: y.metin,
      score: degerlendirmeler[i].score,
      maxScore: y.soru.maxScore,
    }))
  );

  try {
    await prisma.$transaction([
      prisma.answer.createMany({
        data: yanitlar.map((y, i) => ({
          attemptId: deneme.id,
          questionId: y.soru.id,
          responseText: y.metin,
          score: degerlendirmeler[i].score,
          feedback: degerlendirmeler[i].feedback,
          strengths: degerlendirmeler[i].strengths,
          improvements: degerlendirmeler[i].improvements,
        })),
      }),
      prisma.attempt.update({
        where: { id: deneme.id },
        data: {
          totalScore: toplamPuan,
          overallFeedback: genelGeriBildirim,
          completedAt: new Date(),
        },
      }),
    ]);
  } catch (hata) {
    console.error('[testiBitir] Sonuçlar kaydedilemedi:', hata);
    await prisma.attempt.delete({ where: { id: deneme.id } }).catch(() => undefined);
    return { hata: 'Sonuçlar kaydedilemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/student');
  revalidatePath(`/teacher/exams/${test.id}`);
  redirect(`/student/attempts/${deneme.id}`);
}
