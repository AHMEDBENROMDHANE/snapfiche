// Crée un compte de test confirmé (login immédiat) + crédits, via la clé service Supabase.
// Lancer sur le VPS :
//   cd ~/snapfiche && NODE_PATH=$HOME/snapfiche/server/node_modules /opt/plesk/node/22/bin/node db/create-test-user.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const EMAIL = process.argv[2] || 'test.particulier@snapfiche.com';
const PASSWORD = process.argv[3] || 'Snap2026!';
const CREDITS = +(process.argv[4] || 300);

(async () => {
  const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
  let uid;
  const { data, error } = await supa.auth.admin.createUser({ email: EMAIL, password: PASSWORD, email_confirm: true });
  if (error) {
    if (!/already|registered|exists/i.test(error.message)) { console.error('❌', error.message); process.exit(1); }
    // déjà créé -> on récupère son id
    const list = await supa.auth.admin.listUsers();
    uid = (list.data.users.find((u) => u.email === EMAIL) || {}).id;
    console.log('ℹ️ utilisateur déjà existant');
  } else {
    uid = data.user.id;
    console.log('✅ utilisateur créé');
  }
  // Profil + crédits via pg (account_type laissé NULL -> l'écran de choix s'affichera à la 1re connexion)
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('insert into public.profiles(id,email,credits) values($1,$2,$3) on conflict (id) do update set credits=$3', [uid, EMAIL, CREDITS]);
  await c.end();
  console.log('EMAIL    :', EMAIL);
  console.log('PASSWORD :', PASSWORD);
  console.log('CREDITS  :', CREDITS);
  console.log('UID      :', uid);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
