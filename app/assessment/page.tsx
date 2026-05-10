"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { allQuestions, assessmentSections, programCharacteristics } from "@/lib/questions";
import { supabase } from "@/lib/supabase";

const ownershipOptions = ["حكومية", "مجتمعية", "خاصة", "حزبية/منظمة", "أخرى"];
const broadcastOptions = ["FM", "AM", "إنترنت", "هجين"];

export default function AssessmentPage() {
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(allQuestions.map((question) => [question.id, 3])));
  const [characteristics, setCharacteristics] = useState<Record<string, boolean>>(() => Object.fromEntries(programCharacteristics.map((item) => [item.id, false])));
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const overallAverage = useMemo(() => {
    const values = Object.values(scores);
    return values.reduce((total, score) => total + score, 0) / values.length;
  }, [scores]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const stationPayload = {
      name: String(formData.get("station_name")),
      governorate: String(formData.get("governorate")),
      ownership: String(formData.get("ownership")),
      broadcast_type: String(formData.get("broadcast_type")),
      frequency: String(formData.get("frequency") || ""),
      target_audience: String(formData.get("target_audience") || ""),
    };

    const assessmentPayload = {
      researcher_name: String(formData.get("researcher_name")),
      assessment_date: String(formData.get("assessment_date")),
      strengths: String(formData.get("strengths")),
      weaknesses: String(formData.get("weaknesses")),
      opportunities: String(formData.get("opportunities")),
      overall_average: Number(overallAverage.toFixed(2)),
    };

    if (!supabase) {
      setStatus("error");
      setMessage("لم يتم حفظ البيانات لأن إعدادات Supabase غير مضبوطة. راجع ملف README لإضافة مفاتيح البيئة.");
      return;
    }

    const { data: station, error: stationError } = await supabase
      .from("radio_stations")
      .upsert(stationPayload, { onConflict: "name,governorate" })
      .select("id")
      .single();

    if (stationError || !station) {
      setStatus("error");
      setMessage(stationError?.message ?? "تعذر حفظ ملف المحطة.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({ ...assessmentPayload, station_id: station.id, researcher_id: userData.user?.id ?? null })
      .select("id")
      .single();

    if (assessmentError || !assessment) {
      setStatus("error");
      setMessage(assessmentError?.message ?? "تعذر حفظ التقييم.");
      return;
    }

    const scoreRows = allQuestions.map((question) => ({
      assessment_id: assessment.id,
      question_id: question.id,
      question_label: question.label,
      category: question.category,
      score: scores[question.id],
    }));

    const characteristicRows = programCharacteristics.map((item) => ({
      assessment_id: assessment.id,
      characteristic_id: item.id,
      characteristic_label: item.label,
      value: characteristics[item.id],
    }));

    const [{ error: scoresError }, { error: characteristicsError }] = await Promise.all([
      supabase.from("assessment_scores").insert(scoreRows),
      supabase.from("program_characteristics").insert(characteristicRows),
    ]);

    if (scoresError || characteristicsError) {
      setStatus("error");
      setMessage(scoresError?.message ?? characteristicsError?.message ?? "تم حفظ التقييم دون كل التفاصيل.");
      return;
    }

    setStatus("success");
    setMessage("تم حفظ تقييم المحطة بنجاح في قاعدة البيانات.");
    event.currentTarget.reset();
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card">
          <p className="text-sm font-bold text-yemen-red">نموذج موحد</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950">تقييم محطة إذاعية يمنية</h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">املأ ملف المحطة، ثم قيّم الأقسام بمقياس ليكرت من 1 (ضعيف جداً) إلى 5 (ممتاز)، وحدد خصائص البرامج واكتب الملاحظات النوعية.</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <span className="text-sm text-white/60">المتوسط الحالي</span>
              <strong className="block text-3xl">{overallAverage.toFixed(2)} / 5</strong>
            </div>
          </div>
        </section>

        <section className="card grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="researcher_name">اسم الباحث</label>
            <input className="field-input" id="researcher_name" name="researcher_name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="assessment_date">تاريخ التقييم</label>
            <input className="field-input" id="assessment_date" name="assessment_date" type="date" required />
          </div>
          <div>
            <label className="field-label" htmlFor="station_name">اسم المحطة</label>
            <input className="field-input" id="station_name" name="station_name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="governorate">المحافظة</label>
            <input className="field-input" id="governorate" name="governorate" placeholder="صنعاء، عدن، تعز..." required />
          </div>
          <div>
            <label className="field-label" htmlFor="ownership">نوع الملكية</label>
            <select className="field-input" id="ownership" name="ownership" required>{ownershipOptions.map((option) => <option key={option}>{option}</option>)}</select>
          </div>
          <div>
            <label className="field-label" htmlFor="broadcast_type">نطاق البث</label>
            <select className="field-input" id="broadcast_type" name="broadcast_type" required>{broadcastOptions.map((option) => <option key={option}>{option}</option>)}</select>
          </div>
          <div>
            <label className="field-label" htmlFor="frequency">التردد/الرابط</label>
            <input className="field-input" id="frequency" name="frequency" placeholder="مثال: 99.9 FM" />
          </div>
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="target_audience">الجمهور المستهدف</label>
            <input className="field-input" id="target_audience" name="target_audience" placeholder="الشباب، الأسر، الريف، جمهور عام..." />
          </div>
        </section>

        {assessmentSections.map((section) => (
          <section key={section.key} className="card">
            <h2 className="text-2xl font-extrabold text-slate-950">{section.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{section.description}</p>
            <div className="mt-6 space-y-5">
              {section.questions.map((question) => (
                <div key={question.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <label className="font-bold text-slate-800" htmlFor={question.id}>{question.label}</label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full border text-sm font-extrabold transition ${scores[question.id] === value ? "border-yemen-red bg-yemen-red text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                          <input className="sr-only" type="radio" name={question.id} value={value} checked={scores[question.id] === value} onChange={() => setScores((current) => ({ ...current, [question.id]: value }))} />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="card">
          <h2 className="text-2xl font-extrabold text-slate-950">خصائص البرامج</h2>
          <p className="mt-2 leading-7 text-slate-600">اختر نعم أو لا لكل خاصية قائمة في الدورة البرامجية للمحطة.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programCharacteristics.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-800">{item.label}</p>
                <div className="mt-3 flex gap-2">
                  {[true, false].map((value) => (
                    <button key={String(value)} type="button" onClick={() => setCharacteristics((current) => ({ ...current, [item.id]: value }))} className={`flex-1 rounded-xl px-3 py-2 font-bold transition ${characteristics[item.id] === value ? "bg-yemen-green text-white" : "bg-white text-slate-600"}`}>{value ? "نعم" : "لا"}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card grid gap-5 lg:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="strengths">نقاط القوة</label>
            <textarea className="field-input min-h-36" id="strengths" name="strengths" required />
          </div>
          <div>
            <label className="field-label" htmlFor="weaknesses">نقاط الضعف</label>
            <textarea className="field-input min-h-36" id="weaknesses" name="weaknesses" required />
          </div>
          <div>
            <label className="field-label" htmlFor="opportunities">فرص التطوير</label>
            <textarea className="field-input min-h-36" id="opportunities" name="opportunities" required />
          </div>
        </section>

        <section className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="leading-7 text-slate-600">سيتم حفظ ملف المحطة، درجات ليكرت، خصائص نعم/لا، والملاحظات النوعية في Supabase PostgreSQL.</div>
          <button className="primary-button min-w-48" type="submit" disabled={status === "saving"}>{status === "saving" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} حفظ التقييم</button>
        </section>
        {message && <p className={`rounded-2xl p-4 font-bold ${status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
      </form>
    </AppShell>
  );
}
