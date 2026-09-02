"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="bg-white p-8 rounded-xl border border-red-100 shadow-sm text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Bir Hata Oluştu</h2>
        <p className="text-slate-600 mb-6">{error.message || "Bilinmeyen bir hata meydana geldi."}</p>
        <button
          onClick={() => reset()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
