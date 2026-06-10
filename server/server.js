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
const Jimp = require('jimp');
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
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));
app.use(cors({ origin: ALLOWED_ORIGIN ? ALLOWED_ORIGIN.split(',') : true }));

// ---- Sécurité : en-têtes HTTP de base ----
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Sert le frontend SnapFiche (web/) depuis le même serveur (même origine).
// HTML/JS/CSS : no-cache (déploiements immédiats). Images/icônes : cache 1 jour.
app.use(express.static(path.join(__dirname, '..', 'web'), {
  setHeaders: (res, filePath) => {
    if (/\.(png|jpe?g|webp|svg|ico)$/i.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=86400');
    else res.setHeader('Cache-Control', 'no-cache');
  },
}));

// ---- Sécurité : garde anti-SSRF (URL distantes fournies par le client) ----
// N'autorise que http(s) vers des hôtes publics — bloque localhost / IP privées / liens internes.
function assertPublicUrl(raw) {
  let u;
  try { u = new URL(raw); } catch (_) { throw new Error('URL invalide.'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Seuls http/https sont autorisés.');
  const h = u.hostname.toLowerCase();
  const privatePatterns = [
    /^localhost$/, /\.local$/, /^0\./, /^127\./, /^10\./, /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./, /^\[?::1\]?$/, /^\[?f[cd]/i, /^\[?fe80:/i,
  ];
  if (privatePatterns.some((re) => re.test(h))) throw new Error('Adresse non autorisée.');
  return u.href;
}

// ---- Sécurité : limite de débit simple (en mémoire, par utilisateur) ----
const rateBuckets = new Map();
function rateLimit(name, max, windowMs) {
  return (req, res, next) => {
    const key = name + ':' + (req.user ? req.user.id : req.ip);
    const now = Date.now();
    const b = rateBuckets.get(key) || { n: 0, t: now };
    if (now - b.t > windowMs) { b.n = 0; b.t = now; }
    b.n++;
    rateBuckets.set(key, b);
    if (b.n > max) return res.status(429).json({ error: 'Trop de requêtes, réessaie dans un instant.' });
    next();
  };
}
setInterval(() => { const cut = Date.now() - 300000; for (const [k, b] of rateBuckets) if (b.t < cut) rateBuckets.delete(k); }, 60000).unref();

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
// Solde + statut illimité (phase de test : pas de débit ni de blocage).
async function getBalance(uid) {
  const r = await q('select credits, coalesce(unlimited,false) as unlimited from profiles where id=$1', [uid]);
  return r.rows[0] ? { credits: r.rows[0].credits, unlimited: r.rows[0].unlimited } : { credits: 0, unlimited: false };
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
    if (m === 'seedream/4.5-text-to-image') return input.quality === 'high' ? 13 : 7;
    if (m === 'ideogram/v3-text-to-image') return 10;
    if (m === 'qwen/image-edit') return 2;
    if (m === 'bytedance/seedream-v4-edit') return 5;
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
  const b = await getBalance(req.user.id);
  res.json({ credits: b.credits, unlimited: b.unlimited });
});

// Profil de l'utilisateur : type de compte (particulier/entreprise) + nb d'entreprises.
app.get('/api/me', auth, async (req, res) => {
  const p = await q('select account_type, credits, coalesce(unlimited,false) as unlimited, coalesce(is_admin,false) as is_admin from profiles where id=$1', [req.user.id]);
  const cc = await q('select count(*)::int as n from companies where user_id=$1', [req.user.id]);
  const row = p.rows[0] || {};
  res.json({ accountType: row.account_type || null, credits: row.credits || 0, unlimited: !!row.unlimited, isAdmin: !!row.is_admin, companyCount: cc.rows[0].n });
});

// Choix / changement du type de compte. Particulier = 1 entreprise ; Entreprise = plusieurs.
app.post('/api/account-type', auth, async (req, res) => {
  const t = ((req.body && req.body.type) || '').trim();
  if (!['particulier', 'entreprise'].includes(t)) return res.status(400).json({ error: 'Type de compte invalide.' });
  await q('update profiles set account_type=$2 where id=$1', [req.user.id, t]);
  res.json({ ok: true, accountType: t });
});

// ---- Inscription (publique) : compte confirmé immédiatement, sans e-mail de validation ----
app.post('/api/signup', rateLimit('signup', 5, 60000), async (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const password = String((req.body && req.body.password) || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum).' });
  const { data, error } = await supa.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) return res.status(409).json({ error: 'Un compte existe déjà avec cet e-mail.' });
    return res.status(502).json({ error: error.message });
  }
  // Crédits de bienvenue (utiles quand le mode illimité sera désactivé)
  await q('insert into profiles(id,email,credits) values($1,$2,$3) on conflict (id) do nothing', [data.user.id, email, 100]);
  res.json({ ok: true });
});

// ---- Administration ----
async function requireAdmin(req, res, next) {
  try {
    const r = await q('select is_admin from profiles where id=$1', [req.user.id]);
    if (!r.rows[0] || !r.rows[0].is_admin) return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    next();
  } catch (e) { res.status(500).json({ error: e.message }); }
}

// Vue d'ensemble : compteurs + dernières activités.
app.get('/api/admin/overview', auth, requireAdmin, async (_req, res) => {
  const [users, usersWeek, companies, tasks, spent, recent] = await Promise.all([
    q('select count(*)::int as n from profiles'),
    q("select count(*)::int as n from profiles where created_at > now() - interval '7 days'"),
    q('select count(*)::int as n from companies'),
    q('select count(*)::int as n from tasks'),
    q('select coalesce(sum(-delta),0)::int as n from credit_ledger where delta < 0'),
    q(`select l.created_at, l.delta, l.reason, p.email
       from credit_ledger l join profiles p on p.id = l.user_id
       order by l.created_at desc limit 12`),
  ]);
  res.json({
    users: users.rows[0].n, usersWeek: usersWeek.rows[0].n,
    companies: companies.rows[0].n, tasks: tasks.rows[0].n,
    creditsSpent: spent.rows[0].n, recent: recent.rows,
  });
});

// Liste des utilisateurs (recherche par e-mail).
app.get('/api/admin/users', auth, requireAdmin, async (req, res) => {
  const s = String(req.query.search || '').trim().toLowerCase();
  const base = `select p.id, p.email, p.account_type, p.credits, coalesce(p.unlimited,false) as unlimited,
                       coalesce(p.is_admin,false) as is_admin, p.created_at,
                       (select count(*) from companies c where c.user_id = p.id)::int as company_count
                from profiles p`;
  const r = s
    ? await q(base + ' where lower(p.email) like $1 order by p.created_at desc limit 200', ['%' + s + '%'])
    : await q(base + ' order by p.created_at desc limit 200');
  res.json({ users: r.rows });
});

// Mise à jour d'un utilisateur : crédits / illimité / type / admin.
app.post('/api/admin/user/:id', auth, requireAdmin, async (req, res) => {
  const uid = req.params.id;
  const b = req.body || {};
  const cur = await q('select credits from profiles where id=$1', [uid]);
  if (!cur.rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  const sets = [], vals = [uid];
  if (typeof b.credits === 'number' && isFinite(b.credits)) { vals.push(Math.max(0, Math.round(b.credits))); sets.push(`credits=$${vals.length}`); }
  if (typeof b.unlimited === 'boolean') { vals.push(b.unlimited); sets.push(`unlimited=$${vals.length}`); }
  if (typeof b.is_admin === 'boolean') { vals.push(b.is_admin); sets.push(`is_admin=$${vals.length}`); }
  if (b.account_type === null || ['particulier', 'entreprise'].includes(b.account_type)) { vals.push(b.account_type); sets.push(`account_type=$${vals.length}`); }
  if (!sets.length) return res.status(400).json({ error: 'Aucun champ valide.' });
  await q(`update profiles set ${sets.join(', ')} where id=$1`, vals);
  if (typeof b.credits === 'number') {
    const delta = Math.max(0, Math.round(b.credits)) - cur.rows[0].credits;
    if (delta !== 0) await q('insert into credit_ledger(user_id,delta,reason) values($1,$2,$3)', [uid, delta, 'ajustement admin']);
  }
  res.json({ ok: true });
});

app.post('/api/generate', auth, rateLimit('gen', 20, 60000), async (req, res) => {
  const descriptor = req.body;
  const cost = estimateCost(descriptor);
  const bal = await getBalance(req.user.id);
  if (!bal.unlimited && bal.credits < cost) return res.status(402).json({ error: `Crédits insuffisants (besoin ~${cost}, solde ${bal.credits}).`, need: cost, have: bal.credits });
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
    // Sécurité : on ne sonde que les tâches appartenant à l'utilisateur connecté.
    const own = await q('select 1 from tasks where task_id=$1 and user_id=$2', [taskId, req.user.id]);
    if (!own.rows.length) return res.status(404).json({ error: 'Tâche introuvable.' });
    const result = await kie.poll(KIE_API_KEY, { api, taskId });
    if (result.done) {
      const t = await q('select charged, estimate from tasks where task_id=$1 and user_id=$2', [taskId, req.user.id]);
      if (t.rows[0] && !t.rows[0].charged) {
        const bal = await getBalance(req.user.id);
        const charge = bal.unlimited ? 0 : Math.max(0, Math.round(result.credits != null ? result.credits : t.rows[0].estimate));
        if (charge > 0) await changeCredits(req.user.id, -charge, 'generation');
        await q('update tasks set charged=true where task_id=$1', [taskId]);
        result.charged = charge;
      }
    }
    res.json(result);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/chat', auth, rateLimit('chat', 30, 60000), async (req, res) => {
  const bal = await getBalance(req.user.id);
  if (!bal.unlimited && bal.credits < 1) return res.status(402).json({ error: 'Crédits insuffisants.' });
  try {
    const text = await kie.chat(KIE_API_KEY, req.body.model || 'gemini-2.5-flash', req.body.messages);
    if (!bal.unlimited) await changeCredits(req.user.id, -1, 'assistant');
    res.json({ text });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.post('/api/upload', auth, async (req, res) => {
  try {
    let dataUrl = req.body.base64DataUrl;
    // Si on reçoit une URL distante (ex : logo stocké sur Supabase), on télécharge l'image
    // et on la ré-héberge chez kie en vraie image (le modèle a besoin de l'image, pas juste d'un lien).
    if (!dataUrl && req.body.remoteUrl) {
      const r = await fetch(assertPublicUrl(req.body.remoteUrl)); // anti-SSRF
      if (!r.ok) throw new Error('Téléchargement image HTTP ' + r.status);
      const ct = r.headers.get('content-type') || 'image/png';
      const buf = Buffer.from(await r.arrayBuffer());
      dataUrl = `data:${ct};base64,` + buf.toString('base64');
    }
    if (!dataUrl) throw new Error('Aucune image fournie.');
    const url = await kie.uploadBase64(KIE_API_KEY, dataUrl, req.body.fileName || 'image.png');
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

// Extrait les couleurs de marque dominantes (hors blanc/noir/gris) du HTML + CSS.
function extractColors(text) {
  const counts = {};
  const add = (hex) => { counts[hex] = (counts[hex] || 0) + 1; };
  for (const m of text.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    let h = m[1].toLowerCase();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    add('#' + h);
  }
  for (const m of text.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) {
    add('#' + [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join(''));
  }
  const isBrand = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max > 235 && min > 235) return false; // blanc
    if (max < 25) return false;                // noir
    if (max - min < 28) return false;          // gris
    return true;
  };
  return Object.entries(counts).filter(([h]) => isBrand(h)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([h]) => h);
}
async function fetchText(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 7000);
  try { const r = await fetch(url, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0 (SnapFiche)' } }); return await r.text(); }
  catch (_) { return ''; }
  finally { clearTimeout(t); }
}

app.post('/api/fetch-site', auth, rateLimit('fetchsite', 10, 60000), async (req, res) => {
  let url = clean(req.body.url);
  if (!url) return res.status(400).json({ error: 'URL manquante.' });
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    url = assertPublicUrl(url); // anti-SSRF
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

    // Couleurs de marque : on analyse le HTML + les 1ères feuilles CSS du site.
    const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
      .map((m) => m[1]).slice(0, 4);
    let cssText = '';
    for (const href of cssLinks) {
      try { cssText += '\n' + (await fetchText(new URL(href, base).href, 6000)).slice(0, 250000); } catch (_) {}
    }
    let colors = extractColors(html + cssText);
    if (color) { const tc = color.toLowerCase(); colors = [tc, ...colors.filter((c) => c !== tc)]; }
    colors = colors.slice(0, 4);

    res.json({ name, info, email, phone, whatsapp, facebook, instagram, color, colors, logo });
  } catch (e) {
    res.status(502).json({ error: 'Impossible de lire le site : ' + e.message });
  }
});

// ---- Incrustation du VRAI logo (exact, pixel-perfect) sur l'affiche générée ----
async function fetchBuf(url) {
  const r = await fetch(assertPublicUrl(url)); // anti-SSRF
  if (!r.ok) throw new Error('Image HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}
app.post('/api/overlay-logo', auth, async (req, res) => {
  try {
    const { imageUrl, logoUrl, position = 'tr' } = req.body;
    const base = await Jimp.read(await fetchBuf(imageUrl));
    const logo = await Jimp.read(await fetchBuf(logoUrl));
    const W = base.bitmap.width, H = base.bitmap.height;
    const lw = Math.max(60, Math.round(W * 0.20));
    logo.resize(lw, Jimp.AUTO);
    const lh = logo.bitmap.height;
    const pad = Math.round(lw * 0.08);
    const cardW = lw + pad * 2, cardH = lh + pad * 2;
    const card = new Jimp(cardW, cardH, 0xffffffff); // carte blanche (logo visible sur tout fond)
    const m = Math.round(W * 0.035);
    const p = String(position);
    const left = p.includes('l') ? m : p.includes('c') ? Math.round((W - cardW) / 2) : W - cardW - m;
    const top = p.includes('b') ? H - cardH - m : m;
    base.composite(card, left, top);
    base.composite(logo, left + pad, top + pad);
    const out = await base.getBufferAsync(Jimp.MIME_PNG);
    const url = await kie.uploadBase64(KIE_API_KEY, 'data:image/png;base64,' + out.toString('base64'), 'poster.png');
    res.json({ url });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.listen(PORT || 3000, () => console.log(`SnapFiche API en écoute sur :${PORT || 3000}`));
