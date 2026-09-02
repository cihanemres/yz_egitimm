'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { sorulariUret, testOlustur, type TestDurumu } from '@/app/teacher/actions';

type Soru = {
  text: string;
  rubric: string;
  maxScore: number;
};

const SINIF_SECENEKLERI = ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'];

const baslangicDurumu: TestDurumu = undefined;

function bosSoru(): Soru {
  return { text: '', rubric: '', maxScore: 10 };
}

/** Kaydet butonları — form gönderilirken kilitlenir. */
function KaydetButonlari({ soruSayisi }: { soruSayisi: number }) {
  const { pending } = useFormStatus();
  const kapali = pending || soruSayisi === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="publish"
        value="1"
        className="btn-yesil"
        disabled={kapali}
        aria-busy={pending}
      >
        {pending ? 'Kaydediliyor...' : 'Kaydet ve Yayınla'}
      </button>
      <button
        type="submit"
        name="publish"
        value="0"
        className="btn-ikincil"
        disabled={kapali}
        aria-busy={pending}
      >
        Taslak Olarak Kaydet
      </button>
    </div>
  );
}

export default function YeniTestFormu() {
  const [durum, formAction] = useFormState(testOlustur, baslangicDurumu);

  const [baslik, setBaslik] = useState('');
  const [konu, setKonu] = useState('');
  const [sinif, setSinif] = useState(SINIF_SECENEKLERI[1]);
  const [aciklama, setAciklama] = useState('');
  const [soruSayisi, setSoruSayisi] = useState(4);
  const [sorular, setSorular] = useState<Soru[]>([]);

  const [uretimHatasi, setUretimHatasi] = useState<string | null>(null);
  const [uretiliyor, baslatUretim] = useTransition();

  function soruGuncelle(index: number, alan: keyof Soru, deger: string | number) {
    setSorular((onceki) =>
      onceki.map((s, i) => (i === index ? { ...s, [alan]: deger } : s))
    );
  }

  function soruSil(index: number) {
    setSorular((onceki) => onceki.filter((_, i) => i !== index));
  }

  function geminiIleUret() {
    setUretimHatasi(null);

    if (konu.trim().length < 2) {
      setUretimHatasi('Soru üretmek için önce bir konu girin.');
      return;
    }

    baslatUretim(async () => {
      const sonuc = await sorulariUret(konu, sinif, soruSayisi);
      if (sonuc.ok) {
        setSorular((onceki) => [...onceki, ...sonuc.sorular]);
      } else {
        setUretimHatasi(sonuc.hata);
      }
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Sorular, gizli bir alan üzerinden JSON olarak gönderilir. */}
      <input type="hidden" name="questions" value={JSON.stringify(sorular)} />

      {/* --- Test bilgileri --- */}
      <section className="kart space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Test bilgileri</h2>

        <div>
          <label htmlFor="title" className="etiket">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            placeholder="Örn. Algoritma ve Problem Çözme"
            className="girdi"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="topic" className="etiket">
              Konu
            </label>
            <input
              id="topic"
              name="topic"
              type="text"
              required
              value={konu}
              onChange={(e) => setKonu(e.target.value)}
              placeholder="Örn. Algoritma"
              className="girdi"
            />
          </div>

          <div>
            <label htmlFor="gradeLevel" className="etiket">
              Sınıf düzeyi
            </label>
            <select
              id="gradeLevel"
              name="gradeLevel"
              required
              value={sinif}
              onChange={(e) => setSinif(e.target.value)}
              className="girdi"
            >
              {SINIF_SECENEKLERI.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="etiket">
            Açıklama <span className="font-normal text-slate-400">(isteğe bağlı)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Bu testin amacını kısaca yazabilirsiniz."
            className="girdi resize-y"
          />
        </div>
      </section>

      {/* --- Gemini ile soru üretimi --- */}
      <section className="rounded-xl border border-brand-100 bg-brand-50 p-5">
        <h2 className="text-base font-semibold text-brand-900">Yapay zeka ile soru üret</h2>
        <p className="mt-1 text-sm text-brand-900/70">
          Konu ve sınıf düzeyine uygun açık uçlu sorular ile puanlama rubrikleri üretilir. Üretilen
          soruları kaydetmeden önce düzenleyebilirsiniz.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-32">
            <label htmlFor="soruSayisi" className="etiket">
              Soru sayısı
            </label>
            <select
              id="soruSayisi"
              value={soruSayisi}
              onChange={(e) => setSoruSayisi(Number(e.target.value))}
              className="girdi"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={geminiIleUret}
            disabled={uretiliyor}
            className="btn-birincil"
            aria-busy={uretiliyor}
          >
            {uretiliyor && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {uretiliyor ? 'Sorular üretiliyor...' : 'Gemini ile Soru Üret'}
          </button>

          <button
            type="button"
            onClick={() => setSorular((o) => [...o, bosSoru()])}
            className="btn-ikincil"
          >
            + Elle Soru Ekle
          </button>
        </div>

        {uretimHatasi && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {uretimHatasi}
          </p>
        )}
      </section>

      {/* --- Sorular --- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Sorular{' '}
            <span className="font-normal text-slate-500">({sorular.length})</span>
          </h2>
          {sorular.length > 0 && (
            <p className="text-sm text-slate-500">
              Toplam puan: {sorular.reduce((t, s) => t + (Number(s.maxScore) || 0), 0)}
            </p>
          )}
        </div>

        {sorular.length === 0 ? (
          <div className="kart text-center text-sm text-slate-500">
            Henüz soru yok. Yukarıdan yapay zeka ile üretebilir veya elle ekleyebilirsiniz.
          </div>
        ) : (
          sorular.map((soru, i) => (
            <div key={i} className="kart space-y-3">
              <div className="flex items-center justify-between">
                <span className="rozet bg-brand-50 text-brand-700">{i + 1}. Soru</span>
                <button
                  type="button"
                  onClick={() => soruSil(i)}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Sil
                </button>
              </div>

              <div>
                <label className="etiket">Soru metni</label>
                <textarea
                  rows={3}
                  value={soru.text}
                  onChange={(e) => soruGuncelle(i, 'text', e.target.value)}
                  className="girdi resize-y"
                  placeholder="Açık uçlu soru metnini yazın."
                />
              </div>

              <div>
                <label className="etiket">Puanlama rubriği</label>
                <textarea
                  rows={3}
                  value={soru.rubric}
                  onChange={(e) => soruGuncelle(i, 'rubric', e.target.value)}
                  className="girdi resize-y"
                  placeholder="Hangi ölçüt kaç puan getiriyor, açıkça yazın."
                />
                <p className="mt-1 text-xs text-slate-400">
                  Yapay zeka puanlamayı bu rubriğe göre yapar; ne kadar net olursa o kadar tutarlı
                  olur.
                </p>
              </div>

              <div className="w-32">
                <label className="etiket">Tam puan</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={soru.maxScore}
                  onChange={(e) => soruGuncelle(i, 'maxScore', Number(e.target.value))}
                  className="girdi"
                />
              </div>
            </div>
          ))
        )}
      </section>

      {durum?.hata && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {durum.hata}
        </p>
      )}

      <KaydetButonlari soruSayisi={sorular.length} />
    </form>
  );
}
