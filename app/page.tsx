import Link from 'next/link';

import { auth } from '@/auth';

const ozellikler = [
  {
    baslik: 'Açık uçlu sorular',
    metin:
      'Çoktan seçmeli testlerin ötesine geçin. Öğrenciler kavramları kendi cümleleriyle açıklar.',
  },
  {
    baslik: 'Anında yapay zeka değerlendirmesi',
    metin:
      'Her yanıt, öğretmenin yazdığı rubriğe göre saniyeler içinde puanlanır ve gerekçesi açıklanır.',
  },
  {
    baslik: 'Yapıcı geri bildirim',
    metin:
      'Öğrenci her soru için güçlü yönlerini ve geliştirmesi gereken noktaları ayrı ayrı görür.',
  },
  {
    baslik: 'Öğretmen paneli',
    metin:
      'Testlerinizi oluşturun, yayınlayın ve sınıfınızın sonuçlarını tek bir tablodan takip edin.',
  },
];

export default async function AnaSayfa() {
  const session = await auth();
  const panelLinki = session?.user?.role === 'TEACHER' ? '/teacher' : '/student';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
              S
            </span>
            <span className="text-xl font-semibold text-slate-900">SözlüAI</span>
          </div>

          {session?.user ? (
            <Link href={panelLinki} className="btn-birincil">
              Panele Git
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ikincil">
                Giriş Yap
              </Link>
              <Link href="/register" className="btn-birincil">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-14 sm:py-20">
          <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Bilişim Teknolojileri ve Yazılım Dersi
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Yapay zeka destekli açık uçlu test ve geri bildirim platformu
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            SözlüAI, öğrencilerin açık uçlu sorulara verdiği yanıtları öğretmenin belirlediği
            puanlama rubriğine göre değerlendirir; puanı, gerekçesini ve gelişim önerilerini anında
            sunar.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-birincil px-5 py-2.5">
              Ücretsiz Kayıt Ol
            </Link>
            <Link href="/login" className="btn-ikincil px-5 py-2.5">
              Giriş Yap
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-14 sm:grid-cols-2">
          {ozellikler.map((o) => (
            <div key={o.baslik} className="kart">
              <h2 className="text-base font-semibold text-slate-900">{o.baslik}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{o.metin}</p>
            </div>
          ))}
        </section>

        <section className="mb-16 rounded-xl border border-brand-100 bg-brand-50 p-5">
          <h2 className="text-base font-semibold text-brand-900">Nasıl çalışır?</h2>
          <ol className="mt-3 space-y-2 text-sm text-brand-900/80">
            <li>
              <strong>1.</strong> Öğretmen bir test oluşturur veya hazır testi yayınlar. İsterse
              soruları yapay zekaya ürettirir.
            </li>
            <li>
              <strong>2.</strong> Öğrenci yayınlanmış testi açar, tüm soruları tek sayfada yanıtlar
              ve testi bitirir.
            </li>
            <li>
              <strong>3.</strong> Yanıtlar rubriğe göre değerlendirilir; öğrenci puanını ve geri
              bildirimini anında görür.
            </li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center text-xs text-slate-500">
          SözlüAI — Bilişim Teknolojileri ve Yazılım dersi için geliştirilmiştir.
        </div>
      </footer>
    </div>
  );
}
