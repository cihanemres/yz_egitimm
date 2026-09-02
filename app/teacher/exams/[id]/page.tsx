import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { ogretmenGerekli } from '@/lib/yetki';
import { puanBicimle, puanRengi, tarihBicimle } from '@/lib/bicim';
import { testSil, yayinDurumunuDegistir } from '@/app/teacher/actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const test = await prisma.exam.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: test ? `${test.title} — SözlüAI` : 'Test — SözlüAI' };
}

export default async function TestDetaySayfasi({ params }: { params: { id: string } }) {
  const ogretmen = await ogretmenGerekli();

  const test = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      attempts: {
        orderBy: { startedAt: 'desc' },
        include: { student: { select: { name: true, email: true } } },
      },
    },
  });

  if (!test) notFound();

  // Öğretmen yalnızca kendi testini görebilir.
  if (test.teacherId !== ogretmen.id) redirect('/forbidden');

  const tamPuan = test.questions.reduce((t, s) => t + s.maxScore, 0);
  const tamamlanan = test.attempts.filter((d) => d.completedAt !== null);
  const ortalama =
    tamamlanan.length > 0
      ? tamamlanan.reduce((t, d) => t + (d.totalScore ?? 0), 0) / tamamlanan.length
      : null;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <Link href="/teacher" className="text-sm text-slate-500 hover:text-slate-700">
          ← Testlerim
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
              {test.isPublished ? (
                <span className="rozet bg-emerald-50 text-emerald-700">Yayında</span>
              ) : (
                <span className="rozet bg-slate-100 text-slate-600">Taslak</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {test.topic} · {test.gradeLevel} · {test.questions.length} soru · Tam puan {tamPuan}
            </p>
            {test.description && (
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{test.description}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <form action={yayinDurumunuDegistir}>
              <input type="hidden" name="examId" value={test.id} />
              <input type="hidden" name="publish" value={test.isPublished ? '0' : '1'} />
              <button
                type="submit"
                className={test.isPublished ? 'btn-ikincil' : 'btn-yesil'}
                disabled={!test.isPublished && test.questions.length === 0}
              >
                {test.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
              </button>
            </form>

            <form action={testSil}>
              <input type="hidden" name="examId" value={test.id} />
              <button
                type="submit"
                className="btn border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus:ring-rose-200"
              >
                Testi Sil
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="kart">
          <p className="text-xs text-slate-500">Toplam deneme</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{test.attempts.length}</p>
        </div>
        <div className="kart">
          <p className="text-xs text-slate-500">Tamamlanan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{tamamlanan.length}</p>
        </div>
        <div className="kart">
          <p className="text-xs text-slate-500">Sınıf ortalaması</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {ortalama === null ? '-' : `${puanBicimle(ortalama)} / ${tamPuan}`}
          </p>
        </div>
      </div>

      {/* Sorular */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Sorular</h2>

        {test.questions.length === 0 ? (
          <div className="kart text-sm text-slate-500">Bu testte henüz soru yok.</div>
        ) : (
          test.questions.map((soru) => (
            <div key={soru.id} className="kart">
              <div className="flex items-start justify-between gap-3">
                <span className="rozet shrink-0 bg-brand-50 text-brand-700">
                  {soru.order}. Soru
                </span>
                <span className="shrink-0 text-xs text-slate-500">{soru.maxScore} puan</span>
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-900">{soru.text}</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800">
                  Puanlama rubriği
                </summary>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                  {soru.rubric}
                </p>
              </details>
            </div>
          ))
        )}
      </section>

      {/* Öğrenci sonuçları */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Öğrenci sonuçları</h2>

        {test.attempts.length === 0 ? (
          <div className="kart text-sm text-slate-500">
            Bu teste henüz hiçbir öğrenci girmedi.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Öğrenci</th>
                  <th className="px-4 py-3 font-medium">Puan</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {test.attempts.map((deneme) => {
                  const tamamlandi = deneme.completedAt !== null;
                  const puan = deneme.totalScore ?? 0;

                  return (
                    <tr key={deneme.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{deneme.student.name}</p>
                        <p className="text-xs text-slate-500">{deneme.student.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {tamamlandi ? (
                          <span
                            className={`rozet ${puanRengi(puan, tamPuan)}`}
                          >{`${puanBicimle(puan)} / ${tamPuan}`}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {tarihBicimle(deneme.completedAt ?? deneme.startedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {tamamlandi ? (
                          <span className="rozet bg-emerald-50 text-emerald-700">Tamamlandı</span>
                        ) : (
                          <span className="rozet bg-amber-50 text-amber-700">Devam ediyor</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {tamamlandi ? (
                          <Link
                            href={`/student/attempts/${deneme.id}`}
                            className="font-medium text-brand-700 hover:underline"
                          >
                            Görüntüle
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
