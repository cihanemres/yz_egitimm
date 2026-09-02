import UstBar from '@/components/ust-bar';
import { kullaniciGerekli } from '@/lib/yetki';

export default async function OgrenciDuzeni({ children }: { children: React.ReactNode }) {
  // Rol denetimi sayfa bazında yapılır: sonuç sayfasını öğretmen de görebilir.
  await kullaniciGerekli();

  return (
    <div className="flex min-h-screen flex-col">
      <UstBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
