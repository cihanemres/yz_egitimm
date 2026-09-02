import UstBar from '@/components/ust-bar';
import { ogretmenGerekli } from '@/lib/yetki';

export default async function OgretmenDuzeni({ children }: { children: React.ReactNode }) {
  // Middleware'e ek olarak sunucu tarafında da rol denetimi yapılır.
  await ogretmenGerekli();

  return (
    <div className="flex min-h-screen flex-col">
      <UstBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
