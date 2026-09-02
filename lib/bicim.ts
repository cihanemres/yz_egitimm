/** Puanı gereksiz ondalık göstermeden biçimlendirir: 7 → "7", 7.5 → "7,5" */
export function puanBicimle(puan: number | null | undefined): string {
  if (puan === null || puan === undefined || Number.isNaN(puan)) return '-';
  const yuvarlanmis = Math.round(puan * 100) / 100;
  return Number.isInteger(yuvarlanmis)
    ? String(yuvarlanmis)
    : yuvarlanmis.toFixed(1).replace('.', ',');
}

/** Tarihi Türkçe biçimde gösterir. */
export function tarihBicimle(tarih: Date | string | null | undefined): string {
  if (!tarih) return '-';
  const d = typeof tarih === 'string' ? new Date(tarih) : tarih;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Başarı yüzdesine göre renk sınıfı üretir. */
export function puanRengi(puan: number, tamPuan: number): string {
  if (tamPuan <= 0) return 'text-slate-600 bg-slate-100';
  const oran = puan / tamPuan;
  if (oran >= 0.85) return 'text-emerald-700 bg-emerald-50';
  if (oran >= 0.6) return 'text-brand-700 bg-brand-50';
  if (oran >= 0.4) return 'text-amber-700 bg-amber-50';
  return 'text-rose-700 bg-rose-50';
}
