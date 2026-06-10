// Migration : packs (offres de crédits), réglages plateforme, et tasks.model (stats).
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-packs.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Offres de crédits gérées depuis le dashboard admin, affichées sur la page Packs.
  await c.query(`create table if not exists public.packs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    credits integer not null,
    price_tnd numeric(8,2) not null,
    account_type text,                -- 'particulier' | 'entreprise' | null = les deux
    badge text default '',            -- ex : 'Populaire'
    active boolean not null default true,
    sort integer not null default 0,
    created_at timestamptz default now()
  );`);
  await c.query('alter table public.packs enable row level security;');
  // (aucune policy : accès uniquement via le backend service_role)

  // Réglages globaux de la plateforme (clé/valeur).
  await c.query(`create table if not exists public.app_settings (
    key text primary key,
    value jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now()
  );`);
  await c.query('alter table public.app_settings enable row level security;');
  // Mode gratuit (phase de test) : tout le monde est illimité tant que c'est actif.
  await c.query(`insert into public.app_settings(key, value) values ('free_mode', 'true'::jsonb)
                 on conflict (key) do nothing;`);

  // Modèle utilisé par génération (pour les stats d'usage).
  await c.query('alter table public.tasks add column if not exists model text;');

  // Packs d'exemple (modifiables/supprimables depuis le dashboard) — seulement si table vide.
  const n = await c.query('select count(*)::int as n from public.packs');
  if (n.rows[0].n === 0) {
    await c.query(`insert into public.packs(name, credits, price_tnd, account_type, badge, sort) values
      ('Starter',   200,  15.00, 'particulier', '',          1),
      ('Pro',       600,  39.00, 'particulier', 'Populaire', 2),
      ('Business', 1500,  89.00, 'entreprise',  '',          3),
      ('Agence',   4000, 199.00, 'entreprise',  'Meilleur prix', 4);`);
    console.log('ℹ️ 4 packs d\'exemple créés (à ajuster dans le dashboard)');
  }

  console.log('✅ migration packs + app_settings + tasks.model OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
