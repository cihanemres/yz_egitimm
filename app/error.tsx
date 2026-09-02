'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Hata({
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="kart w-full max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={reset} className="btn-birincil">
            Tekrar Dene
          </button>
          <Link href="/" className="btn-ikincil">
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
