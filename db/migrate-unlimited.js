// Migration : ajoute profiles.unlimited (solde illimité pendant la phase de test).
// Par défaut ACTIVÉ pour l'instant — à passer à `default false` quand les packs payants arriveront.
// Lancer :  cd ~/snapfiche && NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-unlimited.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('alter table public.profiles add column if not exists unlimited boolean not null default true;');
  await c.query('update public.profiles set unlimited = true;'); // tous les comptes existants -> illimité
  console.log('✅ migration unlimited OK (tous les comptes en illimité)');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
