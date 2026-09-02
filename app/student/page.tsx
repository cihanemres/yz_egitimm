import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { ogrenciGerekli } from '@/lib/yetki';
import { puanBicimle, puanRengi, tarihBicimle } from '@/lib/bicim';

export const metadata = { title: 'Öğrenci Paneli — SözlüAI' };
export const dynamic = 'force-dynamic';

export default async function OgrenciPaneli() {
  const ogrenci = await ogrenciGerekli();

  const [testler, denemeler] = await Promise.all([
    prisma.exam.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { name: true } },
        questions: { select: { maxScore: true } },
      },
    }),
    prisma.attempt.findMany({
      where: { studentId: ogrenci.id, completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      include: {
        exam: {
          select: { id: true, title: true, questions: { select: { maxScore: true } } },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merhaba, {ogrenci.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Yayınlanmış testlere girebilir, önceki sonuçlarını inceleyebilirsin.
        </p>
      </div>

      {/* Yayınlanmış testler */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Yayındaki testler</h2>

        {testler.length === 0 ? (
          <div className="kart text-sm text-slate-500">
            Şu anda yayında olan bir test yok. Öğretmenin yeni bir test yayınladığında burada
            görünecek.
          </div>
        ) : (
          <ul className="space-y-3">
            {testler.map((test) => {
              const tamPuan = test.questions.reduce((t, s) => t + s.maxScore, 0);
              const oncekiDeneme = denemeler.find((d) => d.examId === test.id);

              return (
                <li key={test.id} className="kart">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900">{test.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {test.topic} · {test.gradeLevel} · {test.questions.length} soru · Tam puan{' '}
                        {tamPuan}
                      </p>
                      {test.description && (
                        <p className="mt-2 text-sm text-slate-600">{test.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        Öğretmen: {test.teacher.name}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Link href={`/student/exams/${test.id}`} className="btn-birincil">
                        {oncekiDeneme ? 'Tekrar Çöz' : 'Teste Başla'}
                      </Link>
                      {oncekiDeneme && (
                        <span className="text-xs text-slate-500">
                          Son puanın: {puanBicimle(oncekiDeneme.totalScore)} / {tamPuan}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Önceki denemeler */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Önceki denemelerim</h2>

        {denemeler.length === 0 ? (
          <div className="kart text-sm text-slate-500">Henüz tamamlanmış bir denemen yok.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Test</th>
                  <th className="px-4 py-3 font-medium">Puan</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium text-right">Sonuç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {denemeler.map((deneme) => {
                  const tamPuan = deneme.exam.questions.reduce((t, s) => t + s.maxScore, 0);
                  const puan = deneme.totalScore ?? 0;

                  return (
                    <tr key={deneme.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{deneme.exam.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rozet ${puanRengi(puan, tamPuan)}`}
                        >{`${puanBicimle(puan)} / ${tamPuan}`}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {tarihBicimle(deneme.completedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/student/attempts/${deneme.id}`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          Görüntüle
                        </Link>
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
