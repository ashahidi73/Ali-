create extension if not exists "uuid-ossp";

create table if not exists public.radio_stations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  governorate text not null,
  ownership text not null,
  broadcast_type text not null,
  frequency text,
  target_audience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, governorate)
);

create table if not exists public.assessments (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid not null references public.radio_stations(id) on delete cascade,
  researcher_id uuid references auth.users(id) on delete set null,
  researcher_name text not null,
  assessment_date date not null,
  strengths text not null,
  weaknesses text not null,
  opportunities text not null,
  overall_average numeric(4, 2) not null check (overall_average between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_scores (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id text not null,
  question_label text not null,
  category text not null,
  score integer not null check (score between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.program_characteristics (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  characteristic_id text not null,
  characteristic_label text not null,
  value boolean not null,
  created_at timestamptz not null default now()
);

alter table public.radio_stations enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.program_characteristics enable row level security;

create policy "authenticated researchers can manage radio stations"
  on public.radio_stations for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated researchers can manage assessments"
  on public.assessments for all
  to authenticated
  using (true)
  with check (auth.uid() = researcher_id or researcher_id is null);

create policy "authenticated researchers can manage scores"
  on public.assessment_scores for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated researchers can manage characteristics"
  on public.program_characteristics for all
  to authenticated
  using (true)
  with check (true);

create or replace view public.station_category_summary
with (security_invoker = true) as
with category_averages as (
  select
    a.station_id,
    s.category,
    round(avg(s.score)::numeric, 2) as category_average
  from public.assessments a
  join public.assessment_scores s on s.assessment_id = a.id
  group by a.station_id, s.category
), category_json as (
  select
    station_id,
    jsonb_object_agg(category, category_average) as category_averages
  from category_averages
  group by station_id
), assessment_counts as (
  select
    station_id,
    count(*)::integer as assessments_count,
    round(avg(overall_average)::numeric, 2) as overall_average,
    max(created_at) as updated_at
  from public.assessments
  group by station_id
)
select
  rs.id as station_id,
  rs.name as station_name,
  rs.governorate,
  rs.ownership,
  rs.broadcast_type,
  coalesce(ac.assessments_count, 0) as assessments_count,
  ac.overall_average,
  cj.category_averages,
  ac.updated_at
from public.radio_stations rs
left join assessment_counts ac on ac.station_id = rs.id
left join category_json cj on cj.station_id = rs.id;

create or replace view public.assessment_export_rows
with (security_invoker = true) as
select
  rs.name as station_name,
  rs.governorate,
  rs.ownership,
  rs.broadcast_type,
  s.category,
  s.question_label,
  s.score,
  a.researcher_name,
  a.created_at
from public.assessment_scores s
join public.assessments a on a.id = s.assessment_id
join public.radio_stations rs on rs.id = a.station_id;
