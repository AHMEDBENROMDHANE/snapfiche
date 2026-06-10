// Migration : ajoute gallery.history (versions précédentes d'une affiche modifiée par IA).
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-gallery-history.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("alter table public.gallery add column if not exists history jsonb not null default '[]'::jsonb;");
  console.log('✅ migration gallery.history OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
