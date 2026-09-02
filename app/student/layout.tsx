import { signOut, auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/login");

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden text-slate-900">
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
        <Link href="/student" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-indigo-900">SözlüAI</span>
          <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded uppercase tracking-wider">Beta</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700">{session.user.name}</span>
            <form action={async () => { "use server"; await signOut(); }}>
              <button className="text-[10px] text-red-500 font-bold uppercase hover:underline">Çıkış Yap</button>
            </form>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
            {session.user.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </nav>
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
