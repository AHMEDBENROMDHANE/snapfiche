// Migration : champs nécessaires au signalement + remboursement automatique jugé par l'IA.
// Lancer : NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-reports.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('alter table public.tasks add column if not exists prompt text;');
  await c.query('alter table public.tasks add column if not exists result_url text;');
  await c.query('alter table public.tasks add column if not exists charge integer not null default 0;');
  await c.query('alter table public.tasks add column if not exists refunded boolean not null default false;');
  console.log('✅ migration reports (tasks: prompt, result_url, charge, refunded) OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
