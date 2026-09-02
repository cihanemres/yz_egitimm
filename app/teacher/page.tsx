import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { ogretmenGerekli } from '@/lib/yetki';
import { tarihBicimle } from '@/lib/bicim';
import { yayinDurumunuDegistir } from './actions';

export const metadata = { title: 'Öğretmen Paneli — SözlüAI' };
export const dynamic = 'force-dynamic';

export default async function OgretmenPaneli() {
  const ogretmen = await ogretmenGerekli();

  const testler = await prisma.exam.findMany({
    where: { teacherId: ogretmen.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Testlerim</h1>
          <p className="mt-1 text-sm text-slate-500">
            Oluşturduğunuz testleri yönetin ve öğrenci sonuçlarını inceleyin.
          </p>
        </div>
        <Link href="/teacher/exams/new" className="btn-birincil">
          + Yeni Test
        </Link>
      </div>

      {testler.length === 0 ? (
        <div className="kart text-center">
          <p className="text-sm text-slate-600">Henüz hiç testiniz yok.</p>
          <Link href="/teacher/exams/new" className="btn-birincil mt-4">
            İlk testinizi oluşturun
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {testler.map((test) => (
            <li key={test.id} className="kart">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/teacher/exams/${test.id}`}
                      className="text-base font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                    >
                      {test.title}
                    </Link>
                    {test.isPublished ? (
                      <span className="rozet bg-emerald-50 text-emerald-700">Yayında</span>
                    ) : (
                      <span className="rozet bg-slate-100 text-slate-600">Taslak</span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {test.topic} · {test.gradeLevel} · {test._count.questions} soru ·{' '}
                    {test._count.attempts} deneme
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Oluşturulma: {tarihBicimle(test.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <form action={yayinDurumunuDegistir}>
                    <input type="hidden" name="examId" value={test.id} />
                    <input type="hidden" name="publish" value={test.isPublished ? '0' : '1'} />
                    <button
                      type="submit"
                      className={test.isPublished ? 'btn-ikincil' : 'btn-yesil'}
                      disabled={!test.isPublished && test._count.questions === 0}
                    >
                      {test.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
                    </button>
                  </form>

                  <Link href={`/teacher/exams/${test.id}`} className="btn-ikincil">
                    Detay
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
