-- ============================================================
--  VKM secure client document requests  (cmavkmunje.com/vkm/...)
--  Run ONCE in Supabase -> SQL Editor -> New query -> Run.
--  Safe to run again (everything is "if not exists").
-- ============================================================
-- Only the website's server (service-role key) can read or write these
-- tables: RLS is ON and there are deliberately NO policies, so the public
-- anon key gets nothing.

create table if not exists public.vkm_requests (
  id              uuid primary key default gen_random_uuid(),
  token_hash      text not null unique,          -- sha256 of the link token; the token itself is never stored
  client_code     text not null,                 -- SmartDocs client code, e.g. VKM1004 (used for "Client login")
  client_name     text not null,
  title           text not null default 'Document Submission',
  documents       jsonb not null default '[]',   -- [{key, label, note}] requested by the firm
  services        jsonb not null default '[]',   -- services the client may tick
  pin_hash        text not null,
  pin_salt        text not null,
  failed_attempts int  not null default 0,
  status          text not null default 'open'   -- open | submitted | locked | revoked
                  check (status in ('open', 'submitted', 'locked', 'revoked')),
  max_files       int  not null default 25,
  expires_at      timestamptz not null,
  created_by      text,
  created_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  client_services jsonb not null default '[]',
  client_message  text,
  client_contact  jsonb not null default '{}',
  synced_at       timestamptz
);
create index if not exists vkm_requests_client_code on public.vkm_requests (upper(client_code), created_at desc);
create index if not exists vkm_requests_inbox on public.vkm_requests (status, synced_at);

create table if not exists public.vkm_request_files (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.vkm_requests(id) on delete cascade,
  storage_path text not null unique,
  file_name    text not null,
  size_bytes   bigint not null,
  mime         text,
  doc_key      text,
  confirmed    boolean not null default false,
  uploaded_at  timestamptz not null default now(),
  synced_at    timestamptz
);
create index if not exists vkm_request_files_req on public.vkm_request_files (request_id);

create table if not exists public.vkm_request_events (
  id         bigserial primary key,
  request_id uuid references public.vkm_requests(id) on delete cascade,
  event      text not null,
  ip         text,
  ua         text,
  created_at timestamptz not null default now()
);
create index if not exists vkm_request_events_req on public.vkm_request_events (request_id, created_at desc);

alter table public.vkm_requests       enable row level security;
alter table public.vkm_request_files  enable row level security;
alter table public.vkm_request_events enable row level security;

-- Private bucket, 25 MB per file. No storage policies: uploads only work
-- through one-time signed upload URLs the website hands out after the client
-- has entered the correct PIN.
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-requests', 'client-requests', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = 26214400;
