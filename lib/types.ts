export type StationSummary = {
  station_id: string;
  station_name: string;
  governorate: string;
  ownership: string;
  broadcast_type: string;
  assessments_count: number;
  overall_average: number | null;
  category_averages: Record<string, number> | null;
  updated_at: string;
};

export type AssessmentExportRow = {
  station_name: string;
  governorate: string;
  ownership: string;
  broadcast_type: string;
  category: string;
  question_label: string;
  score: number;
  researcher_name: string;
  created_at: string;
};
