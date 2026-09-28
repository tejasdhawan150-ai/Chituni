-- DreamJobResume initial schema
-- Every user-owned table has Row Level Security enabled; users can only access their own rows.
-- Subscriptions are written exclusively by the server (service role) from Stripe webhooks.

create extension if not exists "pgcrypto";

-- ── Profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Job analyses ──────────────────────────────────────────────────────────
create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_description text not null check (char_length(job_description) <= 20000),
  job_url text not null default '',
  analysis jsonb not null,
  tailoring jsonb,
  current_report jsonb,
  projected_report jsonb,
  created_at timestamptz not null default now()
);
create index job_analyses_user_idx on public.job_analyses (user_id, created_at desc);

-- ── Resumes ───────────────────────────────────────────────────────────────
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled resume',
  template_id text not null default 'classic-ats',
  target_role text not null default '',
  target_company text not null default '',
  job_analysis_id uuid references public.job_analyses (id) on delete set null,
  ats_score smallint check (ats_score between 0 and 100),
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_user_idx on public.resumes (user_id, updated_at desc);

-- ── Applications (job tracker) ────────────────────────────────────────────
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  resume_id uuid references public.resumes (id) on delete set null,
  ats_score smallint check (ats_score between 0 and 100),
  applied_on date,
  status text not null default 'saved' check (status in ('saved', 'applied', 'interview', 'offer', 'rejected')),
  job_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index applications_user_idx on public.applications (user_id, updated_at desc);

-- ── Cover letters ─────────────────────────────────────────────────────────
create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  company text not null default '',
  role text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);
create index cover_letters_user_idx on public.cover_letters (user_id, created_at desc);

-- ── Subscriptions (server-managed) ────────────────────────────────────────
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'career')),
  status text not null default 'none',
  currency text not null default 'INR',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ── Usage metering (plan limits) ──────────────────────────────────────────
create table public.usage_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('job_analysis', 'ai_rewrite', 'cover_letter', 'linkedin', 'resume_parse')),
  created_at timestamptz not null default now()
);
create index usage_events_user_kind_idx on public.usage_events (user_id, kind, created_at desc);

-- ── updated_at trigger ────────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger resumes_updated_at before update on public.resumes for each row execute function public.set_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

-- ── New user bootstrap ────────────────────────────────────────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.job_analyses enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.cover_letters enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles: own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "job_analyses: own rows" on public.job_analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resumes: own rows" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications: own rows" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cover_letters: own rows" on public.cover_letters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Subscriptions: read-only for the owner. Writes happen via the service role (Stripe webhook).
create policy "subscriptions: read own" on public.subscriptions for select using (auth.uid() = user_id);
-- Usage: owner can read and append, never update or delete.
create policy "usage_events: read own" on public.usage_events for select using (auth.uid() = user_id);
create policy "usage_events: insert own" on public.usage_events for insert with check (auth.uid() = user_id);
