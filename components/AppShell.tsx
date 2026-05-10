import Link from "next/link";
import { RadioTower } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yemen-red text-white">
              <RadioTower aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-extrabold text-slate-950">مرصد الإذاعات اليمنية</span>
              <span className="text-sm text-slate-500">تقييم بحثي موحد للمحطات والبرامج</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-bold">
            <Link className="secondary-button !px-4 !py-2" href="/assessment">تقييم جديد</Link>
            <Link className="secondary-button !px-4 !py-2" href="/dashboard">لوحة النتائج</Link>
            <Link className="primary-button !px-4 !py-2" href="/login">دخول الباحث</Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
