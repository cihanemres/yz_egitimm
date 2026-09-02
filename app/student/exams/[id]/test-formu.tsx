'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { testiBitir, type TeslimDurumu } from '@/app/student/actions';

type Soru = {
  id: string;
  order: number;
  text: string;
  maxScore: number;
};

const baslangic: TeslimDurumu = undefined;

/** Gönderim sırasında tüm sayfayı kaplayan "Değerlendiriliyor..." katmanı. */
function DegerlendirmeKatmani() {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg">
        <span
          className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
          aria-hidden="true"
        />
        <p className="mt-4 text-base font-semibold text-slate-900">Değerlendiriliyor...</p>
        <p className="mt-1 text-sm text-slate-500">
          Yanıtların yapay zeka tarafından inceleniyor. Bu işlem birkaç saniye sürebilir, lütfen
          sayfayı kapatma.
        </p>
      </div>
    </div>
  );
}

/** Boş yanıt varsa onay isteyen "Testi Bitir" butonu. */
function BitirButonu({ yanitlar, toplamSoru }: { yanitlar: Record<string, string>; toplamSoru: number }) {
  const { pending } = useFormStatus();

  function kontrolEt(e: React.MouseEvent<HTMLButtonElement>) {
    const bosSayisi =
      toplamSoru - Object.values(yanitlar).filter((y) => y.trim().length > 0).length;

    if (bosSayisi > 0) {
      const onay = window.confirm(
        `${bosSayisi} soruyu boş bıraktın. Boş bırakılan sorular 0 puan alacak.\n\nTesti yine de bitirmek istiyor musun?`
      );
      if (!onay) e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={kontrolEt}
      className="btn-yesil px-6 py-2.5"
      disabled={pending}
      aria-busy={pending}
    >
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      )}
      {pending ? 'Değerlendiriliyor...' : 'Testi Bitir'}
    </button>
  );
}

export default function TestFormu({ examId, sorular }: { examId: string; sorular: Soru[] }) {
  const [durum, formAction] = useFormState(testiBitir, baslangic);

  const [yanitlar, setYanitlar] = useState<Record<string, string>>(() =>
    Object.fromEntries(sorular.map((s) => [s.id, '']))
  );

  const yanitlananSayisi = Object.values(yanitlar).filter((y) => y.trim().length > 0).length;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="examId" value={examId} />

      <DegerlendirmeKatmani />

      {/* İlerleme */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {yanitlananSayisi} / {sorular.length} soru yanıtlandı
          </span>
          <span className="text-slate-500">
            Tam puan: {sorular.reduce((t, s) => t + s.maxScore, 0)}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{
              width: `${sorular.length ? (yanitlananSayisi / sorular.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Sorular */}
      {sorular.map((soru) => (
        <div key={soru.id} className="kart">
          <div className="flex items-start justify-between gap-3">
            <span className="rozet shrink-0 bg-brand-50 text-brand-700">{soru.order}. Soru</span>
            <span className="shrink-0 text-xs text-slate-500">{soru.maxScore} puan</span>
          </div>

          <p className="mt-3 text-base font-medium leading-relaxed text-slate-900">{soru.text}</p>

          <label htmlFor={`answer-${soru.id}`} className="sr-only">
            {soru.order}. sorunun yanıtı
          </label>
          <textarea
            id={`answer-${soru.id}`}
            name={`answer-${soru.id}`}
            rows={5}
            maxLength={5000}
            value={yanitlar[soru.id] ?? ''}
            onChange={(e) =>
              setYanitlar((onceki) => ({ ...onceki, [soru.id]: e.target.value }))
            }
            placeholder="Yanıtını buraya yaz..."
            className="girdi mt-3 resize-y"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {(yanitlar[soru.id] ?? '').length} / 5000
          </p>
        </div>
      ))}

      {durum?.hata && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {durum.hata}
        </p>
      )}

      <div className="flex flex-col items-center gap-2 pb-4">
        <BitirButonu yanitlar={yanitlar} toplamSoru={sorular.length} />
        <p className="text-xs text-slate-500">
          Testi bitirdiğinde yanıtların değerlendirilecek ve puanını hemen göreceksin.
        </p>
      </div>
    </form>
  );
}
