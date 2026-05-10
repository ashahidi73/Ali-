"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("أضف مفاتيح Supabase في ملف البيئة لتفعيل تسجيل الدخول.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/assessment");
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-xl card">
        <p className="text-sm font-bold text-yemen-red">دخول الباحث</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">تسجيل الدخول إلى منصة التقييم</h1>
        <p className="mt-3 leading-7 text-slate-600">استخدم حساب الباحث المنشأ في Supabase Auth. بعد الدخول يمكن حفظ التقييمات باسم الباحث ومتابعة النتائج.</p>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
            لم يتم ضبط <code>NEXT_PUBLIC_SUPABASE_URL</code> و <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> بعد، لذلك يعمل النموذج في وضع الواجهة فقط.
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="field-label" htmlFor="email">البريد الإلكتروني</label>
            <input id="email" className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="researcher@example.org" required />
          </div>
          <div>
            <label className="field-label" htmlFor="password">كلمة المرور</label>
            <input id="password" className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
          </div>
          {message && <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">{message}</p>}
          <button className="primary-button w-full" type="submit" disabled={loading}>{loading ? "جاري الدخول..." : "دخول الباحث"}</button>
        </form>
      </section>
    </AppShell>
  );
}
