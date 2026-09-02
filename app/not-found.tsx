import Link from 'next/link';

export default function BulunamadiSayfasi() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="kart w-full max-w-md text-center">
        <p className="text-3xl font-bold text-slate-300">404</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-slate-600">
          Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
        </p>
        <Link href="/" className="btn-birincil mt-5">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
