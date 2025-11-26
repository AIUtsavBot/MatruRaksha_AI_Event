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