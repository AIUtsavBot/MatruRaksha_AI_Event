-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agents (
  id bigint NOT NULL DEFAULT nextval('agents_id_seq'::regclass),
  mother_id uuid,
  agent_config jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agents_pkey PRIMARY KEY (id),
  CONSTRAINT agents_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  facility text NOT NULL,
  appointment_date timestamp with time zone NOT NULL,
  assigned_asha uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'completed'::text, 'missed'::text, 'cancelled'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  appointment_type text,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.asha_workers (
  id bigint NOT NULL DEFAULT nextval('asha_workers_id_seq'::regclass),
  name text NOT NULL,
  phone text,
  assigned_area text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  user_profile_id uuid,
  email text,
  CONSTRAINT asha_workers_pkey PRIMARY KEY (id),
  CONSTRAINT asha_workers_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.axorra_chat_histories (
  id integer NOT NULL DEFAULT nextval('axorra_chat_histories_id_seq'::regclass),
  session_id character varying NOT NULL,
  message jsonb NOT NULL,
  CONSTRAINT axorra_chat_histories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.case_discussions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role = ANY (ARRAY['DOCTOR'::text, 'ASHA'::text, 'ADMIN'::text])),
  sender_name text,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT case_discussions_pkey PRIMARY KEY (id),
  CONSTRAINT case_discussions_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.context_memory (
  id bigint NOT NULL DEFAULT nextval('context_memory_id_seq'::regclass),
  mother_id uuid,
  memory_key text NOT NULL,
  memory_value text NOT NULL,
  memory_type text,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT context_memory_pkey PRIMARY KEY (id),
  CONSTRAINT context_memory_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.conversations (
  id bigint NOT NULL DEFAULT nextval('conversations_id_seq'::regclass),
  mother_id uuid,
  message_role text NOT NULL,
  message_content text NOT NULL,
  context_used jsonb,
  agent_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.doctors (
  id bigint NOT NULL DEFAULT nextval('doctors_id_seq'::regclass),
  name text NOT NULL,
  phone text,
  assigned_area text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  user_profile_id uuid,
  email text,
  degree_cert_url text,
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.emergency_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  symptoms ARRAY,
  severity text,
  response jsonb,
  status text DEFAULT 'active'::text,
  ambulance_dispatched boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT emergency_incidents_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_incidents_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.health_metrics (
  id uuid NOT NULL,
  mother_id uuid,
  weight_kg numeric,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  hemoglobin numeric,
  blood_sugar numeric,
  measured_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT health_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT health_metrics_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.health_timeline (
  id uuid NOT NULL,
  mother_id uuid,
  week_number integer,
  date date,
  weight numeric,
  bp_systolic integer,
  bp_diastolic integer,
  hemoglobin numeric,
  symptoms jsonb,
  risk_level character varying,
  risk_score numeric,
  ai_assessment jsonb,
  entry_type character varying,
  reported_by character varying,
  created_at timestamp without time zone,
  CONSTRAINT health_timeline_pkey PRIMARY KEY (id),
  CONSTRAINT health_timeline_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.medical_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid,
  telegram_chat_id text,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  analysis_status text DEFAULT 'pending'::text CHECK (analysis_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'error'::text])),
  analysis_result jsonb,
  extracted_metrics jsonb,
  analyzed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_reports_pkey PRIMARY KEY (id),
  CONSTRAINT medical_reports_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.medication_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  reminders jsonb,
  status text DEFAULT 'sent'::text,
  last_sent timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medication_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT medication_reminders_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.mothers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  age integer NOT NULL,
  gravida integer NOT NULL,
  parity integer NOT NULL,
  bmi double precision,
  location text NOT NULL,
  preferred_language text DEFAULT 'en'::text,
  telegram_chat_id text,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  due_date date,
  asha_worker_id bigint,
  doctor_id bigint,
  CONSTRAINT mothers_pkey PRIMARY KEY (id),
  CONSTRAINT mothers_asha_worker_id_fkey FOREIGN KEY (asha_worker_id) REFERENCES public.asha_workers(id),
  CONSTRAINT mothers_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.nutrition_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  plan text NOT NULL,
  language text DEFAULT 'en'::text,
  trimester integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nutrition_plans_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_plans_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.pregnancy_milestones (
  id uuid NOT NULL,
  mother_id uuid,
  week_number integer,
  milestone_type character varying,
  description text,
  status character varying,
  scheduled_date date,
  completed_date date,
  notes text,
  CONSTRAINT pregnancy_milestones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  medication text NOT NULL,
  dosage text,
  start_date date,
  end_date date,
  schedule jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.registration_requests (
  id bigint NOT NULL DEFAULT nextval('registration_requests_id_seq'::regclass),
  email text NOT NULL,
  full_name text NOT NULL,
  role_requested USER-DEFINED NOT NULL CHECK (role_requested = ANY (ARRAY['DOCTOR'::user_role, 'ASHA_WORKER'::user_role])),
  phone text,
  assigned_area text,
  degree_cert_url text,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::registration_status,
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  password_hash text,
  CONSTRAINT registration_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.risk_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  systolic_bp integer,
  diastolic_bp integer,
  heart_rate integer,
  blood_glucose numeric,
  hemoglobin numeric,
  proteinuria integer DEFAULT 0,
  edema integer DEFAULT 0,
  headache integer DEFAULT 0,
  vision_changes integer DEFAULT 0,
  epigastric_pain integer DEFAULT 0,
  vaginal_bleeding integer DEFAULT 0,
  risk_score numeric,
  risk_level text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  asha_worker_id bigint,
  doctors_id bigint,
  CONSTRAINT risk_assessments_pkey PRIMARY KEY (id),
  CONSTRAINT risk_assessments_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id),
  CONSTRAINT risk_assessments_asha_worker_id_fkey FOREIGN KEY (asha_worker_id) REFERENCES public.asha_workers(id),
  CONSTRAINT risk_assessments_doctors_id_fkey FOREIGN KEY (doctors_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.scheduled_assessments (
  id uuid NOT NULL,
  mother_id uuid,
  assessment_type character varying,
  scheduled_for timestamp without time zone,
  status character varying,
  result jsonb,
  created_at timestamp without time zone,
  CONSTRAINT scheduled_assessments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.telegram_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid,
  chat_id text,
  message_type text,
  message_content text,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT telegram_logs_pkey PRIMARY KEY (id),
  CONSTRAINT telegram_logs_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);
CREATE TABLE public.user_info_Axorra (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Telegram_username text,
  email text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  slack_user_id text UNIQUE,
  linkedin_id text UNIQUE,
  mobile_whatsapp bigint UNIQUE,
  whatsapp_id text UNIQUE,
  CONSTRAINT user_info_Axorra_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role USER-DEFINED,
  is_active boolean DEFAULT true,
  assigned_area text,
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mother_id uuid NOT NULL,
  asha_id uuid,
  visit_date date NOT NULL,
  bp_sys integer,
  bp_dia integer,
  heart_rate integer,
  sugar_level double precision,
  hemoglobin double precision,
  weight double precision,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT visits_pkey PRIMARY KEY (id),
  CONSTRAINT visits_mother_id_fkey FOREIGN KEY (mother_id) REFERENCES public.mothers(id)
);