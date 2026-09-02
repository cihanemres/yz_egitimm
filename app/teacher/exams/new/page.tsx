"use client";
import { useState } from "react";
import { generateQuestionsAction, createExamAction } from "@/actions/exam";
import { useRouter } from "next/navigation";

export default function NewExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("6. Sınıf");
  const [description, setDescription] = useState("");
  
  const [questions, setQuestions] = useState<any[]>([]);

  async function handleGenerate() {
    if (!topic || !gradeLevel) {
      alert("Lütfen önce konu ve sınıf düzeyini doldurun.");
      return;
    }
    setGenerating(true);
    try {
      const generated = await generateQuestionsAction(topic, gradeLevel);
      setQuestions(generated || []);
    } catch (error) {
      alert("Sorular üretilirken hata oluştu.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!title || questions.length === 0) {
      alert("Lütfen başlık girin ve en az 1 soru ekleyin/üretin.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createExamAction({
        title,
        topic,
        gradeLevel,
        description,
        questions
      });
      if (res.success) {
        router.push("/teacher");
      }
    } catch (error) {
      alert("Test kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Yeni Sınav Oluştur</h1>
        <p className="text-slate-500">Açık uçlu soruları Gemini AI ile otomatik hazırlayın</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sınav Başlığı</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="Örn: 1. Dönem 1. Yazılı" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sınıf Düzeyi</label>
            <input type="text" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="Örn: 6. Sınıf" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Konu</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="Örn: Algoritma ve Akış Şemaları" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Açıklama (İsteğe Bağlı)</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800" placeholder="Kısa bir açıklama..." />
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            {generating ? "Gemini Soruları Üretiyor..." : "Gemini ile Soru Üret"}
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col mt-4">
            <h2 className="text-xl font-bold text-slate-900">Sorular ({questions.length})</h2>
          </div>
          
          {questions.map((q, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">SORU {i + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Puan</label>
                  <input type="number" value={q.maxScore || 10} onChange={e => updateQuestion(i, 'maxScore', parseInt(e.target.value))} className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Soru Metni</label>
                <textarea value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed font-medium min-h-[100px] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Rubrik (Değerlendirme Anahtarı)</label>
                <textarea value={q.rubric} onChange={e => updateQuestion(i, 'rubric', e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed font-medium min-h-[120px] transition-all text-sm" />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-6 pb-12">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Sınavı Kaydet ve Yayınla"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
