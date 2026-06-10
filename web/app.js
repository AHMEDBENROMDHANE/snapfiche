// ============ Icônes (style ligne unifié) ============
const ICONS = {
  star: '<path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  tag: '<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>',
  briefcase: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
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
async function ensureAccountType() {
  try { const me = await window.api.getMe(); ACCOUNT.type = me.accountType || null; } catch (_) {}
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

// ============ Image source (upload) ============
const imgSrc = { v: null };
const vidSrc = { v: null };
function wireSource(prefix, holder, emptyText) {
  const file = document.getElementById(prefix + 'SourceFile');
  const name = document.getElementById(prefix + 'SourceName');
  const prev = document.getElementById(prefix + 'SourcePreview');
  const clear = document.getElementById(prefix + 'SourceClear');
  file.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const ds = await downscaleDataUrl(reader.result, 1280, 'image/jpeg');
      holder.v = { dataUrl: ds, name: f.name };
      name.textContent = f.name;
      prev.src = ds;
      prev.classList.remove('hidden');
      clear.classList.remove('hidden');
    };
    reader.readAsDataURL(f);
  });
  clear.onclick = () => {
    holder.v = null;
    file.value = '';
    prev.classList.add('hidden');
    clear.classList.add('hidden');
    name.textContent = emptyText;
  };
}
wireSource('img', imgSrc, 'Aucune — mode texte → image');
wireSource('vid', vidSrc, 'Aucune — mode texte → vidéo');

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
  imgGenerate.disabled = true;
  imgGenToken = { cancelled: false };
  document.getElementById('imgCancel').classList.remove('hidden');
  resultEl.innerHTML = '';
  statusEl.className = 'status';
  statusEl.innerHTML = '<span class="spinner"></span>Préparation…';
  try {
    const images = [];
    const sourceUrl = await uploadSource(imgSrc, statusEl);
    if (sourceUrl) images.push(sourceUrl);
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

function showImageResult(container, url, prompt, history) {
  history = history || []; // pile des images précédentes (pour Annuler)
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  container.appendChild(img);
  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Enregistrer dans la galerie';
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enregistrement…';
    try {
      await window.api.galleryAdd({ type: 'image', url, prompt, companyId: activeCompanyId });
      saveBtn.textContent = '✅ Ajouté à la galerie';
    } catch (e) {
      saveBtn.textContent = '❌ ' + e.message;
    }
  };

  const editBtn = document.createElement('button');
  editBtn.textContent = "✏️ Ouvrir dans l'éditeur";
  editBtn.onclick = () => loadBackgroundFromUrl(url);

  actions.appendChild(saveBtn);
  actions.appendChild(editBtn);
  if (history.length) {
    const undoBtn = document.createElement('button');
    undoBtn.textContent = '↩️ Annuler la modif';
    undoBtn.onclick = () => showImageResult(container, history[history.length - 1], prompt, history.slice(0, -1));
    actions.appendChild(undoBtn);
  }
  container.appendChild(actions);

  // ---- Édition par IA (langage naturel) ----
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
      showImageResult(container, res.resultUrl, prompt, [...history, url]);
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
let layers = []; // { type:'text'|'image', ... }
let bgImage = null;
let selected = null;
let drag = null;

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ajoutez une image de fond', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  }
  for (const l of layers) {
    if (l.type === 'text') {
      ctx.font = `${l.bold ? 'bold ' : ''}${l.size}px ${l.font}`;
      ctx.fillStyle = l.color;
      ctx.textBaseline = 'top';
      ctx.lineWidth = Math.max(2, l.size / 16);
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(l.text, l.x, l.y);
      ctx.fillText(l.text, l.x, l.y);
      l._w = ctx.measureText(l.text).width;
      l._h = l.size;
    } else if (l.type === 'image' && l.img) {
      ctx.drawImage(l.img, l.x, l.y, l.w, l.h);
    }
    if (l === selected) {
      ctx.strokeStyle = '#7c5cff';
      ctx.lineWidth = 3;
      const w = l.type === 'text' ? l._w : l.w;
      const h = l.type === 'text' ? l._h : l.h;
      ctx.strokeRect(l.x - 4, l.y - 4, w + 8, h + 8);
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
  const dataUrl = await window.api.mediaDataUrl(items[choice].file);
  const img = new Image();
  img.onload = () => setBgImage(img);
  img.src = dataUrl;
};

function promptGalleryChoice(items) {
  const list = items.map((g, i) => `${i + 1}. ${g.prompt.slice(0, 40) || '(sans titre)'}`).join('\n');
  const n = prompt(`Quelle image utiliser ?\n${list}`, '1');
  if (!n) return null;
  const idx = parseInt(n, 10) - 1;
  return idx >= 0 && idx < items.length ? idx : null;
}

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
    const w = l.type === 'text' ? l._w || 0 : l.w;
    const h = l.type === 'text' ? l._h || 0 : l.h;
    if (pos.x >= l.x - 4 && pos.x <= l.x + w + 4 && pos.y >= l.y - 4 && pos.y <= l.y + h + 4) return l;
  }
  return null;
}
canvas.addEventListener('mousedown', (e) => {
  const pos = canvasPos(e);
  const hit = hitTest(pos);
  selected = hit;
  if (hit) drag = { dx: pos.x - hit.x, dy: pos.y - hit.y };
  render();
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
        <span class="badge">${item.type === 'video' ? '🎬 Vidéo' : '🖼️ Image'}</span>
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
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Éditer';
      editBtn.onclick = async () => {
        const du = await window.api.mediaDataUrl(item.file);
        const img = new Image();
        img.onload = () => setBgImage(img);
        img.src = du;
        document.querySelector('.nav-btn[data-view="editor"]').click();
      };
      actions.appendChild(editBtn);
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
    id: 'restyle', icon: 'shirt', title: 'Changer tenue / décor',
    desc: 'Garde la même personne, change ses vêtements ou son décor.',
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '4:5', resolution: '2K' },
    needsImage: true,
    ask: [{ key: 'subject', label: 'Nouvelle tenue ou nouveau décor ?', ph: 'Ex : costume bleu élégant — ou : plage au coucher du soleil' }],
    build: (a) =>
      `À partir de la photo de référence : ${a.subject}. Conserve EXACTEMENT la même personne (même visage, même morphologie, même identité). Ne change que ce qui est demandé (tenue ou décor). Rendu photoréaliste, lumière, ombres et perspective cohérentes.`,
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
  RECIPES.forEach((r) => {
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
    const useTextarea = a.key === 'subject';
    const field = document.createElement(useTextarea ? 'textarea' : 'input');
    if (useTextarea) field.rows = 2;
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
    ? 'Photo de la personne (obligatoire)'
    : 'Image de référence (optionnel)';
  // Pour "changer tenue/décor", la référence sert à préserver l'identité (mode forcé).
  document.getElementById('guidedRefMode').classList.toggle('hidden', !!r.needsImage);
  document.getElementById('guidedStyleHint').textContent = lastStyleUrl ? '✓ style mémorisé' : '(aucune création précédente)';
  document.getElementById('guidedStatus').textContent = '';
  document.getElementById('guidedResult').innerHTML = '';
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
let guidedRef = null;
(function wireGuidedRef() {
  const file = document.getElementById('guidedRefFile');
  const prev = document.getElementById('guidedRefPreview');
  const clr = document.getElementById('guidedRefClear');
  file.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      const ds = await downscaleDataUrl(r.result, 1280, 'image/jpeg');
      guidedRef = { dataUrl: ds, name: f.name };
      prev.src = ds;
      prev.classList.remove('hidden');
      clr.classList.remove('hidden');
    };
    r.readAsDataURL(f);
  });
  clr.onclick = () => {
    guidedRef = null;
    file.value = '';
    prev.classList.add('hidden');
    clr.classList.add('hidden');
  };
})();
function resetGuidedRef() {
  guidedRef = null;
  document.getElementById('guidedRefFile').value = '';
  document.getElementById('guidedRefPreview').classList.add('hidden');
  document.getElementById('guidedRefClear').classList.add('hidden');
}

// ---- Assistant IA (idées / rédaction) via kie.ai (Gemini Flash) ----
const AI_MODEL = 'gemini-2.5-flash';
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

document.getElementById('aiIdeas').onclick = async () => {
  if (!guidedRecipe) return;
  const statusEl = document.getElementById('aiStatus');
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
    const SYS =
      "Tu es directeur de création senior dans une agence de design primée. Tu génères des concepts d'affiches PRÉCIS, originaux et directement exploitables — jamais de banalités ni de descriptions vagues. " +
      "Chaque concept combine une ACCROCHE percutante (vrai texte d'affiche) ET une description visuelle concrète : sujet, composition/cadrage, style artistique, lumière, palette. " +
      "Tu exploites l'identité de marque (secteur, couleurs, logo) et tu varies RADICALEMENT les directions artistiques d'un concept à l'autre.";
    const userText =
      `Objectif : ${guidedRecipe.title}.` +
      `\nMarque : ${c ? '« ' + c.name + ' »' : '(non précisée)'}${cat}${cols}${inf}.` +
      (subjectNow ? `\nDemande de l'utilisateur : ${subjectNow}.` : '') +
      (logoDataUrl ? `\nLe logo est joint : tiens compte de son style et de ses couleurs.` : '') +
      `\nLangue du texte affiché : ${LANG_LABEL[guidedLang()]}.` +
      `\n\nDonne 5 concepts d'affiche RADICALEMENT différents et mémorables, SPÉCIFIQUES à ce secteur (pas génériques).` +
      `\nFormat STRICT — exactement une ligne par concept, ainsi :` +
      `\n"Accroche courte et percutante" — concept visuel précis (sujet + composition + style + lumière + palette).` +
      `\nVarie les directions (minimaliste éditorial, rendu 3D, photo cinématographique, typographie géante, collage, néon, rétro, dégradé aurora...).` +
      `\nPas de numéro, pas de puce, pas d'introduction ni de conclusion.`;
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
    statusEl.textContent = 'Cliquez une idée pour l\'utiliser :';
    renderSuggestions(ideas);
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
        { role: 'user', content: (() => { const c = activeCompany(); const ctx = c ? ` Marque « ${c.name} »${c.category ? ', secteur ' + c.category : ''}${c.colors && c.colors.length ? ', couleurs ' + c.colors.join(', ') : ''}.` : ''; return `Objectif : ${guidedRecipe.title}.${ctx} Idée de l'utilisateur : "${current}". Réécris-la en un brief visuel détaillé, inspirant et cohérent avec la marque. Le texte qui apparaîtra sur le visuel sera en ${LANG_LABEL[guidedLang()]}.`; })() },
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
  if (r.needsImage && !guidedRef) {
    statusEl.textContent = "Importez d'abord la photo de la personne.";
    statusEl.className = 'status error';
    return;
  }

  // Style sélectionné : remplace la direction artistique auto par le style choisi.
  const styleSel = document.getElementById('guidedStyle');
  const style = STYLES[r.kind].find((s) => s.id === styleSel.value);
  const useStyle = style && style.t && !r.needsImage; // on garde le prompt dédié pour "changer tenue/décor"
  let prompt = (useStyle ? buildStylePrompt(style, answers.subject) : r.build(answers) + ART_DIRECTION) + langDirective(guidedLang());
  if (document.getElementById('guidedUseBrand').checked && activeCompany()) prompt += brandSuffix(activeCompany());
  if (document.getElementById('guidedShowContact').checked && activeCompany()) prompt += contactDirective(activeCompany());

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

    // 1) Image de référence de l'utilisateur (inspiration / personnage / tenue-décor)
    if (guidedRef) {
      statusEl.innerHTML = '<span class="spinner"></span>Upload de l\'image de référence…';
      const up = await window.api.uploadFile({ base64DataUrl: guidedRef.dataUrl, fileName: guidedRef.name });
      images.push(up.url);
      if (!r.needsImage) {
        const mode = document.getElementById('guidedRefMode').value;
        prompt += mode === 'character'
          ? " Garde le même personnage / sujet que la photo de référence fournie : même visage et mêmes caractéristiques, cohérence d'identité."
          : " Inspire-toi du style visuel, de l'ambiance et de la palette de la photo de référence fournie.";
      }
    }

    // 2) Garder le même style que la dernière création
    if (eff.kind === 'image' && lastStyleUrl && document.getElementById('guidedKeepStyle').checked) {
      images.push(lastStyleUrl);
      prompt += " Garde la même direction artistique que l'image de style fournie (même palette, même ambiance, même traitement graphique).";
    }

    // 3) Logo : selon le mode choisi (placé par l'IA / incrusté exact / aucun)
    const logoMode = document.getElementById('guidedLogoMode').value;
    const hasLogo = eff.kind === 'image' && c && c.logoFile;
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
