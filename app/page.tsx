import Link from "next/link";
import { BarChart3, ClipboardCheck, Database, FileDown, LockKeyhole, Radio } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const features = [
  { icon: LockKeyhole, title: "دخول الباحثين", text: "مصادقة عبر Supabase Auth لضمان أن كل تقييم مرتبط بباحث معتمد." },
  { icon: Radio, title: "ملف المحطة", text: "توثيق بيانات المحطة، المحافظة، نوع الملكية، نطاق البث، والجمهور المستهدف." },
  { icon: ClipboardCheck, title: "نموذج تقييم متعدد الأقسام", text: "أسئلة ليكرت من 1 إلى 5، خصائص برامج بنعم/لا، وملاحظات نوعية مفتوحة." },
  { icon: Database, title: "حفظ في PostgreSQL", text: "تخزين منظم في Supabase مع جداول للتقييمات، الدرجات، والخصائص." },
  { icon: BarChart3, title: "لوحة مؤشرات", text: "متوسطات المحطات والفئات، وعدد التقييمات، وآخر تحديث." },
  { icon: FileDown, title: "تصدير Excel و PDF", text: "تنزيل النتائج للتحليل والمشاركة مع فرق البحث وصناع القرار." },
];

export default function HomePage() {
  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="card p-8 sm:p-10">
          <p className="mb-4 inline-flex rounded-full bg-yemen-red/10 px-4 py-2 text-sm font-bold text-yemen-red">واجهة عربية RTL بالكامل</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">منصة بحثية لتقييم جودة وأثر محطات الإذاعة اليمنية</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">اجمع بيانات موحدة من الباحثين، قيّم المحتوى والإنتاج والأثر والحوكمة، ثم اعرض المتوسطات والتقارير القابلة للتصدير من قاعدة Supabase PostgreSQL.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/assessment" className="primary-button">ابدأ تقييم محطة</Link>
            <Link href="/dashboard" className="secondary-button">استعرض لوحة النتائج</Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
            <span className="text-sm text-white/60">مقياس موحد</span>
            <strong className="mt-2 block text-5xl">1–5</strong>
            <p className="mt-3 leading-7 text-white/70">درجات ليكرت لكل سؤال مع احتساب متوسط كل فئة ومحطة تلقائياً.</p>
          </div>
          <div className="rounded-[2rem] bg-yemen-green p-6 text-white shadow-soft">
            <span className="text-sm text-white/70">بيانات قابلة للتحليل</span>
            <strong className="mt-2 block text-5xl">PDF + Excel</strong>
            <p className="mt-3 leading-7 text-white/80">تقارير جاهزة للاجتماعات البحثية وخطط التطوير.</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="card">
            <feature.icon className="mb-4 h-8 w-8 text-yemen-red" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-slate-950">{feature.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{feature.text}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
