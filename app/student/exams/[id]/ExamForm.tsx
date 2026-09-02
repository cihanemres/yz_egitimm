"use client";
import { useState } from "react";
import { submitExamAction } from "@/actions/exam";
import { useRouter } from "next/navigation";

export default function ExamForm({ exam }: { exam: any }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Check for empty answers
    const emptyCount = exam.questions.length - Object.keys(answers).filter(k => answers[k]?.trim().length > 0).length;
    if (emptyCount > 0) {
      const confirm = window.confirm(`${emptyCount} soruyu boş bıraktınız. Yine de bitirmek istiyor musunuz? (Boş yanıtlar 0 puan alacaktır)`);
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = exam.questions.map((q: any) => ({
        questionId: q.id,
        responseText: answers[q.id] || ""
      }));
      
      const res = await submitExamAction(exam.id, formattedAnswers);
      if (res.success) {
        router.push(`/student/attempts/${res.attemptId}`);
      }
    } catch (error) {
      alert("Sınav gönderilirken hata oluştu.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {exam.questions.map((q: any, i: number) => (
        <div key={q.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">SORU {i + 1}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">{q.maxScore || 10} PUAN</span>
            </div>
            <p className="text-lg font-medium text-slate-800 leading-relaxed">{q.text}</p>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cevabınız</label>
            <textarea
              className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed transition-all"
              placeholder="Yanıtınızı buraya yazınız..."
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              disabled={submitting}
            />
          </div>
        </div>
      ))}

      <div className="pt-6 pb-20 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-3 text-lg"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Gemini AI Değerlendiriyor...
            </>
          ) : (
            "Yanıtları Gönder ve Değerlendir"
          )}
        </button>
      </div>
    </div>
  );
}
