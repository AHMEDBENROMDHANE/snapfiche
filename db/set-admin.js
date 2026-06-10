// Donne ou retire les droits administrateur à un compte.
// Usage : node db/set-admin.js <email> [on|off]
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

const EMAIL = process.argv[2];
const ON = (process.argv[3] || 'on') !== 'off';
if (!EMAIL) { console.error('Usage: node db/set-admin.js <email> [on|off]'); process.exit(1); }

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query('update public.profiles set is_admin=$2 where email=$1 returning id', [EMAIL, ON]);
  await c.end();
  if (!r.rows.length) { console.error('❌ Utilisateur introuvable : ' + EMAIL); process.exit(1); }
  console.log(`✅ ${EMAIL} -> admin ${ON ? 'ACTIVÉ' : 'désactivé'}`);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
