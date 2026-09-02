import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExamDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      attempts: {
        include: { student: true },
        orderBy: { completedAt: 'desc' }
      }
    }
  });

  if (!exam || exam.teacherId !== session?.user?.id) {
    redirect("/teacher");
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-4">
        <Link href="/teacher" className="text-indigo-600 hover:underline text-sm font-bold uppercase tracking-wider">&larr; Sınavlarıma Dön</Link>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{exam.title}</h1>
        {exam.description && <p className="text-slate-500 leading-relaxed">{exam.description}</p>}
        <div className="flex gap-3 mt-2">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{exam.gradeLevel}</span>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider">{exam.topic}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${exam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {exam.isPublished ? 'Yayında' : 'Taslak'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Sorular ({exam.questions.length})</h2>
          </div>
          <div className="space-y-6">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">SORU {i + 1}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{q.maxScore || 10} PUAN</span>
                </div>
                <p className="text-slate-900 font-medium leading-relaxed mb-4">{q.text}</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-2">Rubrik (Değerlendirme Kriteri)</span>
                  <p className="text-slate-700 leading-relaxed">{q.rubric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Öğrenci Sonuçları ({exam.attempts.length})</h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {exam.attempts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">Henüz hiçbir öğrenci bu sınava girmedi.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold">Öğrenci</th>
                    <th className="p-4 font-bold">Puan</th>
                    <th className="p-4 font-bold hidden sm:table-cell">Tarih</th>
                    <th className="p-4 font-bold text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {exam.attempts.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{attempt.student.name}</td>
                      <td className="p-4">
                        {attempt.totalScore !== null ? (
                          <span className="font-black text-indigo-600 text-lg">{attempt.totalScore}</span>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs uppercase">Bekliyor</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-medium hidden sm:table-cell">{attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="p-4 text-right">
                        <Link href={`/student/attempts/${attempt.id}`} className="text-indigo-600 hover:text-indigo-800 font-bold uppercase text-[10px] tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors inline-block">İncele</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
