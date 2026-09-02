import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await auth();
  
  const availableExams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: { teacher: true },
    orderBy: { createdAt: 'desc' }
  });

  const myAttempts = await prisma.attempt.findMany({
    where: { studentId: session?.user?.id, completedAt: { not: null } },
    include: { exam: true },
    orderBy: { completedAt: 'desc' }
  });

  const attemptedExamIds = myAttempts.map(a => a.examId);
  const newExams = availableExams.filter(exam => !attemptedExamIds.includes(exam.id));

  return (
    <div className="flex flex-col gap-6 h-full p-8 overflow-y-auto">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Yeni Sınavlar</h1>
        <p className="text-slate-500">Girebileceğiniz aktif açık uçlu testler</p>
      </div>
      
      {newExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center py-12 text-slate-500">
          Şu anda girebileceğiniz yeni bir sınav bulunmuyor.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {newExams.map(exam => (
            <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{exam.title}</h3>
                <p className="text-slate-500 mt-2 text-sm line-clamp-2 leading-relaxed">{exam.description}</p>
                <div className="flex gap-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="bg-slate-50 px-3 py-1 rounded-full">{exam.topic}</span>
                  <span className="bg-slate-50 px-3 py-1 rounded-full">{exam.teacher.name}</span>
                </div>
              </div>
              <Link href={`/student/exams/${exam.id}`} className="mt-6 inline-block text-center w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                Sınava Başla
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col mt-8">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">Önceki Sınavlarım</h2>
      </div>
      
      {myAttempts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center py-12 text-slate-500">
          Henüz tamamlanmış bir sınavınız yok.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {myAttempts.map(attempt => (
            <div key={attempt.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{attempt.exam.title}</h3>
                <div className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">
                  {new Date(attempt.completedAt!).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-3xl font-black text-indigo-600">{attempt.totalScore}</span>
                <Link href={`/student/attempts/${attempt.id}`} className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline mt-2">Sonucu İncele</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
