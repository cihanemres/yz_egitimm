import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col items-center justify-center p-8 overflow-hidden text-slate-900">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Yapay Zeka Destekli <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sözlü Sınav Platformu</span>
        </h1>
        
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Öğretmenler için açık uçlu soru üretimini ve okumayı kolaylaştıran, 
          öğrencilere anında ve yapıcı geri bildirim sağlayan modern eğitim aracı.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-lg">
            Giriş Yap
          </Link>
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-lg">
            Kayıt Ol
          </Link>
        </div>
        
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Anında Dönüt</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Öğrenciler sınavı bitirir bitirmez yapay zekadan anında değerlendirme alır.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Otomatik Rubrik</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Sorulara uygun değerlendirme kriterleri otomatik olarak oluşturulur.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Rol Bazlı Erişim</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Öğretmen ve öğrenci panelleriyle güvenli ve kontrollü bir deneyim.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Gelişim Analizi</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Öğrencilerin güçlü ve zayıf yönlerini detaylı analizlerle takip edin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
