// ============================================================
// SnapFiche — Backend (api.snapfiche.com)
// Auth : Supabase (GoTrue).  Base : PostgreSQL direct (pg) -> fiable + atomique.
// Rôle : détenir la clé kie.ai, vérifier l'utilisateur, relayer kie.ai, débiter les crédits.
// ============================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const kie = require('./kie');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE, DATABASE_URL, KIE_API_KEY, ALLOWED_ORIGIN, PORT } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE manquants.');
if (!DATABASE_URL) throw new Error('DATABASE_URL manquant (connexion PostgreSQL Supabase).');
if (!KIE_API_KEY) throw new Error('KIE_API_KEY manquante.');

// Auth uniquement (vérification du jeton utilisateur)
const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
// Base de données (privilégié, contourne PostgREST)
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
const q = (sql, params) => pool.query(sql, params);

const app = express();
app.use(express.json({ limit: '12mb' }));
app.use(cors({ origin: ALLOWED_ORIGIN ? ALLOWED_ORIGIN.split(',') : true }));
// Sert le frontend SnapFiche (web/) depuis le même serveur (même origine).
app.use(express.static(path.join(__dirname, '..', 'web')));

// ---- Authentification + garantie du profil ----
async function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Non authentifié.' });
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data || !data.user) return res.status(401).json({ error: 'Session invalide.' });
    req.user = data.user;
    await q('insert into profiles(id,email) values($1,$2) on conflict (id) do nothing', [req.user.id, req.user.email]);
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getCredits(uid) {
  const r = await q('select credits from profiles where id=$1', [uid]);
  return r.rows[0] ? r.rows[0].credits : 0;
}
async function changeCredits(uid, delta, reason) {
  await q('update profiles set credits = credits + $2 where id=$1', [uid, delta]);
  await q('insert into credit_ledger(user_id,delta,reason) values($1,$2,$3)', [uid, delta, reason]);
}

function estimateCost(d) {
  const input = d.input || {};
  if (d.api === 'flux') return d.model === 'flux-kontext-max' ? 12 : 8;
  if (d.api === 'veo') return Math.round((d.model === 'veo3' ? 31 : 7.5) * (input.duration || 8));
  if (d.api === 'jobs') {
    const m = d.model || '';
    if (m === 'google/nano-banana') return 4;
    if (m === 'nano-banana-pro') return ({ '1K': 24, '2K': 30, '4K': 40 })[input.resolution || '1K'] || 24;
    if (m.startsWith('bytedance/seedance')) {
      const fast = m.includes('fast');
      const table = fast ? { '480p': 9, '720p': 20, '1080p': 40 } : { '480p': 11.5, '720p': 25, '1080p': 50 };
      return Math.round((table[input.resolution || '720p'] || 25) * (input.duration || 5));
    }
    return 8;
  }
  return 8;
}

// ---------------- Routes ----------------
app.get('/health', (_req, res) => res.json({ ok: true, service: 'snapfiche-api' }));

app.get('/api/credits', auth, async (req, res) => {
  res.json({ credits: await getCredits(req.user.id) });
});

app.post('/api/generate', auth, async (req, res) => {
  const descriptor = req.body;
  const cost = estimateCost(descriptor);
  const credits = await getCredits(req.user.id);
  if (credits < cost) return res.status(402).json({ error: `Crédits insuffisants (besoin ~${cost}, solde ${credits}).`, need: cost, have: credits });
  try {
    const taskId = await kie.generate(KIE_API_KEY, descriptor);
    await q('insert into tasks(task_id,user_id,api,estimate) values($1,$2,$3,$4) on conflict (task_id) do nothing', [taskId, req.user.id, descriptor.api, cost]);
    res.json({ taskId });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/poll', auth, async (req, res) => {
  const { api, taskId } = req.body;
  try {
    const result = await kie.poll(KIE_API_KEY, { api, taskId });
    if (result.done) {
      const t = await q('select charged, estimate from tasks where task_id=$1 and user_id=$2', [taskId, req.user.id]);
      if (t.rows[0] && !t.rows[0].charged) {
        const charge = Math.max(0, Math.round(result.credits != null ? result.credits : t.rows[0].estimate));
        await changeCredits(req.user.id, -charge, 'generation');
        await q('update tasks set charged=true where task_id=$1', [taskId]);
        result.charged = charge;
      }
    }
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/chat', auth, async (req, res) => {
  if ((await getCredits(req.user.id)) < 1) return res.status(402).json({ error: 'Crédits insuffisants.' });
  try {
    const text = await kie.chat(KIE_API_KEY, req.body.model || 'gemini-2.5-flash', req.body.messages);
    await changeCredits(req.user.id, -1, 'assistant');
    res.json({ text });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/upload', auth, async (req, res) => {
  try {
    const url = await kie.uploadBase64(KIE_API_KEY, req.body.base64DataUrl, req.body.fileName);
    res.json({ url });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ---- Récupération auto des infos d'un site web ----
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
function metaContent(html, name) {
  const re1 = new RegExp('<meta[^>]+(?:name|property)=["\']' + name + '["\'][^>]*content=["\']([^"\']+)["\']', 'i');
  const re2 = new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:name|property)=["\']' + name + '["\']', 'i');
  const m = re1.exec(html) || re2.exec(html);
  return m ? m[1] : '';
}
function firstMatch(re, html) { const m = re.exec(html); return m ? m[0] : ''; }

app.post('/api/fetch-site', auth, async (req, res) => {
  let url = clean(req.body.url);
  if (!url) return res.status(400).json({ error: 'URL manquante.' });
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const resp = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (SnapFiche)' } });
    clearTimeout(timer);
    const html = await resp.text();
    const base = new URL(resp.url || url);

    const title = clean((/<title[^>]*>([^<]*)<\/title>/i.exec(html) || [])[1]);
    const name = clean(metaContent(html, 'og:site_name')) || (title.split(/[|\-–—·•]/)[0] || '').trim() || base.hostname.replace(/^www\./, '');
    const info = clean(metaContent(html, 'og:description') || metaContent(html, 'description'));
    const color = clean(metaContent(html, 'theme-color'));

    // logo (og:image -> sinon favicon)
    let logo = clean(metaContent(html, 'og:image') || metaContent(html, 'og:image:url'));
    if (!logo) {
      const fav = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i.exec(html);
      if (fav) logo = fav[1];
    }
    if (logo && !/^https?:\/\//i.test(logo)) { try { logo = new URL(logo, base).href; } catch (_) {} }

    // email
    const mailto = (/mailto:([^"'?>\s]+)/i.exec(html) || [])[1];
    const emailTxt = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).find((e) => !/\.(png|jpe?g|gif|webp|svg)$/i.test(e));
    const email = clean(mailto || emailTxt || '').toLowerCase();

    // téléphone
    const tel = (/tel:([+0-9 ().\-]{6,})/i.exec(html) || [])[1];
    const phone = clean(tel || '');

    // réseaux
    const facebook = firstMatch(/https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/[^"'\s<)]+/i, html);
    const instagram = firstMatch(/https?:\/\/(?:www\.)?instagram\.com\/[^"'\s<)]+/i, html);
    const whatsapp = firstMatch(/https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^"'\s<)]+/i, html);

    res.json({ name, info, email, phone, whatsapp, facebook, instagram, color, logo });
  } catch (e) {
    res.status(502).json({ error: 'Impossible de lire le site : ' + e.message });
  }
});

app.listen(PORT || 3000, () => console.log(`SnapFiche API en écoute sur :${PORT || 3000}`));
