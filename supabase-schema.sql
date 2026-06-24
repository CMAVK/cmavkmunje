-- ============================================================
--  V K MUNJE & COMPANY — Supabase schema
--  Paste this whole file into Supabase → SQL Editor → Run.
--  Safe to re-run (uses IF NOT EXISTS / drop-and-recreate policies).
-- ============================================================

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  rating int not null check (rating between 1 and 5),
  category text not null,
  review text not null,
  status text not null default 'pending',   -- pending | approved | hidden
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- DOCUMENT SUBMISSIONS ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text,
  phone text,
  category text not null,
  file_name text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- APPOINTMENTS (consultation bookings) ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  email text,
  service text,
  date date,
  "time" text,
  message text,
  status text not null default 'new',        -- new | confirmed | done
  created_at timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.reviews      enable row level security;
alter table public.documents    enable row level security;
alter table public.appointments enable row level security;

-- Reviews: anyone may read ONLY approved reviews.
drop policy if exists "reviews_read_approved" on public.reviews;
create policy "reviews_read_approved" on public.reviews
  for select using (status = 'approved');

-- Reviews: anyone may submit a new review (it starts as 'pending').
drop policy if exists "reviews_insert_public" on public.reviews;
create policy "reviews_insert_public" on public.reviews
  for insert with check (
    status = 'pending' and featured = false
  );

-- Documents: anyone may insert a submission record. No public read.
drop policy if exists "documents_insert_public" on public.documents;
create policy "documents_insert_public" on public.documents
  for insert with check (true);

-- Documents: a logged-in client may read ONLY their own submissions
-- (rows whose email matches their authenticated email).
drop policy if exists "documents_read_own" on public.documents;
create policy "documents_read_own" on public.documents
  for select to authenticated
  using (email is not null and lower(email) = lower(auth.jwt() ->> 'email'));

-- Appointments: anyone may insert a booking. No public read.
drop policy if exists "appointments_insert_public" on public.appointments;
create policy "appointments_insert_public" on public.appointments
  for insert with check (true);

-- NOTE: the firm's admin panel uses the SERVICE ROLE key on the server,
-- which bypasses RLS — so admins can read/update/delete everything.

-- ============================================================
--  STORAGE BUCKET for uploaded client documents
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Allow anonymous uploads into the 'documents' bucket (insert only).
drop policy if exists "documents_upload_public" on storage.objects;
create policy "documents_upload_public" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'documents');
