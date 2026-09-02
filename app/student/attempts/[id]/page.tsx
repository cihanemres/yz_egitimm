import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AttemptResultPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  const attempt = await prisma.attempt.findUnique({
    where: { id: params.id },
    include: {
      exam: { include: { questions: true } },
      student: true,
      answers: { include: { question: true } }
    }
  });

  if (!attempt) redirect("/");

  // Both the student who took the exam and the teacher who created it can view it
  const isOwner = attempt.studentId === session?.user?.id;
  const isTeacher = session?.user?.role === "TEACHER" && attempt.exam.teacherId === session?.user?.id;
  
  if (!isOwner && !isTeacher) {
    redirect("/");
  }

  const totalMaxScore = attempt.exam.questions.length * 100;
  const backLink = isTeacher ? `/teacher/exams/${attempt.examId}` : "/student";
  const backText = isTeacher ? "Sınava Dön" : "Sınavlara Dön";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-8 overflow-y-auto">
      <Link href={backLink} className="text-indigo-600 hover:underline text-sm font-bold uppercase tracking-wider">&larr; {backText}</Link>
      
      <div className="bg-indigo-900 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <h1 className="text-3xl font-bold">{attempt.exam.title} - Sonuçlar</h1>
        <p className="text-indigo-200 mt-2 font-medium">{attempt.student.name}</p>
        
        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center mb-4">
            <span className="text-5xl font-black text-white">{attempt.totalScore}</span>
          </div>
          <span className="text-indigo-200 font-bold tracking-widest uppercase text-sm">Genel Başarı Puanı</span>
        </div>
        
        <div className="mt-8 p-6 bg-white/10 border border-white/20 rounded-2xl text-left relative z-10 backdrop-blur-sm">
          <h3 className="text-[10px] font-bold text-indigo-300 uppercase mb-3 tracking-widest">Yapay Zeka Genel Değerlendirmesi</h3>
          <p className="text-indigo-50 leading-relaxed text-sm">{attempt.feedback || 'Genel değerlendirme bulunmuyor.'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Gemini AI Canlı Analiz Detayları</span>
        </div>
        
        {attempt.answers.map((answer, i) => (
          <div key={answer.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div className="pr-8">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">SORU {i + 1}</span>
                <p className="text-lg font-medium text-slate-900 leading-relaxed">{answer.question.text}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                  <span className="text-2xl font-black text-indigo-600">{answer.score}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Puan</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öğrencinin Yanıtı</h4>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 italic">
                  {answer.text || <span className="text-slate-400">Boş bırakılmış</span>}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Yapay Zeka Geri Bildirimi
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
                  <p className="text-indigo-900 text-sm leading-relaxed">{answer.feedback || 'Değerlendirme bulunmuyor.'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
