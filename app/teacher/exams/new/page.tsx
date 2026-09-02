import Link from 'next/link';

import YeniTestFormu from './yeni-test-formu';

export const metadata = { title: 'Yeni Test — SözlüAI' };

export default function YeniTestSayfasi() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/teacher" className="text-sm text-slate-500 hover:text-slate-700">
          ← Testlerim
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Yeni test oluştur</h1>
        <p className="mt-1 text-sm text-slate-500">
          Soruları yapay zeka ile üretebilir, dilediğiniz gibi düzenleyip yayınlayabilirsiniz.
        </p>
      </div>

      <YeniTestFormu />
    </div>
  );
}
