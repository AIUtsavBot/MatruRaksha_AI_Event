-- MatruRaksha Supabase schema aligned with backend expectations

create table if not exists public.mothers (
  id bigserial primary key,
  name text not null,
  phone text unique not null,
  age int,
  gravida int,
  parity int,
  bmi numeric,
  location text,
  preferred_language text,
  telegram_chat_id text,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  appointment_type text not null,
  appointment_date timestamptz not null,
  notes text,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.health_timeline (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  blood_pressure text,
  hemoglobin numeric,
  sugar_level numeric,
  weight numeric,
  concerns jsonb,
  summary text,
  event_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.medical_reports (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  filename text,
  upload_date timestamptz,
  analysis_summary text,
  health_metrics jsonb,
  concerns jsonb,
  recommendations jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.health_metrics (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  weight_kg numeric,
  blood_pressure_systolic int,
  blood_pressure_diastolic int,
  hemoglobin numeric,
  blood_sugar numeric,
  measured_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.context_memory (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  memory_key text not null,
  memory_value text not null,
  memory_type text,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  message_role text not null,
  message_content text not null,
  context_used jsonb,
  agent_response jsonb,
  created_at timestamptz default now()
);

create table if not exists public.agents (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  agent_config jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_mothers_phone on public.mothers(phone);
create index if not exists idx_appointments_mother_id on public.appointments(mother_id);
create index if not exists idx_timeline_mother_id on public.health_timeline(mother_id);
create index if not exists idx_reports_mother_id on public.medical_reports(mother_id);
create index if not exists idx_metrics_mother_id on public.health_metrics(mother_id);
create index if not exists idx_context_memory_mother_id on public.context_memory(mother_id);
create index if not exists idx_conversations_mother_id on public.conversations(mother_id);
create index if not exists idx_agents_mother_id on public.agents(mother_id);

-- ===== PHASE 1: Schema Upgrades =====
alter table public.mothers
  add column if not exists medical_history jsonb default '{"conditions": [], "medications": [], "trend_analysis": "No prior history."}'::jsonb;

create table if not exists public.asha_workers (
  id bigserial primary key,
  name text not null,
  phone text,
  assigned_area text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.asha_workers (name, phone, assigned_area, is_active)
  values
  ('Seema Patil', '9000000001', 'Pune', true),
  ('Rakesh Kumar', '9000000002', 'Mumbai', true),
  ('Anita Joshi', '9000000003', 'Nashik', true)
on conflict do nothing;

alter table public.mothers
  add column if not exists asha_worker_id bigint references public.asha_workers(id);

create table if not exists public.case_discussions (
  id bigserial primary key,
  mother_id bigint references public.mothers(id) on delete cascade,
  sender_role text not null,
  sender_name text,
  message text not null,
  created_at timestamptz default now()
);

alter publication supabase_realtime add table public.case_discussions;
alter publication supabase_realtime add table public.risk_assessments;
alter publication supabase_realtime add table public.mothers;

-- ===== Doctor Management (Proximity Assignment) =====
create table if not exists public.doctors (
  id bigserial primary key,
  name text not null,
  phone text,
  assigned_area text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.doctors (name, phone, assigned_area, is_active)
  values
  ('Dr. Meera Shah', '9100000001', 'Pune', true),
  ('Dr. Arjun Rao', '9100000002', 'Mumbai', true),
  ('Dr. Kavita Desai', '9100000003', 'Nashik', true)
on conflict do nothing;

alter table public.mothers
  add column if not exists doctor_id bigint references public.doctors(id);

-- Ensure appointments have a constrained status and realtime replication
alter table public.appointments
  alter column status drop default;

-- Create status enum-like constraint if not already present
alter table public.appointments
  add constraint if not exists chk_appointments_status
  check (status in ('scheduled','confirmed','completed','missed','cancelled'));

-- Add facility column if missing
do $ begin
  alter table public.appointments add column facility text;
exception when duplicate_column then null;
end $;

-- Add to realtime publication as well
alter publication supabase_realtime add table public.appointments;

-- Case discussions sender role constraint
alter table public.case_discussions
  add constraint if not exists chk_case_discussions_sender_role
  check (sender_role in ('MOTHER','ASHA','DOCTOR','SYSTEM'));
