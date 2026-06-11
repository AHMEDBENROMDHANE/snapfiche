// ============ Icônes (style ligne unifié) ============
const ICONS = {
  star: '<path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>',
  briefcase: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  layers: '<path d="M12 2l10 6-10 6L2 8z"/><path d="M2 14l10 6 10-6"/>',
  shirt: '<path d="M4 7l4-3 2 2h4l2-2 4 3-2 3-2-1v11H8V9L6 10z"/>',
};
function svgIcon(name, cls) {
  return `<svg class="${cls || 'ico'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

// Sécurité : échappe les données utilisateur avant insertion en innerHTML (anti-XSS).
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Réduit une image (data URL) pour éviter des fichiers/requêtes trop volumineux.
function downscaleDataUrl(dataUrl, maxDim, mime) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      try {
        resolve(cv.toDataURL(mime || 'image/png', 0.88));
      } catch (_) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// ============ Styles sélectionnables (look auto) ============
// {SUBJECT} = sujet, {COLOR} = couleur de marque. (Les --ar sont gérés par le format/params.)
const STYLES = {
  image: [
    { id: 'auto', name: 'Automatique (recommandé)' },
    { id: 'swiss', name: 'Swiss / Minimalisme', t: 'Minimalist Swiss-style poster, bold sans-serif typography on a strict grid, generous negative space, single accent color {COLOR} on off-white background, perfect geometric alignment, {SUBJECT} as the focal element, high contrast, modern editorial design, flat, ultra clean, 4k' },
    { id: 'retro', name: 'Rétro / Vintage 70s-80s', t: 'Retro 1970s poster, warm earthy palette (mustard, burnt orange, cream), vintage grain texture, rounded retro typography, sunburst graphic elements, {SUBJECT} illustrated in vintage style, halftone shading, nostalgic advertising aesthetic' },
    { id: 'neon', name: 'Néon / Cyberpunk', t: 'Cyberpunk neon poster, glowing magenta and cyan lights, dark rainy city backdrop, reflective wet surfaces, futuristic signage, {SUBJECT} illuminated by neon glow, cinematic atmosphere, blade runner mood, high detail' },
    { id: '3d', name: '3D Render moderne', t: 'Modern 3D render poster, soft studio lighting, pastel gradient background, mix of glossy and matte materials, floating geometric shapes, {SUBJECT} centered with realistic reflections, octane render, clean commercial look, shallow depth of field' },
    { id: 'glass', name: 'Glassmorphism', t: 'Glassmorphism poster, frosted translucent glass panels, vibrant blurred gradient background (purple to blue), soft layered shadows, depth and transparency, {SUBJECT} on a glass card, modern UI aesthetic, clean and airy' },
    { id: 'luxe', name: 'Luxe / Premium (noir & or)', t: 'Luxury premium poster, deep matte black background, elegant gold foil typography, subtle marble texture, thin gold line accents, {SUBJECT} with dramatic spotlight, sophisticated minimal layout, high-end brand aesthetic' },
    { id: 'brutalist', name: 'Brutalist / Bold typo', t: 'Brutalist graphic poster, oversized bold typography filling the frame, raw high-contrast black and white with one shocking accent color {COLOR}, asymmetric tense layout, anti-design aesthetic, {SUBJECT} as hero element' },
    { id: 'watercolor', name: 'Aquarelle / Illustration', t: 'Hand-painted watercolor poster, soft flowing washes, delicate paper texture, organic bleeding edges, pastel and earthy tones, {SUBJECT} illustrated loosely, artisanal handmade feel, elegant serif title' },
    { id: 'collage', name: 'Collage / Mixed media', t: 'Mixed-media collage poster, torn paper edges, cut-out photo fragments, layered textures, handwritten scribbles, bold marker strokes, vintage magazine clippings, energetic chaotic composition featuring {SUBJECT}' },
    { id: 'aurora', name: 'Aurora / Gradient mesh', t: 'Smooth gradient mesh poster, dreamy aurora colors blending (pink, violet, teal), grainy noise texture overlay, soft glowing orbs, minimal centered typography, modern tech startup aesthetic, {SUBJECT}' },
    { id: 'product', name: 'Photo produit réaliste', t: 'Photorealistic product poster, {SUBJECT} on a seamless studio backdrop, professional softbox lighting, crisp reflections, shallow depth of field, commercial advertising photography, clean tagline space at top, premium look' },
    { id: 'memphis', name: 'Memphis / Pop coloré', t: 'Memphis design poster, playful 80s shapes, bold primary colors, squiggles, dots and zigzags, geometric confetti, fun energetic layout, {SUBJECT} with retro-pop styling, white background' },
  ],
  video: [
    { id: 'auto', name: 'Automatique (recommandé)' },
    { id: 'cine', name: 'Cinématique / Filmique', t: 'Cinematic shot of {SUBJECT}, shallow depth of field, anamorphic lens flare, moody volumetric lighting, slow dolly-in camera movement, film grain, teal and orange color grade, 4k' },
    { id: '3dreveal', name: '3D Motion / Reveal produit', t: '3D animated product reveal of {SUBJECT}, smooth 360 rotation, studio lighting, glossy reflections, soft pastel background, floating particles, slow motion, octane render quality, clean commercial loop' },
    { id: 'kinetic', name: 'Kinetic typography', t: 'Kinetic typography animation, bold words {SUBJECT} flying and morphing in sync with the beat, high-contrast colors, dynamic motion, smooth easing, modern motion-graphics style, energetic rhythm' },
    { id: 'glitch', name: 'Glitch / Cyberpunk', t: 'Glitchy cyberpunk video of {SUBJECT}, digital distortion, RGB split, scan lines, neon flicker, datamosh effects, fast cuts, dark futuristic atmosphere, VHS artifacts' },
    { id: 'hyperlapse', name: 'Hyperlapse / Timelapse', t: 'Smooth hyperlapse moving through {SUBJECT}, motion blur, camera flowing forward, day-to-night transition, cinematic and fast-paced, stabilized, 4k' },
    { id: 'drone', name: 'Drone / Aérien', t: 'Aerial drone shot flying over {SUBJECT}, sweeping cinematic movement, golden hour lighting, vast landscape reveal, smooth gimbal motion, epic scale, 4k' },
    { id: 'macro', name: 'Macro produit (slow-mo)', t: 'Extreme macro slow-motion of {SUBJECT}, water droplets, soft bokeh, dramatic side lighting, sensual detail, focus pull, luxury commercial mood, 120fps' },
    { id: 'liquid', name: 'Liquid / Fluid', t: 'Abstract liquid simulation, colorful viscous fluids swirling and merging, {SUBJECT} emerging from the liquid, glossy surfaces, slow motion, satisfying flow, studio lighting, 3d render' },
    { id: 'anime', name: 'Anime / 2D', t: 'Anime-style animated scene of {SUBJECT}, vibrant cel-shaded colors, dynamic camera, expressive motion, detailed background art, smooth 2d animation, dramatic lighting' },
    { id: 'whippan', name: 'Whip-pan / Energetic', t: 'Fast-paced dynamic montage of {SUBJECT}, quick whip-pan transitions, motion blur, upbeat energy, punchy cuts synced to music, vibrant colors, social-media ready' },
    { id: 'asmr', name: 'ASMR / Satisfying', t: 'Satisfying ASMR-style close-up of {SUBJECT}, crisp slow-motion detail, soft natural lighting, clean minimal background, smooth gentle camera, oddly satisfying, 60fps' },
    { id: 'stopmotion', name: 'Stop motion', t: 'Stop-motion animation of {SUBJECT}, handmade tactile feel, slight frame jitter, playful object movement, warm practical lighting, craft aesthetic, charming and quirky' },
  ],
};
function fillStyleSelect(sel, kind) {
  sel.innerHTML = '';
  STYLES[kind].forEach((s) => sel.add(new Option(s.name, s.id)));
}
function buildStylePrompt(style, subject) {
  const c = activeCompany();
  const color = c && c.colors && c.colors[0] ? c.colors[0] : 'a bold accent color';
  return style.t.replace(/\{SUBJECT\}/g, subject).replace(/\{COLOR\}/g, color);
}

// ============ Registre des modèles ============
const CREDIT_USD = 0.005; // 1 crédit ≈ 0,005 $
const usd = (c) => (c * CREDIT_USD).toFixed(2);

// Les coûts en crédits sont des ESTIMATIONS basées sur les tarifs publiés de kie.ai.
// Le solde réel (affiché en bas à gauche) fait foi.
const MODELS = {
  image: [
    { id: 'nano-banana-pro', label: '🔥 Snap Max — Ultra HD (qualité max)', api: 'jobs', edit: true, ratio: true, res: true, imageField: 'image_input', creditsByRes: { '1K': 24, '2K': 30, '4K': 40 } },
    { id: 'seedream/4.5-text-to-image', label: '✨ Snap — Créatif (éco)', api: 'jobs', ratio: true, credits: 7, jobsInput: (prompt, params) => ({ prompt, aspect_ratio: params.aspect_ratio || '1:1', quality: 'basic' }) },
    { id: 'ideogram/v3-text-to-image', label: '🔤 Snap Texte — Typo nette', api: 'jobs', ratio: true, credits: 10, jobsInput: (prompt, params) => ({ prompt, aspect_ratio: params.aspect_ratio || '1:1', rendering_speed: 'QUALITY' }) },
    { id: 'flux-kontext-pro', label: '🎨 Snap Plus', api: 'flux', edit: true, ratio: true, credits: 8 },
    { id: 'flux-kontext-max', label: '🎨 Snap Pro', api: 'flux', edit: true, ratio: true, credits: 12 },
  ],
  video: [
    { id: 'veo3_fast', label: 'Veo 3 Fast', api: 'veo', image: true, durations: [4, 6, 8], resolutions: ['720p', '1080p'], creditsPerSec: 7.5 },
    { id: 'veo3', label: 'Veo 3 (Quality)', api: 'veo', image: true, durations: [4, 6, 8], resolutions: ['720p', '1080p'], creditsPerSec: 31 },
    { id: 'bytedance/seedance-2', label: 'Seedance 2.0', api: 'jobs', image: true, audio: true, durations: [4, 6, 8, 10, 12, 15], resolutions: ['480p', '720p', '1080p'], creditsPerSecByRes: { '480p': 11.5, '720p': 25, '1080p': 50 } },
    { id: 'bytedance/seedance-2-fast', label: 'Seedance 2.0 Fast', api: 'jobs', image: true, audio: true, durations: [4, 6, 8, 10, 12, 15], resolutions: ['480p', '720p', '1080p'], creditsPerSecByRes: { '480p': 9, '720p': 20, '1080p': 40 } },
  ],
};
const findModel = (type, id) => MODELS[type].find((m) => m.id === id);

// ============ Navigation ============
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// Menu hamburger (mobile) : ouverture/fermeture du tiroir
const _sidebar = document.querySelector('.sidebar');
const _backdrop = document.getElementById('navBackdrop');
function closeNav() { if (_sidebar) _sidebar.classList.remove('open'); if (_backdrop) _backdrop.classList.remove('show'); }
function openNav() { if (_sidebar) _sidebar.classList.add('open'); if (_backdrop) _backdrop.classList.add('show'); }
const _menuToggle = document.getElementById('menuToggle');
if (_menuToggle) _menuToggle.onclick = () => (_sidebar.classList.contains('open') ? closeNav() : openNav());
if (_backdrop) _backdrop.onclick = closeNav;

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    navButtons.forEach((b) => b.classList.remove('active'));
    views.forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
    if (btn.dataset.view === 'gallery') loadGallery();
    if (btn.dataset.view === 'admin') loadAdmin();
    if (btn.dataset.view === 'packs') loadUserPacks();
    closeNav(); // referme le tiroir sur mobile après navigation
  });
});

// ============ Réglages / clé API ============
const settingsModal = document.getElementById('settingsModal');
const keyStatus = document.getElementById('keyStatus');

async function refreshKeyStatus() {
  const s = await window.api.configStatus();
  if (s.hasKey) {
    keyStatus.textContent = s.fromEnv ? '🔑 Clé (.env) active' : '🔑 Clé active';
    keyStatus.className = 'key-status ok';
  } else {
    keyStatus.textContent = '⚠️ Aucune clé API';
    keyStatus.className = 'key-status warn';
  }
}
document.getElementById('settingsBtn').onclick = () => settingsModal.classList.remove('hidden');
document.getElementById('closeSettings').onclick = () => settingsModal.classList.add('hidden');
document.getElementById('saveKey').onclick = async () => {
  await window.api.setApiKey(document.getElementById('apiKeyInput').value);
  settingsModal.classList.add('hidden');
  refreshKeyStatus();
  refreshBalance();
};
refreshKeyStatus();

// ============ Solde ============
async function refreshBalance() {
  const el = document.getElementById('balanceVal');
  el.textContent = '…';
  try {
    const b = await window.api.getCredits();
    if (b.unlimited) {
      el.textContent = '∞ illimité';
      el.title = 'Solde illimité (phase de test)';
    } else {
      el.textContent = `${b.credits} cr (~$${b.usd})`;
      el.title = `${b.credits} crédits ≈ ${b.usd} $`;
    }
  } catch (e) {
    el.textContent = 'erreur';
  }
}
document.getElementById('refreshBalance').onclick = refreshBalance;
refreshBalance();

// ============ Entreprises (charte de marque) ============
let companies = [];
let activeCompanyId = null;
const activeCompany = () => companies.find((c) => c.id === activeCompanyId) || null;

// Construit les consignes de marque ajoutées au prompt IA.
function brandSuffix(c) {
  if (!c) return '';
  const parts = [`respecte l'identité de marque de « ${c.name} »`];
  if (c.category) parts.push(`secteur d'activité : ${c.category}`);
  if (c.colors && c.colors.length) parts.push(`palette de couleurs ${c.colors.join(', ')}`);
  if (c.website) parts.push(`style visuel cohérent avec le site ${c.website}`);
  if (c.info) parts.push(c.info);
  return '\n\nConsignes de marque : ' + parts.join('. ') + '.';
}
// Coordonnées prêtes à afficher sur l'affiche (handles courts, pas d'URL complète).
// Coordonnées « texte » (tél, e-mail, site) — reproduites caractère par caractère.
function contactLine(c) {
  if (!c) return '';
  const parts = [];
  if (c.phone) parts.push('Tél : ' + c.phone);
  if (c.email) parts.push(c.email);
  if (c.website) parts.push(c.website.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  return parts.join('   ·   ');
}
// Réseaux sociaux — à représenter par leurs ICÔNES officielles, pas en toutes lettres.
function socialItems(c) {
  if (!c) return [];
  const out = [];
  if (c.whatsapp) { const n = (c.whatsapp.match(/(\+?\d[\d ]{5,})/) || [])[1]; out.push("l'icône WhatsApp" + (n ? ' suivie du numéro ' + n.trim() : '')); }
  if (c.instagram) { const h = (c.instagram.match(/instagram\.com\/([^/?#]+)/) || [])[1]; out.push("l'icône Instagram" + (h ? ' suivie de @' + h : '')); }
  if (c.facebook) { const f = (c.facebook.match(/(?:facebook|fb)\.com\/([^/?#]+)/) || [])[1]; out.push("l'icône Facebook" + (f ? ' suivie de ' + f : '')); }
  return out;
}
function contactDirective(c) {
  const cl = contactLine(c);
  const socials = socialItems(c);
  if (!cl && !socials.length) return '';
  let d = '';
  if (cl) d += ` Affiche en bas de l'affiche, en petit mais parfaitement lisible, ces coordonnées EXACTES (reproduis-les caractère par caractère, ne modifie aucun chiffre ni lettre) : ${cl}.`;
  if (socials.length) {
    d += ` Pour les réseaux sociaux, n'écris SURTOUT PAS le nom du réseau en toutes lettres (pas de "Facebook", "Instagram", "WhatsApp" écrit en texte) : utilise UNIQUEMENT leurs icônes/logos officiels et reconnaissables, en petit, intégrés proprement dans le style et les couleurs de l'affiche, regroupés en une rangée nette en bas — ${socials.join(' ; ')}.`;
  }
  return d;
}
function applyBrand(prefix, prompt) {
  const useBrand = document.getElementById(prefix + 'UseBrand').checked;
  const c = activeCompany();
  return useBrand && c ? prompt + brandSuffix(c) : prompt;
}
function updateBrandHints() {
  const c = activeCompany();
  const txt = c ? `→ ${c.name}` : '→ aucune entreprise active';
  document.getElementById('imgBrandHint').textContent = txt;
  document.getElementById('vidBrandHint').textContent = txt;
  const g = document.getElementById('guidedBrandHint');
  if (g) g.textContent = txt;
}

async function setActiveCompany(id) {
  activeCompanyId = id || null;
  await window.api.setActiveCompany(activeCompanyId);
  document.getElementById('activeCompany').value = activeCompanyId || '';
  updateBrandHints();
  updateEditorBrand();
  renderCompanyList();
}
document.getElementById('activeCompany').onchange = (e) => setActiveCompany(e.target.value);

function populateCompanySelectors() {
  const sel = document.getElementById('activeCompany');
  sel.innerHTML = '<option value="">— Aucune —</option>';
  companies.forEach((c) => sel.add(new Option(c.name, c.id)));
  sel.value = activeCompanyId || '';
  const gf = document.getElementById('galleryFilter');
  gf.innerHTML = '<option value="">Toutes</option>';
  companies.forEach((c) => gf.add(new Option(c.name, c.id)));
}

async function renderCompanyList() {
  const wrap = document.getElementById('companyList');
  if (!companies.length) {
    wrap.innerHTML = '<p class="empty">Aucune entreprise. Créez-en une à gauche.</p>';
    return;
  }
  // Pré-charger TOUS les logos avant de modifier le DOM : évite les doublons
  // si deux rendus se chevauchent (création + activation).
  const logos = await Promise.all(
    companies.map((c) =>
      c.logoFile ? window.api.mediaDataUrl(c.logoFile).catch(() => null) : Promise.resolve(null)
    )
  );
  wrap.innerHTML = '';
  companies.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'company-card' + (c.id === activeCompanyId ? ' active' : '');
    const logoHtml = logos[i]
      ? `<img class="logo" src="${logos[i]}" />`
      : `<div class="logo placeholder">${svgIcon('briefcase', 'ico')}</div>`;
    const swatches = (c.colors || []).map((col) => `<span style="background:${col}"></span>`).join('');
    card.innerHTML = `${logoHtml}<div class="cinfo"><h4>${esc(c.name)}</h4>${c.website ? `<div class="web">${esc(c.website)}</div>` : ''}<div class="swatches">${swatches}</div></div><div class="cactions"></div>`;
    const act = card.querySelector('.cactions');
    const useBtn = document.createElement('button');
    useBtn.textContent = c.id === activeCompanyId ? '✓ Active' : 'Activer';
    useBtn.onclick = () => setActiveCompany(c.id);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Modifier';
    editBtn.onclick = () => editCompany(c);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Suppr.';
    delBtn.onclick = async () => {
      if (confirm(`Supprimer « ${c.name} » ?`)) {
        await window.api.companyDelete(c.id);
        if (activeCompanyId === c.id) activeCompanyId = null;
        await loadCompanies();
      }
    };
    act.append(useBtn, editBtn, delBtn);
    wrap.appendChild(card);
  });
}

// ===== Type de compte (particulier / entreprise) =====
const ACCOUNT = { type: null };
function isParticulier() { return ACCOUNT.type === 'particulier'; }
function atCompanyLimit() { return isParticulier() && companies.length >= 1; }

// Première connexion : si aucun type choisi, on affiche l'écran de choix (bloquant).
// Renvoie true si l'utilisateur vient de choisir son type (pour démarrer le cycle de setup).
// Fonctionnalités activées par l'admin (par défaut : tout est actif).
function featureOn(k) { return !ACCOUNT.features || ACCOUNT.features[k] !== false; }
async function ensureAccountType() {
  try {
    const me = await window.api.getMe();
    ACCOUNT.type = me.accountType || null;
    ACCOUNT.isAdmin = !!me.isAdmin;
    ACCOUNT.features = me.features || {};
  } catch (_) {}
  if (ACCOUNT.type) return false;
  const gate = document.getElementById('typeGate');
  if (!gate) return false;
  return await new Promise((resolve) => {
    gate.classList.remove('hidden');
    const cards = gate.querySelectorAll('.type-card');
    cards.forEach((b) => {
      b.onclick = async () => {
        cards.forEach((x) => (x.disabled = true));
        try {
          const r = await window.api.setAccountType(b.dataset.type);
          ACCOUNT.type = r.accountType;
          gate.classList.add('hidden');
          resolve(true); // type fraîchement choisi
        } catch (e) {
          document.getElementById('typeError').textContent = e.message;
          cards.forEach((x) => (x.disabled = false));
        }
      };
    });
  });
}

// Bascule vers la vue Entreprises et démarre le cycle de configuration de la 1re marque.
function goToCompanySetup() {
  const btn = document.querySelector('.nav-btn[data-view="company"]');
  if (btn) btn.click();
}

// Bannière + verrouillage de l'ajout d'entreprise selon le type de compte.
function applyAccountUI() {
  const banner = document.getElementById('accountBanner');
  const resetBtn = document.getElementById('companyReset');
  const sel = document.getElementById('accountTypeSelect');
  if (sel && ACCOUNT.type) sel.value = ACCOUNT.type;
  if (banner) {
    if (isParticulier()) {
      const locked = atCompanyLimit();
      banner.className = 'account-banner' + (locked ? ' locked' : '');
      banner.innerHTML = locked
        ? '👤 Compte <b>Particulier</b> — limité à 1 entreprise. Pour en gérer plusieurs, passe en <b>Entreprise</b> dans les Réglages.'
        : '👤 Compte <b>Particulier</b> — tu peux créer 1 entreprise.';
    } else {
      banner.className = 'account-banner';
      banner.innerHTML = '🏢 Compte <b>Entreprise</b> — nombre d\'entreprises illimité.';
    }
    banner.classList.remove('hidden');
  }
  // Particulier ayant déjà son entreprise : on masque « Nouveau » (édition de l'existante seulement)
  if (resetBtn) resetBtn.style.display = atCompanyLimit() ? 'none' : '';

  // Particulier : on retire « Entreprises » du menu et on montre le bouton « Mon offre » -> page Packs.
  const navCompany = document.getElementById('navCompany');
  const navPacks = document.getElementById('navPacks');
  const brandField = document.getElementById('brandEditField');
  if (navCompany) navCompany.style.display = isParticulier() ? 'none' : '';
  if (navPacks) navPacks.style.display = isParticulier() ? '' : 'none';
  if (brandField) brandField.style.display = isParticulier() ? '' : 'none';
  const navAdmin = document.getElementById('navAdmin');
  if (navAdmin) navAdmin.style.display = ACCOUNT.isAdmin ? '' : 'none';
  // Fonctionnalités désactivées par l'admin -> masquées dans le menu et l'UI.
  const navVideo = document.querySelector('.nav-btn[data-view="video"]');
  if (navVideo) navVideo.style.display = featureOn('video') ? '' : 'none';
  const navEditor = document.querySelector('.nav-btn[data-view="editor"]');
  if (navEditor) navEditor.style.display = featureOn('editor') ? '' : 'none';
  document.querySelectorAll('.ai-assistant').forEach((el) => el.classList.toggle('hidden', !featureOn('ai_assistant')));
  updateOfferUI();

  // Particulier sans entreprise -> assistant pas-à-pas ; sinon -> formulaire classique.
  const wizard = document.getElementById('companyWizard');
  const layout = document.querySelector('.company-layout');
  const useWizard = isParticulier() && companies.length === 0;
  if (wizard && layout) {
    layout.classList.toggle('hidden', useWizard);
    if (useWizard) {
      if (wizard.classList.contains('hidden')) startWizard(); // 1er affichage -> reset + étape 1
    } else {
      wizard.classList.add('hidden');
    }
  }
}

// ===== Offre / Packs (Particulier) =====
// État stocké en local pour l'instant (les vrais packs + paiement viendront ensuite).
function offerActive() { return localStorage.getItem('offerActive') === '1'; }
function updateOfferUI() {
  const on = offerActive();
  const lbl = document.getElementById('navPacksLabel');
  if (lbl) lbl.textContent = on ? 'Offre activée' : 'Offre désactivée';
  const t = document.getElementById('offerToggle');
  if (t) t.checked = on;
  const st = document.getElementById('offerState');
  if (st) { st.textContent = on ? 'Activée' : 'Désactivée'; st.className = 'offer-state ' + (on ? 'on' : 'off'); }
}
(function wireOffer() {
  const t = document.getElementById('offerToggle');
  if (t) t.onchange = () => { localStorage.setItem('offerActive', t.checked ? '1' : '0'); updateOfferUI(); };
  const eb = document.getElementById('editBrandBtn');
  if (eb) eb.onclick = () => {
    document.getElementById('settingsModal').classList.add('hidden');
    const nav = document.getElementById('navCompany');
    if (nav) nav.click(); // ouvre la vue Entreprises (formulaire/assistant de la marque)
  };
})();

// ===== Page Packs (utilisateur) =====
async function loadUserPacks() {
  const wrap = document.getElementById('userPacks');
  if (!wrap) return;
  try {
    const { packs } = await window.api.getPacks();
    if (!packs.length) return; // garde la carte « bientôt disponibles »
    wrap.innerHTML = '';
    for (const p of packs) {
      const card = document.createElement('div');
      card.className = 'pack-card' + (p.promo_active ? ' promo' : '');
      const badge = p.promo_active ? '🔥 PROMO' : p.badge;
      const priceHtml = p.promo_active
        ? `<div class="pack-price"><s class="pack-old">${(+p.price_tnd).toFixed(2)}</s> ${(+p.promo_price_tnd).toFixed(2)} <small>TND</small></div>` +
          (p.promo_until ? `<div class="pack-promo-until">⏳ jusqu'au ${new Date(p.promo_until).toLocaleDateString('fr-FR')}</div>` : '')
        : `<div class="pack-price">${(+p.price_tnd).toFixed(2)} <small>TND</small></div>`;
      card.innerHTML =
        (badge ? `<span class="pack-badge">${esc(badge)}</span>` : '') +
        `<h3>${esc(p.name)}</h3>` +
        `<div class="pack-credits">${p.credits} crédits</div>` +
        priceHtml +
        `<button class="primary pack-buy">Choisir ce pack</button>`;
      card.querySelector('.pack-buy').onclick = () =>
        alert('💳 Le paiement en ligne (Flouci / Paymee) arrive très bientôt.\nEn attendant, contacte-nous pour recharger ton compte.');
      wrap.appendChild(card);
    }
  } catch (_) { /* on garde le contenu par défaut */ }
}

// ===== Dashboard admin =====
function renderAdminChart(daily) {
  const el = document.getElementById('adminChart');
  const maxS = Math.max(1, ...daily.map((d) => d.signups));
  const maxG = Math.max(1, ...daily.map((d) => d.generations));
  el.innerHTML = daily.map((d) => {
    const label = d.day.slice(8) + '/' + d.day.slice(5, 7);
    return `<div class="chart-col" title="${label} — ${d.signups} inscription(s), ${d.generations} génération(s), ${d.credits} crédit(s)">
      <div class="chart-bars">
        <div class="bar bar-signup" style="height:${Math.round((d.signups / maxS) * 100)}%"></div>
        <div class="bar bar-gen" style="height:${Math.round((d.generations / maxG) * 100)}%"></div>
      </div>
      <span class="chart-day">${label}</span>
    </div>`;
  }).join('');
}
function renderAdminModels(models) {
  const el = document.getElementById('adminModels');
  if (!models.length) { el.innerHTML = ''; return; }
  const max = Math.max(...models.map((m) => m.n));
  el.innerHTML = '<h4>Modèles les plus utilisés (30 j)</h4>' + models.map((m) =>
    `<div class="model-row"><span class="model-name">${esc(m.model)}</span>
     <div class="model-bar"><div style="width:${Math.round((m.n / max) * 100)}%"></div></div>
     <span class="model-n">${m.n}</span></div>`
  ).join('');
}

// --- Gestion des packs (admin) ---
const PACK_TYPES = [['', 'Tous'], ['particulier', 'Particulier'], ['entreprise', 'Entreprise']];
function packRow(p, isNew) {
  const tr = document.createElement('tr');
  const typeOpts = PACK_TYPES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  const promoEnd = p.promo_until ? new Date(p.promo_until).toISOString().slice(0, 10) : '';
  tr.innerHTML =
    `<td><input type="text" class="pk-name" value="${esc(p.name || '')}" placeholder="Nom" /></td>` +
    `<td><input type="number" class="pk-credits" value="${p.credits || ''}" min="1" style="width:80px" /></td>` +
    `<td><input type="number" class="pk-price" value="${p.price_tnd != null ? p.price_tnd : ''}" min="0" step="0.5" style="width:84px" /></td>` +
    `<td><input type="number" class="pk-promo" value="${p.promo_price_tnd != null ? p.promo_price_tnd : ''}" min="0" step="0.5" placeholder="—" style="width:84px" title="Prix promo (vide = pas de promo)" /></td>` +
    `<td><input type="date" class="pk-promoend" value="${promoEnd}" title="Fin de la promo (vide = sans limite)" style="width:130px" /></td>` +
    `<td><select class="pk-type">${typeOpts}</select></td>` +
    `<td><input type="text" class="pk-badge" value="${esc(p.badge || '')}" placeholder="—" style="width:100px" /></td>` +
    `<td><input type="number" class="pk-sort" value="${p.sort || 0}" style="width:60px" /></td>` +
    `<td><input type="checkbox" class="pk-active" ${p.active !== false ? 'checked' : ''} /></td>` +
    `<td class="pk-actions"><button class="mini pk-save">${isNew ? 'Créer' : '💾'}</button>${isNew ? '' : ' <button class="mini pk-del">🗑</button>'}</td>`;
  tr.querySelector('.pk-type').value = p.account_type || '';
  const fields = () => {
    const promoVal = tr.querySelector('.pk-promo').value.trim();
    const promoEndVal = tr.querySelector('.pk-promoend').value;
    return {
      name: tr.querySelector('.pk-name').value.trim(),
      credits: +tr.querySelector('.pk-credits').value,
      price_tnd: +tr.querySelector('.pk-price').value,
      promo_price_tnd: promoVal === '' ? null : +promoVal,
      promo_until: promoEndVal ? new Date(promoEndVal + 'T23:59:59').toISOString() : null,
      account_type: tr.querySelector('.pk-type').value || null,
      badge: tr.querySelector('.pk-badge').value.trim(),
      sort: +tr.querySelector('.pk-sort').value || 0,
      active: tr.querySelector('.pk-active').checked,
    };
  };
  tr.querySelector('.pk-save').onclick = async () => {
    const f = fields();
    if (!f.name || !f.credits || isNaN(f.price_tnd)) return alert('Nom, crédits et prix sont requis.');
    try {
      if (isNew) await window.api.adminPackCreate(f);
      else await window.api.adminPackUpdate(p.id, f);
      await loadAdminPacks();
      loadUserPacks(); // rafraîchit la page offre si ouverte ensuite
    } catch (e) { alert('Échec : ' + e.message); }
  };
  const del = tr.querySelector('.pk-del');
  if (del) del.onclick = async () => {
    if (!confirm(`Supprimer le pack « ${p.name} » ?`)) return;
    try { await window.api.adminPackDelete(p.id); await loadAdminPacks(); } catch (e) { alert('Échec : ' + e.message); }
  };
  return tr;
}
async function loadAdminPacks() {
  const body = document.getElementById('adminPacksBody');
  body.innerHTML = '<tr><td colspan="10"><span class="spinner"></span></td></tr>';
  try {
    const { packs } = await window.api.adminPacks();
    body.innerHTML = '';
    packs.forEach((p) => body.appendChild(packRow(p, false)));
    if (!packs.length) body.innerHTML = '<tr><td colspan="10" class="empty">Aucun pack — clique « + Nouveau pack ».</td></tr>';
  } catch (e) {
    body.innerHTML = `<tr><td colspan="10" class="empty">❌ ${esc(e.message)}</td></tr>`;
  }
}
(function wireAdminPacks() {
  const btn = document.getElementById('packNew');
  if (!btn) return;
  btn.onclick = () => {
    const body = document.getElementById('adminPacksBody');
    if (body.querySelector('.pk-new')) return;
    const tr = packRow({ active: true, sort: 0 }, true);
    tr.classList.add('pk-new');
    body.prepend(tr);
    tr.querySelector('.pk-name').focus();
  };
})();

// --- Fonctionnalités on/off (feature flags) ---
const FEATURE_DEFS = [
  { key: 'signup', label: '✍️ Inscriptions', desc: 'Création de nouveaux comptes' },
  { key: 'video', label: '🎬 Génération vidéo', desc: 'Vue Vidéo + recettes vidéo guidées' },
  { key: 'image_edit', label: '🎨 Modification IA', desc: 'Retouche des images par instruction' },
  { key: 'editor', label: '✏️ Éditeur d\'affiche', desc: 'Calques, textes, designs sauvegardés' },
  { key: 'poster_pro', label: '✨ Affiche Pro', desc: 'Visuel IA + texte en calques' },
  { key: 'ai_assistant', label: '💡 Assistant IA', desc: 'Idées et amélioration de texte' },
];
function renderFeatureFlags(features) {
  const wrap = document.getElementById('featureFlags');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const def of FEATURE_DEFS) {
    const on = features[def.key] !== false;
    const row = document.createElement('div');
    row.className = 'ff-row';
    row.innerHTML =
      `<div class="ff-info"><span class="ff-label">${def.label}</span><span class="ff-desc">${def.desc}</span></div>` +
      `<label class="switch"><input type="checkbox" ${on ? 'checked' : ''} /><span class="slider"></span></label>` +
      `<span class="offer-state ${on ? 'on' : 'off'}">${on ? 'Active' : 'Désactivée'}</span>`;
    const input = row.querySelector('input');
    const state = row.querySelector('.offer-state');
    input.onchange = async () => {
      input.disabled = true;
      try {
        const r = await window.api.adminSetSettings({ features: { [def.key]: input.checked } });
        const now = r.features[def.key] !== false;
        input.checked = now;
        state.textContent = now ? 'Active' : 'Désactivée';
        state.className = 'offer-state ' + (now ? 'on' : 'off');
        ACCOUNT.features = r.features; // applique aussi à la session admin
        applyAccountUI();
        renderGuidedCards();
      } catch (e) {
        alert('Échec : ' + e.message);
        input.checked = !input.checked;
      } finally {
        input.disabled = false;
      }
    };
    wrap.appendChild(row);
  }
}

// --- Réglage mode gratuit ---
(function wireFreeMode() {
  const t = document.getElementById('freeModeToggle');
  if (!t) return;
  t.onchange = async () => {
    const st = document.getElementById('freeModeState');
    try {
      if (!t.checked && !confirm('Désactiver le mode gratuit ?\nLes utilisateurs non-illimités seront limités par leur solde de crédits.')) {
        t.checked = true;
        return;
      }
      const r = await window.api.adminSetSettings({ free_mode: t.checked });
      t.checked = r.free_mode;
      st.textContent = r.free_mode ? 'Actif' : 'Désactivé';
      st.className = 'offer-state ' + (r.free_mode ? 'on' : 'off');
      refreshBalance();
    } catch (e) { alert('Échec : ' + e.message); }
  };
})();

async function loadAdmin() {
  const stats = document.getElementById('adminStats');
  const recent = document.getElementById('adminRecent');
  stats.innerHTML = '<span class="spinner"></span>';
  try {
    const o = await window.api.adminOverview();
    const card = (val, label) => `<div class="stat-card"><div class="sc-val">${val}</div><div class="sc-label">${label}</div></div>`;
    stats.innerHTML =
      card(o.users, 'Utilisateurs') +
      card('+' + o.usersWeek, 'Inscrits cette semaine') +
      card(o.companies, 'Entreprises / marques') +
      card(o.tasks, 'Générations lancées') +
      card(o.creditsSpent, 'Crédits consommés');
    recent.innerHTML = (o.recent || []).map((r) => {
      const d = new Date(r.created_at);
      const when = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const cls = r.delta < 0 ? 'neg' : 'pos';
      return `<div class="ar-row"><span class="ar-when">${when}</span><span class="ar-delta ${cls}">${r.delta > 0 ? '+' : ''}${r.delta}</span><span>${esc(r.email)}</span><span style="color:var(--muted)">${esc(r.reason || '')}</span></div>`;
    }).join('') || '<p class="empty">Aucune activité.</p>';
  } catch (e) {
    stats.innerHTML = `<p class="empty">❌ ${esc(e.message)}</p>`;
  }
  // Réglages, graphique d'activité, usage des modèles et packs — en parallèle.
  window.api.adminSettings().then((s) => {
    const t = document.getElementById('freeModeToggle');
    const st = document.getElementById('freeModeState');
    if (t) t.checked = s.free_mode;
    if (st) { st.textContent = s.free_mode ? 'Actif' : 'Désactivé'; st.className = 'offer-state ' + (s.free_mode ? 'on' : 'off'); }
    renderFeatureFlags(s.features || {});
  }).catch(() => {});
  window.api.adminDaily().then((d) => {
    renderAdminChart(d.daily || []);
    renderAdminModels(d.models || []);
  }).catch(() => {});
  loadAdminPacks();
  await loadAdminUsers();
}

async function loadAdminUsers() {
  const body = document.getElementById('adminUsersBody');
  const search = document.getElementById('adminSearch').value.trim();
  body.innerHTML = '<tr><td colspan="7"><span class="spinner"></span></td></tr>';
  try {
    const { users } = await window.api.adminUsers(search);
    body.innerHTML = '';
    for (const u of users) {
      const tr = document.createElement('tr');
      const created = new Date(u.created_at).toLocaleDateString('fr-FR');
      tr.innerHTML =
        `<td class="at-email" title="${esc(u.email)}">${esc(u.email)}</td>` +
        `<td><select class="at-type"><option value="">—</option><option value="particulier">Particulier</option><option value="entreprise">Entreprise</option></select></td>` +
        `<td><span class="at-credits">${u.credits}</span> <button class="credit-edit" title="Modifier le solde">✎</button></td>` +
        `<td><input type="checkbox" class="at-unlimited" ${u.unlimited ? 'checked' : ''} /></td>` +
        `<td>${u.company_count}</td>` +
        `<td><input type="checkbox" class="at-admin" ${u.is_admin ? 'checked' : ''} /></td>` +
        `<td>${created}</td>`;
      tr.querySelector('.at-type').value = u.account_type || '';
      const upd = async (fields) => {
        try { await window.api.adminUpdateUser(u.id, fields); }
        catch (e) { alert('Échec : ' + e.message); loadAdminUsers(); }
      };
      tr.querySelector('.at-type').onchange = (e) => upd({ account_type: e.target.value || null });
      tr.querySelector('.at-unlimited').onchange = (e) => upd({ unlimited: e.target.checked });
      tr.querySelector('.at-admin').onchange = (e) => upd({ is_admin: e.target.checked });
      tr.querySelector('.credit-edit').onclick = async () => {
        const v = prompt(`Nouveau solde pour ${u.email} :`, u.credits);
        if (v === null) return;
        const n = parseInt(v, 10);
        if (isNaN(n) || n < 0) return alert('Valeur invalide.');
        await upd({ credits: n });
        tr.querySelector('.at-credits').textContent = n;
        u.credits = n;
      };
      body.appendChild(tr);
    }
    if (!users.length) body.innerHTML = '<tr><td colspan="7" class="empty">Aucun utilisateur trouvé.</td></tr>';
  } catch (e) {
    body.innerHTML = `<tr><td colspan="7" class="empty">❌ ${esc(e.message)}</td></tr>`;
  }
}
(function wireAdminSearch() {
  const inp = document.getElementById('adminSearch');
  if (!inp) return;
  let t;
  inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(loadAdminUsers, 350); });
})();

async function loadCompanies() {
  companies = await window.api.companyList();
  renderCompanyList();
  populateCompanySelectors();
  updateBrandHints();
  updateEditorBrand();
  applyAccountUI();
}

// --- Formulaire entreprise ---
let formColors = [];
let formLogoDataUrl = null;
let formRemoveLogo = false;
let formLogoUrl = null; // logo récupéré depuis le site web (URL distante)

function renderFormColors() {
  const el = document.getElementById('colorChips');
  el.innerHTML = '';
  formColors.forEach((col, i) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.background = col;
    chip.title = col;
    const x = document.createElement('span');
    x.className = 'x';
    x.textContent = '×';
    x.onclick = () => {
      formColors.splice(i, 1);
      renderFormColors();
    };
    chip.appendChild(x);
    el.appendChild(chip);
  });
}
// Normalise un code hex saisi/collé (#abc, abc, #aabbcc, aabbcc) -> #aabbcc, sinon null.
function normalizeHex(h) {
  h = (h || '').trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(h)) return ('#' + h.replace('#', '')).toLowerCase();
  if (/^#?[0-9a-fA-F]{3}$/.test(h)) {
    const x = h.replace('#', '');
    return ('#' + x[0] + x[0] + x[1] + x[1] + x[2] + x[2]).toLowerCase();
  }
  return null;
}
const newColorEl = document.getElementById('newColor');
const newColorHexEl = document.getElementById('newColorHex');
// Le sélecteur met à jour le champ texte, et inversement (si hex valide).
newColorEl.addEventListener('input', () => {
  newColorHexEl.value = newColorEl.value;
});
newColorHexEl.addEventListener('input', () => {
  const n = normalizeHex(newColorHexEl.value);
  if (n) newColorEl.value = n;
});
newColorHexEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('addColor').click();
  }
});
document.getElementById('addColor').onclick = () => {
  const v = normalizeHex(newColorHexEl.value) || newColorEl.value;
  if (!v) return;
  if (!formColors.includes(v)) formColors.push(v);
  newColorHexEl.value = '';
  renderFormColors();
};
document.getElementById('companyLogo').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    formLogoDataUrl = await downscaleDataUrl(r.result, 512, 'image/png');
    formRemoveLogo = false;
    const p = document.getElementById('companyLogoPreview');
    p.src = formLogoDataUrl;
    p.classList.remove('hidden');
    document.getElementById('companyLogoClear').classList.remove('hidden');
  };
  r.readAsDataURL(f);
});
document.getElementById('companyLogoClear').onclick = () => {
  formLogoDataUrl = null;
  formLogoUrl = null;
  formRemoveLogo = true;
  document.getElementById('companyLogo').value = '';
  document.getElementById('companyLogoPreview').classList.add('hidden');
  document.getElementById('companyLogoClear').classList.add('hidden');
};

function resetCompanyForm() {
  document.getElementById('companyId').value = '';
  document.getElementById('companyName').value = '';
  document.getElementById('companyWebsite').value = '';
  document.getElementById('companyInfo').value = '';
  ['companyCategory', 'companyEmail', 'companyPhone', 'companyWhatsapp', 'companyFacebook', 'companyInstagram'].forEach((id) => (document.getElementById(id).value = ''));
  document.getElementById('companyFetchStatus').textContent = '';
  formColors = [];
  renderFormColors();
  formLogoDataUrl = null;
  formRemoveLogo = false;
  formLogoUrl = null;
  document.getElementById('companyLogo').value = '';
  document.getElementById('companyLogoPreview').classList.add('hidden');
  document.getElementById('companyLogoClear').classList.add('hidden');
  document.getElementById('companyFormTitle').textContent = 'Nouvelle entreprise';
}
document.getElementById('companyReset').onclick = resetCompanyForm;

// --- Récupération auto des infos depuis le site web ---
document.getElementById('companyFetch').onclick = async () => {
  const status = document.getElementById('companyFetchStatus');
  const url = document.getElementById('companyWebsite').value.trim();
  if (!url) { status.textContent = "Entre d'abord l'adresse du site web."; return; }
  const btn = document.getElementById('companyFetch');
  btn.disabled = true;
  status.textContent = '⏳ Lecture du site en cours…';
  try {
    const d = await window.api.fetchSite(url);
    const set = (id, v) => { if (v) document.getElementById(id).value = v; };
    set('companyName', d.name);
    set('companyInfo', d.info);
    set('companyEmail', d.email);
    set('companyPhone', d.phone);
    set('companyWhatsapp', d.whatsapp);
    set('companyFacebook', d.facebook);
    set('companyInstagram', d.instagram);
    const cols = d.colors && d.colors.length ? d.colors : d.color ? [d.color] : [];
    let addedCol = 0;
    cols.forEach((col) => { const n = normalizeHex(col); if (n && !formColors.includes(n)) { formColors.push(n); addedCol++; } });
    if (addedCol) renderFormColors();
    if (d.logo) {
      formLogoUrl = d.logo;
      formRemoveLogo = false;
      const p = document.getElementById('companyLogoPreview');
      p.src = d.logo;
      p.classList.remove('hidden');
      document.getElementById('companyLogoClear').classList.remove('hidden');
    }
    // Détection automatique de la catégorie/secteur via l'IA (si vide)
    const catEl = document.getElementById('companyCategory');
    if (!catEl.value.trim() && (d.name || d.info)) {
      try {
        const r2 = await window.api.aiChat({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: "Tu identifies le secteur d'activité d'une entreprise. Réponds UNIQUEMENT par 1 à 3 mots (ex : Restauration, Immobilier, Boutique high-tech), sans phrase ni ponctuation finale." },
            { role: 'user', content: `Entreprise : ${d.name || ''}. Description : ${d.info || ''}. Site : ${url}. Quel est son secteur d'activité ?` },
          ],
        });
        if (r2.text) catEl.value = r2.text.trim().replace(/[.\n]/g, '').slice(0, 40);
      } catch (_) {}
    }
    const n = ['name', 'email', 'phone', 'whatsapp', 'facebook', 'instagram'].filter((k) => d[k]).length;
    status.textContent = (n || addedCol) ? `✅ Récupéré : ${n} champ(s), ${addedCol} couleur(s), ${catEl.value ? 'catégorie ✓, ' : ''}${d.logo ? 'logo ✓' : 'pas de logo'}. Vérifie puis Enregistre.` : "ℹ️ Peu d'infos trouvées — complète à la main.";
  } catch (e) {
    status.textContent = '❌ ' + e.message;
  } finally {
    btn.disabled = false;
  }
};

// ===== Assistant pas-à-pas (compte Particulier) =====
let wizStep = 1, wizColors = [], wizLogoDataUrl = null, wizLogoUrl = null, wizWired = false;
const WIZ_FIELDS = ['wizName', 'wizWebsite', 'wizEmail', 'wizPhone', 'wizWhatsapp', 'wizFacebook', 'wizInstagram', 'wizCategory', 'wizInfo'];

function renderWizColors() {
  const el = document.getElementById('wizColorChips');
  el.innerHTML = '';
  wizColors.forEach((col, i) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.background = col;
    chip.title = col;
    const x = document.createElement('span');
    x.className = 'x';
    x.textContent = '×';
    x.onclick = () => { wizColors.splice(i, 1); renderWizColors(); };
    chip.appendChild(x);
    el.appendChild(chip);
  });
}
function showWizStep(n) {
  wizStep = n;
  document.querySelectorAll('#companyWizard .wiz-step').forEach((s) => s.classList.toggle('hidden', +s.dataset.step !== n));
  document.querySelectorAll('#companyWizard .wiz-dot').forEach((d) => {
    const s = +d.dataset.s;
    d.classList.toggle('active', s === n);
    d.classList.toggle('done', s < n);
  });
  document.getElementById('wizBack').classList.toggle('hidden', n === 1);
  document.getElementById('wizNext').textContent = n === 4 ? '✓ Terminer' : (n === 1 ? 'Analyser & continuer →' : 'Continuer →');
  document.getElementById('wizError').textContent = '';
}
function startWizard() {
  // reset état
  wizStep = 1; wizColors = []; wizLogoDataUrl = null; wizLogoUrl = null;
  WIZ_FIELDS.forEach((id) => { const e = document.getElementById(id); if (e) e.value = ''; });
  renderWizColors();
  document.getElementById('wizLogoPreview').classList.add('hidden');
  document.getElementById('wizLogoClear').classList.add('hidden');
  document.getElementById('wizFetchStatus').textContent = '';
  document.querySelectorAll('#companyWizard .wiz-tag').forEach((t) => t.classList.add('hidden'));
  document.getElementById('companyWizard').classList.remove('hidden');
  showWizStep(1);
  wireWizard();
}
function wireWizard() {
  if (wizWired) return; wizWired = true;
  // Logo
  document.getElementById('wizLogo').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      wizLogoDataUrl = await downscaleDataUrl(r.result, 512, 'image/png');
      wizLogoUrl = null;
      const p = document.getElementById('wizLogoPreview');
      p.src = wizLogoDataUrl; p.classList.remove('hidden');
      document.getElementById('wizLogoClear').classList.remove('hidden');
    };
    r.readAsDataURL(f);
  });
  document.getElementById('wizLogoClear').onclick = () => {
    wizLogoDataUrl = null; wizLogoUrl = null;
    document.getElementById('wizLogo').value = '';
    document.getElementById('wizLogoPreview').classList.add('hidden');
    document.getElementById('wizLogoClear').classList.add('hidden');
  };
  // Couleurs
  document.getElementById('wizAddColor').onclick = () => {
    const hex = document.getElementById('wizNewColorHex');
    const v = normalizeHex(hex.value) || document.getElementById('wizNewColor').value;
    if (v && !wizColors.includes(v)) wizColors.push(v);
    hex.value = ''; renderWizColors();
  };
  // Navigation
  document.getElementById('wizBack').onclick = () => showWizStep(Math.max(1, wizStep - 1));
  document.getElementById('wizNext').onclick = wizNext;
}
function wizTag(id, on) {
  const t = document.querySelector(`#companyWizard .wiz-tag[data-for="${id}"]`);
  if (t) t.classList.toggle('hidden', !on);
}
async function wizFetch() {
  const url = document.getElementById('wizWebsite').value.trim();
  const status = document.getElementById('wizFetchStatus');
  if (!url) return; // pas de site -> rien à récupérer
  status.textContent = '⏳ Analyse du site en cours…';
  try {
    const d = await window.api.fetchSite(url);
    const set = (id, v) => { if (v && !document.getElementById(id).value.trim()) { document.getElementById(id).value = v; wizTag(id, true); } };
    if (d.name && !document.getElementById('wizName').value.trim()) document.getElementById('wizName').value = d.name;
    set('wizInfo', d.info); set('wizEmail', d.email); set('wizPhone', d.phone);
    set('wizWhatsapp', d.whatsapp); set('wizFacebook', d.facebook); set('wizInstagram', d.instagram);
    const cols = d.colors && d.colors.length ? d.colors : (d.color ? [d.color] : []);
    let addedCol = 0;
    cols.forEach((c) => { const n = normalizeHex(c); if (n && !wizColors.includes(n)) { wizColors.push(n); addedCol++; } });
    if (addedCol) { renderWizColors(); wizTag('wizColors', true); }
    if (d.logo && !wizLogoDataUrl) {
      wizLogoUrl = d.logo;
      const p = document.getElementById('wizLogoPreview');
      p.src = d.logo; p.classList.remove('hidden');
      document.getElementById('wizLogoClear').classList.remove('hidden');
    }
    // Détection du secteur via IA si non rempli
    const catEl = document.getElementById('wizCategory');
    if (!catEl.value.trim() && (d.name || d.info)) {
      try {
        const r2 = await window.api.aiChat({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: "Tu identifies le secteur d'activité d'une entreprise. Réponds UNIQUEMENT par 1 à 3 mots (ex : Restauration, Immobilier), sans phrase ni ponctuation finale." },
            { role: 'user', content: `Entreprise : ${d.name || ''}. Description : ${d.info || ''}. Site : ${url}. Quel est son secteur ?` },
          ],
        });
        if (r2.text) { catEl.value = r2.text.trim().replace(/[.\n]/g, '').slice(0, 40); wizTag('wizCategory', true); }
      } catch (_) {}
    }
    const n = ['email', 'phone', 'whatsapp', 'facebook', 'instagram'].filter((k) => d[k]).length;
    status.textContent = (n || addedCol || d.logo) ? `✅ Infos récupérées — vérifie-les aux étapes suivantes.` : "ℹ️ Peu d'infos trouvées — complète à la main.";
  } catch (e) {
    status.textContent = 'ℹ️ Site illisible — complète les infos à la main.';
  }
}
async function wizNext() {
  const err = document.getElementById('wizError');
  err.textContent = '';
  if (wizStep === 1) {
    if (!document.getElementById('wizName').value.trim()) { err.textContent = 'Le nom de la marque est requis.'; return; }
    const btn = document.getElementById('wizNext');
    btn.disabled = true; btn.textContent = 'Analyse…';
    await wizFetch();
    btn.disabled = false;
    showWizStep(2);
    return;
  }
  if (wizStep < 4) { showWizStep(wizStep + 1); return; }
  // Étape 4 -> enregistrement
  await wizFinish();
}
async function wizFinish() {
  const btn = document.getElementById('wizNext');
  const err = document.getElementById('wizError');
  const val = (id) => document.getElementById(id).value.trim();
  const payload = {
    name: val('wizName'),
    website: val('wizWebsite'),
    info: val('wizInfo'),
    email: val('wizEmail'),
    phone: val('wizPhone'),
    whatsapp: val('wizWhatsapp'),
    facebook: val('wizFacebook'),
    instagram: val('wizInstagram'),
    category: val('wizCategory'),
    colors: wizColors,
  };
  if (wizLogoDataUrl) payload.logoDataUrl = wizLogoDataUrl;
  else if (wizLogoUrl) payload.logoUrl = wizLogoUrl;
  btn.disabled = true; btn.textContent = 'Création…';
  try {
    const saved = await window.api.companySave(payload);
    activeCompanyId = saved.id;
    await window.api.setActiveCompany(saved.id);
    await loadCompanies(); // companies.length=1 -> applyAccountUI masque l'assistant
  } catch (e) {
    const msg = /PARTICULIER_LIMIT/.test(e.message) ? 'Une entreprise existe déjà sur ce compte.' : e.message;
    err.textContent = '❌ ' + msg;
    btn.disabled = false; btn.textContent = '✓ Terminer';
  }
}

// --- Import / Export des entreprises ---
document.getElementById('dataExport').onclick = async () => {
  try {
    const res = await window.api.dataExport();
    if (!res.canceled) alert(`✅ ${res.count} entreprise(s) exportée(s) :\n${res.filePath}`);
  } catch (e) {
    alert('Échec de l\'export : ' + e.message);
  }
};
document.getElementById('dataImportFile').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const data = JSON.parse(r.result);
      const res = await window.api.dataImport(data);
      await loadCompanies();
      alert(`✅ ${res.added} entreprise(s) importée(s).`);
    } catch (err) {
      alert('Échec de l\'import : ' + err.message);
    } finally {
      e.target.value = '';
    }
  };
  r.readAsText(f);
});

function editCompany(c) {
  document.getElementById('companyId').value = c.id;
  document.getElementById('companyName').value = c.name || '';
  document.getElementById('companyWebsite').value = c.website || '';
  document.getElementById('companyInfo').value = c.info || '';
  document.getElementById('companyEmail').value = c.email || '';
  document.getElementById('companyPhone').value = c.phone || '';
  document.getElementById('companyWhatsapp').value = c.whatsapp || '';
  document.getElementById('companyFacebook').value = c.facebook || '';
  document.getElementById('companyInstagram').value = c.instagram || '';
  document.getElementById('companyCategory').value = c.category || '';
  formColors = [...(c.colors || [])];
  renderFormColors();
  formLogoDataUrl = null;
  formRemoveLogo = false;
  formLogoUrl = null;
  document.getElementById('companyLogo').value = ''; // permet de re-choisir le même fichier
  const p = document.getElementById('companyLogoPreview');
  const clr = document.getElementById('companyLogoClear');
  if (c.logoFile) {
    window.api.mediaDataUrl(c.logoFile).then((du) => {
      p.src = du;
      p.classList.remove('hidden');
    });
    clr.classList.remove('hidden');
  } else {
    p.classList.add('hidden');
    clr.classList.add('hidden');
  }
  document.getElementById('companyFormTitle').textContent = "Modifier l'entreprise";
  document.querySelector('.nav-btn[data-view="company"]').click();
}

document.getElementById('companySave').onclick = async () => {
  const name = document.getElementById('companyName').value.trim();
  if (!name) {
    alert('Le nom de l\'entreprise est requis.');
    return;
  }
  const editingId = document.getElementById('companyId').value || undefined;
  // Particulier : pas de 2e entreprise (on autorise seulement la modification de l'existante).
  if (!editingId && atCompanyLimit()) {
    alert('Compte Particulier : une seule entreprise autorisée.\nPasse en Entreprise dans les Réglages pour en ajouter d\'autres.');
    return;
  }
  const payload = {
    id: editingId,
    name,
    category: document.getElementById('companyCategory').value.trim(),
    website: document.getElementById('companyWebsite').value.trim(),
    info: document.getElementById('companyInfo').value.trim(),
    email: document.getElementById('companyEmail').value.trim(),
    phone: document.getElementById('companyPhone').value.trim(),
    whatsapp: document.getElementById('companyWhatsapp').value.trim(),
    facebook: document.getElementById('companyFacebook').value.trim(),
    instagram: document.getElementById('companyInstagram').value.trim(),
    colors: formColors,
  };
  if (formLogoDataUrl) payload.logoDataUrl = formLogoDataUrl;
  else if (formLogoUrl) payload.logoUrl = formLogoUrl;
  if (formRemoveLogo) payload.removeLogo = true;
  const btn = document.getElementById('companySave');
  btn.disabled = true;
  const oldLabel = btn.textContent;
  btn.textContent = 'Enregistrement…';
  try {
    const saved = await window.api.companySave(payload);
    resetCompanyForm();
    if (!activeCompanyId) {
      activeCompanyId = saved.id;
      await window.api.setActiveCompany(saved.id);
    }
    await loadCompanies(); // un seul rendu -> plus de doublon
  } catch (e) {
    const msg = /PARTICULIER_LIMIT/.test(e.message)
      ? 'Compte Particulier : une seule entreprise autorisée. Passe en Entreprise dans les Réglages.'
      : e.message;
    alert('Échec de l\'enregistrement : ' + msg);
  } finally {
    btn.disabled = false;
    btn.textContent = oldLabel;
  }
};

// Changer de type de compte depuis les Réglages.
document.getElementById('saveAccountType').onclick = async () => {
  const sel = document.getElementById('accountTypeSelect');
  const hint = document.getElementById('accountTypeHint');
  const btn = document.getElementById('saveAccountType');
  btn.disabled = true;
  try {
    const r = await window.api.setAccountType(sel.value);
    ACCOUNT.type = r.accountType;
    applyAccountUI();
    hint.textContent = '✅ Type de compte mis à jour : ' + (r.accountType === 'entreprise' ? 'Entreprise' : 'Particulier') + '.';
  } catch (e) {
    hint.textContent = '❌ ' + e.message;
  } finally {
    btn.disabled = false;
  }
};

// --- Charte dans l'éditeur ---
function updateEditorBrand() {
  const c = activeCompany();
  const nameEl = document.getElementById('editorBrandName');
  const colorsEl = document.getElementById('editorColors');
  const logoBtn = document.getElementById('addCompanyLogo');
  colorsEl.innerHTML = '';
  if (!c) {
    nameEl.textContent = 'Aucune entreprise active';
    logoBtn.disabled = true;
    return;
  }
  nameEl.textContent = c.name;
  logoBtn.disabled = !c.logoFile;
  (c.colors || []).forEach((col) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.style.background = col;
    chip.title = `Texte en ${col}`;
    chip.onclick = () => {
      document.getElementById('textColor').value = col;
      if (selected && selected.type === 'text') {
        selected.color = col;
        render();
      }
    };
    colorsEl.appendChild(chip);
  });
}
document.getElementById('addCompanyLogo').onclick = async () => {
  const c = activeCompany();
  if (!c || !c.logoFile) return;
  const du = await window.api.mediaDataUrl(c.logoFile);
  const img = new Image();
  img.onload = () => {
    const w = Math.min(300, img.naturalWidth);
    const h = w * (img.naturalHeight / img.naturalWidth);
    const layer = { type: 'image', img, x: 40, y: 40, w, h };
    layers.push(layer);
    selected = layer;
    render();
  };
  img.src = du;
};

// ============ Images sources (upload) ============
// Miniatures génériques : grille d'aperçus avec bouton de retrait.
function renderThumbs(container, list, onChange) {
  container.innerHTML = '';
  list.forEach((it, i) => {
    const d = document.createElement('div');
    d.className = 'thumb';
    d.innerHTML = `<img src="${it.dataUrl}" alt="Image importée ${i + 1}" /><button type="button" class="thumb-x" aria-label="Retirer cette image">✕</button>`;
    d.querySelector('.thumb-x').onclick = () => { list.splice(i, 1); onChange(); };
    container.appendChild(d);
  });
}
// Lit + réduit un fichier image -> {dataUrl, name}
function readImageFile(f) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = async () => resolve({ dataUrl: await downscaleDataUrl(r.result, 1280, 'image/jpeg'), name: f.name });
    r.readAsDataURL(f);
  });
}

// Vue Image : PLUSIEURS images sources (référence de style, personnage, produit… max 8).
const IMG_MAX_SOURCES = 8;
const imgSrcList = [];
(function wireImgSources() {
  const file = document.getElementById('imgSourceFile');
  const name = document.getElementById('imgSourceName');
  const clear = document.getElementById('imgSourceClear');
  const thumbs = document.getElementById('imgThumbs');
  const sync = () => {
    name.textContent = imgSrcList.length
      ? `${imgSrcList.length} image(s) — référence, personnage, produit…`
      : 'Aucune — mode texte → image';
    clear.classList.toggle('hidden', !imgSrcList.length);
    renderThumbs(thumbs, imgSrcList, sync);
  };
  file.addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, IMG_MAX_SOURCES - imgSrcList.length);
    for (const f of files) imgSrcList.push(await readImageFile(f));
    file.value = '';
    sync();
  });
  clear.onclick = () => { imgSrcList.length = 0; sync(); };
})();

// Vue Vidéo : image de début (1 seule).
const vidSrc = { v: null };
(function wireVidSource() {
  const file = document.getElementById('vidSourceFile');
  const name = document.getElementById('vidSourceName');
  const prev = document.getElementById('vidSourcePreview');
  const clear = document.getElementById('vidSourceClear');
  file.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    vidSrc.v = await readImageFile(f);
    name.textContent = f.name;
    prev.src = vidSrc.v.dataUrl;
    prev.classList.remove('hidden');
    clear.classList.remove('hidden');
  });
  clear.onclick = () => {
    vidSrc.v = null;
    file.value = '';
    prev.classList.add('hidden');
    clear.classList.add('hidden');
    name.textContent = 'Aucune — mode texte → vidéo';
  };
})();

// Image de fin (dernière frame) pour la vidéo
const vidEnd = { v: null };
(function wireVidEnd() {
  const file = document.getElementById('vidEndFile');
  const name = document.getElementById('vidEndName');
  const prev = document.getElementById('vidEndPreview');
  const clr = document.getElementById('vidEndClear');
  file.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const ds = await downscaleDataUrl(reader.result, 1280, 'image/jpeg');
      vidEnd.v = { dataUrl: ds, name: f.name };
      name.textContent = f.name;
      prev.src = ds;
      prev.classList.remove('hidden');
      clr.classList.remove('hidden');
    };
    reader.readAsDataURL(f);
  });
  clr.onclick = () => {
    vidEnd.v = null;
    file.value = '';
    prev.classList.add('hidden');
    clr.classList.add('hidden');
    name.textContent = 'Aucune';
  };
})();

async function uploadSource(holder, statusEl) {
  if (!holder.v) return null;
  statusEl.innerHTML = '<span class="spinner"></span>Upload de l\'image source…';
  const { url } = await window.api.uploadFile({ base64DataUrl: holder.v.dataUrl, fileName: holder.v.name });
  return url;
}

// Consigne ajoutée au prompt quand on intègre le logo, et upload du logo de l'entreprise active.
const LOGO_DIRECTIVE =
  " IMPORTANT : utilise le logo de marque fourni EXACTEMENT tel quel — ne le redessine pas, ne ré-écris pas son texte, ne change pas ses couleurs ni ses formes. Garde-le identique, net et lisible, et place-le élégamment dans la composition (en-tête ou un coin).";
async function uploadCompanyLogo(statusEl) {
  const c = activeCompany();
  if (!c || !c.logoFile) return null;
  statusEl.innerHTML = '<span class="spinner"></span>Préparation du logo…';
  try {
    // Le logo est une URL (Supabase) -> le backend la télécharge et la ré-héberge en vraie image chez kie.
    const up = await window.api.uploadFile({ remoteUrl: c.logoFile, fileName: 'logo.png' });
    return up.url;
  } catch (_) {
    return null;
  }
}

// ============ Remplissage des sélecteurs + estimation de coût ============
const imgModelSel = document.getElementById('imgModel');
MODELS.image.forEach((m) => imgModelSel.add(new Option(m.label, m.id)));
const vidModelSel = document.getElementById('vidModel');
MODELS.video.forEach((m) => vidModelSel.add(new Option(m.label, m.id)));
const vidResSel = document.getElementById('vidRes');
const vidDurSel = document.getElementById('vidDur');
fillStyleSelect(document.getElementById('imgStyle'), 'image');
fillStyleSelect(document.getElementById('vidStyle'), 'video');

// Applique le style sélectionné (vue manuelle) au sujet/prompt.
function applyStyleManual(prefix, subject) {
  const kind = prefix === 'img' ? 'image' : 'video';
  const sel = document.getElementById(prefix + 'Style');
  const style = STYLES[kind].find((s) => s.id === sel.value);
  return style && style.t ? buildStylePrompt(style, subject) : subject;
}

function imageCost() {
  const m = findModel('image', imgModelSel.value);
  if (m.creditsByRes) return m.creditsByRes[document.getElementById('imgRes').value] || 0;
  return m.credits || 0;
}
function updateImageUI() {
  const m = findModel('image', imgModelSel.value);
  document.getElementById('imgResWrap').classList.toggle('hidden', !m.res);
  const c = imageCost();
  document.getElementById('imgCost').textContent = `Coût estimé : ~${c} crédits (~$${usd(c)}) / image`;
}
imgModelSel.onchange = updateImageUI;
document.getElementById('imgRes').onchange = updateImageUI;

function videoCost() {
  const m = findModel('video', vidModelSel.value);
  const dur = parseInt(vidDurSel.value, 10) || 8;
  const cps = m.creditsPerSecByRes ? m.creditsPerSecByRes[vidResSel.value] || 0 : m.creditsPerSec || 0;
  return Math.round(cps * dur);
}
function updateVideoUI() {
  const m = findModel('video', vidModelSel.value);
  vidResSel.innerHTML = '';
  m.resolutions.forEach((r) => vidResSel.add(new Option(r, r)));
  vidResSel.value = m.resolutions.includes('720p') ? '720p' : m.resolutions[0];
  vidDurSel.innerHTML = '';
  m.durations.forEach((d) => vidDurSel.add(new Option(d + ' s', d)));
  vidDurSel.value = m.durations.includes(8) ? 8 : m.durations[0];
  document.getElementById('vidAudioWrap').classList.toggle('hidden', !m.audio);
  const c = videoCost();
  document.getElementById('vidCost').textContent = `Coût estimé : ~${c} crédits (~$${usd(c)}) / vidéo`;
}
vidModelSel.onchange = updateVideoUI;
vidResSel.onchange = updateVideoUI;
vidDurSel.onchange = updateVideoUI;
updateImageUI();
updateVideoUI();

// ============ Polling ============
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function sleepCancellable(ms, token) {
  const step = 500;
  for (let t = 0; t < ms; t += step) {
    if (token && token.cancelled) return;
    await sleep(step);
  }
}
async function pollUntilDone(descriptor, statusEl, label, token) {
  const maxAttempts = 160; // ~13 min max (5 s d'intervalle)
  for (let i = 0; i < maxAttempts; i++) {
    if (token && token.cancelled) throw new Error('Génération annulée.');
    await sleepCancellable(5000, token);
    if (token && token.cancelled) throw new Error('Génération annulée.');
    const res = await window.api.poll(descriptor);
    if (res.done) return res;
    if (res.failed) throw new Error(res.error || 'La génération a échoué.');
    statusEl.innerHTML = `<span class="spinner"></span>${label} en cours… (${i + 1})`;
  }
  throw new Error('Délai dépassé. Réessayez plus tard.');
}

// Jetons d'annulation par vue
let imgGenToken = null;
let vidGenToken = null;
let guidedGenToken = null;
document.getElementById('imgCancel').onclick = () => { if (imgGenToken) imgGenToken.cancelled = true; };
document.getElementById('vidCancel').onclick = () => { if (vidGenToken) vidGenToken.cancelled = true; };
document.getElementById('guidedCancel').onclick = () => { if (guidedGenToken) guidedGenToken.cancelled = true; };

// ============ Génération d'IMAGE ============
function buildImageDescriptor(m, prompt, images) {
  const imgs = (images || []).filter(Boolean);
  if (m.api === 'flux') {
    const input = {
      prompt,
      aspectRatio: document.getElementById('imgRatio').value,
      model: m.id,
      outputFormat: 'png',
    };
    if (imgs.length) input.inputImage = imgs[0]; // Flux : une seule image
    return { api: 'flux', model: m.id, input };
  }
  // API unifiée (jobs). Certains modèles ont leur propre format d'entrée (jobsInput).
  const ratio = document.getElementById('imgRatio').value;
  const input = m.jobsInput
    ? m.jobsInput(prompt, { aspect_ratio: ratio, resolution: m.res ? document.getElementById('imgRes').value : undefined })
    : { prompt, aspect_ratio: ratio, output_format: 'png' };
  if (!m.jobsInput && m.res) input.resolution = document.getElementById('imgRes').value;
  if (imgs.length && m.imageField) input[m.imageField] = imgs;
  return { api: 'jobs', model: m.id, input };
}

const imgGenerate = document.getElementById('imgGenerate');
imgGenerate.onclick = async () => {
  const prompt = document.getElementById('imgPrompt').value.trim();
  const statusEl = document.getElementById('imgStatus');
  const resultEl = document.getElementById('imgResult');
  if (!prompt) {
    statusEl.textContent = 'Veuillez saisir un texte descriptif.';
    statusEl.className = 'status error';
    return;
  }
  const m = findModel('image', imgModelSel.value);
  // Compatibilité : tous les modèles n'acceptent pas d'images sources.
  if (imgSrcList.length && m.api !== 'flux' && !m.imageField) {
    statusEl.textContent = `Le modèle « ${m.label} » ne prend pas d'images sources — choisis 🔥 Snap Max (jusqu'à 8 images) ou retire les images.`;
    statusEl.className = 'status error';
    return;
  }
  if (imgSrcList.length > 1 && m.api === 'flux') {
    statusEl.textContent = `${m.label} n'accepte qu'UNE image source — garde la première ou choisis 🔥 Snap Max (multi-images).`;
    statusEl.className = 'status error';
    return;
  }
  imgGenerate.disabled = true;
  imgGenToken = { cancelled: false };
  document.getElementById('imgCancel').classList.remove('hidden');
  resultEl.innerHTML = '';
  statusEl.className = 'status';
  statusEl.innerHTML = '<span class="spinner"></span>Préparation…';
  try {
    const images = [];
    for (let i = 0; i < imgSrcList.length; i++) {
      statusEl.innerHTML = `<span class="spinner"></span>Upload des images sources… (${i + 1}/${imgSrcList.length})`;
      const { url } = await window.api.uploadFile({ base64DataUrl: imgSrcList[i].dataUrl, fileName: imgSrcList[i].name });
      images.push(url);
    }
    let prompt2 = applyBrand('img', applyStyleManual('img', prompt));
    const c = activeCompany();
    if (c && document.getElementById('imgShowContact').checked) prompt2 += contactDirective(c);
    if (c && c.logoFile && document.getElementById('imgUseLogo').checked) {
      const logoKie = await uploadCompanyLogo(statusEl); // logo placé par l'IA
      if (logoKie) {
        images.push(logoKie);
        prompt2 += LOGO_DIRECTIVE;
      }
    }
    const descriptor = buildImageDescriptor(m, prompt2, images);
    statusEl.innerHTML = '<span class="spinner"></span>Envoi de la requête…';
    const { taskId } = await window.api.generate(descriptor);
    const res = await pollUntilDone({ api: m.api, taskId }, statusEl, "Génération de l'image", imgGenToken);
    statusEl.textContent = res.credits != null ? `✅ Image générée. (−${res.credits} crédits)` : '✅ Image générée.';
    showImageResult(resultEl, res.resultUrl, prompt);
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '⏹️ ' : '❌ ') + e.message;
    statusEl.className = 'status error';
  } finally {
    imgGenerate.disabled = false;
    document.getElementById('imgCancel').classList.add('hidden');
  }
};

// Affiche une image générée : enregistrée AUTOMATIQUEMENT dans la galerie, éditable par IA
// avec historique des versions (Annuler), synchronisé avec l'élément de galerie (galleryId).
//   galleryId : undefined = nouvelle création (auto-save) · string = élément existant · null = non enregistré
function showImageResult(container, url, prompt, history, galleryId) {
  history = history || []; // pile des images précédentes (pour Annuler)
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  container.appendChild(img);
  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const saveBtn = document.createElement('button');
  const manualSave = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enregistrement…';
    try {
      const it = await window.api.galleryAdd({ type: 'image', url, prompt, companyId: activeCompanyId, history });
      galleryId = it.id;
      saveBtn.textContent = '✅ Dans la galerie';
    } catch (e) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Réessayer l\'enregistrement';
    }
  };
  if (galleryId === undefined) {
    // Nouvelle création -> enregistrement automatique
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Enregistrement…';
    window.api.galleryAdd({ type: 'image', url, prompt, companyId: activeCompanyId, history })
      .then((it) => { galleryId = it.id; saveBtn.textContent = '✅ Dans la galerie'; })
      .catch(() => { galleryId = null; saveBtn.disabled = false; saveBtn.textContent = '💾 Enregistrer dans la galerie'; saveBtn.onclick = manualSave; });
  } else if (galleryId) {
    saveBtn.disabled = true;
    saveBtn.textContent = '✅ Dans la galerie';
  } else {
    saveBtn.textContent = '💾 Enregistrer dans la galerie';
    saveBtn.onclick = manualSave;
  }

  actions.appendChild(saveBtn);
  if (featureOn('editor')) {
    const editBtn = document.createElement('button');
    editBtn.textContent = "✏️ Ouvrir dans l'éditeur";
    editBtn.onclick = () => loadBackgroundFromUrl(url);
    actions.appendChild(editBtn);
  }
  if (history.length) {
    const undoBtn = document.createElement('button');
    undoBtn.textContent = `↩️ Annuler la modif (${history.length})`;
    undoBtn.onclick = async () => {
      const prev = history[history.length - 1], newHist = history.slice(0, -1);
      if (galleryId) { try { await window.api.galleryUpdate(galleryId, { url: prev, history: newHist }); } catch (_) {} }
      showImageResult(container, prev, prompt, newHist, galleryId || null);
    };
    actions.appendChild(undoBtn);
  }
  container.appendChild(actions);

  // ---- Édition par IA (langage naturel) ----
  if (!featureOn('image_edit')) return; // fonctionnalité désactivée par l'admin
  const edit = document.createElement('div');
  edit.className = 'edit-ai';
  edit.innerHTML =
    '<div class="edit-title">✏️ Modifier avec l\'IA</div>' +
    '<div class="edit-row"><input type="text" class="edit-input" placeholder="Ex : change le titre en « SOLDES -50% », fond plus sombre, ajoute des ballons, enlève la personne…" />' +
    '<select class="edit-model">' +
      '<option value="bytedance/seedream-v4-edit">✨ Snap Plus — Retouche fidèle (recommandé · ~5 cr)</option>' +
      '<option value="nano-banana-pro">🔥 Snap Max — Ultra HD (qualité max · ~30 cr)</option>' +
      '<option value="qwen/image-edit">⚡ Snap — Éco (~2 cr)</option>' +
    '</select>' +
    '<button class="edit-btn">Modifier</button></div>' +
    '<div class="edit-hint">Seul le changement demandé est appliqué — le format, la mise en page et le reste sont conservés.</div>' +
    '<div class="edit-status"></div>';
  const input = edit.querySelector('.edit-input');
  const ebtn = edit.querySelector('.edit-btn');
  const estatus = edit.querySelector('.edit-status');
  const runEdit = async () => {
    const instr = input.value.trim();
    if (!instr) return;
    ebtn.disabled = true;
    estatus.className = 'edit-status';
    estatus.innerHTML = '<span class="spinner"></span>Modification en cours…';
    try {
      const model = edit.querySelector('.edit-model').value;
      // Ratio de l'affiche source -> on le force pour éviter tout recadrage / changement de taille
      const ar = nearestAspect(img.naturalWidth, img.naturalHeight);
      // Consigne de préservation : le modèle ne touche QUE ce qui est demandé
      const guarded = editGuardPrompt(instr, ar);
      let payload;
      if (model === 'qwen/image-edit') {
        payload = { prompt: guarded, image_url: url };                                       // Snap (éco) : conserve la toile source
      } else if (model === 'nano-banana-pro') {
        payload = { prompt: guarded, image_input: [url], aspect_ratio: ar, resolution: '2K', output_format: 'png' }; // Snap Max : ratio forcé
      } else {
        payload = { prompt: guarded, image_urls: [url] };                                    // Snap Plus : éditeur fidèle, garde les dims source
      }
      const descriptor = { api: 'jobs', model, input: payload };
      const { taskId } = await window.api.generate(descriptor);
      const res = await pollUntilDone({ api: 'jobs', taskId }, estatus, 'Modification');
      refreshBalance();
      // ré-affiche le résultat modifié (édition itérative + historique pour Annuler)
      // et met à jour l'élément de galerie correspondant (nouvelle version + historique)
      const newHistory = [...history, url];
      if (galleryId) { try { await window.api.galleryUpdate(galleryId, { url: res.resultUrl, history: newHistory }); } catch (_) {} }
      showImageResult(container, res.resultUrl, prompt, newHistory, galleryId || null);
    } catch (e) {
      estatus.textContent = '❌ ' + e.message;
      estatus.className = 'edit-status error';
      ebtn.disabled = false;
    }
  };
  ebtn.onclick = runEdit;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runEdit(); });
  container.appendChild(edit);
}

// Ratio standard le plus proche des dimensions source (pour ne pas déformer/recadrer).
function nearestAspect(w, h) {
  if (!w || !h) return '1:1';
  const r = w / h;
  const opts = [
    ['1:1', 1], ['4:5', 0.8], ['5:4', 1.25], ['3:4', 0.75], ['4:3', 1.333],
    ['2:3', 0.667], ['3:2', 1.5], ['9:16', 0.5625], ['16:9', 1.777],
  ];
  let best = opts[0], diff = Infinity;
  for (const o of opts) { const d = Math.abs(o[1] - r); if (d < diff) { diff = d; best = o; } }
  return best[0];
}

// Encadre l'instruction de l'utilisateur pour que le modèle ne modifie QUE le demandé.
function editGuardPrompt(instr, ratio) {
  return (
    'You are editing an existing finished marketing poster. ' +
    'Apply ONLY the following change requested by the user. ' +
    'Keep absolutely everything else identical: same ' + ratio + ' aspect ratio and pixel dimensions, ' +
    'same overall layout and composition, same other text content and wording, same fonts, same colors, ' +
    'same logo, same background and graphic elements, same positions. ' +
    'Do NOT crop, zoom, resize, re-frame, re-render, or restyle anything that the request does not explicitly mention. ' +
    'The result must look like the same poster with only the requested change applied.\n\n' +
    'Requested change (may be in French): ' + instr
  );
}

// ============ Génération de VIDÉO ============
// opts: { startUrl, endUrl, extraImages } — début/fin de vidéo, + images de référence (logo).
function buildVideoDescriptor(m, prompt, opts) {
  opts = opts || {};
  const startUrl = opts.startUrl || null;
  const endUrl = opts.endUrl || null;
  const extra = (opts.extraImages || []).filter(Boolean);
  const ratio = document.getElementById('vidRatio').value;
  const res = vidResSel.value;
  const dur = parseInt(vidDurSel.value, 10);
  if (m.api === 'veo') {
    const input = { prompt, model: m.id, aspect_ratio: ratio, resolution: res, duration: dur };
    if (startUrl && endUrl) {
      input.imageUrls = [startUrl, endUrl];
      input.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
    } else {
      const imgs = [startUrl, ...extra].filter(Boolean).slice(0, 2);
      if (imgs.length) {
        input.imageUrls = imgs;
        input.generationType = 'REFERENCE_2_VIDEO';
      }
    }
    return { api: 'veo', model: m.id, input };
  }
  // API unifiée (Seedance) — first/last frames OU références (mutuellement exclusifs).
  const input = {
    prompt,
    aspect_ratio: ratio === 'Auto' ? 'adaptive' : ratio,
    resolution: res,
    duration: dur,
    generate_audio: document.getElementById('vidAudio').checked,
  };
  if (startUrl) {
    input.first_frame_url = startUrl;
    if (endUrl) input.last_frame_url = endUrl;
  } else if (extra.length) {
    input.reference_image_urls = extra;
  }
  return { api: 'jobs', model: m.id, input };
}

const vidGenerate = document.getElementById('vidGenerate');
vidGenerate.onclick = async () => {
  const prompt = document.getElementById('vidPrompt').value.trim();
  const statusEl = document.getElementById('vidStatus');
  const resultEl = document.getElementById('vidResult');
  if (!prompt) {
    statusEl.textContent = 'Veuillez saisir un texte descriptif.';
    statusEl.className = 'status error';
    return;
  }
  const m = findModel('video', vidModelSel.value);
  vidGenerate.disabled = true;
  vidGenToken = { cancelled: false };
  document.getElementById('vidCancel').classList.remove('hidden');
  resultEl.innerHTML = '';
  statusEl.className = 'status';
  statusEl.innerHTML = '<span class="spinner"></span>Préparation…';
  try {
    const startUrl = await uploadSource(vidSrc, statusEl);
    let endUrl = null;
    if (vidEnd.v) {
      statusEl.innerHTML = '<span class="spinner"></span>Upload de l\'image de fin…';
      const up = await window.api.uploadFile({ base64DataUrl: vidEnd.v.dataUrl, fileName: vidEnd.v.name });
      endUrl = up.url;
    }
    let prompt2 = applyBrand('vid', applyStyleManual('vid', prompt));
    const extraImages = [];
    // Le logo (référence) est incompatible avec le mode début/fin -> seulement sans frames.
    if (!startUrl && !endUrl && document.getElementById('vidUseLogo').checked) {
      const logoUrl = await uploadCompanyLogo(statusEl);
      if (logoUrl) {
        extraImages.push(logoUrl);
        prompt2 += LOGO_DIRECTIVE;
      }
    }
    const descriptor = buildVideoDescriptor(m, prompt2, { startUrl, endUrl, extraImages });
    statusEl.innerHTML = '<span class="spinner"></span>Envoi de la requête… (la vidéo peut prendre quelques minutes)';
    const { taskId } = await window.api.generate(descriptor);
    const res = await pollUntilDone({ api: m.api, taskId }, statusEl, 'Génération de la vidéo', vidGenToken);
    statusEl.textContent = res.credits != null ? `✅ Vidéo générée. (−${res.credits} crédits)` : '✅ Vidéo générée.';
    showVideoResult(resultEl, res.resultUrl, prompt);
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '⏹️ ' : '❌ ') + e.message;
    statusEl.className = 'status error';
  } finally {
    vidGenerate.disabled = false;
    document.getElementById('vidCancel').classList.add('hidden');
  }
};

function showVideoResult(container, url, prompt) {
  container.innerHTML = '';
  const vid = document.createElement('video');
  vid.src = url;
  vid.controls = true;
  vid.autoplay = true;
  vid.loop = true;
  vid.muted = true;
  container.appendChild(vid);
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Enregistrer dans la galerie';
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Téléchargement…';
    try {
      await window.api.galleryAdd({ type: 'video', url, prompt, companyId: activeCompanyId });
      saveBtn.textContent = '✅ Ajouté à la galerie';
    } catch (e) {
      saveBtn.textContent = '❌ ' + e.message;
    }
  };
  actions.appendChild(saveBtn);
  container.appendChild(actions);
}

// ============ ÉDITEUR D'AFFICHE (canvas) ============
const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');
let layers = []; // { type:'text'|'image'|'icon'|'rect', ... }
let bgImage = null;
let bgUrl = null;                    // URL (ou data URL) du fond — pour sauvegarder le design
let currentDesign = { id: null };    // design ouvert (null = nouveau)
let selected = null;
let drag = null;

// Découpe un texte en lignes : sauts manuels (\n) + retour auto si maxW est défini.
function textLines(l) {
  ctx.font = `${l.bold ? 'bold ' : ''}${l.size}px ${l.font}`;
  const out = [];
  for (const raw of String(l.text).split('\n')) {
    if (!l.maxW) { out.push(raw); continue; }
    let line = '';
    for (const word of raw.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (ctx.measureText(t).width > l.maxW && line) { out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

// Icônes vectorielles (réseaux & contact) dessinées en primitives — nettes à toute taille.
function drawIconShape(g, name, x, y, s, color) {
  g.save();
  g.translate(x, y);
  const u = s / 24;
  g.scale(u, u);
  g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  if (name === 'facebook') {
    g.beginPath(); g.roundRect(1, 1, 22, 22, 6); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.font = 'bold 17px Georgia'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
    g.fillText('f', 13, 20.5);
    g.globalCompositeOperation = 'source-over';
  } else if (name === 'instagram') {
    g.lineWidth = 2.2;
    g.beginPath(); g.roundRect(2, 2, 20, 20, 6); g.stroke();
    g.beginPath(); g.arc(12, 12, 5, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(17.4, 6.6, 1.6, 0, Math.PI * 2); g.fill();
  } else if (name === 'whatsapp') {
    g.beginPath(); g.arc(12, 12, 11, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(3.5, 21.5); g.lineTo(8, 19.5); g.lineTo(5.5, 16.5); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.lineWidth = 3;
    g.beginPath(); g.arc(12.5, 13.5, 5.2, Math.PI * 0.78, Math.PI * 1.62); g.stroke();
    g.globalCompositeOperation = 'source-over';
  } else if (name === 'phone') {
    g.lineWidth = 3.2;
    g.beginPath(); g.arc(13, 13, 7.5, Math.PI * 0.78, Math.PI * 1.62); g.stroke();
    g.beginPath(); g.arc(6.8, 8.2, 2.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(17.8, 19.2, 2.2, 0, Math.PI * 2); g.fill();
  } else if (name === 'globe') {
    g.lineWidth = 2;
    g.beginPath(); g.arc(12, 12, 10, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(2, 12); g.lineTo(22, 12); g.stroke();
    g.beginPath(); g.ellipse(12, 12, 4.6, 10, 0, 0, Math.PI * 2); g.stroke();
  } else if (name === 'mail') {
    g.lineWidth = 2.2;
    g.beginPath(); g.roundRect(2, 4.5, 20, 15, 2.5); g.stroke();
    g.beginPath(); g.moveTo(3.5, 6.5); g.lineTo(12, 13.5); g.lineTo(20.5, 6.5); g.stroke();
  }
  g.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#2a2342';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#8b80a8';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ajoutez une image de fond', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  }
  for (const l of layers) {
    if (l.type === 'rect') {
      ctx.save();
      ctx.fillStyle = l.color;
      ctx.beginPath(); ctx.roundRect(l.x, l.y, l.w, l.h, l.r || 0); ctx.fill();
      ctx.restore();
      l._w = l.w; l._h = l.h;
    } else if (l.type === 'icon') {
      drawIconShape(ctx, l.name, l.x, l.y, l.size, l.color);
      l._w = l.size; l._h = l.size;
    } else if (l.type === 'text') {
      const lines = textLines(l);
      const lh = l.size * 1.18;
      ctx.save();
      ctx.font = `${l.bold ? 'bold ' : ''}${l.size}px ${l.font}`;
      ctx.textBaseline = 'top';
      let maxW = 0;
      for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line).width);
      l._w = l.align === 'center' && l.maxW ? l.maxW : maxW;
      l._h = lines.length * lh;
      if (l.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = Math.max(4, l.size / 6);
        ctx.shadowOffsetY = Math.max(1, l.size / 24);
      } else {
        ctx.lineWidth = Math.max(2, l.size / 16);
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      }
      ctx.fillStyle = l.color;
      lines.forEach((line, i) => {
        const w = ctx.measureText(line).width;
        const x = l.align === 'center' ? l.x + (l._w - w) / 2 : l.x;
        if (!l.shadow) ctx.strokeText(line, x, l.y + i * lh);
        ctx.fillText(line, x, l.y + i * lh);
      });
      ctx.restore();
    } else if (l.type === 'image' && l.img) {
      ctx.drawImage(l.img, l.x, l.y, l.w, l.h);
      l._w = l.w; l._h = l.h;
    }
    if (l === selected) {
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.strokeRect(l.x - 4, l.y - 4, (l._w || 0) + 8, (l._h || 0) + 8);
    }
  }
}
render();

function setBgImage(imgEl) {
  bgImage = imgEl;
  const max = 1080;
  const scale = max / Math.max(imgEl.naturalWidth, imgEl.naturalHeight);
  canvas.width = Math.round(imgEl.naturalWidth * scale);
  canvas.height = Math.round(imgEl.naturalHeight * scale);
  render();
}

function loadBackgroundFromUrl(url) {
  bgUrl = url;
  const apply = (dataUrl) => {
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = dataUrl;
  };
  if (url.startsWith('data:')) apply(url);
  else window.api.fetchDataUrl(url).then(apply);
  document.querySelector('.nav-btn[data-view="editor"]').click();
}

document.getElementById('bgFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    bgUrl = reader.result; // data URL — hébergé au moment de l'enregistrement du design
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('bgFromGallery').onclick = async () => {
  const items = (await window.api.galleryList()).filter((g) => g.type === 'image');
  if (!items.length) {
    alert('Aucune image dans la galerie.');
    return;
  }
  const choice = items.length === 1 ? 0 : promptGalleryChoice(items);
  if (choice === null) return;
  loadBackgroundFromUrl(items[choice].url);
};

function promptGalleryChoice(items) {
  const list = items.map((g, i) => `${i + 1}. ${g.prompt.slice(0, 40) || '(sans titre)'}`).join('\n');
  const n = prompt(`Quelle image utiliser ?\n${list}`, '1');
  if (!n) return null;
  const idx = parseInt(n, 10) - 1;
  return idx >= 0 && idx < items.length ? idx : null;
}

// ===== Affiche Pro : visuel IA (sans texte) + calques modifiables =====
// Éléments de contact de l'entreprise -> [{icon, text}] pour la barre du bas.
function contactItems(c) {
  if (!c) return [];
  const out = [];
  if (c.phone) out.push({ icon: 'phone', text: c.phone });
  if (c.whatsapp) { const n = (c.whatsapp.match(/(\+?\d[\d ]{5,})/) || [])[1]; out.push({ icon: 'whatsapp', text: n ? n.trim() : '' }); }
  if (c.instagram) { const h = (c.instagram.match(/instagram\.com\/([^/?#]+)/) || [])[1]; out.push({ icon: 'instagram', text: h ? '@' + h : '' }); }
  if (c.facebook) { const f = (c.facebook.match(/(?:facebook|fb)\.com\/([^/?#]+)/) || [])[1]; out.push({ icon: 'facebook', text: f || '' }); }
  if (c.website) out.push({ icon: 'globe', text: c.website.replace(/^https?:\/\//, '').replace(/\/$/, '') });
  return out.filter((it) => it.text).slice(0, 5);
}

// Compose l'affiche : fond généré par l'IA + titre, description, logo et barre de
// contact (icônes vectorielles) en CALQUES — tout reste modifiable/déplaçable.
async function composeProPoster(srcUrl, a) {
  const c = activeCompany();
  try { await document.fonts.ready; } catch (_) {}
  const dataUrl = srcUrl.startsWith('data:') ? srcUrl : await window.api.fetchDataUrl(srcUrl);
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { setBgImage(img); resolve(); };
    img.onerror = reject;
    img.src = dataUrl;
  });
  layers = [];
  const W = canvas.width, H = canvas.height;

  // Logo de l'entreprise (coin haut-gauche) — en data URL pour ne pas « tainted » le canvas (export PNG)
  if (c && c.logoFile) {
    try {
      let du = await window.api.mediaDataUrl(c.logoFile);
      if (!du.startsWith('data:')) du = await window.api.fetchDataUrl(du);
      await new Promise((res) => {
        const im = new Image();
        im.onload = () => {
          const w = W * 0.15, h = w * (im.naturalHeight / im.naturalWidth);
          layers.push({ type: 'image', img: im, x: W * 0.045, y: W * 0.04, w, h });
          res();
        };
        im.onerror = res;
        im.src = du;
      });
    } catch (_) {}
  }

  // Titre
  if (a.headline) {
    layers.push({
      type: 'text', text: a.headline.toUpperCase(), x: W * 0.07, y: H * 0.16,
      maxW: W * 0.86, align: 'center', size: Math.round(W * 0.092),
      color: '#ffffff', font: 'Montserrat', bold: true, shadow: true,
    });
  }
  // Description
  if (a.desc) {
    layers.push({
      type: 'text', text: a.desc, x: W * 0.1, y: H * 0.16 + (a.headline ? W * 0.13 : 0),
      maxW: W * 0.8, align: 'center', size: Math.round(W * 0.034),
      color: '#ffffff', font: 'Poppins', bold: false, shadow: true,
    });
  }

  // Barre de contact (pastille sombre + icônes réseaux + textes)
  const items = contactItems(c);
  if (items.length) {
    const s = Math.round(W * 0.034);          // taille icône
    const gap = Math.round(W * 0.011);        // icône <-> texte
    const itemGap = Math.round(W * 0.034);    // entre éléments
    const pad = Math.round(W * 0.02);
    const fs = Math.round(s * 0.8);           // taille texte
    ctx.font = `${fs}px Poppins`;
    const widths = items.map((it) => s + gap + ctx.measureText(it.text).width);
    const total = widths.reduce((aa, b) => aa + b, 0) + itemGap * (items.length - 1);
    const barH = s + pad * 2;
    const barW = Math.min(W * 0.95, total + pad * 3);
    const barX = (W - barW) / 2;
    const barY = H - barH - H * 0.03;
    layers.push({ type: 'rect', x: barX, y: barY, w: barW, h: barH, r: barH / 2, color: 'rgba(12,9,20,0.66)' });
    let x = (W - total) / 2;
    for (let i = 0; i < items.length; i++) {
      layers.push({ type: 'icon', name: items[i].icon, x, y: barY + pad, size: s, color: '#ffffff' });
      layers.push({ type: 'text', text: items[i].text, x: x + s + gap, y: barY + pad + Math.round(s * 0.1), size: fs, color: '#ffffff', font: 'Poppins', bold: false });
      x += widths[i] + itemGap;
    }
  }

  selected = null;
  render();
  document.querySelector('.nav-btn[data-view="editor"]').click();
  // Sauvegarde automatique du design (fond + calques) -> rééditable plus tard
  bgUrl = srcUrl;
  currentDesign.id = null;
  document.getElementById('designName').value = (a.headline || 'Affiche Pro').slice(0, 50);
  try { await saveCurrentDesign(true); } catch (_) {}
}

// ===== Sauvegarde / réouverture des affiches composées (designs) =====
// Sérialise les calques (les images deviennent des data URLs ré-importables).
function serializeLayers() {
  return layers.map((l) => {
    const c = { ...l };
    delete c._w; delete c._h;
    if (l.type === 'image' && l.img) {
      c.src = l.img.src;
      delete c.img;
    }
    return c;
  });
}
function designStatus(msg) {
  const el = document.getElementById('designStatus');
  if (el) el.textContent = msg;
}
async function saveCurrentDesign(silent) {
  if (!bgImage || !bgUrl) {
    if (!silent) alert("Ajoute d'abord une image de fond.");
    return;
  }
  const btn = document.getElementById('designSaveBtn');
  btn.disabled = true;
  designStatus('⏳ Enregistrement…');
  try {
    // Aperçu (miniature) : rendu sans cadre de sélection, réduit à 480 px
    const prevSel = selected;
    selected = null; render();
    const pv = document.createElement('canvas');
    const scale = 480 / canvas.width;
    pv.width = 480; pv.height = Math.round(canvas.height * scale);
    pv.getContext('2d').drawImage(canvas, 0, 0, pv.width, pv.height);
    let previewDataUrl = null;
    try { previewDataUrl = pv.toDataURL('image/jpeg', 0.82); } catch (_) {}
    selected = prevSel; render();

    const saved = await window.api.designSave({
      id: currentDesign.id,
      name: document.getElementById('designName').value.trim() || 'Affiche',
      bgUrl,
      layers: serializeLayers(),
      previewDataUrl,
      companyId: activeCompanyId,
    });
    currentDesign.id = saved.id;
    if (saved.bg_url) bgUrl = saved.bg_url; // si le fond data: a été hébergé
    designStatus('✅ Affiche enregistrée — rouvre-la quand tu veux via 📂 Ouvrir.');
  } catch (e) {
    designStatus('❌ ' + e.message);
    if (!silent) alert('Échec de l\'enregistrement : ' + e.message);
  } finally {
    btn.disabled = false;
  }
}
async function openDesign(d) {
  document.getElementById('designsModal').classList.add('hidden');
  designStatus('⏳ Ouverture…');
  const du = d.bg_url.startsWith('data:') ? d.bg_url : await window.api.fetchDataUrl(d.bg_url);
  await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => { setBgImage(im); resolve(); };
    im.onerror = reject;
    im.src = du;
  });
  bgUrl = d.bg_url;
  layers = [];
  for (const l of d.layers || []) {
    if (l.type === 'image' && l.src) {
      await new Promise((res) => {
        const im = new Image();
        im.onload = () => { const c = { ...l, img: im }; delete c.src; layers.push(c); res(); };
        im.onerror = res;
        im.src = l.src;
      });
    } else {
      layers.push({ ...l });
    }
  }
  currentDesign.id = d.id;
  document.getElementById('designName').value = d.name || 'Affiche';
  selected = null;
  render();
  document.querySelector('.nav-btn[data-view="editor"]').click();
  designStatus('✅ Affiche ouverte — tous les calques sont modifiables.');
}
async function showDesignsModal() {
  const grid = document.getElementById('designsGrid');
  document.getElementById('designsModal').classList.remove('hidden');
  grid.innerHTML = '<p class="empty"><span class="spinner"></span>Chargement…</p>';
  try {
    const designs = await window.api.designList();
    if (!designs.length) {
      grid.innerHTML = '<p class="empty">Aucune affiche enregistrée. Crée une « Affiche Pro » dans le travail guidé, ou compose-en une ici puis « 💾 Enregistrer ».</p>';
      return;
    }
    grid.innerHTML = '';
    for (const d of designs) {
      const card = document.createElement('div');
      card.className = 'design-card';
      card.innerHTML =
        `<img src="${esc(d.preview_url || d.bg_url)}" loading="lazy" alt="${esc(d.name)}" />` +
        `<div class="dc-meta"><span class="dc-name">${esc(d.name)}</span><button class="dc-del" title="Supprimer">🗑</button></div>`;
      card.onclick = (e) => { if (!e.target.classList.contains('dc-del')) openDesign(d).catch((err) => designStatus('❌ ' + err.message)); };
      card.querySelector('.dc-del').onclick = async (e) => {
        e.stopPropagation();
        if (!confirm(`Supprimer « ${d.name} » ?`)) return;
        try { await window.api.designDelete(d.id); card.remove(); } catch (err) { alert('Échec : ' + err.message); }
      };
      grid.appendChild(card);
    }
  } catch (e) {
    grid.innerHTML = `<p class="empty">❌ ${esc(e.message)}</p>`;
  }
}
document.getElementById('designSaveBtn').onclick = () => saveCurrentDesign(false);
document.getElementById('designOpenBtn').onclick = showDesignsModal;
document.getElementById('designsClose').onclick = () => document.getElementById('designsModal').classList.add('hidden');
document.getElementById('designNewBtn').onclick = () => {
  if (layers.length && !confirm('Commencer une nouvelle affiche ? (les calques non enregistrés seront perdus)')) return;
  bgImage = null; bgUrl = null; layers = []; selected = null; currentDesign.id = null;
  document.getElementById('designName').value = '';
  designStatus('Nouvelle affiche — ajoute une image de fond.');
  render();
};

document.getElementById('addText').onclick = () => {
  const text = document.getElementById('textInput').value.trim() || 'Texte';
  const layer = {
    type: 'text',
    text,
    x: canvas.width * 0.1,
    y: canvas.height * 0.1,
    size: parseInt(document.getElementById('textSize').value, 10) || 64,
    color: document.getElementById('textColor').value,
    font: document.getElementById('textFont').value,
    bold: document.getElementById('textBold').checked,
  };
  layers.push(layer);
  selected = layer;
  render();
};

document.getElementById('logoFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(300, img.naturalWidth);
      const h = w * (img.naturalHeight / img.naturalWidth);
      const layer = { type: 'image', img, x: 40, y: 40, w, h };
      layers.push(layer);
      selected = layer;
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('layerDelete').onclick = () => {
  if (!selected) return;
  layers = layers.filter((l) => l !== selected);
  selected = null;
  render();
};

function canvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}
function hitTest(pos) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    const w = l._w || 0;
    const h = l._h || 0;
    if (pos.x >= l.x - 4 && pos.x <= l.x + w + 4 && pos.y >= l.y - 4 && pos.y <= l.y + h + 4) return l;
  }
  return null;
}
// Sélection d'un calque texte/icône : recharge les réglages dans le panneau pour modification directe.
function syncToolsFromSelected() {
  if (!selected) return;
  if (selected.type === 'text') {
    document.getElementById('textInput').value = selected.text;
    document.getElementById('textSize').value = selected.size;
    document.getElementById('textColor').value = /^#([0-9a-f]{6})$/i.test(selected.color) ? selected.color : '#ffffff';
    const fontSel = document.getElementById('textFont');
    if ([...fontSel.options].some((o) => o.value === selected.font)) fontSel.value = selected.font;
    document.getElementById('textBold').checked = !!selected.bold;
  } else if (selected.type === 'icon') {
    document.getElementById('textColor').value = /^#([0-9a-f]{6})$/i.test(selected.color) ? selected.color : '#ffffff';
  }
}
canvas.addEventListener('mousedown', (e) => {
  const pos = canvasPos(e);
  const hit = hitTest(pos);
  selected = hit;
  if (hit) drag = { dx: pos.x - hit.x, dy: pos.y - hit.y };
  syncToolsFromSelected();
  render();
});
// Modification EN DIRECT du calque sélectionné via le panneau (texte, taille, couleur, police, gras).
document.getElementById('textInput').addEventListener('input', (e) => {
  if (selected && selected.type === 'text') { selected.text = e.target.value; render(); }
});
document.getElementById('textSize').addEventListener('input', (e) => {
  if (selected && selected.type === 'text') { selected.size = Math.max(8, parseInt(e.target.value, 10) || selected.size); render(); }
});
document.getElementById('textColor').addEventListener('input', (e) => {
  if (selected && (selected.type === 'text' || selected.type === 'icon')) { selected.color = e.target.value; render(); }
});
document.getElementById('textFont').addEventListener('change', (e) => {
  if (selected && selected.type === 'text') { selected.font = e.target.value; render(); }
});
document.getElementById('textBold').addEventListener('change', (e) => {
  if (selected && selected.type === 'text') { selected.bold = e.target.checked; render(); }
});
canvas.addEventListener('mousemove', (e) => {
  if (!drag || !selected) return;
  const pos = canvasPos(e);
  selected.x = pos.x - drag.dx;
  selected.y = pos.y - drag.dy;
  render();
});
window.addEventListener('mouseup', () => (drag = null));
canvas.addEventListener(
  'wheel',
  (e) => {
    if (!selected) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    if (selected.type === 'text') selected.size = Math.max(8, Math.round(selected.size * factor));
    else if (selected.type === 'icon') selected.size = Math.max(10, Math.round(selected.size * factor));
    else {
      selected.w *= factor;
      selected.h *= factor;
    }
    render();
  },
  { passive: false }
);

document.getElementById('exportPoster').onclick = async () => {
  const prev = selected;
  selected = null;
  render();
  const dataUrl = canvas.toDataURL('image/png');
  selected = prev;
  render();
  const res = await window.api.exportSave({ dataUrl, defaultName: 'affiche.png' });
  if (!res.canceled) alert('Affiche enregistrée :\n' + res.filePath);
};

// ============ GALERIE ============
document.getElementById('galleryFilter').onchange = loadGallery;
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '<p class="empty">Chargement…</p>';
  const all = await window.api.galleryList();
  const filter = document.getElementById('galleryFilter').value;
  const items = filter ? all.filter((i) => i.companyId === filter) : all;
  if (!items.length) {
    grid.innerHTML = `<p class="empty">${all.length ? 'Aucune création pour cette entreprise.' : 'Aucune création sauvegardée pour le moment.'}</p>`;
    return;
  }
  grid.innerHTML = '';
  for (const item of items) {
    const dataUrl = await window.api.mediaDataUrl(item.file);
    const card = document.createElement('div');
    card.className = 'gallery-item';
    const media =
      item.type === 'video'
        ? `<video src="${esc(dataUrl)}" muted loop preload="metadata" onmouseover="this.play()" onmouseout="this.pause()"></video>`
        : `<img src="${esc(dataUrl)}" loading="lazy" alt="Création sauvegardée" />`;
    card.innerHTML = `
      ${media}
      <div class="meta">
        <span class="badge">${item.type === 'video' ? '🎬 Vidéo' : '🖼️ Image'}</span>${(item.history || []).length ? ` <span class="badge">🕘 ${item.history.length + 1} versions</span>` : ''}
        <p>${esc((item.prompt || '').slice(0, 90))}</p>
        <div class="actions"></div>
      </div>`;
    const actions = card.querySelector('.actions');

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Exporter';
    exportBtn.onclick = () =>
      window.api.exportSaveFile({
        srcPath: item.file,
        defaultName: `${item.type}_${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`,
      });
    actions.appendChild(exportBtn);

    if (item.type === 'image') {
      // Modification par IA depuis la galerie : rouvre l'affiche avec son historique
      // de versions (Annuler possible), les modifs sont resynchronisées dans la galerie.
      if (featureOn('image_edit')) {
        const aiBtn = document.createElement('button');
        aiBtn.textContent = '🎨 Modifier IA';
        aiBtn.onclick = () => {
          document.querySelector('.nav-btn[data-view="image"]').click();
          const resultEl = document.getElementById('imgResult');
          showImageResult(resultEl, item.url, item.prompt, item.history || [], item.id);
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        actions.appendChild(aiBtn);
      }
      if (featureOn('editor')) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Éditer';
        editBtn.onclick = () => loadBackgroundFromUrl(item.url);
        actions.appendChild(editBtn);
      }
    }

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Suppr.';
    delBtn.onclick = async () => {
      if (confirm('Supprimer cette création ?')) {
        await window.api.galleryDelete(item.id);
        loadGallery();
      }
    };
    actions.appendChild(delBtn);

    grid.appendChild(card);
  }
}

// ============ TRAVAIL GUIDÉ ============
// Chaque « recette » décide automatiquement du modèle, du format et des réglages,
// et construit le prompt à partir de réponses simples (+ charte de l'entreprise).
const RECIPES = [
  {
    id: 'poster-pro', icon: 'layers', title: 'Affiche Pro ✨ (texte modifiable)',
    desc: "L'IA crée le visuel SANS texte — titre, description, logo et contacts sont posés en calques 100 % modifiables.",
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '4:5', resolution: '2K' },
    proLayers: true,
    ask: [
      { key: 'subject', label: 'Quel visuel de fond ?', ph: 'Ex : burger gourmet sur table en bois, vapeur, éclairage dramatique, fond sombre' },
      { key: 'headline', label: "Titre de l'affiche (calque modifiable)", ph: 'Ex : SOLDES -50%' },
      { key: 'desc', label: "Texte de l'affiche (calque modifiable — infos, points éducatifs, offre…)", ph: 'Ex : Invisible au quotidien • Amovible pour manger • Résultats dès 6 mois', multiline: true },
    ],
    build: (a) =>
      `Visuel d'arrière-plan pour une affiche professionnelle. Sujet : ${a.subject}. ` +
      `INTERDICTION ABSOLUE : aucun texte, aucune lettre, aucun chiffre, aucun mot, aucun logo, aucune typographie, aucun filigrane dans l'image — uniquement le visuel. ` +
      `Composition pensée pour accueillir du texte ensuite : zone supérieure épurée et dégagée (fond uni, ciel, flou doux) pour un grand titre, zone inférieure calme pour une barre de contact. ` +
      `Sujet principal au centre ou au tiers, profondeur de champ, éclairage soigné, qualité studio.`,
  },
  {
    id: 'poster-event', icon: 'star', title: 'Affiche événement',
    desc: 'Affiche verticale percutante (concert, expo, soirée…).',
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '9:16', resolution: '2K' },
    ask: [
      { key: 'subject', label: 'Quel évènement et message ?', ph: 'Ex : soirée jazz le 12 juin au Café Bleu, entrée 10€' },
      { key: 'style', label: 'Ambiance / style (optionnel)', ph: 'Ex : rétro, élégant, néon…' },
    ],
    build: (a) => `Affiche événementielle professionnelle et percutante. Sujet : ${a.subject}.${a.style ? ` Ambiance ${a.style}.` : ''} Composition verticale équilibrée, forte hiérarchie typographique, grand titre lisible, zone pour la date et le lieu, arrière-plan évocateur, qualité impression haute définition.`,
  },
  {
    id: 'social-post', icon: 'smartphone', title: 'Post réseaux sociaux',
    desc: 'Visuel carré pour Instagram, Facebook, LinkedIn.',
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '1:1', resolution: '2K' },
    ask: [{ key: 'subject', label: 'Quel message / sujet du post ?', ph: 'Ex : promotion -20% sur toute la boutique ce week-end' }],
    build: (a) => `Visuel carré pour les réseaux sociaux, moderne et accrocheur. Message : ${a.subject}. Composition claire, texte court bien lisible, couleurs vives, optimisé pour le mobile.`,
  },
  {
    id: 'story', icon: 'smartphone', title: 'Story / Reel',
    desc: 'Visuel vertical plein écran (Stories, TikTok, Shorts).',
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '9:16', resolution: '2K' },
    ask: [{ key: 'subject', label: 'Quel message de la story ?', ph: 'Ex : nouvelle collection été disponible en ligne' }],
    build: (a) => `Visuel vertical plein écran (story / reel), dynamique et impactant. Message : ${a.subject}. Accroche en haut, appel à l'action en bas, style tendance réseaux sociaux.`,
  },
  {
    id: 'web-banner', icon: 'monitor', title: 'Bannière web',
    desc: 'Bandeau horizontal pour site ou e-mailing.',
    kind: 'image', model: 'flux-kontext-pro', params: { aspect_ratio: '16:9' },
    ask: [{ key: 'subject', label: 'Quel message de la bannière ?', ph: 'Ex : lancement de notre nouvelle offre de services' }],
    build: (a) => `Bannière web horizontale professionnelle. Message : ${a.subject}. Composition panoramique, espace pour titre et bouton, design épuré et moderne.`,
  },
  {
    id: 'restyle', icon: 'shirt', title: 'Tenue · décor · produit',
    desc: 'Importez la personne + le produit (ex : femme + robe) : elle le porte/présente. Ou changez tenue & décor.',
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '4:5', resolution: '2K' },
    needsImage: true,
    ask: [{ key: 'subject', label: 'Que faut-il faire ?', ph: 'Ex : elle porte la robe de la photo — costume bleu élégant — plage au coucher du soleil — elle tient le produit en souriant' }],
    build: (a) =>
      `À partir des photos de référence fournies : ${a.subject}. Conserve EXACTEMENT la même personne (même visage, même morphologie, même identité). ` +
      `Si un VÊTEMENT est fourni en photo, habille la personne avec EXACTEMENT ce vêtement : même coupe, même tissu, mêmes couleurs, mêmes motifs et détails, ajusté naturellement à sa morphologie. ` +
      `Si un PRODUIT/OBJET est fourni, reproduis-le À L'IDENTIQUE (même forme, étiquette, couleurs) et mets-le en scène avec elle de façon naturelle. ` +
      `Ne change que ce qui est demandé (tenue, décor, ou mise en scène). Rendu photoréaliste, lumière, ombres et perspective cohérentes.`,
  },
  {
    id: 'product', icon: 'tag', title: 'Visuel produit',
    desc: "Mise en scène soignée d'un produit.",
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '1:1', resolution: '2K' },
    ask: [
      { key: 'subject', label: 'Quel produit mettre en valeur ?', ph: 'Ex : une bougie parfumée artisanale sur fond minéral' },
      { key: 'style', label: 'Décor / ambiance (optionnel)', ph: 'Ex : lumière douce, studio, nature…' },
    ],
    build: (a) => `Photographie produit professionnelle, mise en scène soignée. Produit : ${a.subject}.${a.style ? ` Décor : ${a.style}.` : ''} Éclairage studio, netteté élevée, rendu commercial premium.`,
  },
  {
    id: 'promo-video', icon: 'video', title: 'Vidéo promo',
    desc: 'Courte vidéo horizontale (pub, présentation).',
    kind: 'video', model: 'veo3_fast', params: { aspect_ratio: '16:9', resolution: '720p', duration: 8 },
    ask: [{ key: 'subject', label: 'Que doit montrer la vidéo ?', ph: 'Ex : présentation dynamique de notre café torréfié maison' }],
    build: (a) => `Vidéo promotionnelle cinématographique et dynamique. Sujet : ${a.subject}. Plans fluides et soignés, lumière travaillée, rythme énergique, ambiance professionnelle.`,
  },
  {
    id: 'promo-story-video', icon: 'film', title: 'Vidéo verticale',
    desc: 'Vidéo plein écran (Reel, TikTok, Story).',
    kind: 'video', model: 'bytedance/seedance-2-fast', params: { aspect_ratio: '9:16', resolution: '720p', duration: 8 },
    ask: [{ key: 'subject', label: 'Que doit montrer la vidéo ?', ph: 'Ex : démonstration rapide de notre application mobile' }],
    build: (a) => `Vidéo verticale plein écran, dynamique et tendance pour les réseaux sociaux. Sujet : ${a.subject}. Plans rythmés, énergie, accroche immédiate.`,
  },
];

let guidedRecipe = null;
let lastStyleUrl = null; // dernière création (image) — pour « garder le même style »

// Direction artistique haut de gamme ajoutée à chaque création guidée (inspiration studios créatifs / loveart).
const ART_DIRECTION =
  " Direction artistique haut de gamme : composition équilibrée et impactante, hiérarchie visuelle claire, " +
  "typographie moderne et soignée, éclairage cinématographique, palette de couleurs harmonieuse, profondeur et textures riches, " +
  "finitions premium, esthétique tendance et éditoriale, rendu ultra-détaillé en haute résolution.";

// Langue de l'affiche (texte rendu + sorties de l'assistant IA).
const LANG_LABEL = { en: 'anglais', fr: 'français', ar: 'arabe' };
function guidedLang() {
  const el = document.getElementById('guidedLang');
  return el ? el.value : 'en';
}
function langDirective(lang) {
  if (lang === 'fr') return " Tout le texte visible sur l'affiche doit être rédigé en français, sans fautes.";
  if (lang === 'ar') return " Tout le texte visible sur l'affiche doit être rédigé en arabe (caractères arabes corrects).";
  return ' Render all visible text on the poster in correct English.';
}

// Options de qualité proposées à l'utilisateur, selon la recette.
function qualityOptions(r) {
  if (r.kind === 'video') {
    return [{ v: '720p', label: 'Standard (720p)' }, { v: '1080p', label: 'Élevée (1080p HD)' }];
  }
  const m = findModel('image', r.model);
  if (m.res) {
    return [{ v: '1K', label: 'Standard (1K)' }, { v: '2K', label: 'Élevée (2K)' }, { v: '4K', label: 'Maximum (4K)' }];
  }
  // Modèle image sans réglage de résolution : on propose de monter en gamme via Nano Banana Pro.
  return [{ v: 'std', label: 'Standard' }, { v: '2K', label: 'Élevée (HD)' }, { v: '4K', label: 'Maximum (4K)' }];
}
function defaultQuality(r) {
  if (r.kind === 'video') return r.params.resolution || '720p';
  const m = findModel('image', r.model);
  return m.res ? r.params.resolution || '1K' : 'std';
}
// Recette « effective » après application du choix de qualité (peut changer le modèle).
function effectiveRecipe(r, quality) {
  const eff = { kind: r.kind, model: r.model, params: { ...r.params } };
  if (r.kind === 'video') {
    eff.params.resolution = quality;
    return eff;
  }
  const m = findModel('image', r.model);
  if (m.res) {
    eff.params.resolution = quality;
  } else if (quality !== 'std') {
    eff.model = 'nano-banana-pro';
    eff.params.resolution = quality;
  }
  return eff;
}

function recipeSummary(eff) {
  if (eff.kind === 'image') {
    const m = findModel('image', eff.model);
    const c = m.creditsByRes ? m.creditsByRes[eff.params.resolution] || 0 : m.credits || 0;
    return `${m.label} · ${eff.params.aspect_ratio}${eff.params.resolution ? ' · ' + eff.params.resolution : ''} · ~${c} cr (~$${usd(c)})`;
  }
  const m = findModel('video', eff.model);
  const cps = m.creditsPerSecByRes ? m.creditsPerSecByRes[eff.params.resolution] || 0 : m.creditsPerSec || 0;
  const c = Math.round(cps * eff.params.duration);
  return `${m.label} · ${eff.params.aspect_ratio} · ${eff.params.resolution} · ${eff.params.duration}s · ~${c} cr (~$${usd(c)})`;
}
function updateGuidedSummary() {
  if (!guidedRecipe) return;
  const quality = document.getElementById('guidedQuality').value;
  const eff = effectiveRecipe(guidedRecipe, quality);
  document.getElementById('guidedSummary').innerHTML = `L'app utilisera : <b>${recipeSummary(eff)}</b>`;
}

function guidedImageDescriptor(modelId, params, prompt, images) {
  const imgs = (images || []).filter(Boolean);
  const m = findModel('image', modelId);
  if (m.api === 'flux') {
    const input = { prompt, aspectRatio: params.aspect_ratio, model: m.id, outputFormat: 'png' };
    if (imgs.length) input.inputImage = imgs[0]; // Flux : une seule image
    return { api: 'flux', model: m.id, input };
  }
  const input = { prompt, aspect_ratio: params.aspect_ratio, output_format: 'png' };
  if (m.res && params.resolution) input.resolution = params.resolution;
  if (imgs.length && m.imageField) input[m.imageField] = imgs; // Nano Banana : plusieurs images
  return { api: 'jobs', model: m.id, input };
}
function guidedVideoDescriptor(modelId, params, prompt, images) {
  const imgs = (images || []).filter(Boolean);
  const m = findModel('video', modelId);
  if (m.api === 'veo') {
    const input = { prompt, model: m.id, aspect_ratio: params.aspect_ratio, resolution: params.resolution, duration: params.duration };
    if (imgs.length) {
      input.imageUrls = imgs;
      input.generationType = 'REFERENCE_2_VIDEO';
    }
    return { api: 'veo', model: m.id, input };
  }
  const input = {
    prompt,
    aspect_ratio: params.aspect_ratio === 'Auto' ? 'adaptive' : params.aspect_ratio,
    resolution: params.resolution,
    duration: params.duration,
    generate_audio: true,
  };
  if (imgs.length) input.reference_image_urls = imgs;
  return { api: 'jobs', model: m.id, input };
}

function renderGuidedCards() {
  const grid = document.getElementById('guidedCards');
  grid.innerHTML = '';
  RECIPES.filter((r) => {
    if (r.proLayers && !featureOn('poster_pro')) return false;
    if (r.kind === 'video' && !featureOn('video')) return false;
    return true;
  }).forEach((r) => {
    const card = document.createElement('div');
    card.className = 'guided-card';
    card.innerHTML = `<div class="gicon">${svgIcon(r.icon, 'ico-card')}</div><h4>${r.title}</h4><p>${r.desc}</p><span class="gtag">${r.kind === 'video' ? 'Vidéo' : 'Image'} · réglages auto</span>`;
    card.onclick = () => openRecipe(r);
    grid.appendChild(card);
  });
}

function openRecipe(r) {
  guidedRecipe = r;
  document.getElementById('guidedCards').classList.add('hidden');
  document.getElementById('guidedPanel').classList.remove('hidden');
  document.getElementById('guidedTitle').innerHTML = svgIcon(r.icon, 'ico-title') + ' ' + r.title;
  document.getElementById('guidedDesc').textContent = r.desc;
  const q = document.getElementById('guidedQuestions');
  q.innerHTML = '';
  r.ask.forEach((a) => {
    const wrap = document.createElement('div');
    wrap.className = 'gq';
    const label = document.createElement('label');
    label.textContent = a.label;
    const useTextarea = a.key === 'subject' || a.multiline;
    const field = document.createElement(useTextarea ? 'textarea' : 'input');
    if (useTextarea) field.rows = a.key === 'subject' ? 2 : 3;
    field.placeholder = a.ph || '';
    field.dataset.key = a.key;
    field.className = 'gq-field';
    wrap.append(label, field);
    q.appendChild(wrap);
  });
  // Sélecteur de style (look auto)
  fillStyleSelect(document.getElementById('guidedStyle'), r.kind);
  // Sélecteur de qualité (choisi par l'utilisateur)
  const qs = document.getElementById('guidedQuality');
  qs.innerHTML = '';
  qualityOptions(r).forEach((o) => qs.add(new Option(o.label, o.v)));
  qs.value = defaultQuality(r);
  document.getElementById('guidedBrandHint').textContent = activeCompany() ? `→ ${activeCompany().name}` : '→ aucune entreprise active';
  updateGuidedSummary();
  resetGuidedRef();
  document.getElementById('guidedRefLabel').textContent = r.needsImage
    ? '📸 Photos : la personne + le produit/vêtement (ex : femme + robe) — 1 à 6 images, obligatoire'
    : 'Images de référence (optionnel — style, personnage, produit… max 6)';
  // Affiche Pro : langue / logo / coordonnées deviennent des calques -> réglages inutiles ici.
  ['gqLang', 'gqLogo', 'gqContact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !!r.proLayers);
  });
  // Pour "changer tenue/décor", la référence sert à préserver l'identité (mode forcé).
  document.getElementById('guidedRefMode').classList.toggle('hidden', !!r.needsImage);
  document.getElementById('guidedStyleHint').textContent = lastStyleUrl ? '✓ style mémorisé' : '(aucune création précédente)';
  document.getElementById('guidedStatus').textContent = '';
  document.getElementById('guidedResult').innerHTML = '<div class="result-placeholder">✨ Ta création apparaîtra ici</div>';
  document.getElementById('aiStatus').textContent = '';
  document.getElementById('aiSuggestions').innerHTML = '';
}

document.getElementById('guidedBack').onclick = () => {
  document.getElementById('guidedPanel').classList.add('hidden');
  document.getElementById('guidedCards').classList.remove('hidden');
  guidedRecipe = null;
};
document.getElementById('guidedQuality').onchange = updateGuidedSummary;
document.getElementById('guidedLogoMode').onchange = (e) => {
  document.getElementById('guidedLogoPos').classList.toggle('hidden', e.target.value !== 'exact');
};

// ---- Image de référence (inspiration / personnage) ----
// Références multiples : style à imiter, personnage à garder, produit à intégrer… (max 6)
const GUIDED_MAX_REFS = 6;
const guidedRefs = [];
(function wireGuidedRefs() {
  const file = document.getElementById('guidedRefFile');
  const clr = document.getElementById('guidedRefClear');
  const thumbs = document.getElementById('guidedRefThumbs');
  const sync = () => {
    clr.classList.toggle('hidden', !guidedRefs.length);
    renderThumbs(thumbs, guidedRefs, sync);
  };
  file.addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, GUIDED_MAX_REFS - guidedRefs.length);
    for (const f of files) guidedRefs.push(await readImageFile(f));
    file.value = '';
    sync();
  });
  clr.onclick = () => { guidedRefs.length = 0; sync(); };
})();
function resetGuidedRef() {
  guidedRefs.length = 0;
  document.getElementById('guidedRefFile').value = '';
  document.getElementById('guidedRefThumbs').innerHTML = '';
  document.getElementById('guidedRefClear').classList.add('hidden');
}

// ---- Assistant IA (idées / rédaction) via kie.ai (Gemini Flash) ----
const AI_MODEL = 'gemini-2.5-flash';

// Variété des idées : directions artistiques tirées au sort à chaque clic,
// + mémoire des concepts déjà proposés pour ne jamais se répéter.
const IDEA_ANGLES = [
  // Photo
  'macro photographie ultra détaillée', 'photographie lifestyle authentique', 'photo cinématographique clair-obscur',
  'photo studio fond coloré uni', 'flat lay vu de dessus', 'photo en lévitation (objets flottants)',
  'noir et blanc dramatique avec une seule couleur accent', 'golden hour chaleureuse', 'photo éclatée (exploded view)',
  // 3D & digital
  'rendu 3D doux (clay render)', '3D glassmorphism translucide', 'rendu 3D hyperréaliste produit', 'low-poly géométrique',
  'univers miniature diorama 3D', 'metaball / formes organiques 3D',
  // Illustration
  'illustration flat moderne et colorée', 'illustration ligne continue minimaliste', 'aquarelle douce',
  'style bande dessinée pop', 'gravure vintage / botanique', 'pixel art rétro gaming', 'papier découpé en relief (paper cut)',
  // Typo & graphisme
  'typographie géante en vedette', 'typographie cinétique en spirale', 'lettrage manuscrit expressif',
  'grille suisse éditoriale stricte', 'affiche brutaliste contrastée', 'bauhaus géométrique primaire',
  // Pédagogie & info
  'infographie pédagogique élégante', 'comparatif avant / après', 'schéma technique stylisé',
  'chronologie / étapes numérotées visuelles', 'mythes vs réalités en deux colonnes', 'coupe anatomique didactique',
  // Ambiances
  'minimalisme éditorial premium', 'néon vibrant sur fond sombre', 'collage magazine rétro', 'dégradés aurora pastel',
  'humour décalé et complice', 'storytelling émotionnel intimiste', 'luxe sobre et minimal', 'pop colorée énergique',
  'futurisme chrome et iridescent', 'vaporwave nostalgique', 'naturel organique (bois, lin, végétal)', 'art déco géométrique doré',
];
let lastIdeaTitles = [];
function pickAngles(n) {
  const pool = [...IDEA_ANGLES];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
function subjectField() {
  return document.querySelector('#guidedQuestions .gq-field[data-key="subject"]');
}
function companyContext() {
  const c = activeCompany();
  if (!c) return '';
  let ctx = ` pour l'entreprise « ${c.name} »`;
  if (c.category) ctx += `, secteur : ${c.category}`;
  if (c.info) ctx += ` (${c.info})`;
  if (c.website) ctx += `, site ${c.website}`;
  return ctx;
}
function renderSuggestions(list) {
  const el = document.getElementById('aiSuggestions');
  el.innerHTML = '';
  list.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ai-chip';
    b.textContent = s;
    b.onclick = () => {
      const f = subjectField();
      if (f) {
        f.value = s;
        f.focus();
      }
    };
    el.appendChild(b);
  });
}

// Idées « Affiche Pro » : chaque concept = titre + description + visuel de fond.
// Un clic remplit les 3 champs (headline, desc, subject) d'un coup.
function setGuidedField(key, value) {
  const f = document.querySelector(`#guidedQuestions .gq-field[data-key="${key}"]`);
  if (f) f.value = value;
}
function renderProSuggestions(list) {
  const el = document.getElementById('aiSuggestions');
  el.innerHTML = '';
  list.forEach(([head, desc, visual]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ai-chip';
    b.innerHTML = `<b>${esc(head)}</b>${desc ? ' — ' + esc(desc) : ''}<br><small style="color:var(--muted)">🎨 ${esc(visual)}</small>`;
    b.onclick = () => {
      setGuidedField('headline', head);
      setGuidedField('desc', desc);
      setGuidedField('subject', visual);
      const sf = subjectField();
      if (sf) sf.focus();
    };
    el.appendChild(b);
  });
}

document.getElementById('aiIdeas').onclick = async () => {
  if (!guidedRecipe) return;
  const statusEl = document.getElementById('aiStatus');
  // Affiche Pro : la langue n'est pas demandée (texte tapé en calques) -> idées en français par défaut.
  if (!guidedLang() && !guidedRecipe.proLayers) {
    statusEl.textContent = "Choisissez d'abord la langue de l'affiche (au-dessus).";
    statusEl.className = 'ai-status error';
    return;
  }
  const btn = document.getElementById('aiIdeas');
  btn.disabled = true;
  document.getElementById('aiSuggestions').innerHTML = '';
  statusEl.className = 'ai-status';
  statusEl.innerHTML = '<span class="spinner"></span>L\'IA réfléchit…';
  try {
    const c = activeCompany();
    const cat = c && c.category ? `, secteur : ${c.category}` : '';
    const cols = c && c.colors && c.colors.length ? `, couleurs de marque : ${c.colors.join(', ')}` : '';
    const inf = c && c.info ? `, infos : ${c.info}` : '';
    const subjectNow = (subjectField() && subjectField().value.trim()) || '';
    // Si l'entreprise a un logo, on le fait "voir" à l'IA pour des idées cohérentes avec la marque.
    let logoDataUrl = null;
    if (c && c.logoFile) {
      try {
        logoDataUrl = await downscaleDataUrl(await window.api.mediaDataUrl(c.logoFile), 384, 'image/png');
      } catch (_) {}
    }
    const isPro = !!guidedRecipe.proLayers;
    const angles = pickAngles(5);
    const SYS =
      "Tu es à la fois directeur de création senior ET concepteur-rédacteur dans une agence primée. Tu produis des concepts d'affiches COMPLETS : un vrai titre, le VRAI TEXTE de l'affiche (jamais de placeholder), et une direction artistique précise. " +
      "RÈGLE D'OR sur le texte : si l'affiche est ÉDUCATIVE ou informative, le texte contient de VRAIES informations utiles, concrètes et exactes qui apprennent quelque chose au lecteur (avantages, chiffres, conseils, étapes) — pas du vocabulaire marketing creux. " +
      "Si l'affiche est promotionnelle : offre précise + appel à l'action. Si c'est un événement : date, lieu, infos pratiques. " +
      "Tu exploites l'identité de marque (secteur, couleurs, logo) et tu respectes scrupuleusement la direction artistique imposée pour chaque concept.";
    const userText =
      `Objectif : ${guidedRecipe.title}.` +
      `\nMarque : ${c ? '« ' + c.name + ' »' : '(non précisée)'}${cat}${cols}${inf}.` +
      (subjectNow ? `\nDemande de l'utilisateur (à respecter en priorité) : ${subjectNow}.` : '') +
      (logoDataUrl ? `\nLe logo est joint : tiens compte de son style et de ses couleurs.` : '') +
      `\nLangue du texte affiché : ${LANG_LABEL[guidedLang() || 'fr']}.` +
      `\n\nDonne exactement 5 concepts d'affiche très différents, SPÉCIFIQUES à cette demande et ce secteur (jamais génériques).` +
      `\nDirections artistiques IMPOSÉES, une par concept et dans cet ordre : 1) ${angles[0]} ; 2) ${angles[1]} ; 3) ${angles[2]} ; 4) ${angles[3]} ; 5) ${angles[4]}.` +
      (lastIdeaTitles.length ? `\nINTERDIT de reproposer des concepts proches de ceux-ci (déjà montrés) : ${lastIdeaTitles.join(' | ')}.` : '') +
      (isPro
        ? `\nFormat STRICT — exactement une ligne par concept, 3 parties séparées par || ainsi :` +
          `\nTITRE court et percutant || TEXTE réel de l'affiche (éducatif : 3 à 4 points concrets séparés par « • » ; promo : offre + appel à l'action ; événement : date/lieu/infos) || VISUEL du fond UNIQUEMENT, sans aucun texte ni lettre : sujet précis, cadrage, style, lumière, palette reprenant les couleurs de la marque, ambiance (20 mots minimum).` +
          `\nLa 3e partie ne doit JAMAIS mentionner de texte, mots ou typographie — c'est un fond d'image pur.`
        : `\nFormat STRICT — exactement une ligne par concept, ainsi :` +
          `\n"Titre percutant" — texte réel de l'affiche (éducatif : points concrets « • » ; promo : offre + CTA) — concept visuel précis (sujet + cadrage + style + lumière + palette de la marque).`) +
      `\nPas de numéro, pas de puce en début de ligne, pas d'introduction ni de conclusion.`;
    // Essai avec le logo (vision) ; repli en texte seul si l'image échoue.
    let text;
    try {
      const content = logoDataUrl
        ? [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: logoDataUrl } }]
        : userText;
      text = (await window.api.aiChat({ model: AI_MODEL, messages: [{ role: 'system', content: SYS }, { role: 'user', content }] })).text;
    } catch (errImg) {
      if (!logoDataUrl) throw errImg;
      text = (await window.api.aiChat({ model: AI_MODEL, messages: [{ role: 'system', content: SYS }, { role: 'user', content: userText }] })).text;
    }
    const ideas = text
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim())
      .filter((l) => l.length > 3)
      .slice(0, 6);
    if (!ideas.length) throw new Error('Aucune idée reçue.');
    if (isPro) {
      // Concepts complets : titre || texte || visuel -> un clic remplit les 3 champs
      const parsed = ideas
        .map((l) => l.split(/\s*\|\|\s*/).map((p) => p.replace(/^["“”']|["“”']$/g, '').trim()))
        .filter((p) => p.length >= 3 && p[0] && p[2]);
      if (!parsed.length) {
        statusEl.textContent = 'Cliquez une idée pour l\'utiliser :';
        renderSuggestions(ideas); // repli : format inattendu -> comportement classique
      } else {
        statusEl.textContent = 'Cliquez un concept : il remplit le titre, le texte et le visuel :';
        renderProSuggestions(parsed);
        lastIdeaTitles = [...lastIdeaTitles, ...parsed.map((p) => p[0])].slice(-15);
      }
    } else {
      statusEl.textContent = 'Cliquez une idée pour l\'utiliser :';
      renderSuggestions(ideas);
      lastIdeaTitles = [...lastIdeaTitles, ...ideas.map((l) => l.slice(0, 60))].slice(-15);
    }
  } catch (e) {
    statusEl.textContent = '❌ ' + e.message;
    statusEl.className = 'ai-status error';
  } finally {
    btn.disabled = false;
  }
};

document.getElementById('aiImprove').onclick = async () => {
  if (!guidedRecipe) return;
  const statusEl = document.getElementById('aiStatus');
  if (!guidedLang() && !guidedRecipe.proLayers) {
    statusEl.textContent = "Choisissez d'abord la langue de l'affiche (au-dessus).";
    statusEl.className = 'ai-status error';
    return;
  }
  const f = subjectField();
  const current = f ? f.value.trim() : '';
  if (!current) {
    statusEl.textContent = 'Écrivez d\'abord quelques mots à améliorer.';
    statusEl.className = 'ai-status error';
    return;
  }
  const btn = document.getElementById('aiImprove');
  btn.disabled = true;
  statusEl.className = 'ai-status';
  statusEl.innerHTML = '<span class="spinner"></span>Amélioration…';
  try {
    const { text } = await window.api.aiChat({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: "Tu es directeur de création expert en prompts de génération d'images. Tu transformes une idée brève en un brief visuel détaillé et PRO : accroche/texte clé, sujet, composition/cadrage, style artistique, lumière, palette (couleurs de marque), ambiance, haute qualité. 2 à 4 phrases denses, concrètes et exploitables, en français, sans listes, sans guillemets, sans préambule." },
        { role: 'user', content: (() => { const c = activeCompany(); const ctx = c ? ` Marque « ${c.name} »${c.category ? ', secteur ' + c.category : ''}${c.colors && c.colors.length ? ', couleurs ' + c.colors.join(', ') : ''}.` : ''; return `Objectif : ${guidedRecipe.title}.${ctx} Idée de l'utilisateur : "${current}". Réécris-la en un brief visuel détaillé, inspirant et cohérent avec la marque. Le texte qui apparaîtra sur le visuel sera en ${LANG_LABEL[guidedLang() || 'fr']}.`; })() },
      ],
    });
    if (f) f.value = text;
    statusEl.textContent = '✅ Texte amélioré.';
  } catch (e) {
    statusEl.textContent = '❌ ' + e.message;
    statusEl.className = 'ai-status error';
  } finally {
    btn.disabled = false;
  }
};

document.getElementById('guidedGenerate').onclick = async () => {
  const r = guidedRecipe;
  if (!r) return;
  const statusEl = document.getElementById('guidedStatus');
  const resultEl = document.getElementById('guidedResult');
  const answers = {};
  document.querySelectorAll('#guidedQuestions .gq-field').forEach((f) => (answers[f.dataset.key] = f.value.trim()));
  if (!answers.subject) {
    statusEl.textContent = "Décrivez d'abord le sujet.";
    statusEl.className = 'status error';
    return;
  }
  if (r.needsImage && !guidedRefs.length) {
    statusEl.textContent = "Importez d'abord la ou les photos (personne, produit…).";
    statusEl.className = 'status error';
    return;
  }
  if (!guidedLang() && !r.proLayers) { // Affiche Pro : le texte est tapé par l'utilisateur (calques), pas généré
    statusEl.textContent = "Choisissez d'abord la langue de l'affiche.";
    statusEl.className = 'status error';
    return;
  }

  // Style sélectionné : remplace la direction artistique auto par le style choisi.
  const styleSel = document.getElementById('guidedStyle');
  const style = STYLES[r.kind].find((s) => s.id === styleSel.value);
  const useStyle = style && style.t && !r.needsImage && !r.proLayers; // prompts dédiés conservés
  // Affiche Pro : pas de directive de langue ni de coordonnées dans l'image (tout est en calques).
  let prompt = (useStyle ? buildStylePrompt(style, answers.subject) : r.build(answers) + ART_DIRECTION) + (r.proLayers ? '' : langDirective(guidedLang()));
  if (document.getElementById('guidedUseBrand').checked && activeCompany()) prompt += brandSuffix(activeCompany());
  if (!r.proLayers && document.getElementById('guidedShowContact').checked && activeCompany()) prompt += contactDirective(activeCompany());

  const eff = effectiveRecipe(r, document.getElementById('guidedQuality').value);
  const btn = document.getElementById('guidedGenerate');
  btn.disabled = true;
  guidedGenToken = { cancelled: false };
  document.getElementById('guidedCancel').classList.remove('hidden');
  resultEl.innerHTML = '';
  statusEl.className = 'status';
  statusEl.innerHTML = '<span class="spinner"></span>Préparation…';
  try {
    // On rassemble les images de référence transmises au modèle : photo utilisateur, style à garder, logo.
    const images = [];
    const c = activeCompany();

    // 1) Images de référence de l'utilisateur (inspiration / personnage / produit / tenue-décor)
    if (guidedRefs.length) {
      for (let i = 0; i < guidedRefs.length; i++) {
        statusEl.innerHTML = `<span class="spinner"></span>Upload des images de référence… (${i + 1}/${guidedRefs.length})`;
        const up = await window.api.uploadFile({ base64DataUrl: guidedRefs[i].dataUrl, fileName: guidedRefs[i].name });
        images.push(up.url);
      }
      if (!r.needsImage) {
        const mode = document.getElementById('guidedRefMode').value;
        prompt += mode === 'character'
          ? " Garde les mêmes personnages / sujets / produits que les photos de référence fournies : mêmes visages, mêmes caractéristiques, mêmes produits à l'identique, cohérence d'identité parfaite."
          : " Inspire-toi du style visuel, de l'ambiance et de la palette des photos de référence fournies.";
      } else if (guidedRefs.length > 1) {
        prompt += " Plusieurs photos sont fournies (personne, produit, élément…) : COMBINE-les naturellement dans une seule scène cohérente — même lumière, mêmes proportions, intégration réaliste.";
      }
    }

    // 2) Garder le même style que la dernière création
    if (eff.kind === 'image' && lastStyleUrl && document.getElementById('guidedKeepStyle').checked) {
      images.push(lastStyleUrl);
      prompt += " Garde la même direction artistique que l'image de style fournie (même palette, même ambiance, même traitement graphique).";
    }

    // 3) Logo : selon le mode choisi (placé par l'IA / incrusté exact / aucun)
    // Affiche Pro : le logo est un calque ajouté dans l'éditeur, pas dans l'image générée.
    const logoMode = document.getElementById('guidedLogoMode').value;
    const hasLogo = eff.kind === 'image' && c && c.logoFile && !r.proLayers;
    const overlayLogoAfter = hasLogo && logoMode === 'exact';
    if (hasLogo && logoMode === 'ai') {
      const logoKie = await uploadCompanyLogo(statusEl); // re-héberge le vrai logo et le donne au modèle
      if (logoKie) {
        images.push(logoKie);
        prompt += LOGO_DIRECTIVE;
      }
    }

    const descriptor =
      eff.kind === 'image'
        ? guidedImageDescriptor(eff.model, eff.params, prompt, images)
        : guidedVideoDescriptor(eff.model, eff.params, prompt, images);
    statusEl.innerHTML = '<span class="spinner"></span>Création en cours…' + (r.kind === 'video' ? ' (la vidéo peut prendre quelques minutes)' : '');
    const { taskId } = await window.api.generate(descriptor);
    const res = await pollUntilDone({ api: descriptor.api, taskId }, statusEl, r.kind === 'video' ? 'Génération de la vidéo' : "Génération de l'image", guidedGenToken);
    statusEl.textContent = res.credits != null ? `✅ Terminé. (−${res.credits} crédits)` : '✅ Terminé.';
    if (eff.kind === 'image') {
      lastStyleUrl = res.resultUrl; // mémorise le style (image sans logo)
      document.getElementById('guidedStyleHint').textContent = '✓ style mémorisé';
      let finalUrl = res.resultUrl;
      if (overlayLogoAfter) {
        statusEl.innerHTML = '<span class="spinner"></span>Incrustation du logo…';
        try {
          const posEl = document.getElementById('guidedLogoPos');
          const o = await window.api.overlayLogo({ imageUrl: res.resultUrl, logoUrl: c.logoFile, position: posEl ? posEl.value : 'tr' });
          finalUrl = o.url;
          statusEl.textContent = '✅ Terminé (logo ajouté).';
        } catch (_) {
          statusEl.textContent = '✅ Terminé (logo non ajouté).';
        }
      }
      showImageResult(resultEl, finalUrl, answers.subject);
      // Affiche Pro : ouvre l'éditeur avec titre/description/logo/contacts en calques modifiables
      if (r.proLayers) {
        statusEl.innerHTML = '<span class="spinner"></span>Composition des calques (titre, contacts)…';
        try {
          await composeProPoster(finalUrl, answers);
          statusEl.textContent = '✅ Affiche composée — modifie les textes dans l\'éditeur, puis exporte.';
        } catch (_) {
          statusEl.textContent = '✅ Image générée (ouvre-la dans l\'éditeur pour ajouter tes textes).';
        }
      }
    } else {
      showVideoResult(resultEl, res.resultUrl, answers.subject);
    }
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '⏹️ ' : '❌ ') + e.message;
    statusEl.className = 'status error';
  } finally {
    btn.disabled = false;
    document.getElementById('guidedCancel').classList.add('hidden');
  }
};

// (Le code d'accès de l'app de bureau est remplacé sur le web par la connexion Supabase — voir supabase.js)

// ============ Initialisation ============
(async () => {
  try {
    const s = await window.api.configStatus();
    activeCompanyId = s.activeCompanyId || null;
  } catch (_) {}
  const justChose = await ensureAccountType(); // 1re connexion : choix Particulier / Entreprise
  renderGuidedCards();
  await loadCompanies();
  // Après le choix du type, on démarre directement le cycle de configuration de la marque
  // (assistant pas-à-pas pour Particulier, formulaire complet pour Entreprise).
  if (justChose && companies.length === 0) goToCompanySetup();
})();
