export default function Yukleniyor() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
          aria-hidden="true"
        />
        <p className="text-sm text-slate-500">Yükleniyor...</p>
      </div>
    </div>
  );
}
