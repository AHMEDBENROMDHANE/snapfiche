// Migration : promos sur les packs (prix promo + date de fin optionnelle).
// Lancer :  NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/migrate-pack-promo.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('alter table public.packs add column if not exists promo_price_tnd numeric(8,2);');
  await c.query('alter table public.packs add column if not exists promo_until timestamptz;');
  console.log('✅ migration promo packs OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
