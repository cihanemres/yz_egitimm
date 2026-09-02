'use client';

import { useFormState } from 'react-dom';

import GonderButonu from '@/components/gonder-butonu';
import { kayitOl, type KayitDurumu } from './actions';

const baslangic: KayitDurumu = undefined;

export default function KayitFormu() {
  const [durum, formAction] = useFormState(kayitOl, baslangic);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="etiket">
          Ad Soyad
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Örn. Elif Yılmaz"
          className="girdi"
        />
      </div>

      <div>
        <label htmlFor="email" className="etiket">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@okul.com"
          className="girdi"
        />
      </div>

      <div>
        <label htmlFor="password" className="etiket">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          className="girdi"
        />
      </div>

      <fieldset>
        <legend className="etiket">Rolünüz</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-300 p-3 text-sm transition hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
            <input
              type="radio"
              name="role"
              value="STUDENT"
              defaultChecked
              className="mt-0.5 accent-brand-600"
            />
            <span>
              <span className="block font-medium text-slate-900">Öğrenci</span>
              <span className="block text-xs text-slate-500">Testlere girer</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-300 p-3 text-sm transition hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
            <input type="radio" name="role" value="TEACHER" className="mt-0.5 accent-brand-600" />
            <span>
              <span className="block font-medium text-slate-900">Öğretmen</span>
              <span className="block text-xs text-slate-500">Test oluşturur</span>
            </span>
          </label>
        </div>
      </fieldset>

      {durum?.hata && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {durum.hata}
        </p>
      )}

      <GonderButonu className="btn-birincil w-full" bekleyenMetin="Hesap oluşturuluyor...">
        Kayıt Ol
      </GonderButonu>
    </form>
  );
}
