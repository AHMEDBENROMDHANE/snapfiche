// Migration : signup_log — journal des inscriptions (IP + empreinte d'appareil)
// pour limiter l'abus des comptes d'essai (multi-comptes pour récupérer des crédits gratuits).
// Lancer : NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-signup-guard.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(`create table if not exists public.signup_log (
    id bigint generated always as identity primary key,
    email text,
    ip text,
    fingerprint text,
    created_at timestamptz default now()
  );`);
  await c.query('create index if not exists signup_log_ip_idx on public.signup_log(ip, created_at);');
  await c.query('create index if not exists signup_log_fp_idx on public.signup_log(fingerprint, created_at);');
  await c.query('alter table public.signup_log enable row level security;'); // accès serveur (service_role) uniquement
  console.log('✅ migration signup_log OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
