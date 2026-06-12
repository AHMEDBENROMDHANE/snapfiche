// Migration : user_styles — styles gardés par l'utilisateur (image + directive)
// pour les resélectionner visuellement lors des prochaines créations.
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-user-styles.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(`create table if not exists public.user_styles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null default 'Style',
    image_url text not null,
    directive text default '',
    created_at timestamptz default now()
  );`);
  await c.query('alter table public.user_styles enable row level security;');
  await c.query('drop policy if exists "styles_own" on public.user_styles;');
  await c.query(`create policy "styles_own" on public.user_styles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`);
  console.log('✅ migration user_styles OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
