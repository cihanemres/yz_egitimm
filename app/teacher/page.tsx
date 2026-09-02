import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await auth();
  
  const exams = await prisma.exam.findMany({
    where: { teacherId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { attempts: true } } }
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Sınavlarım</h1>
        <p className="text-slate-500">Oluşturduğunuz tüm açık uçlu testler</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-slate-500 text-lg">Henüz bir sınav oluşturmadınız.</p>
          <Link href="/teacher/exams/new" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">İlk testinizi oluşturun</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map(exam => (
            <Link key={exam.id} href={`/teacher/exams/${exam.id}`} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors leading-relaxed">{exam.title}</h2>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{exam.description || 'Açıklama yok'}</p>
              
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">{exam.gradeLevel}</span>
                <span className="text-slate-400">{exam._count.attempts} Deneme</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
