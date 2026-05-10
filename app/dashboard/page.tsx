"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, RefreshCcw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { AssessmentExportRow, StationSummary } from "@/lib/types";

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<StationSummary[]>([]);
  const [exportRows, setExportRows] = useState<AssessmentExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    summaries.forEach((summary) => Object.keys(summary.category_averages ?? {}).forEach((category) => names.add(category)));
    return Array.from(names);
  }, [summaries]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("أضف إعدادات Supabase لعرض البيانات الحية. تظهر اللوحة فارغة حالياً.");
      setLoading(false);
      return;
    }

    const [{ data: summaryData, error: summaryError }, { data: exportData, error: exportError }] = await Promise.all([
      supabase.from("station_category_summary").select("*").order("overall_average", { ascending: false }),
      supabase.from("assessment_export_rows").select("*").order("created_at", { ascending: false }),
    ]);

    if (summaryError || exportError) {
      setMessage(summaryError?.message ?? exportError?.message ?? "تعذر تحميل بيانات اللوحة.");
    } else {
      setSummaries((summaryData ?? []) as StationSummary[]);
      setExportRows((exportData ?? []) as AssessmentExportRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(exportRows.map((row) => ({
      "المحطة": row.station_name,
      "المحافظة": row.governorate,
      "الملكية": row.ownership,
      "البث": row.broadcast_type,
      "الفئة": row.category,
      "السؤال": row.question_label,
      "الدرجة": row.score,
      "الباحث": row.researcher_name,
      "تاريخ الإدخال": row.created_at,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "نتائج التقييم");
    XLSX.writeFile(workbook, "نتائج-تقييم-الاذاعات-اليمنية.xlsx");
  }

  function exportPdf() {
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.setFontSize(16);
    pdf.text("Yemeni Radio Assessment Results", 14, 16);
    autoTable(pdf, {
      head: [["Station", "Governorate", "Category", "Score", "Researcher", "Created"]],
      body: exportRows.map((row) => [row.station_name, row.governorate, row.category, row.score, row.researcher_name, new Date(row.created_at).toLocaleDateString("ar")]),
      startY: 24,
      styles: { fontSize: 8, halign: "right" },
      headStyles: { fillColor: [206, 17, 38] },
    });
    pdf.save("radio-assessment-results.pdf");
  }

  return (
    <AppShell>
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-yemen-red">لوحة النتائج</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">متوسطات التقييم حسب المحطة والفئة</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">تعرض هذه اللوحة ملخصاً مباشراً من قاعدة PostgreSQL يتضمن متوسط كل محطة، متوسط كل فئة، وعدد التقييمات المتاحة للتصدير.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadDashboard} className="secondary-button" type="button"><RefreshCcw size={18} /> تحديث</button>
            <button onClick={exportExcel} className="primary-button" type="button" disabled={!exportRows.length}><FileSpreadsheet size={18} /> Excel</button>
            <button onClick={exportPdf} className="secondary-button" type="button" disabled={!exportRows.length}><Download size={18} /> PDF</button>
          </div>
        </div>
        {message && <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-amber-800">{message}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card"><span className="text-sm text-slate-500">عدد المحطات</span><strong className="mt-2 block text-4xl text-slate-950">{summaries.length}</strong></div>
        <div className="card"><span className="text-sm text-slate-500">عدد التقييمات</span><strong className="mt-2 block text-4xl text-slate-950">{summaries.reduce((total, item) => total + item.assessments_count, 0)}</strong></div>
        <div className="card"><span className="text-sm text-slate-500">متوسط عام</span><strong className="mt-2 block text-4xl text-slate-950">{summaries.length ? (summaries.reduce((total, item) => total + Number(item.overall_average ?? 0), 0) / summaries.length).toFixed(2) : "0.00"}</strong></div>
      </section>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-3 text-right">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="px-4 py-2">المحطة</th>
                <th className="px-4 py-2">المحافظة</th>
                <th className="px-4 py-2">الملكية</th>
                <th className="px-4 py-2">البث</th>
                <th className="px-4 py-2">التقييمات</th>
                <th className="px-4 py-2">المتوسط</th>
                {categoryNames.map((category) => <th key={category} className="px-4 py-2">{category}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="rounded-2xl bg-slate-50 p-6 text-center" colSpan={6 + categoryNames.length}>جاري تحميل البيانات...</td></tr>
              ) : summaries.length ? summaries.map((summary) => (
                <tr key={summary.station_id} className="bg-slate-50 align-top">
                  <td className="rounded-r-2xl px-4 py-4 font-extrabold text-slate-950">{summary.station_name}</td>
                  <td className="px-4 py-4">{summary.governorate}</td>
                  <td className="px-4 py-4">{summary.ownership}</td>
                  <td className="px-4 py-4">{summary.broadcast_type}</td>
                  <td className="px-4 py-4">{summary.assessments_count}</td>
                  <td className="px-4 py-4 font-extrabold text-yemen-red">{Number(summary.overall_average ?? 0).toFixed(2)}</td>
                  {categoryNames.map((category) => <td key={category} className="px-4 py-4">{Number(summary.category_averages?.[category] ?? 0).toFixed(2)}</td>)}
                </tr>
              )) : (
                <tr><td className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500" colSpan={6 + categoryNames.length}>لا توجد تقييمات محفوظة بعد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
