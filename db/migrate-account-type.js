// Migration : ajoute profiles.account_type + un trigger qui empêche un compte
// « particulier » d'avoir plus d'une entreprise (filet de sécurité côté DB).
// Lancer sur le VPS :  cd ~/snapfiche && node db/migrate-account-type.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('alter table public.profiles add column if not exists account_type text;');
  await c.query(`create or replace function public.enforce_company_limit() returns trigger
language plpgsql security definer as $fn$
declare atype text; cnt int;
begin
  select account_type into atype from public.profiles where id = NEW.user_id;
  if atype = 'particulier' then
    select count(*) into cnt from public.companies where user_id = NEW.user_id;
    if cnt >= 1 then
      raise exception 'PARTICULIER_LIMIT';
    end if;
  end if;
  return NEW;
end; $fn$;`);
  await c.query('drop trigger if exists trg_company_limit on public.companies;');
  await c.query('create trigger trg_company_limit before insert on public.companies for each row execute procedure public.enforce_company_limit();');
  console.log('✅ migration account_type OK');
  await c.end();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
