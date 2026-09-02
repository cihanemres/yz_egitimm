import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Role } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { kullaniciGerekli } from '@/lib/yetki';
import { puanBicimle, puanRengi, tarihBicimle } from '@/lib/bicim';

export const metadata = { title: 'Test Sonucu — SözlüAI' };
export const dynamic = 'force-dynamic';

export default async function SonucSayfasi({ params }: { params: { id: string } }) {
  const kullanici = await kullaniciGerekli();

  const deneme = await prisma.attempt.findUnique({
    where: { id: params.id },
    include: {
      student: { select: { id: true, name: true } },
      exam: {
        select: {
          id: true,
          title: true,
          topic: true,
          gradeLevel: true,
          teacherId: true,
          questions: { orderBy: { order: 'asc' } },
        },
      },
      answers: true,
    },
  });

  if (!deneme) notFound();

  // Yetki: öğrenci yalnızca kendi denemesini, öğretmen yalnızca kendi testinin
  // denemelerini görebilir.
  const ogrencininKendisi =
    kullanici.role === Role.STUDENT && deneme.studentId === kullanici.id;
  const testinOgretmeni =
    kullanici.role === Role.TEACHER && deneme.exam.teacherId === kullanici.id;

  if (!ogrencininKendisi && !testinOgretmeni) redirect('/forbidden');

  const tamPuan = deneme.exam.questions.reduce((t, s) => t + s.maxScore, 0);
  const toplamPuan = deneme.totalScore ?? 0;
  const yuzde = tamPuan > 0 ? Math.round((toplamPuan / tamPuan) * 100) : 0;

  // Yanıtları soru sırasına göre eşleştir.
  const yanitHaritasi = new Map(deneme.answers.map((y) => [y.questionId, y]));

  const geriLink = testinOgretmeni ? `/teacher/exams/${deneme.exam.id}` : '/student';
  const geriMetin = testinOgretmeni ? '← Test detayı' : '← Panelim';

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div>
        <Link href={geriLink} className="text-sm text-slate-500 hover:text-slate-700">
          {geriMetin}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{deneme.exam.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {deneme.exam.topic} · {deneme.exam.gradeLevel} ·{' '}
          {tarihBicimle(deneme.completedAt ?? deneme.startedAt)}
        </p>
        {testinOgretmeni && (
          <p className="mt-1 text-sm font-medium text-slate-700">
            Öğrenci: {deneme.student.name}
          </p>
        )}
      </div>

      {deneme.completedAt === null ? (
        <div className="kart text-sm text-slate-600">
          Bu deneme tamamlanmamış, bu nedenle sonuç bulunmuyor.
        </div>
      ) : (
        <>
          {/* Soru bazında sonuçlar */}
          <div className="space-y-4">
            {deneme.exam.questions.map((soru) => {
              const yanit = yanitHaritasi.get(soru.id);
              const puan = yanit?.score ?? 0;

              return (
                <div key={soru.id} className="kart">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rozet shrink-0 bg-slate-100 text-slate-600">
                      {soru.order}. Soru
                    </span>
                    <span className={`rozet shrink-0 ${puanRengi(puan, soru.maxScore)}`}>
                      {puanBicimle(puan)} / {soru.maxScore}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-medium leading-relaxed text-slate-900">
                    {soru.text}
                  </p>

                  {/* Verilen yanıt */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Verilen yanıt
                    </p>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {yanit?.responseText?.trim() || (
                        <span className="italic text-slate-400">Boş bırakılmış</span>
                      )}
                    </p>
                  </div>

                  {/* Geri bildirim */}
                  {yanit?.feedback && (
                    <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                        Geri bildirim
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-brand-900/80">
                        {yanit.feedback}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Güçlü yönler
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-900/80">
                        {yanit?.strengths?.trim() || '-'}
                      </p>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Geliştirilecek yönler
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                        {yanit?.improvements?.trim() || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toplam puan ve genel geri bildirim */}
          <div className="kart">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Toplam puan
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {puanBicimle(toplamPuan)}{' '}
                  <span className="text-lg font-medium text-slate-400">/ {tamPuan}</span>
                </p>
              </div>
              <span className={`rozet px-3 py-1 text-sm ${puanRengi(toplamPuan, tamPuan)}`}>
                %{yuzde}
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${Math.min(yuzde, 100)}%` }}
              />
            </div>

            {deneme.overallFeedback && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Genel değerlendirme
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {deneme.overallFeedback}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pb-4">
            <Link href={geriLink} className="btn-ikincil">
              {testinOgretmeni ? 'Test Detayına Dön' : 'Panele Dön'}
            </Link>
            {ogrencininKendisi && (
              <Link href={`/student/exams/${deneme.exam.id}`} className="btn-birincil">
                Testi Tekrar Çöz
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
