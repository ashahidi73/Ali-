# منصة تقييم الإذاعات اليمنية

تطبيق Next.js بواجهة عربية RTL لتقييم محطات الإذاعة اليمنية. يدعم تسجيل دخول الباحثين عبر Supabase Auth، حفظ التقييمات في PostgreSQL، لوحة مؤشرات للمتوسطات، وتصدير النتائج إلى Excel وPDF.

## المزايا

- تسجيل دخول الباحثين بالبريد وكلمة المرور.
- نموذج ملف محطة إذاعية يشمل الاسم، المحافظة، الملكية، نطاق البث، التردد، والجمهور المستهدف.
- نموذج تقييم متعدد الأقسام بأسئلة ليكرت من 1 إلى 5.
- خصائص برامج بنعم/لا.
- حقول مفتوحة لنقاط القوة، نقاط الضعف، وفرص التطوير.
- حفظ البيانات في Supabase PostgreSQL.
- لوحة نتائج تعرض متوسطات المحطات والفئات وعدد التقييمات.
- تصدير بيانات التقييم إلى Excel وPDF.
- تصميم responsive يدعم RTL Arabic بالكامل.

## التشغيل المحلي

```bash
npm install
npm run dev
```

انسخ متغيرات البيئة التالية إلى ملف `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## إعداد قاعدة البيانات

1. أنشئ مشروع Supabase جديداً.
2. افتح SQL Editor.
3. نفّذ محتوى الملف `supabase/schema.sql`.
4. أنشئ حسابات الباحثين من Authentication > Users.
5. شغّل التطبيق، سجّل الدخول، ثم ابدأ إضافة التقييمات.

## بنية البيانات

- `radio_stations`: ملفات المحطات.
- `assessments`: بيانات التقييم العامة والملاحظات النوعية.
- `assessment_scores`: درجات ليكرت لكل سؤال وفئة.
- `program_characteristics`: خصائص البرامج بنعم/لا.
- `station_category_summary`: View للوحة المؤشرات.
- `assessment_export_rows`: View لتصدير Excel وPDF.
