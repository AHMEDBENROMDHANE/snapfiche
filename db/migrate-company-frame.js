// Migration : companies.frame — cadre de marque (logo + réseaux sociaux) en calques
// relatifs, modifiable dans l'éditeur et applicable sur n'importe quelle affiche.
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-company-frame.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('alter table public.companies add column if not exists frame jsonb;');
  console.log('✅ migration companies.frame OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
