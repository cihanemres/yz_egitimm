'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OgrenciHatasi({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="kart mx-auto max-w-lg text-center">
      <h1 className="text-lg font-semibold text-slate-900">Sayfa yüklenemedi</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button onClick={reset} className="btn-birincil">
          Tekrar Dene
        </button>
        <Link href="/student" className="btn-ikincil">
          Panele Dön
        </Link>
      </div>
    </div>
  );
}
