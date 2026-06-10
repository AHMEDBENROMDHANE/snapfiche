// Migration : table designs — affiches composées (fond IA + calques) rééditables.
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-designs.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(`create table if not exists public.designs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null default 'Affiche',
    bg_url text not null,
    layers jsonb not null default '[]'::jsonb,
    preview_url text,
    company_id uuid references public.companies(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );`);
  await c.query('alter table public.designs enable row level security;');
  await c.query('drop policy if exists "designs_own" on public.designs;');
  await c.query(`create policy "designs_own" on public.designs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`);
  console.log('✅ migration designs OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
