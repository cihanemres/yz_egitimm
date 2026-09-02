import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ExamForm from "./ExamForm";

export default async function TakeExamPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  const exam = await prisma.exam.findUnique({
    where: { id: params.id, isPublished: true },
    include: { questions: { orderBy: { order: 'asc' } } }
  });

  if (!exam) redirect("/student");

  // Check if already attempted
  const existingAttempt = await prisma.attempt.findFirst({
    where: { examId: exam.id, studentId: session?.user?.id }
  });

  if (existingAttempt && existingAttempt.completedAt) {
    redirect(`/student/attempts/${existingAttempt.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 p-8 overflow-y-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{exam.title}</h1>
        {exam.description && <p className="text-slate-500 leading-relaxed">{exam.description}</p>}
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wider uppercase">
            Açık Uçlu Sınav
          </span>
        </div>
      </div>

      <ExamForm exam={exam} />
    </div>
  );
}
