// Remet un compte de test à zéro : mot de passe + état vierge (type non choisi, 0 entreprise).
// Usage : node db/reset-test-user.js <email> <nouveau_mot_de_passe> [credits]
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];
const CREDITS = +(process.argv[4] || 300);
if (!EMAIL || !PASSWORD) { console.error('Usage: node db/reset-test-user.js <email> <mdp> [credits]'); process.exit(1); }

(async () => {
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
  const list = await supa.auth.admin.listUsers({ perPage: 1000 });
  const user = list.data.users.find((u) => u.email === EMAIL);
  if (!user) { console.error('Utilisateur introuvable : ' + EMAIL); process.exit(1); }
  const r = await supa.auth.admin.updateUserById(user.id, { password: PASSWORD, email_confirm: true });
  if (r.error) { console.error('ERR ' + r.error.message); process.exit(1); }
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('delete from companies where user_id=$1', [user.id]);
  await c.query('update profiles set account_type=null, credits=$2, unlimited=true where id=$1', [user.id, CREDITS]);
  await c.end();
  console.log('✅ compte remis à zéro');
  console.log('EMAIL    :', EMAIL);
  console.log('PASSWORD :', PASSWORD);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
