-- ============================================================
-- SnapFiche — schéma Supabase (à exécuter dans SQL Editor)
-- ============================================================

-- 1) PROFILS (1 par utilisateur, contient le solde de crédits)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  credits integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- L'utilisateur peut LIRE son profil. (Les crédits ne sont modifiés que par le serveur via service_role.)
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) ENTREPRISES (charte par utilisateur)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  colors jsonb default '[]'::jsonb,
  website text default '',
  info text default '',
  logo_url text,
  created_at timestamptz default now()
);
alter table public.companies enable row level security;
drop policy if exists "companies_own" on public.companies;
create policy "companies_own" on public.companies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) GALERIE (créations par utilisateur)
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                 -- 'image' | 'video'
  prompt text default '',
  url text not null,
  company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.gallery enable row level security;
drop policy if exists "gallery_own" on public.gallery;
create policy "gallery_own" on public.gallery
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) HISTORIQUE DES CRÉDITS (transparence)
create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,             -- + (recharge) ou - (génération)
  reason text,
  created_at timestamptz default now()
);
alter table public.credit_ledger enable row level security;
drop policy if exists "ledger_read_own" on public.credit_ledger;
create policy "ledger_read_own" on public.credit_ledger
  for select using (auth.uid() = user_id);

-- 5) TÂCHES (pour ne débiter qu'une fois à la fin d'une génération)
create table if not exists public.tasks (
  task_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  api text,
  estimate integer not null default 0,
  charged boolean not null default false,
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
-- (aucune policy : seul le serveur via service_role y accède)

-- 6) FONCTION : ajouter/retirer des crédits de façon atomique
create or replace function public.add_credits(uid uuid, amount integer)
returns void language sql security definer as $$
  update public.profiles set credits = credits + amount where id = uid;
$$;

-- ============================================================
-- ADMIN : créditer un utilisateur à la main (par email)
--   select public.grant_credits('client@mail.com', 500);
-- ============================================================
create or replace function public.grant_credits(user_email text, amount integer)
returns void language plpgsql security definer as $$
declare uid uuid;
begin
  select id into uid from public.profiles where email = user_email;
  if uid is null then raise exception 'Utilisateur introuvable: %', user_email; end if;
  update public.profiles set credits = credits + amount where id = uid;
  insert into public.credit_ledger(user_id, delta, reason) values (uid, amount, 'recharge admin');
end; $$;
