import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { ogrenciGerekli } from '@/lib/yetki';
import TestFormu from './test-formu';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const test = await prisma.exam.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: test ? `${test.title} — SözlüAI` : 'Test — SözlüAI' };
}

export default async function TestCozmeSayfasi({ params }: { params: { id: string } }) {
  await ogrenciGerekli();

  const test = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      teacher: { select: { name: true } },
      questions: { orderBy: { order: 'asc' } },
    },
  });

  if (!test) notFound();

  // Öğrenci yalnızca yayınlanmış testleri çözebilir.
  if (!test.isPublished) {
    return (
      <div className="kart mx-auto max-w-lg text-center">
        <h1 className="text-lg font-semibold text-slate-900">Bu test yayında değil</h1>
        <p className="mt-2 text-sm text-slate-600">
          Öğretmenin bu testi henüz yayınlamamış ya da yayından kaldırmış olabilir.
        </p>
        <Link href="/student" className="btn-birincil mt-5">
          Panele Dön
        </Link>
      </div>
    );
  }

  if (test.questions.length === 0) {
    return (
      <div className="kart mx-auto max-w-lg text-center">
        <h1 className="text-lg font-semibold text-slate-900">Bu testte henüz soru yok</h1>
        <Link href="/student" className="btn-birincil mt-5">
          Panele Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/student" className="text-sm text-slate-500 hover:text-slate-700">
          ← Panelim
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{test.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {test.topic} · {test.gradeLevel} · {test.questions.length} soru · Öğretmen:{' '}
          {test.teacher.name}
        </p>
        {test.description && <p className="mt-2 text-sm text-slate-600">{test.description}</p>}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Tüm soruları kendi cümlelerinle yanıtla. Yanıtların, öğretmenin belirlediği puanlama
        rubriğine göre değerlendirilecek.
      </div>

      <TestFormu
        examId={test.id}
        sorular={test.questions.map((s) => ({
          id: s.id,
          order: s.order,
          text: s.text,
          maxScore: s.maxScore,
        }))}
      />
    </div>
  );
}
