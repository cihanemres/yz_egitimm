'use client';

import { useFormState } from 'react-dom';

import GonderButonu from '@/components/gonder-butonu';
import { girisYap, type GirisDurumu } from './actions';

const baslangic: GirisDurumu = undefined;

export default function GirisFormu() {
  const [durum, formAction] = useFormState(girisYap, baslangic);

  return (
    <form action={formAction} className="space-y-4">
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
          autoComplete="current-password"
          placeholder="Şifreniz"
          className="girdi"
        />
      </div>

      {durum?.hata && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {durum.hata}
        </p>
      )}

      <GonderButonu className="btn-birincil w-full" bekleyenMetin="Giriş yapılıyor...">
        Giriş Yap
      </GonderButonu>
    </form>
  );
}
