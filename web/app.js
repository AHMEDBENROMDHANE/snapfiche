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
  frame: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16.5h18M7.5 16.5V21"/><circle cx="7" cy="7" r="1.6"/>',
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
    // ---- Tendances 2026 ----
    { id: 'neonnoir', name: 'Neon-Noir (2026)', t: 'Neon-noir poster, dominant red and black palette with electric neon highlights, blurred streaked motion effects, oversized ultra-bold typography, {SUBJECT} emerging from darkness, cinematic tension, urban night atmosphere, dramatic rim lighting' },
    { id: 'acidfade', name: 'Acid Fade (2026)', t: 'Acid fade poster, high-saturation prismatic gradients, neon heat-map color blends melting into psychedelic liquid transitions, chrome accents, {SUBJECT} dissolving into iridescent waves, grainy texture, futuristic rave aesthetic' },
    { id: 'sketch', name: 'Fait main / Sketch (2026)', t: 'Hand-drawn sketch poster, authentic pencil and ink strokes, visible construction lines, doodles and handwritten annotations in margins, imperfect charming linework, {SUBJECT} sketched expressively, paper texture, human warmth, anti-digital aesthetic' },
    { id: 'artnouveau', name: 'Art Nouveau moderne (2026)', t: 'Modern Art Nouveau revival poster, organic flowing curved lines, botanical ornamental frames, elegant whiplash motifs blended with bold contemporary abstraction, {SUBJECT} embraced by floral linework, muted gold and deep jewel tones, decorative sophistication' },
    { id: 'scrapbook', name: 'Scrapbooking (2026)', t: 'Scrapbook style poster, layered paper textures, washi tape, stickers, polaroid frames, handwritten notes and doodles, torn edges, {SUBJECT} in a personal memory-board collage, cozy assumed imperfection, tactile and authentic' },
    { id: 'liquidtype', name: 'Typo liquide (2026)', t: 'Liquid typography poster, fluid melting letterforms that stretch and breathe, glossy chrome and gel-like type treatment, {SUBJECT} integrated with morphing characters, smooth organic motion frozen in time, vibrant gradient backdrop' },
    { id: 'folk', name: 'Folk art (2026)', t: 'Folk art poster, traditional hand-crafted patterns, stylized flowers, birds and animals, warm heritage palette, symmetrical naive composition, {SUBJECT} celebrated in timeless artisanal motifs, woodblock print texture, cultural warmth' },
    { id: 'maximal', name: 'Maximalisme chromatique (2026)', t: 'Chromatic maximalism poster, electric saturated clashing colors, dense layered patterns and shapes, energetic visual overload done with intention, {SUBJECT} at the vibrant epicenter, bold confidence, dopamine-inducing palette' },
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
    { id: 'nano-banana-pro', label: 'Snap Max', desc: 'Qualité maximale : affiches très détaillées, textes nets, sait combiner plusieurs images (personne + produit).', api: 'jobs', edit: true, ratio: true, res: true, imageField: 'image_input', creditsByRes: { '1K': 24, '2K': 30, '4K': 40 } },
    { id: 'seedream/4.5-text-to-image', label: 'Snap', desc: 'Rapide et économique : parfait pour tester des idées et produire en volume.', api: 'jobs', ratio: true, credits: 7, jobsInput: (prompt, params) => ({ prompt, aspect_ratio: params.aspect_ratio || '1:1', quality: 'basic' }) },
    { id: 'ideogram/v3-text-to-image', label: 'Snap Texte', desc: 'Spécialiste de la typographie : titres, slogans et textes parfaitement lisibles sur l\'image.', api: 'jobs', ratio: true, credits: 10, jobsInput: (prompt, params) => ({ prompt, aspect_ratio: params.aspect_ratio || '1:1', rendering_speed: 'QUALITY' }) },
    { id: 'flux-kontext-pro', label: 'Snap Plus', desc: 'Équilibré : bon rendu général et retouche fidèle d\'une image importée.', api: 'flux', edit: true, ratio: true, credits: 8 },
    { id: 'flux-kontext-max', label: 'Snap Pro', desc: 'Haut de gamme : compositions raffinées et suivi précis des consignes.', api: 'flux', edit: true, ratio: true, credits: 12 },
  ],
  video: [
    { id: 'veo3_fast', label: 'Snap Motion', desc: 'Vidéo fluide et rapide : le meilleur rapport qualité/prix pour les pubs courtes.', api: 'veo', image: true, durations: [4, 6, 8], resolutions: ['720p', '1080p'], creditsPerSec: 7.5 },
    { id: 'veo3', label: 'Snap Motion Pro', desc: 'Vidéo cinéma : la meilleure qualité d\'image, pour les campagnes importantes.', api: 'veo', image: true, durations: [4, 6, 8], resolutions: ['720p', '1080p'], creditsPerSec: 31 },
    { id: 'bytedance/seedance-2', label: 'Snap Clip Pro', desc: 'Vidéo créative avec son : transitions début→fin, jusqu\'à 15 s, idéale réseaux sociaux.', api: 'jobs', image: true, audio: true, durations: [4, 6, 8, 10, 12, 15], resolutions: ['480p', '720p', '1080p'], creditsPerSecByRes: { '480p': 11.5, '720p': 25, '1080p': 50 } },
    { id: 'bytedance/seedance-2-fast', label: 'Snap Clip', desc: 'Vidéo créative économique avec son : parfaite pour stories et tests.', api: 'jobs', image: true, audio: true, durations: [4, 6, 8, 10, 12, 15], resolutions: ['480p', '720p', '1080p'], creditsPerSecByRes: { '480p': 9, '720p': 20, '1080p': 40 } },
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
    keyStatus.textContent = s.fromEnv ? 'Clé (.env) active' : 'Clé active';
    keyStatus.className = 'key-status ok';
  } else {
    keyStatus.textContent = 'Aucune clé API';
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
  renderGuidedCards(); // carte cadre + boutons par carte dépendent de l'entreprise active
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
        ? 'Compte <b>Particulier</b> — limité à 1 entreprise. Pour en gérer plusieurs, passe en <b>Entreprise</b> dans les Réglages.'
        : 'Compte <b>Particulier</b> — tu peux créer 1 entreprise.';
    } else {
      banner.className = 'account-banner';
      banner.innerHTML = 'Compte <b>Entreprise</b> — nombre d\'entreprises illimité.';
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
      const badge = p.promo_active ? 'PROMO' : p.badge;
      const priceHtml = p.promo_active
        ? `<div class="pack-price"><s class="pack-old">${(+p.price_tnd).toFixed(2)}</s> ${(+p.promo_price_tnd).toFixed(2)} <small>TND TTC</small></div>` +
          (p.promo_until ? `<div class="pack-promo-until">jusqu'au ${new Date(p.promo_until).toLocaleDateString('fr-FR')}</div>` : '')
        : `<div class="pack-price">${(+p.price_tnd).toFixed(2)} <small>TND TTC</small></div>`;
      const equiv = Math.floor(p.credits / 30);
      card.innerHTML =
        (badge ? `<span class="pack-badge">${esc(badge)}</span>` : '') +
        `<h3>${esc(p.name)}</h3>` +
        `<div class="pack-credits">${p.credits} crédits</div>` +
        priceHtml +
        `<div class="pack-equiv">≈ ${equiv} affiches HD (2K) · soit ${((p.promo_active ? +p.promo_price_tnd : +p.price_tnd) / equiv).toFixed(2)} DT l'affiche</div>` +
        `<button class="primary pack-buy">Choisir ce pack</button>`;
      const price = p.promo_active ? +p.promo_price_tnd : +p.price_tnd;
      card.querySelector('.pack-buy').onclick = () => {
        window.location.href = '/paiement?pack=' + encodeURIComponent(p.name) +
          '&credits=' + p.credits + '&price=' + price;
      };
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
    `<td class="pk-actions"><button class="mini pk-save">${isNew ? 'Créer' : ''}</button>${isNew ? '' : ' <button class="mini pk-del">✕</button>'}</td>`;
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
    body.innerHTML = `<tr><td colspan="10" class="empty">✗ ${esc(e.message)}</td></tr>`;
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
  { key: 'signup', label: 'Inscriptions', desc: 'Création de nouveaux comptes' },
  { key: 'video', label: 'Génération vidéo', desc: 'Vue Vidéo + recettes vidéo guidées' },
  { key: 'image_edit', label: 'Modification SnapFiche', desc: 'Retouche des images par instruction' },
  { key: 'ai_assistant', label: 'Assistant SnapFiche', desc: 'Idées et amélioration de texte' },
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

// Solde réel du compte kie.ai (l'argent derrière les générations).
async function loadKieBalance() {
  const box = document.getElementById('kieBalanceBox');
  if (!box) return;
  box.innerHTML = '<span class="spinner"></span> Solde kie.ai…';
  try {
    const b = await window.api.adminKieBalance();
    const low = b.credits < 500; // seuil d'alerte visuelle
    box.className = 'kie-balance' + (low ? ' low' : '');
    box.innerHTML =
      `<span class="kb-label">Solde kie.ai (réel)</span>` +
      `<span class="kb-val">${b.credits.toLocaleString('fr-FR')} crédits</span>` +
      `<span class="kb-usd">≈ $${b.usd}</span>` +
      (low ? `<span class="kb-warn">Solde bas — pense à recharger sur kie.ai</span>` : '') +
      `<button id="kieRefresh" class="mini">↻</button>` +
      `<a href="https://kie.ai/api-key" target="_blank" rel="noopener" class="mini">Recharger sur kie.ai</a>`;
    const rb = document.getElementById('kieRefresh');
    if (rb) rb.onclick = loadKieBalance;
  } catch (e) {
    box.className = 'kie-balance';
    box.innerHTML = `<span class="kb-label">Solde kie.ai</span><span class="kb-warn">Lecture impossible : ${esc(e.message)}</span>`;
  }
}
// Bannière d'alerte « crédits kie.ai insuffisants » (déclenchée quand une génération a échoué pour ça).
function renderKieAlert(alert) {
  const b = document.getElementById('kieAlertBanner');
  if (!b) return;
  if (!alert || !alert.at) { b.classList.add('hidden'); return; }
  const when = new Date(alert.at).toLocaleString('fr-FR');
  b.classList.remove('hidden');
  b.innerHTML = `<b>⚠ Crédits kie.ai insuffisants</b> — une génération a échoué (${when}). Recharge ton compte kie.ai pour rétablir le service. <button id="kieAckBtn" class="mini">J'ai rechargé</button>`;
  const ack = document.getElementById('kieAckBtn');
  if (ack) ack.onclick = async () => { try { await window.api.adminKieAck(); b.classList.add('hidden'); loadKieBalance(); } catch (_) {} };
}

async function loadAdmin() {
  const stats = document.getElementById('adminStats');
  const recent = document.getElementById('adminRecent');
  loadKieBalance();
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
    renderKieAlert(o.kieAlert);
    recent.innerHTML = (o.recent || []).map((r) => {
      const d = new Date(r.created_at);
      const when = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const cls = r.delta < 0 ? 'neg' : 'pos';
      return `<div class="ar-row"><span class="ar-when">${when}</span><span class="ar-delta ${cls}">${r.delta > 0 ? '+' : ''}${r.delta}</span><span>${esc(r.email)}</span><span style="color:var(--muted)">${esc(r.reason || '')}</span></div>`;
    }).join('') || '<p class="empty">Aucune activité.</p>';
  } catch (e) {
    stats.innerHTML = `<p class="empty">✗ ${esc(e.message)}</p>`;
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
    body.innerHTML = `<tr><td colspan="7" class="empty">✗ ${esc(e.message)}</td></tr>`;
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
  renderGuidedCards(); // workflow guidé : carte cadre selon l'entreprise active
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
  status.textContent = 'Lecture du site en cours…';
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
    status.textContent = (n || addedCol) ? `✓ Récupéré : ${n} champ(s), ${addedCol} couleur(s), ${catEl.value ? 'catégorie ✓, ' : ''}${d.logo ? 'logo ✓' : 'pas de logo'}. Vérifie puis Enregistre.` : "ℹ️ Peu d'infos trouvées — complète à la main.";
  } catch (e) {
    status.textContent = '✗ ' + e.message;
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
  status.textContent = 'Analyse du site en cours…';
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
    status.textContent = (n || addedCol || d.logo) ? `✓ Infos récupérées — vérifie-les aux étapes suivantes.` : "ℹ️ Peu d'infos trouvées — complète à la main.";
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
    err.textContent = '✗ ' + msg;
    btn.disabled = false; btn.textContent = '✓ Terminer';
  }
}

// --- Import / Export des entreprises ---
document.getElementById('dataExport').onclick = async () => {
  try {
    const res = await window.api.dataExport();
    if (!res.canceled) alert(`✓ ${res.count} entreprise(s) exportée(s) :\n${res.filePath}`);
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
      alert(`✓ ${res.added} entreprise(s) importée(s).`);
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
    hint.textContent = '✓ Type de compte mis à jour : ' + (r.accountType === 'entreprise' ? 'Entreprise' : 'Particulier') + '.';
  } catch (e) {
    hint.textContent = '✗ ' + e.message;
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
  document.getElementById('imgModelHint').textContent = m.desc || '';
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
  document.getElementById('vidModelHint').textContent = m.desc || '';
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
    statusEl.textContent = `Le modèle « ${m.label} » ne prend pas d'images sources — choisis Snap Max (jusqu'à 8 images) ou retire les images.`;
    statusEl.className = 'status error';
    return;
  }
  if (imgSrcList.length > 1 && m.api === 'flux') {
    statusEl.textContent = `${m.label} n'accepte qu'UNE image source — garde la première ou choisis Snap Max (multi-images).`;
    statusEl.className = 'status error';
    return;
  }
  imgGenerate.disabled = true;
  imgGenToken = { cancelled: false };
  document.getElementById('imgCancel').classList.remove('hidden');
  showGenLoading(resultEl, document.getElementById('imgRatio').value, "Génération de l'image…");
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
    statusEl.textContent = res.credits != null ? `✓ Image générée. (−${res.credits} crédits)` : '✓ Image générée.';
    showImageResult(resultEl, res.resultUrl, prompt2, [], undefined, taskId); // prompt complet + taskId (signalement)
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '■ ' : '✗ ') + e.message;
    statusEl.className = 'status error';
  } finally {
    imgGenerate.disabled = false;
    document.getElementById('imgCancel').classList.add('hidden');
  }
};

// Animation pendant la génération / modification : carte « atelier » au format cible,
// balayage lumineux + messages qui défilent.
const GEN_MSGS = ['Composition de la scène…', 'Application de la charte…', 'Réglage des lumières…', 'Peaufinage des détails…', 'Presque prêt…'];
function showGenLoading(container, ratio, title) {
  // Logo pulsant (violet ↔ blanc) + barre de progression avec pourcentage.
  container.innerHTML =
    `<div class="gen-loading">` +
    `<img class="gen-logo-pulse" src="/assets/logo.png" alt="SnapFiche" />` +
    `<div class="gen-loading-text">${esc(title || 'Création en cours…')}</div>` +
    `<div class="gen-bar"><div class="gen-bar-fill" id="genBar"></div></div>` +
    `<div class="gen-loading-sub"><span id="genMsg">${GEN_MSGS[0]}</span> · <b id="genPct">0%</b></div>` +
    `</div>`;
  let i = 0;
  const msgEl = container.querySelector('#genMsg');
  const barEl = container.querySelector('#genBar');
  const pctEl = container.querySelector('#genPct');
  const timer = setInterval(() => { i = (i + 1) % GEN_MSGS.length; if (msgEl && msgEl.isConnected) msgEl.textContent = GEN_MSGS[i]; else clearInterval(timer); }, 2200);
  // Progression simulée : monte vite puis ralentit, plafonne à ~95% (le 100% arrive avec le résultat).
  let pct = 0;
  const prog = setInterval(() => {
    if (!barEl || !barEl.isConnected) { clearInterval(prog); return; }
    const step = pct < 60 ? 3.5 : pct < 85 ? 1.2 : 0.35;
    pct = Math.min(95, pct + step);
    barEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  }, 320);
  return () => { clearInterval(timer); clearInterval(prog); };
}

// Grille de propositions (batch) : on clique celle qu'on préfère -> elle s'ouvre en grand
// (avec toutes les actions) et s'enregistre alors dans la galerie. Les autres sont jetées.
function showImageGrid(container, urls, prompt) {
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'variant-grid';
  urls.forEach((u) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'variant-cell';
    cell.innerHTML = `<img src="${esc(u)}" loading="lazy" alt="Proposition" /><span class="variant-pick">Choisir</span>`;
    cell.onclick = () => showImageResult(container, u, prompt, [], undefined); // auto-save à la sélection
    grid.appendChild(cell);
  });
  container.appendChild(grid);
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = 'Clique la proposition que tu préfères — elle sera enregistrée dans ta galerie.';
  container.appendChild(hint);
}

// ============ Animation GRATUITE (côté navigateur, 0 crédit) ============
// Effet « Ken Burns » (zoom/travelling lent) + balayage de lumière + vignette,
// encodé en .mp4 via ffmpeg.wasm. Aucun appel à l'IA, aucun crédit débité.
let _ffmpeg = null, _ffmpegLoading = null;
function loadScriptOnce(src) {
  return new Promise((res, rej) => {
    if (document.querySelector('script[data-src="' + src + '"]')) return res();
    const s = document.createElement('script');
    s.src = src; s.dataset.src = src;
    s.onload = () => res(); s.onerror = () => rej(new Error('Échec de chargement : ' + src));
    document.head.appendChild(s);
  });
}
async function loadFFmpeg() {
  if (_ffmpeg) return _ffmpeg;
  if (_ffmpegLoading) return _ffmpegLoading;
  _ffmpegLoading = (async () => {
    // Fichiers servis en MÊME ORIGINE via notre proxy -> le worker (classique) se résout
    // automatiquement à côté de ffmpeg.js. NE PAS passer classWorkerURL (créerait un worker
    // « module » incompatible avec importScripts). URLs absolues obligatoires.
    const O = location.origin;
    await loadScriptOnce(O + '/vendor/ffmpeg/ffmpeg.js');
    const { FFmpeg } = window.FFmpegWASM;
    const ff = new FFmpeg();
    await ff.load({
      coreURL: O + '/vendor/ffmpeg/ffmpeg-core.js',
      wasmURL: O + '/vendor/ffmpeg/ffmpeg-core.wasm',
    });
    _ffmpeg = ff;
    return ff;
  })();
  return _ffmpegLoading;
}
function canvasBlob(c, type, q) { return new Promise((r) => c.toBlob(r, type, q)); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function drawKenBurns(ctx, img, W, H, t) {
  const e = easeInOut(t);
  ctx.clearRect(0, 0, W, H);
  const cover = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const scale = cover * (1.0 + 0.12 * e);
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  const x = (W - dw) / 2 - 0.04 * W * e, y = (H - dh) / 2 - 0.03 * H * e;
  ctx.drawImage(img, x, y, dw, dh);
  // Balayage de lumière (une fois)
  const lt = (t - 0.15) / 0.4;
  if (lt > 0 && lt < 1) {
    const sx = lt * (W * 1.6) - W * 0.3;
    const g = ctx.createLinearGradient(sx, 0, sx + W * 0.35, H);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // Vignette douce
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // Fondu d'entrée
  if (t < 0.12) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - t / 0.12) + ')'; ctx.fillRect(0, 0, W, H); }
}
function loadImageFromBlob(blob) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im); im.onerror = () => rej(new Error('Image illisible.'));
    im.src = URL.createObjectURL(blob);
  });
}
async function freeAnimate(container, url, prompt, history, galleryId, taskId) {
  const fps = 24, dur = 5, N = fps * dur, pad = (i) => 'f' + String(i).padStart(4, '0') + '.jpg';
  container.innerHTML =
    '<div class="gen-loading"><img class="gen-logo-pulse" src="/assets/logo.png" alt="" />' +
    '<div class="gen-loading-text">Animation studio (gratuite)…</div>' +
    '<div class="gen-bar"><div class="gen-bar-fill" id="faBar"></div></div>' +
    '<div class="gen-loading-sub"><span id="faMsg">Préparation…</span> · <b id="faPct">0%</b></div></div>';
  const bar = container.querySelector('#faBar'), pct = container.querySelector('#faPct'), msg = container.querySelector('#faMsg');
  const setP = (p, m) => { p = Math.min(100, Math.round(p)); if (bar) bar.style.width = p + '%'; if (pct) pct.textContent = p + '%'; if (m && msg) msg.textContent = m; };
  try {
    setP(3, 'Chargement de l\'image…');
    const blob = await window.api.proxyImageBlob(url);
    const img = await loadImageFromBlob(blob);
    setP(8, 'Préparation du moteur vidéo…');
    const ff = await loadFFmpeg();
    let W = img.naturalWidth, H = img.naturalHeight;
    const capf = Math.min(1, 1280 / Math.max(W, H));
    W = Math.max(2, Math.round(W * capf / 2) * 2); H = Math.max(2, Math.round(H * capf / 2) * 2);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    for (let i = 0; i < N; i++) {
      drawKenBurns(ctx, img, W, H, i / (N - 1));
      const b = await canvasBlob(cv, 'image/jpeg', 0.9);
      await ff.writeFile(pad(i), new Uint8Array(await b.arrayBuffer()));
      setP(8 + (i / N) * 52, 'Création des images… ' + (i + 1) + '/' + N);
    }
    ff.on('progress', (ev) => { if (ev && typeof ev.progress === 'number') setP(60 + Math.max(0, Math.min(1, ev.progress)) * 38, 'Encodage de la vidéo…'); });
    await ff.exec(['-framerate', String(fps), '-i', 'f%04d.jpg', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-movflags', '+faststart', 'out.mp4']);
    setP(99, 'Finalisation…');
    const data = await ff.readFile('out.mp4');
    const mp4 = new Blob([data.buffer], { type: 'video/mp4' });
    for (let i = 0; i < N; i++) { try { await ff.deleteFile(pad(i)); } catch (_) {} }
    try { await ff.deleteFile('out.mp4'); } catch (_) {}
    setP(100, 'Prêt !');
    showFreeVideo(container, URL.createObjectURL(mp4), url, prompt, history, galleryId, taskId);
  } catch (e) {
    alert('Échec de l\'animation gratuite : ' + e.message);
    showImageResult(container, url, prompt, history, galleryId, taskId);
  }
}
function showFreeVideo(container, videoUrl, srcUrl, prompt, history, galleryId, taskId) {
  container.innerHTML = '';
  const v = document.createElement('video');
  v.src = videoUrl; v.controls = true; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
  container.appendChild(v);
  const actions = document.createElement('div');
  actions.className = 'result-actions';
  const dl = document.createElement('a');
  dl.className = 'dl-video-btn'; dl.textContent = '⬇ Télécharger la vidéo (.mp4)';
  dl.href = videoUrl; dl.download = 'snapfiche-animation.mp4';
  actions.appendChild(dl);
  const again = document.createElement('button');
  again.textContent = 'Refaire l\'animation';
  again.onclick = () => freeAnimate(container, srcUrl, prompt, history, galleryId, taskId);
  actions.appendChild(again);
  const back = document.createElement('button');
  back.textContent = '← Revenir à l\'image';
  back.onclick = () => showImageResult(container, srcUrl, prompt, history, galleryId, taskId);
  actions.appendChild(back);
  container.appendChild(actions);
  const note = document.createElement('div');
  note.className = 'hint'; note.style.marginTop = '8px';
  note.textContent = 'Animation studio gratuite (mouvement de caméra + lumière) — 0 crédit. Pour un mouvement généré par IA, utilise « Animer en IA ».';
  container.appendChild(note);
}

// Affiche une image générée : enregistrée AUTOMATIQUEMENT dans la galerie, éditable par IA
// avec historique des versions (Annuler), synchronisé avec l'élément de galerie (galleryId).
//   galleryId : undefined = nouvelle création (auto-save) · string = élément existant · null = non enregistré
function showImageResult(container, url, prompt, history, galleryId, taskId) {
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
      saveBtn.textContent = '✓ Dans la galerie';
    } catch (e) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Réessayer l\'enregistrement';
    }
  };
  if (galleryId === undefined) {
    // Nouvelle création -> enregistrement automatique
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enregistrement…';
    window.api.galleryAdd({ type: 'image', url, prompt, companyId: activeCompanyId, history })
      .then((it) => { galleryId = it.id; saveBtn.textContent = '✓ Dans la galerie'; })
      .catch(() => { galleryId = null; saveBtn.disabled = false; saveBtn.textContent = 'Enregistrer dans la galerie'; saveBtn.onclick = manualSave; });
  } else if (galleryId) {
    saveBtn.disabled = true;
    saveBtn.textContent = '✓ Dans la galerie';
  } else {
    saveBtn.textContent = 'Enregistrer dans la galerie';
    saveBtn.onclick = manualSave;
  }

  actions.appendChild(saveBtn);

  // Régénération Snap Max 2K. reframe=true -> outpainting : on part de l'IMAGE actuelle
  // et on étend la scène au nouveau format (même sujet/voiture/ambiance) ; sinon variante (prompt).
  async function regenAt(ratio, btn, label, reframe) {
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ ' + label + '…';
    showGenLoading(container, ratio, reframe ? `Reformatage en ${label}…` : 'Nouvelle variante…');
    try {
      let input;
      if (reframe) {
        let srcUrl = url;
        try { const up = await window.api.uploadFile({ remoteUrl: url, fileName: 'reframe-src.png' }); if (up && up.url) srcUrl = up.url; } catch (_) {}
        const outpaintPrompt =
          `Reformate cette affiche au format ${ratio}. Garde EXACTEMENT la même scène, le même sujet/voiture/personnes, les mêmes couleurs, le même style et les mêmes textes. ` +
          `Étends naturellement l'arrière-plan (ciel, décor, sol) pour remplir le nouveau cadre sans déformer ni recadrer les éléments existants. Repositionne harmonieusement le sujet dans le nouveau format. Rendu cohérent et continu. ` +
          (prompt ? `Contexte de l'affiche : ${String(prompt).slice(0, 300)}.` : '');
        input = { prompt: outpaintPrompt, image_input: [srcUrl], aspect_ratio: ratio, resolution: '2K', output_format: 'png' };
      } else {
        input = { prompt: prompt || 'affiche professionnelle', aspect_ratio: ratio, resolution: '2K', output_format: 'png' };
      }
      const { taskId } = await window.api.generate({ api: 'jobs', model: 'nano-banana-pro', input });
      let resultUrl = null;
      for (let t = 0; t < 70 && !resultUrl; t++) {
        await new Promise((s) => setTimeout(s, 2500));
        const r = await window.api.poll({ api: 'jobs', taskId });
        if (r.error) throw new Error(r.error);
        if (r.done) resultUrl = r.resultUrl;
      }
      if (!resultUrl) throw new Error('Délai dépassé — réessaie.');
      refreshBalance();
      // nouvelle création (auto-enregistrée en galerie), l'originale reste en galerie
      showImageResult(container, resultUrl, prompt, [], undefined);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = old;
      alert('Échec : ' + e.message);
    }
  }
  // Variante : même format, nouveau rendu
  const varBtn = document.createElement('button');
  varBtn.textContent = 'Variante (~30 cr)';
  varBtn.title = 'Regénère une autre version avec le même prompt et le même format';
  varBtn.onclick = () => regenAt(nearestAspect(img.naturalWidth, img.naturalHeight), varBtn, 'Variante');
  actions.appendChild(varBtn);

  // Garder ce style : image + directive sauvegardées, resélectionnables dans le travail guidé
  const styleBtn = document.createElement('button');
  styleBtn.textContent = 'Garder ce style';
  styleBtn.title = 'Sauvegarde ce rendu comme style réutilisable (image + directive)';
  styleBtn.onclick = async () => {
    const name = window.prompt('Nom du style :', (prompt || 'Mon style').split('\n')[0].slice(0, 30));
    if (name === null) return;
    styleBtn.disabled = true;
    styleBtn.textContent = 'Sauvegarde…';
    try {
      await window.api.styleSave({ name: name.trim() || 'Style', imageUrl: url, directive: (prompt || '').slice(0, 500) });
      _stylesCache = null; // force le rafraîchissement de la bibliothèque
      styleBtn.textContent = '✓ Style gardé';
    } catch (e) {
      styleBtn.disabled = false;
      styleBtn.textContent = 'Garder ce style';
      alert('Échec : ' + e.message);
    }
  };
  actions.appendChild(styleBtn);

  // Signaler un problème : SnapFiche vérifie l'image et rembourse si le défaut est réel.
  if (taskId) {
    const repBtn = document.createElement('button');
    repBtn.textContent = 'Signaler un problème';
    repBtn.title = 'Un défaut sur cette création ? SnapFiche vérifie et te rembourse si justifié.';
    repBtn.onclick = async () => {
      const complaint = window.prompt('Décris le problème (ex : texte illisible, voiture déformée, hors-sujet…) :', '');
      if (complaint === null || !complaint.trim()) return;
      repBtn.disabled = true;
      repBtn.textContent = 'Vérification…';
      try {
        const r = await window.api.report(taskId, complaint.trim());
        if (r.verdict === 'refund') {
          repBtn.textContent = r.refunded > 0 ? `✓ Remboursé (+${r.refunded} cr)` : '✓ Problème confirmé';
          refreshBalance();
        } else if (r.verdict === 'already') {
          repBtn.textContent = 'Déjà traité';
        } else {
          repBtn.disabled = false;
          repBtn.textContent = 'Signaler un problème';
        }
        alert(r.message || 'Merci, ton signalement a été traité.');
      } catch (e) {
        repBtn.disabled = false;
        repBtn.textContent = 'Signaler un problème';
        alert('Échec : ' + e.message);
      }
    };
    actions.appendChild(repBtn);
  }

  // Animer GRATUITEMENT : effet studio (caméra + lumière) encodé en .mp4 dans le navigateur, 0 crédit.
  {
    const freeBtn = document.createElement('button');
    freeBtn.textContent = '🎬 Animer (gratuit)';
    freeBtn.title = 'Crée une courte vidéo animée (mouvement de caméra + lumière) directement dans ton navigateur — sans crédit.';
    freeBtn.onclick = () => freeAnimate(container, url, prompt, history, galleryId, taskId);
    actions.appendChild(freeBtn);
  }

  // Animer en vidéo : transforme l'affiche/le visuel en courte vidéo (image -> vidéo).
  if (featureOn('video')) {
    const animBtn = document.createElement('button');
    animBtn.textContent = 'Animer en IA (~100 cr)';
    animBtn.title = 'Crée une courte vidéo animée à partir de cette image (mouvement de caméra, vie)';
    animBtn.onclick = async () => {
      animBtn.disabled = true;
      showGenLoading(container, '9:16', 'Animation en vidéo…');
      try {
        let srcUrl = url;
        try { const up = await window.api.uploadFile({ remoteUrl: url, fileName: 'anim-src.png' }); if (up && up.url) srcUrl = up.url; } catch (_) {}
        const motion = "Anime cette image en une courte vidéo cinématographique : léger mouvement de caméra (travelling/zoom lent), éléments vivants (lumière, vent, reflets). Garde EXACTEMENT la même scène, le même sujet et la même composition.";
        const { taskId: vt } = await window.api.generate({
          api: 'jobs', model: 'bytedance/seedance-2-fast',
          input: { prompt: motion, first_frame_url: srcUrl, aspect_ratio: 'adaptive', resolution: '720p', duration: 5, generate_audio: false },
        });
        let videoUrl = null;
        for (let t = 0; t < 90 && !videoUrl; t++) {
          await new Promise((s) => setTimeout(s, 3000));
          const rr = await window.api.poll({ api: 'jobs', taskId: vt });
          if (rr.error) throw new Error(rr.error);
          if (rr.done) videoUrl = rr.resultUrl;
        }
        if (!videoUrl) throw new Error('Délai dépassé — réessaie.');
        refreshBalance();
        showVideoResult(container, videoUrl, prompt);
      } catch (e) {
        alert('Échec : ' + e.message);
        showImageResult(container, url, prompt, history, galleryId, taskId);
      }
    };
    actions.appendChild(animBtn);
  }

  if (history.length) {
    const undoBtn = document.createElement('button');
    undoBtn.textContent = `↩ Annuler la modif (${history.length})`;
    undoBtn.onclick = async () => {
      const prev = history[history.length - 1], newHist = history.slice(0, -1);
      if (galleryId) { try { await window.api.galleryUpdate(galleryId, { url: prev, history: newHist }); } catch (_) {} }
      showImageResult(container, prev, prompt, newHist, galleryId || null);
    };
    actions.appendChild(undoBtn);
  }
  container.appendChild(actions);

  // Pellicule des versions : toutes les étapes (ancienne → … → actuelle), cliquables pour revenir.
  if (history.length) {
    const versions = [...history, url]; // la dernière = version actuelle
    const strip = document.createElement('div');
    strip.className = 'film-strip';
    strip.innerHTML = '<span class="film-label">Versions</span>';
    versions.forEach((u, i) => {
      const isCurrent = i === versions.length - 1;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'film-cell' + (isCurrent ? ' current' : '');
      cell.title = isCurrent ? 'Version actuelle' : `Revenir à la version ${i + 1}`;
      cell.innerHTML = `<img src="${esc(u)}" loading="lazy" alt="Version ${i + 1}" /><span class="film-tag">${isCurrent ? 'Actuelle' : 'v' + (i + 1)}</span>`;
      if (!isCurrent) cell.onclick = async () => {
        const newHist = history.slice(0, i); // on revient à la version i, l'historique avant elle
        if (galleryId) { try { await window.api.galleryUpdate(galleryId, { url: u, history: newHist }); } catch (_) {} }
        showImageResult(container, u, prompt, newHist, galleryId || null);
      };
      strip.appendChild(cell);
    });
    container.appendChild(strip);
  }

  // Déclinaison multi-formats par OUTPAINTING : étend la même affiche au nouveau format.
  const declRow = document.createElement('div');
  declRow.className = 'decline-row';
  container.appendChild(declRow);
  const buildDecl = () => {
    const FORMATS = [
      { r: '9:16', label: 'Story 9:16' },
      { r: '1:1', label: 'Carré 1:1' },
      { r: '4:5', label: 'Portrait 4:5' },
      { r: '16:9', label: 'Paysage 16:9' },
    ];
    const currentAr = nearestAspect(img.naturalWidth, img.naturalHeight);
    declRow.innerHTML = '<span class="decline-label">Décliner en :</span>';
    FORMATS.filter((f) => f.r !== currentAr).forEach((f) => {
      const b = document.createElement('button');
      b.className = 'mini';
      b.textContent = f.label;
      b.title = `Reformate la MÊME affiche au format ${f.label} (~30 cr)`;
      b.onclick = () => regenAt(f.r, b, f.label, true); // reframe = outpainting
      declRow.appendChild(b);
    });
  };
  if (img.complete && img.naturalWidth) buildDecl();
  else img.addEventListener('load', buildDecl, { once: true });

  // ---- Édition par IA (langage naturel) ----
  if (!featureOn('image_edit')) return; // fonctionnalité désactivée par l'admin
  const edit = document.createElement('div');
  edit.className = 'edit-ai';
  edit.innerHTML =
    '<div class="edit-title">Modifier avec SnapFiche <span class="edit-model-tag">Snap Max · ~30 cr</span></div>' +
    '<textarea class="edit-input edit-input-big" rows="3" placeholder="Décris ta modification : change le titre en « SOLDES -50% », fond plus sombre, ajoute des ballons, enlève la personne, corrige le numéro de téléphone…"></textarea>' +
    '<div class="edit-row"><button class="edit-btn">Appliquer la modification</button></div>' +
    '<div class="edit-hint">SnapFiche reformule ta demande à partir du prompt d\'origine, puis applique UNIQUEMENT ce changement — le reste de l\'affiche est conservé.</div>' +
    '<div class="edit-status"></div>';
  const input = edit.querySelector('.edit-input');
  const ebtn = edit.querySelector('.edit-btn');
  const estatus = edit.querySelector('.edit-status');
  const runEdit = async () => {
    const instr = input.value.trim();
    if (!instr) return;
    ebtn.disabled = true;
    estatus.className = 'edit-status';
    try {
      // Ratio de l'affiche source -> on le force pour éviter tout recadrage / changement de taille
      const ar = nearestAspect(img.naturalWidth, img.naturalHeight);

      // 1) Reformulation : l'assistant comprend la modif dans le contexte du prompt d'origine
      //    et écrit une instruction optimisée pour Nano Banana (Snap Max).
      estatus.innerHTML = '<span class="spinner"></span>Analyse de ta demande…';
      let editPrompt = null;
      try {
        const SYS =
          "Tu es prompt engineer expert du modèle d'édition d'image Nano Banana. On te donne le prompt d'origine d'une affiche et une demande de modification (souvent en français familier, parfois vague). " +
          "Tu écris UNE instruction d'édition en anglais, claire, précise et exécutable : décris exactement le changement à appliquer (textes exacts entre guillemets s'il y en a), " +
          "et précise que tout le reste (composition, style, couleurs, typographies, logo, autres textes) doit rester strictement identique. Réponds UNIQUEMENT par l'instruction, sans guillemets autour ni commentaire.";
        const USR = `Prompt d'origine de l'affiche : ${prompt || '(inconnu)'}\nDemande de modification de l'utilisateur : ${instr}`;
        const rr = await window.api.aiChat({ model: AI_MODEL, messages: [{ role: 'system', content: SYS }, { role: 'user', content: USR }] });
        if (rr.text && rr.text.trim().length > 10) editPrompt = rr.text.trim();
      } catch (_) { /* repli : instruction brute */ }
      const guarded = editGuardPrompt(editPrompt || instr, ar);

      // 2) Ré-upload de la photo de sortie chez kie (URL stable pour le modèle)
      estatus.innerHTML = '<span class="spinner"></span>Préparation de l\'image…';
      let srcUrl = url;
      try {
        const up = await window.api.uploadFile({ remoteUrl: url, fileName: 'edit-source.png' });
        if (up && up.url) srcUrl = up.url;
      } catch (_) { /* repli : URL d'origine */ }

      // 3) Snap Max (nano-banana-pro) uniquement — la meilleure fidélité de retouche
      estatus.innerHTML = '<span class="spinner"></span>Modification en cours…';
      showGenLoading(container, ar, 'Modification en cours…');
      const descriptor = {
        api: 'jobs',
        model: 'nano-banana-pro',
        input: { prompt: guarded, image_input: [srcUrl], aspect_ratio: ar, resolution: '2K', output_format: 'png' },
      };
      const { taskId } = await window.api.generate(descriptor);
      const res = await pollUntilDone({ api: 'jobs', taskId }, estatus, 'Modification');
      refreshBalance();

      // 4) Versionne le prompt avec la photo (galerie + affichage) + historique pour Annuler
      const newPrompt = (prompt ? prompt + '\n' : '') + '· Modif : ' + instr;
      const newHistory = [...history, url];
      if (galleryId) { try { await window.api.galleryUpdate(galleryId, { url: res.resultUrl, history: newHistory, prompt: newPrompt }); } catch (_) {} }
      showImageResult(container, res.resultUrl, newPrompt, newHistory, galleryId || null);
    } catch (e) {
      estatus.textContent = '✗ ' + e.message;
      estatus.className = 'edit-status error';
      ebtn.disabled = false;
    }
  };
  ebtn.onclick = runEdit;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runEdit(); } });
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
    statusEl.textContent = res.credits != null ? `✓ Vidéo générée. (−${res.credits} crédits)` : '✓ Vidéo générée.';
    showVideoResult(resultEl, res.resultUrl, prompt);
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '■ ' : '✗ ') + e.message;
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
  saveBtn.textContent = 'Enregistrer dans la galerie';
  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Téléchargement…';
    try {
      await window.api.galleryAdd({ type: 'video', url, prompt, companyId: activeCompanyId });
      saveBtn.textContent = '✓ Ajouté à la galerie';
    } catch (e) {
      saveBtn.textContent = '✗ ' + e.message;
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
function textLines(l, g) {
  g = g || ctx;
  g.font = `${l.bold ? 'bold ' : ''}${l.size}px ${l.font}`;
  const out = [];
  for (const raw of String(l.text).split('\n')) {
    if (!l.maxW) { out.push(raw); continue; }
    let line = '';
    for (const word of raw.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (g.measureText(t).width > l.maxW && line) { out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

// Couleur hex normalisée + conversion en rgba (transparences de marque).
function hexFull(h) {
  h = String(h || '#7c3aed').replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return '#' + h.slice(0, 6);
}
function hexToRgba(h, a) {
  const x = hexFull(h).slice(1);
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

// Dessine un calque sur n'importe quel contexte canvas (application du cadre de marque).
function drawLayerOnto(g, l) {
  if (l.type === 'rect') {
    g.save();
    if (l.glow) { g.shadowColor = l.glow; g.shadowBlur = Math.max(8, (l.h || 10) * 2.2); }
    g.fillStyle = l.color;
    g.beginPath(); g.roundRect(l.x, l.y, l.w, l.h, l.r || 0); g.fill();
    if (l.glow) { g.fill(); } // double passe -> halo néon plus marqué
    g.restore();
  } else if (l.type === 'grad') {
    // Fondu dégradé : transparent -> couleur (vers le bas par défaut, 'up' = vers le haut)
    const gr = g.createLinearGradient(0, l.y, 0, l.y + l.h);
    const a = l.alpha != null ? l.alpha : 0.85;
    gr.addColorStop(0, hexToRgba(l.color, l.dir === 'up' ? a : 0));
    gr.addColorStop(1, hexToRgba(l.color, l.dir === 'up' ? 0 : a));
    g.save(); g.fillStyle = gr; g.fillRect(l.x, l.y, l.w, l.h); g.restore();
  } else if (l.type === 'icon') {
    drawIconShape(g, l.name, l.x, l.y, l.size, l.color);
  } else if (l.type === 'image' && l.img) {
    g.drawImage(l.img, l.x, l.y, l.w, l.h);
  } else if (l.type === 'text') {
    const lines = textLines(l, g);
    const lh = l.size * 1.18;
    g.save();
    g.font = `${l.bold ? 'bold ' : ''}${l.size}px ${l.font}`;
    g.textBaseline = 'top';
    let maxW = 0;
    for (const line of lines) maxW = Math.max(maxW, g.measureText(line).width);
    const blockW = l.align === 'center' && l.maxW ? l.maxW : maxW;
    if (l.shadow) {
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = Math.max(4, l.size / 6);
      g.shadowOffsetY = Math.max(1, l.size / 24);
    }
    g.fillStyle = l.color;
    lines.forEach((line, i) => {
      const w = g.measureText(line).width;
      const x = l.align === 'center' ? l.x + (blockW - w) / 2 : l.x;
      g.fillText(line, x, l.y + i * lh);
    });
    g.restore();
  }
}

// Tracés vectoriels officiels (viewBox 24) — qualité HD à toute taille via Path2D.
const ICON_PATHS = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  globe: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
};
const _iconPathCache = {};

// Icônes HD : tracé vectoriel officiel (Path2D) si disponible, sinon primitives de secours.
function drawIconShape(g, name, x, y, s, color) {
  const d = ICON_PATHS[name];
  if (d) {
    if (!_iconPathCache[name]) _iconPathCache[name] = new Path2D(d);
    g.save();
    g.translate(x, y);
    g.scale(s / 24, s / 24);
    g.fillStyle = color;
    g.fill(_iconPathCache[name]);
    g.restore();
    return;
  }
  drawIconShapeLegacy(g, name, x, y, s, color);
}
function drawIconShapeLegacy(g, name, x, y, s, color) {
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
    if (l.type === 'rect' || l.type === 'grad') {
      drawLayerOnto(ctx, l);
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
// ===== Cadre de marque : logo + barre réseaux, défini une fois, appliqué partout =====
// Construit les calques par défaut du cadre (logo haut-gauche + barre de contact en bas).
async function buildBrandFrameLayers(W, H, c) {
  const out = [];
  // Logo (data URL pour ne pas « tainted » le canvas à l'export)
  if (c && c.logoFile) {
    try {
      let du = await window.api.mediaDataUrl(c.logoFile);
      if (!du.startsWith('data:')) du = await window.api.fetchDataUrl(du);
      await new Promise((res) => {
        const im = new Image();
        im.onload = () => {
          const w = W * 0.15, h = w * (im.naturalHeight / im.naturalWidth);
          out.push({ type: 'image', img: im, x: W * 0.045, y: W * 0.04, w, h });
          res();
        };
        im.onerror = res;
        im.src = du;
      });
    } catch (_) {}
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
    out.push({ type: 'rect', x: barX, y: barY, w: barW, h: barH, r: barH / 2, color: 'rgba(12,9,20,0.66)' });
    out.push(...contactRowLayers(items, (W - total) / 2, barY + pad, s, fs, gap, itemGap, '#ffffff', widths));
  }
  return out;
}

// ===== 6 modèles de cadres tendance, générés avec les infos de l'entreprise =====
// Logo de l'entreprise en Image (data URL, mise en cache).
async function getLogoImage(c) {
  if (!c || !c.logoFile) return null;
  if (c._logoImg) return c._logoImg;
  try {
    let du = await window.api.mediaDataUrl(c.logoFile);
    if (!du.startsWith('data:')) du = await window.api.fetchDataUrl(du);
    const im = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = du;
    });
    c._logoImg = im;
    return im;
  } catch (_) { return null; }
}
// Mesure une rangée de contacts (icône + texte) pour la centrer.
function measureContactRow(items, s, fs, gap, itemGap, font) {
  ctx.font = `${fs}px ${font || 'Poppins'}`;
  const widths = items.map((it) => s + gap + ctx.measureText(it.text).width);
  return { widths, total: widths.reduce((a, b) => a + b, 0) + itemGap * (items.length - 1) };
}
// Groupes de calques : déplacer un membre déplace tout le groupe (icône + son texte).
let _gidSeq = 0;
function newGid() { return 'g' + (++_gidSeq) + '_' + Math.random().toString(36).slice(2, 6); }
function contactRowLayers(items, startX, y, s, fs, gap, itemGap, color, widths) {
  const out = [];
  let x = startX;
  for (let i = 0; i < items.length; i++) {
    const gid = newGid(); // l'icône et son texte bougent ensemble
    out.push({ type: 'icon', name: items[i].icon, x, y, size: s, color, gid });
    out.push({ type: 'text', text: items[i].text, x: x + s + gap, y: y + Math.round(s * 0.1), size: fs, color, font: 'Poppins', bold: false, gid });
    x += widths[i] + itemGap;
  }
  return out;
}
async function logoLayer(c, x, y, w) {
  const im = await getLogoImage(c);
  if (!im) return [];
  return [{ type: 'image', img: im, x, y, w, h: w * (im.naturalHeight / im.naturalWidth) }];
}

const FRAME_TEMPLATES = [
  {
    id: 'brandbar', name: 'Barre translucide', desc: 'Bandeau pleine largeur teinté de ta charte + liseré',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c);
      const s = Math.round(W * 0.03), fs = Math.round(s * 0.8), gap = Math.round(W * 0.01), itemGap = Math.round(W * 0.032), pad = Math.round(W * 0.022);
      const barH = s + pad * 2;
      const line = Math.max(2, Math.round(W * 0.004));
      out.push({ type: 'rect', x: 0, y: H - barH, w: W, h: barH, r: 0, color: hexToRgba(brand, 0.42) });
      out.push({ type: 'rect', x: 0, y: H - barH - line, w: W, h: line, r: 0, color: hexToRgba(brand, 0.95) });
      if (items.length) {
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        out.push(...contactRowLayers(items, (W - total) / 2, H - barH + pad, s, fs, gap, itemGap, '#ffffff', widths));
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.14)));
      return out;
    },
  },
  {
    id: 'fade', name: 'Fondu dégradé', desc: "Bas de l'image fondu au noir, style Instagram",
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c);
      out.push({ type: 'grad', x: 0, y: H - H * 0.2, w: W, h: H * 0.2, color: '#0d0a14', alpha: 0.85 });
      const s = Math.round(W * 0.03), fs = Math.round(s * 0.8), gap = Math.round(W * 0.01), itemGap = Math.round(W * 0.032);
      if (items.length) {
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        const y = H - s - W * 0.035;
        out.push({ type: 'rect', x: (W - W * 0.12) / 2, y: y - W * 0.022, w: W * 0.12, h: Math.max(2, W * 0.0045), r: W * 0.002, color: hexToRgba(brand, 0.95) });
        out.push(...contactRowLayers(items, (W - total) / 2, y, s, fs, gap, itemGap, '#ffffff', widths));
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.14)));
      return out;
    },
  },
  {
    id: 'chips', name: 'Pastilles de verre', desc: 'Chaque contact dans sa pastille glass',
    build: async (W, H, c) => {
      const out = [];
      const items = contactItems(c).slice(0, 4);
      const s = Math.round(W * 0.027), fs = Math.round(s * 0.82), gap = Math.round(W * 0.009), pad = Math.round(W * 0.016), chipGap = Math.round(W * 0.014);
      ctx.font = fs + 'px Poppins';
      const chipWs = items.map((it) => s + gap + ctx.measureText(it.text).width + pad * 2);
      const total = chipWs.reduce((a, b) => a + b, 0) + chipGap * Math.max(0, items.length - 1);
      const chipH = s + pad * 1.4;
      let x = (W - total) / 2;
      const y = H - chipH - W * 0.032;
      for (let i = 0; i < items.length; i++) {
        const gid = newGid(); // la pastille entière (fond + icône + texte) bouge ensemble
        out.push({ type: 'rect', x, y, w: chipWs[i], h: chipH, r: chipH / 2, color: 'rgba(20,16,28,0.5)', gid });
        out.push({ type: 'icon', name: items[i].icon, x: x + pad, y: y + (chipH - s) / 2, size: s, color: '#ffffff', gid });
        out.push({ type: 'text', text: items[i].text, x: x + pad + s + gap, y: y + (chipH - s) / 2 + Math.round(s * 0.08), size: fs, color: '#ffffff', font: 'Poppins', bold: false, gid });
        x += chipWs[i] + chipGap;
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.13)));
      return out;
    },
  },
  {
    id: 'neon', name: 'Ligne néon', desc: 'Barre sombre + ligne lumineuse de ta couleur',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c);
      const s = Math.round(W * 0.03), fs = Math.round(s * 0.8), gap = Math.round(W * 0.01), itemGap = Math.round(W * 0.032), pad = Math.round(W * 0.022);
      const barH = s + pad * 2;
      out.push({ type: 'rect', x: 0, y: H - barH, w: W, h: barH, r: 0, color: 'rgba(10,8,16,0.62)' });
      out.push({ type: 'rect', x: W * 0.06, y: H - barH - Math.max(2, W * 0.0045), w: W * 0.88, h: Math.max(2, W * 0.0045), r: W * 0.003, color: hexFull(brand), glow: hexFull(brand) });
      if (items.length) {
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        out.push(...contactRowLayers(items, (W - total) / 2, H - barH + pad, s, fs, gap, itemGap, '#ffffff', widths));
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.14)));
      return out;
    },
  },
  {
    id: 'dock', name: 'Dock latéral', desc: "Colonne d'icônes translucide sur le côté",
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c).slice(0, 5);
      const s = Math.round(W * 0.034), pad = Math.round(W * 0.016);
      if (items.length) {
        const dockW = s + pad * 2;
        const dockH = items.length * (s + pad) + pad;
        const dx = W - dockW - W * 0.03;
        const dy = H - dockH - W * 0.03;
        out.push({ type: 'rect', x: dx, y: dy, w: dockW, h: dockH, r: dockW / 2, color: hexToRgba(brand, 0.5) });
        items.forEach((it, i) => {
          out.push({ type: 'icon', name: it.icon, x: dx + pad, y: dy + pad + i * (s + pad), size: s, color: '#ffffff' });
        });
      }
      const site = (c && c.website) ? c.website.replace(/^https?:[/][/]/, '').replace(/[/]$/, '') : '';
      if (site) {
        out.push({ type: 'text', text: site, x: W * 0.05, y: H - W * 0.055, size: Math.round(W * 0.024), color: '#ffffff', font: 'Poppins', bold: false, shadow: true });
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.14)));
      return out;
    },
  },
  {
    id: 'glasscard', name: 'Badge verre teinté', desc: 'Carte glass aux couleurs de ta charte',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c).slice(0, 4);
      const s = Math.round(W * 0.026), fs = Math.round(s * 0.85), gap = Math.round(W * 0.012), pad = Math.round(W * 0.026), lh = Math.round(s * 1.65);
      ctx.font = fs + 'px Poppins';
      const maxTextW = Math.max(0, ...items.map((it) => ctx.measureText(it.text).width));
      const im = await getLogoImage(c);
      const lw = W * 0.11;
      const logoH = im ? lw * (im.naturalHeight / im.naturalWidth) : 0;
      const cardW = Math.max(s + gap + maxTextW, lw) + pad * 2;
      const cardH = pad * 2 + (im ? logoH + pad * 0.7 : 0) + items.length * lh;
      const cx = W * 0.045, cy = H - cardH - W * 0.045;
      out.push({ type: 'rect', x: cx, y: cy, w: cardW, h: cardH, r: W * 0.022, color: hexToRgba(brand, 0.4) });
      out.push({ type: 'rect', x: cx, y: cy, w: cardW, h: Math.max(2, W * 0.004), r: W * 0.002, color: hexToRgba(brand, 0.95) });
      let y = cy + pad;
      if (im) {
        out.push({ type: 'image', img: im, x: cx + pad, y, w: lw, h: logoH });
        y += logoH + pad * 0.7;
      }
      for (const it of items) {
        const gid = newGid(); // icône + texte liés
        out.push({ type: 'icon', name: it.icon, x: cx + pad, y, size: s, color: '#ffffff', gid });
        out.push({ type: 'text', text: it.text, x: cx + pad + s + gap, y: y + Math.round(s * 0.08), size: fs, color: '#ffffff', font: 'Poppins', bold: false, gid });
        y += lh;
      }
      return out;
    },
  },
  {
    id: 'topbar', name: 'Bandeau magazine', desc: 'Bande de charte en HAUT, esprit éditorial',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c);
      const barH = Math.round(W * 0.085);
      out.push({ type: 'rect', x: 0, y: 0, w: W, h: barH, r: 0, color: hexToRgba(brand, 0.92) });
      out.push({ type: 'rect', x: 0, y: barH, w: W, h: Math.max(2, W * 0.003), r: 0, color: 'rgba(255,255,255,0.85)' });
      const im = await getLogoImage(c);
      if (im) {
        const lh = barH * 0.62, lw = lh * (im.naturalWidth / im.naturalHeight);
        out.push({ type: 'image', img: im, x: W * 0.04, y: (barH - lh) / 2, w: lw, h: lh });
      }
      if (items.length) {
        const s = Math.round(W * 0.026), fs = Math.round(s * 0.8), gap = Math.round(W * 0.009), itemGap = Math.round(W * 0.026);
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        out.push(...contactRowLayers(items, (W - total) / 2, H - s - W * 0.03, s, fs, gap, itemGap, '#ffffff', widths));
      }
      return out;
    },
  },
  {
    id: 'cinema', name: 'Cinéma', desc: 'Double fondu haut + bas, ambiance film',
    build: async (W, H, c) => {
      const out = [];
      const items = contactItems(c);
      out.push({ type: 'grad', x: 0, y: 0, w: W, h: H * 0.14, color: '#0d0a14', alpha: 0.8, dir: 'up' });
      out.push({ type: 'grad', x: 0, y: H - H * 0.18, w: W, h: H * 0.18, color: '#0d0a14', alpha: 0.85 });
      if (items.length) {
        const s = Math.round(W * 0.028), fs = Math.round(s * 0.8), gap = Math.round(W * 0.009), itemGap = Math.round(W * 0.03);
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        out.push(...contactRowLayers(items, (W - total) / 2, H - s - W * 0.035, s, fs, gap, itemGap, '#ffffff', widths));
      }
      const im = await getLogoImage(c);
      if (im) {
        const lw = W * 0.13, lh = lw * (im.naturalHeight / im.naturalWidth);
        out.push({ type: 'image', img: im, x: (W - lw) / 2, y: W * 0.03, w: lw, h: lh });
      }
      return out;
    },
  },
  {
    id: 'split', name: 'Split bicolore', desc: 'Bloc logo couleur charte + bloc contacts sombre',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c).slice(0, 4);
      const barH = Math.round(W * 0.095);
      const leftW = Math.round(W * 0.3);
      out.push({ type: 'rect', x: 0, y: H - barH, w: leftW, h: barH, r: 0, color: hexFull(brand) });
      out.push({ type: 'rect', x: leftW, y: H - barH, w: W - leftW, h: barH, r: 0, color: 'rgba(12,9,20,0.78)' });
      const im = await getLogoImage(c);
      if (im) {
        const lh = barH * 0.58, lw = lh * (im.naturalWidth / im.naturalHeight);
        out.push({ type: 'image', img: im, x: (leftW - lw) / 2, y: H - barH + (barH - lh) / 2, w: lw, h: lh });
      }
      if (items.length) {
        const s = Math.round(W * 0.026), fs = Math.round(s * 0.78), gap = Math.round(W * 0.008), itemGap = Math.round(W * 0.024);
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        out.push(...contactRowLayers(items, leftW + (W - leftW - total) / 2, H - barH + (barH - s) / 2, s, fs, gap, itemGap, '#ffffff', widths));
      }
      return out;
    },
  },
  {
    id: 'neonframe', name: 'Contour néon', desc: 'Bordure lumineuse complète, parfait événementiel',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const inset = Math.round(W * 0.025), th = Math.max(2, Math.round(W * 0.005));
      const col = hexFull(brand);
      out.push({ type: 'rect', x: inset, y: inset, w: W - inset * 2, h: th, r: th, color: col, glow: col });
      out.push({ type: 'rect', x: inset, y: H - inset - th, w: W - inset * 2, h: th, r: th, color: col, glow: col });
      out.push({ type: 'rect', x: inset, y: inset, w: th, h: H - inset * 2, r: th, color: col, glow: col });
      out.push({ type: 'rect', x: W - inset - th, y: inset, w: th, h: H - inset * 2, r: th, color: col, glow: col });
      const items = contactItems(c).slice(0, 3);
      if (items.length) {
        const s = Math.round(W * 0.026), fs = Math.round(s * 0.8), gap = Math.round(W * 0.009), itemGap = Math.round(W * 0.028), pad = Math.round(W * 0.015);
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        const bh = s + pad * 2;
        const by = H - inset - th - bh - W * 0.015;
        out.push({ type: 'rect', x: (W - total) / 2 - pad * 1.6, y: by, w: total + pad * 3.2, h: bh, r: bh / 2, color: 'rgba(12,9,20,0.6)' });
        out.push(...contactRowLayers(items, (W - total) / 2, by + pad, s, fs, gap, itemGap, '#ffffff', widths));
      }
      out.push(...(await logoLayer(c, W * 0.055, W * 0.05, W * 0.13)));
      return out;
    },
  },
  {
    id: 'sticker', name: 'Sticker rond', desc: 'Pastille circulaire glass avec ton logo',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const D = Math.round(W * 0.21);
      const sx = W - D - W * 0.04, sy = H - D - W * 0.04;
      out.push({ type: 'rect', x: sx, y: sy, w: D, h: D, r: D / 2, color: 'rgba(255,255,255,0.88)' });
      out.push({ type: 'rect', x: sx, y: sy, w: D, h: D, r: D / 2, color: hexToRgba(brand, 0.14) });
      const im = await getLogoImage(c);
      if (im) {
        const lw = D * 0.62, lh = lw * (im.naturalHeight / im.naturalWidth);
        out.push({ type: 'image', img: im, x: sx + (D - lw) / 2, y: sy + (D - Math.min(lh, D * 0.62)) / 2, w: lw, h: lh });
      }
      const site = (c && c.website) ? c.website.replace(/^https?:[/][/]/, '').replace(/[/]$/, '') : '';
      if (site) {
        out.push({ type: 'text', text: site, x: W * 0.05, y: H - W * 0.055, size: Math.round(W * 0.024), color: '#ffffff', font: 'Poppins', bold: false, shadow: true });
      }
      return out;
    },
  },
  {
    id: 'floatbar', name: 'Barre flottante', desc: 'Pastille arrondie teintée charte, détachée du bord',
    build: async (W, H, c) => {
      const out = [];
      const brand = (c && c.colors && c.colors[0]) || '#7c3aed';
      const items = contactItems(c);
      const s = Math.round(W * 0.029), fs = Math.round(s * 0.8), gap = Math.round(W * 0.01), itemGap = Math.round(W * 0.03), pad = Math.round(W * 0.022);
      if (items.length) {
        const { widths, total } = measureContactRow(items, s, fs, gap, itemGap);
        const barH = s + pad * 2;
        const barW = Math.min(W * 0.92, total + pad * 3.4);
        const bx = (W - barW) / 2, by = H - barH - W * 0.04;
        out.push({ type: 'rect', x: bx, y: by, w: barW, h: barH, r: barH / 2, color: hexToRgba(brand, 0.55) });
        out.push({ type: 'rect', x: bx, y: by, w: barW, h: Math.max(2, W * 0.0035), r: W * 0.002, color: 'rgba(255,255,255,0.8)' });
        out.push(...contactRowLayers(items, (W - total) / 2, by + pad, s, fs, gap, itemGap, '#ffffff', widths));
      }
      out.push(...(await logoLayer(c, W * 0.045, W * 0.04, W * 0.14)));
      return out;
    },
  },
];

// Fond d'exemple (dégradé neutre) pour visualiser les cadres.
function drawSampleBg(g, W, H) {
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#cfc4ec');
  grad.addColorStop(1, '#7e6ab8');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.35)';
  g.font = `600 ${Math.round(W * 0.045)}px Inter`;
  g.textAlign = 'center';
  g.fillText("Exemple d'affiche", W / 2, H / 2);
  g.textAlign = 'left';
}

// Galerie des 6 modèles : aperçus réels générés avec les infos de l'entreprise.
async function showFrameTemplates() {
  const c = activeCompany();
  if (!c) return alert("Choisis d'abord une entreprise active (menu en haut à gauche).");
  const modal = document.getElementById('framesModal');
  const grid = document.getElementById('framesGrid');
  modal.classList.remove('hidden');
  grid.innerHTML = '<p class="empty"><span class="spinner"></span>Génération des aperçus…</p>';
  try { await document.fonts.ready; } catch (_) {}
  grid.innerHTML = '';
  const PW = 480, PH = 600;
  for (const t of FRAME_TEMPLATES) {
    try {
      const cv = document.createElement('canvas');
      cv.width = PW; cv.height = PH;
      const g = cv.getContext('2d');
      drawSampleBg(g, PW, PH);
      const ls = await t.build(PW, PH, c);
      for (const l of ls) drawLayerOnto(g, l);
      const card = document.createElement('div');
      card.className = 'design-card';
      card.innerHTML = `<img src="${cv.toDataURL('image/jpeg', 0.85)}" alt="${esc(t.name)}" /><div class="dc-meta"><span class="dc-name">${esc(t.name)}</span></div><div class="dc-desc">${esc(t.desc)}</div>`;
      card.onclick = () => applyFrameTemplate(t).catch((e) => alert('Échec : ' + e.message));
      grid.appendChild(card);
    } catch (_) {}
  }
}
// Charge un modèle dans l'éditeur (sur fond d'exemple) pour personnalisation.
async function applyFrameTemplate(t) {
  const c = activeCompany();
  document.getElementById('framesModal').classList.add('hidden');
  const SW = 1080, SH = 1350;
  const cv = document.createElement('canvas');
  cv.width = SW; cv.height = SH;
  drawSampleBg(cv.getContext('2d'), SW, SH);
  await new Promise((res) => { const im = new Image(); im.onload = () => { setBgImage(im); res(); }; im.src = cv.toDataURL(); });
  bgUrl = null;
  currentDesign.id = null;
  layers = await t.build(canvas.width, canvas.height, c);
  selected = null;
  render();
  document.querySelector('.nav-btn[data-view="editor"]').click();
  designStatus(`Modèle « ${t.name} » chargé — ajuste les éléments puis « Enregistrer le cadre ».`);
}
document.getElementById('frameTemplatesBtn').onclick = showFrameTemplates;
document.getElementById('framesClose').onclick = () => document.getElementById('framesModal').classList.add('hidden');

// Coordonnées relatives (fractions de largeur/hauteur) -> le cadre s'adapte à tout format.
function normalizeFrameLayers(ls, W, H) {
  return ls.map((l) => {
    const base = { type: l.type, nx: l.x / W, ny: l.y / H, gid: l.gid || null };
    if (l.type === 'rect') return { ...base, nw: l.w / W, nh: l.h / H, nr: (l.r || 0) / W, color: l.color, glow: l.glow || null };
    if (l.type === 'grad') return { ...base, nw: l.w / W, nh: l.h / H, color: l.color, alpha: l.alpha != null ? l.alpha : 0.85, dir: l.dir || null };
    if (l.type === 'icon') return { ...base, ns: l.size / W, name: l.name, color: l.color };
    if (l.type === 'image') return { ...base, nw: l.w / W, nh: l.h / H, src: l.img ? l.img.src : null };
    return { ...base, ns: l.size / W, text: l.text, color: l.color, font: l.font, bold: !!l.bold, shadow: !!l.shadow, align: l.align || null, nmaxw: l.maxW ? l.maxW / W : null };
  });
}
async function denormalizeFrameLayers(ls, W, H) {
  const out = [];
  for (const l of ls || []) {
    const gid = l.gid || undefined; // groupe préservé (icône + texte liés)
    if (l.type === 'rect') out.push({ type: 'rect', x: l.nx * W, y: l.ny * H, w: l.nw * W, h: l.nh * H, r: (l.nr || 0) * W, color: l.color, glow: l.glow || undefined, gid });
    else if (l.type === 'grad') out.push({ type: 'grad', x: l.nx * W, y: l.ny * H, w: l.nw * W, h: l.nh * H, color: l.color, alpha: l.alpha, dir: l.dir || undefined, gid });
    else if (l.type === 'icon') out.push({ type: 'icon', x: l.nx * W, y: l.ny * H, size: l.ns * W, name: l.name, color: l.color, gid });
    else if (l.type === 'image' && l.src) {
      await new Promise((res) => {
        const im = new Image();
        im.onload = () => { out.push({ type: 'image', x: l.nx * W, y: l.ny * H, w: l.nw * W, h: l.nh * H, img: im, gid }); res(); };
        im.onerror = res;
        im.src = l.src;
      });
    } else if (l.type === 'text') {
      out.push({ type: 'text', x: l.nx * W, y: l.ny * H, size: Math.round(l.ns * W), text: l.text, color: l.color, font: l.font, bold: l.bold, shadow: l.shadow, align: l.align || undefined, maxW: l.nmaxw ? l.nmaxw * W : undefined, gid });
    }
  }
  return out;
}

// Applique le cadre de l'entreprise active sur une image -> nouvelle URL hébergée.
async function applyBrandFrame(url) {
  const c = activeCompany();
  if (!c) throw new Error('Aucune entreprise active.');
  try { await document.fonts.ready; } catch (_) {}
  const du = url.startsWith('data:') ? url : await window.api.fetchDataUrl(url);
  const img = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("Impossible de charger l'image."));
    im.src = du;
  });
  const W = img.naturalWidth, H = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0);
  const ls = c.frame && c.frame.length
    ? await denormalizeFrameLayers(c.frame, W, H)
    : await buildBrandFrameLayers(W, H, c);
  if (!ls.length) throw new Error('Cadre vide — ajoute un logo ou des coordonnées à ton entreprise.');
  for (const l of ls) drawLayerOnto(g, l);
  const dataUrl = cv.toDataURL('image/jpeg', 0.93);
  const up = await window.api.uploadFile({ base64DataUrl: dataUrl, fileName: 'affiche-cadre.jpg' });
  return up.url;
}

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

  // Cadre de marque : le cadre personnalisé de l'entreprise s'il existe, sinon le cadre par défaut
  layers.push(...(c && c.frame && c.frame.length ? await denormalizeFrameLayers(c.frame, W, H) : await buildBrandFrameLayers(W, H, c)));

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
  designStatus('Enregistrement…');
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
    designStatus('✓ Affiche enregistrée — rouvre-la quand tu veux via Ouvrir.');
  } catch (e) {
    designStatus('✗ ' + e.message);
    if (!silent) alert('Échec de l\'enregistrement : ' + e.message);
  } finally {
    btn.disabled = false;
  }
}
async function openDesign(d) {
  document.getElementById('designsModal').classList.add('hidden');
  designStatus('Ouverture…');
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
  designStatus('✓ Affiche ouverte — tous les calques sont modifiables.');
}
async function showDesignsModal() {
  const grid = document.getElementById('designsGrid');
  document.getElementById('designsModal').classList.remove('hidden');
  grid.innerHTML = '<p class="empty"><span class="spinner"></span>Chargement…</p>';
  try {
    const designs = await window.api.designList();
    if (!designs.length) {
      grid.innerHTML = '<p class="empty">Aucune affiche enregistrée. Crée une « Affiche Pro » dans le travail guidé, ou compose-en une ici puis « Enregistrer ».</p>';
      return;
    }
    grid.innerHTML = '';
    for (const d of designs) {
      const card = document.createElement('div');
      card.className = 'design-card';
      card.innerHTML =
        `<img src="${esc(d.preview_url || d.bg_url)}" loading="lazy" alt="${esc(d.name)}" />` +
        `<div class="dc-meta"><span class="dc-name">${esc(d.name)}</span><button class="dc-del" title="Supprimer">✕</button></div>`;
      card.onclick = (e) => { if (!e.target.classList.contains('dc-del')) openDesign(d).catch((err) => designStatus('✗ ' + err.message)); };
      card.querySelector('.dc-del').onclick = async (e) => {
        e.stopPropagation();
        if (!confirm(`Supprimer « ${d.name} » ?`)) return;
        try { await window.api.designDelete(d.id); card.remove(); } catch (err) { alert('Échec : ' + err.message); }
      };
      grid.appendChild(card);
    }
  } catch (e) {
    grid.innerHTML = `<p class="empty">✗ ${esc(e.message)}</p>`;
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

// ===== Édition du cadre de marque dans l'éditeur =====
// Ouvre le cadre de l'entreprise active sur un fond d'exemple : tout est déplaçable/modifiable.
async function editBrandFrame() {
  const c = activeCompany();
  if (!c) return alert("Choisis d'abord une entreprise active (menu en haut à gauche).");
  try { await document.fonts.ready; } catch (_) {}
  const SW = 1080, SH = 1350;
  const cv = document.createElement('canvas');
  cv.width = SW; cv.height = SH;
  drawSampleBg(cv.getContext('2d'), SW, SH);
  await new Promise((res) => { const im = new Image(); im.onload = () => { setBgImage(im); res(); }; im.src = cv.toDataURL(); });
  bgUrl = null; currentDesign.id = null;
  layers = c.frame && c.frame.length
    ? await denormalizeFrameLayers(c.frame, canvas.width, canvas.height)
    : await buildBrandFrameLayers(canvas.width, canvas.height, c);
  selected = null;
  render();
  document.querySelector('.nav-btn[data-view="editor"]').click();
  designStatus(`Cadre de « ${c.name} » — déplace/modifie les éléments puis « Enregistrer le cadre ».`);
}
document.getElementById('frameEditBtn').onclick = () => editBrandFrame();
// Sauvegarde le cadre (coordonnées relatives -> s'adapte à tous les formats d'affiche).
document.getElementById('frameSaveBtn').onclick = async () => {
  const c = activeCompany();
  if (!c) return alert("Choisis d'abord une entreprise active.");
  if (!layers.length) return alert('Le cadre est vide — ajoute au moins un élément (logo, texte, icône).');
  const btn = document.getElementById('frameSaveBtn');
  btn.disabled = true;
  try {
    const frame = normalizeFrameLayers(layers, canvas.width, canvas.height);
    await window.api.frameSave(c.id, frame);
    c.frame = frame; // met à jour le cache local
    renderGuidedCards(); // la carte « Crée ton cadre » devient « Charte & cadre »
    designStatus(`✓ Cadre de « ${c.name} » enregistré — il s'appliquera sur tes prochaines affiches.`);
  } catch (e) {
    alert("Échec de l'enregistrement du cadre : " + e.message);
  } finally {
    btn.disabled = false;
  }
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
  if (hit) {
    // Membres du même groupe (icône + texte) : ils suivront le déplacement.
    const mates = hit.gid ? layers.filter((l) => l !== hit && l.gid === hit.gid) : [];
    drag = { dx: pos.x - hit.x, dy: pos.y - hit.y, group: mates.map((l) => ({ l, ox: l.x - hit.x, oy: l.y - hit.y })) };
  }
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
  // Le groupe suit (icône + texte restent alignés)
  for (const m of drag.group || []) {
    m.l.x = selected.x + m.ox;
    m.l.y = selected.y + m.oy;
  }
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
        <span class="badge">${item.type === 'video' ? 'Vidéo' : 'Image'}</span>${(item.history || []).length ? ` <span class="badge">${item.history.length + 1} versions</span>` : ''}
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
        aiBtn.textContent = 'Modifier';
        aiBtn.onclick = () => {
          document.querySelector('.nav-btn[data-view="image"]').click();
          const resultEl = document.getElementById('imgResult');
          showImageResult(resultEl, item.url, item.prompt, item.history || [], item.id);
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        actions.appendChild(aiBtn);
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
    id: 'poster-pro', icon: 'layers', title: 'Affiche Pro (texte modifiable)',
    desc: "SnapFiche crée le visuel SANS texte — titre, description, logo et contacts sont posés en calques 100 % modifiables.",
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
    kind: 'image', model: 'nano-banana-pro', params: { aspect_ratio: '1:1' },
    qualityChoices: [
      { v: '1k', label: '1K — recommandé réseaux (~24 cr)', model: 'nano-banana-pro', resolution: '1K' },
      { v: '2k', label: '2K — qualité max (~30 cr)', model: 'nano-banana-pro', resolution: '2K' },
    ],
    defaultQuality: '1k',
    ask: [{ key: 'subject', label: 'Quel message / sujet du post ?', ph: 'Ex : promotion -20% sur toute la boutique ce week-end' }],
    build: (a) => `Visuel carré pour les réseaux sociaux, moderne et accrocheur. Message : ${a.subject}. Composition claire, texte court bien lisible, couleurs vives, optimisé pour le mobile.`,
  },
  {
    id: 'story', icon: 'smartphone', title: 'Story / Reel',
    desc: 'Visuel vertical plein écran (Stories, TikTok, Shorts).',
    kind: 'image', model: 'flux-kontext-max', params: { aspect_ratio: '9:16' },
    qualityChoices: [
      { v: 'pro', label: 'Snap Pro — rapide (~12 cr)', model: 'flux-kontext-max' },
      { v: 'max1k', label: 'Snap Max — 1K (~24 cr)', model: 'nano-banana-pro', resolution: '1K' },
      { v: 'max2k', label: 'Snap Max — 2K, qualité max (~30 cr)', model: 'nano-banana-pro', resolution: '2K' },
    ],
    defaultQuality: 'max1k',
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
      `À partir des photos de référence fournies : ${a.subject}. ` +
      `COHÉRENCE OBLIGATOIRE selon la nature de l'objet fourni : un VÊTEMENT doit être PORTÉ par une personne adaptée (une robe → une femme, un costume → un homme), des chaussures aux pieds, une montre au poignet ; un PRODUIT/OBJET doit être utilisé ou présenté dans son contexte naturel (tenu, posé en situation). JAMAIS l'objet qui flotte seul. ` +
      `Reproduis le produit/vêtement À L'IDENTIQUE (même forme, coupe, tissu, couleurs, motifs, étiquette) et, si une personne est fournie, conserve EXACTEMENT son visage et sa morphologie. ` +
      `Rendu photoréaliste, lumière, ombres et perspective cohérentes.`,
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
// Cocher « garder le même style » fige la direction visuelle -> idées verrouillées + styles gardés désélectionnés.
document.getElementById('guidedKeepStyle').addEventListener('change', () => {
  if (document.getElementById('guidedKeepStyle').checked && selectedStyleRef) {
    selectedStyleRef = null;
    renderStyleLibrary();
  }
  updateIdeasAccess();
});
let selectedStyleRef = null; // style gardé sélectionné dans la bibliothèque {id, image_url, directive, name}
let _stylesCache = null;     // liste des styles gardés (rafraîchie à l'ouverture du panneau)

// « Garder le même style » ou style gardé sélectionné -> les idées visuelles n'ont plus de sens
// (la direction visuelle vient de l'image de référence) : on verrouille le bouton.
function updateIdeasAccess() {
  const btn = document.getElementById('aiIdeas');
  if (!btn) return;
  const keep = document.getElementById('guidedKeepStyle');
  const locked = (keep && keep.checked) || !!selectedStyleRef;
  btn.disabled = locked;
  btn.title = locked ? 'Style imposé par l\'image de référence — décoche « Garder le même style » ou désélectionne le style pour proposer des idées.' : '';
}

// Bibliothèque des styles gardés : vignettes cliquables (sélection unique) + suppression.
async function renderStyleLibrary(force) {
  const strip = document.getElementById('styleLibStrip');
  if (!strip) return;
  try {
    if (force || !_stylesCache) _stylesCache = await window.api.styleList();
  } catch (_) { _stylesCache = []; }
  strip.innerHTML = '';
  if (!_stylesCache.length) {
    strip.innerHTML = '<span class="hint">Aucun style gardé — après une création réussie, clique « Garder ce style ».</span>';
    return;
  }
  for (const s of _stylesCache) {
    const d = document.createElement('div');
    d.className = 'style-thumb' + (selectedStyleRef && selectedStyleRef.id === s.id ? ' selected' : '');
    d.title = s.name + (s.directive ? ' — ' + s.directive.slice(0, 80) : '');
    d.innerHTML = `<img src="${esc(s.image_url)}" loading="lazy" alt="${esc(s.name)}" /><span class="st-name">${esc(s.name)}</span><button type="button" class="st-del" aria-label="Supprimer">✕</button>`;
    d.onclick = (e) => {
      if (e.target.classList.contains('st-del')) return;
      if (selectedStyleRef && selectedStyleRef.id === s.id) {
        selectedStyleRef = null; // re-clic = désélection
      } else {
        selectedStyleRef = s;
        const keep = document.getElementById('guidedKeepStyle');
        if (keep) keep.checked = false; // exclusif avec « dernière création »
      }
      renderStyleLibrary();
      updateIdeasAccess();
    };
    d.querySelector('.st-del').onclick = async (e) => {
      e.stopPropagation();
      if (!confirm(`Supprimer le style « ${s.name} » ?`)) return;
      try {
        await window.api.styleDelete(s.id);
        _stylesCache = _stylesCache.filter((x) => x.id !== s.id);
        if (selectedStyleRef && selectedStyleRef.id === s.id) selectedStyleRef = null;
        renderStyleLibrary();
        updateIdeasAccess();
      } catch (err) { alert('Échec : ' + err.message); }
    };
    strip.appendChild(d);
  }
}

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
  if (r.qualityChoices) return r.qualityChoices.map((c) => ({ v: c.v, label: c.label }));
  if (r.kind === 'video') {
    return [{ v: '720p', label: 'Standard (720p)' }, { v: '1080p', label: 'Élevée (1080p HD)' }];
  }
  const m = findModel('image', r.model);
  if (m.res) {
    return [{ v: '1K', label: 'Standard (1K)' }, { v: '2K', label: 'Élevée (2K)' }];
  }
  // Modèle image sans réglage de résolution : on propose de monter en gamme via Nano Banana Pro.
  return [{ v: 'std', label: 'Standard' }, { v: '2K', label: 'Élevée (HD)' }];
}
function defaultQuality(r) {
  if (r.qualityChoices) return r.defaultQuality || r.qualityChoices[0].v;
  if (r.kind === 'video') return r.params.resolution || '720p';
  const m = findModel('image', r.model);
  return m.res ? r.params.resolution || '1K' : 'std';
}
// Recette « effective » après application du choix de qualité (peut changer le modèle).
function effectiveRecipe(r, quality) {
  const eff = { kind: r.kind, model: r.model, params: { ...r.params } };
  // Choix de qualité personnalisés par recette (modèle + résolution explicites).
  if (r.qualityChoices) {
    const c = r.qualityChoices.find((x) => x.v === quality) || r.qualityChoices[0];
    eff.model = c.model;
    if (c.resolution) eff.params.resolution = c.resolution; else delete eff.params.resolution;
    return eff;
  }
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

// Résumé sans jargon technique : format, qualité, durée et coût (pas de nom de modèle).
function recipeSummary(eff) {
  if (eff.kind === 'image') {
    const m = findModel('image', eff.model);
    const c = m.creditsByRes ? m.creditsByRes[eff.params.resolution] || 0 : m.credits || 0;
    return `Format ${eff.params.aspect_ratio}${eff.params.resolution ? ' · Qualité ' + eff.params.resolution : ''} · ~${c} crédits`;
  }
  const m = findModel('video', eff.model);
  const cps = m.creditsPerSecByRes ? m.creditsPerSecByRes[eff.params.resolution] || 0 : m.creditsPerSec || 0;
  const c = Math.round(cps * eff.params.duration);
  return `Format ${eff.params.aspect_ratio} · ${eff.params.resolution} · ${eff.params.duration}s · ~${c} crédits`;
}
function updateGuidedSummary() {
  if (!guidedRecipe) return;
  const quality = document.getElementById('guidedQuality').value;
  const eff = effectiveRecipe(guidedRecipe, quality);
  document.getElementById('guidedSummary').innerHTML = `<b>${recipeSummary(eff)}</b>`;
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

// Carte « cadre de marque » : 1re étape tant qu'il n'existe pas, puis carte « Charte & cadre ».
function buildFrameCard(hasFrame) {
  const card = document.createElement('div');
  card.className = 'guided-card frame-card' + (hasFrame ? '' : ' frame-card-first');
  card.innerHTML = hasFrame
    ? `<div class="gicon">${svgIcon('frame', 'ico-card')}</div><h4>Charte & cadre</h4><p>Modifier ton cadre de marque (logo + réseaux) ou choisir un autre modèle.</p><span class="gtag">Cadre enregistré ✓</span>`
    : `<div class="gicon">${svgIcon('frame', 'ico-card')}</div><h4>1 · Crée ton cadre de marque</h4><p>Logo + réseaux en bordure de tes affiches — à faire une fois, appliqué ensuite automatiquement. 6 modèles tendance générés avec tes infos.</p><span class="gtag">Commence par ici</span>`;
  card.onclick = () => { if (hasFrame) editBrandFrame(); else showFrameTemplates(); };
  return card;
}

// Palette néon froide (violet → magenta → bleu → cyan) pour rester dans la charte.
const CARD_HUES = [262, 286, 312, 232, 200, 274, 300, 218];
function renderGuidedCards() {
  const grid = document.getElementById('guidedCards');
  grid.innerHTML = '';
  RECIPES.filter((r) => {
    if (r.proLayers) return false; // édition manuelle retirée
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

// Les 4 dernières créations en tuiles « metro » (1 grande + 3 petites) sur l'accueil guidé.
// Créations de la session en cours : ajoutées une par une à chaque génération,
// réinitialisées au changement d'objectif (cadre).
let sessionCreations = []; // { url, prompt }
function resetSessionStrip() { sessionCreations = []; renderSessionStrip(); }
function addSessionCreation(url, prompt) { sessionCreations.unshift({ url, prompt: prompt || '' }); renderSessionStrip(); }
function renderSessionStrip() {
  const sec = document.getElementById('sessionSection');
  const metro = document.getElementById('sessionMetro');
  if (!sec || !metro) return;
  if (!sessionCreations.length) { sec.classList.add('hidden'); metro.innerHTML = ''; return; }
  metro.innerHTML = '';
  sessionCreations.slice(0, 6).forEach((it, i) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'metro-cell' + (i === 0 ? ' metro-big' : '');
    cell.innerHTML = `<img src="${esc(it.url)}" loading="lazy" alt="Création" /><span class="metro-open">Rouvrir</span>`;
    cell.onclick = () => {
      const resultEl = document.getElementById('guidedResult');
      showImageResult(resultEl, it.url, it.prompt || '', [], undefined);
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    metro.appendChild(cell);
  });
  sec.classList.remove('hidden');
}

function openRecipe(r, opts) {
  guidedRecipe = r;
  document.getElementById('guidedCards').classList.add('hidden');
  resetSessionStrip(); // nouveau cadre -> on repart d'une session vierge
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
  // Bloc d'import des photos : en HAUT et obligatoire pour « Tenue · décor · produit ».
  const gqRef = document.getElementById('gqRef');
  const genLeft = document.querySelector('#guidedPanel .gen-left');
  const refLabel = document.getElementById('guidedRefLabel');
  const dropText = document.getElementById('guidedDropText');
  if (gqRef && genLeft) {
    if (r.needsImage) {
      refLabel.innerHTML = 'Tes photos — la personne + le produit / vêtement <span class="req">* obligatoire</span><br><small>Ex : la photo de la personne ET la photo de la robe (1 à 6 images).</small>';
      dropText.textContent = 'Importer les photos (clique ou glisse-dépose)';
      gqRef.classList.add('ref-required');
      genLeft.insertBefore(gqRef, genLeft.firstChild); // tout en haut
    } else {
      refLabel.innerHTML = 'Images de référence <small>(optionnel — style, personnage, produit… max 6)</small>';
      dropText.textContent = 'Ajouter des images';
      gqRef.classList.remove('ref-required');
      const anchor = document.getElementById('gqStyleAuto');
      if (anchor) genLeft.insertBefore(gqRef, anchor); else genLeft.appendChild(gqRef); // position normale
    }
  }
  // Affiche Pro : langue / coordonnées deviennent des calques -> réglages inutiles ici.
  // (gqLogo reste masqué en permanence : logo appliqué automatiquement, mode 'ai' par défaut.)
  ['gqLang', 'gqContact', 'gqLogoToggle'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !!r.proLayers);
  });
  // Cadre de marque : seulement pour les recettes image classiques (en Pro c'est déjà des calques).
  const gqFrame = document.getElementById('gqFrame');
  if (gqFrame) gqFrame.classList.toggle('hidden', !!r.proLayers || r.kind !== 'image');
  // Choix fait depuis la carte : « + Mon cadre » ou « L'IA gère »
  const af = document.getElementById('guidedApplyFrame');
  if (af) af.checked = opts && 'frame' in opts ? opts.frame : !!activeCompany();
  const sck = document.getElementById('guidedShowContact');
  if (sck && opts && 'frame' in opts) sck.checked = !opts.frame; // IA gère -> elle dessine aussi les contacts
  const ulg = document.getElementById('guidedUseLogo');
  if (ulg) ulg.checked = true; // logo intégré par défaut (ignoré si le cadre est appliqué : il le porte déjà)
  // Assistant en 2 temps pour TOUTES les recettes image : 1) textes, 2) idées visuelles.
  // (vidéo : un seul bouton d'idées, pas de texte rendu à l'écran)
  // Produit/vêtement (needsImage) : pas de « textes » (hors-sujet) ; bouton idées = mises en scène.
  document.getElementById('aiTexts').classList.toggle('hidden', r.kind !== 'image' || !!r.needsImage);
  document.getElementById('aiIdeas').textContent = r.needsImage ? 'Proposer des mises en scène' : (r.kind === 'image' ? '2 · Idées visuelles' : 'Proposer des idées');
  // Pour "changer tenue/décor", la référence sert à préserver l'identité (mode forcé).
  document.getElementById('guidedRefMode').classList.toggle('hidden', !!r.needsImage);
  document.getElementById('guidedStyleHint').textContent = lastStyleUrl ? '✓ style mémorisé' : '(aucune création précédente)';
  // Styles gardés : visibles pour les recettes image ; sélection remise à zéro à l'ouverture.
  const gqLib = document.getElementById('gqStyleLib');
  if (gqLib) gqLib.classList.toggle('hidden', r.kind !== 'image');
  // Propositions multiples : images seulement (la vidéo coûte trop cher pour du batch).
  const gqVar = document.getElementById('gqVariants');
  if (gqVar) { gqVar.classList.toggle('hidden', r.kind !== 'image'); const sv = document.getElementById('guidedVariants'); if (sv) sv.value = '1'; }
  selectedStyleRef = null;
  renderStyleLibrary(true);
  updateIdeasAccess();
  document.getElementById('guidedStatus').textContent = '';
  document.getElementById('guidedResult').innerHTML = '<div class="result-placeholder">Ta création apparaîtra ici</div>';
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
    const dz = document.getElementById('guidedDrop');
    const dzt = document.getElementById('guidedDropText');
    if (dz) dz.classList.toggle('filled', guidedRefs.length > 0);
    if (dzt) dzt.textContent = guidedRefs.length
      ? `${guidedRefs.length} photo(s) ajoutée(s) — clique pour en ajouter`
      : (guidedRecipe && guidedRecipe.needsImage ? 'Importer les photos (clique ou glisse-dépose)' : 'Ajouter des images');
  };
  const addFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/')).slice(0, GUIDED_MAX_REFS - guidedRefs.length);
    for (const f of files) guidedRefs.push(await readImageFile(f));
    sync();
  };
  file.addEventListener('change', async (e) => { await addFiles(e.target.files); file.value = ''; });
  clr.onclick = () => { guidedRefs.length = 0; sync(); };
  // Glisser-déposer sur la zone
  const dz = document.getElementById('guidedDrop');
  if (dz) {
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  }
  // « Mes créations » : ajoute une création passée comme image de référence.
  const gf = document.getElementById('guidedRefFromGallery');
  if (gf) gf.onclick = () => showOwnPicker(async (item) => {
    if (guidedRefs.length >= GUIDED_MAX_REFS) return alert('Maximum atteint.');
    try {
      let du = await window.api.mediaDataUrl(item.url);
      if (!du.startsWith('data:')) du = await window.api.fetchDataUrl(du);
      guidedRefs.push({ dataUrl: du, name: 'creation.png' });
      sync();
    } catch (e) { alert('Échec : ' + e.message); }
  });
})();

// Picker des créations de l'utilisateur (galerie images) -> callback(item).
async function showOwnPicker(onPick) {
  const modal = document.getElementById('ownPickModal');
  const grid = document.getElementById('ownPickGrid');
  modal.classList.remove('hidden');
  grid.innerHTML = '<p class="empty"><span class="spinner"></span>Chargement…</p>';
  try {
    const items = (await window.api.galleryList()).filter((g) => g.type === 'image');
    if (!items.length) { grid.innerHTML = '<p class="empty">Aucune création enregistrée pour le moment.</p>'; return; }
    grid.innerHTML = '';
    items.forEach((it) => {
      const card = document.createElement('div');
      card.className = 'design-card';
      card.innerHTML = `<img src="${esc(it.url)}" loading="lazy" alt="Création" />`;
      card.onclick = () => { modal.classList.add('hidden'); onPick(it); };
      grid.appendChild(card);
    });
  } catch (e) { grid.innerHTML = `<p class="empty">✗ ${esc(e.message)}</p>`; }
}
(function wireOwnPicker() {
  const b = document.getElementById('ownPickClose');
  if (b) b.onclick = () => document.getElementById('ownPickModal').classList.add('hidden');
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
  // Tendances 2026
  'neon-noir (rouge/noir, néons, flou de mouvement)', 'acid fade (dégradés prismatiques saturés, fluide psychédélique)',
  'croquis fait main authentique (anti-perfection numérique)', 'art nouveau moderne (lignes organiques + abstraction)',
  'scrapbooking (papier, autocollants, notes manuscrites)', 'typographie liquide (lettres fondues chromées)',
  'folk art (motifs artisanaux, fleurs, oiseaux)', 'maximalisme chromatique électrique',
  'mixed media scanné et surtravaillé (textures denses)', 'duotone réactif haute énergie',
  'grille technique avec timestamps et annotations', 'glass block (blocs de verre 3D)',
];
let lastIdeaTitles = [];
function pickAngles(n, sourcePool) {
  const pool = [...(sourcePool || IDEA_ANGLES)];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

// Styles ADAPTÉS au secteur d'activité : fini le vaporwave pour un cabinet dentaire.
// Chaque famille de secteurs a sa sélection de directions crédibles.
const SECTOR_ANGLE_MAP = [
  {
    match: /dent|sant|m[ée]dic|clinique|pharma|opti|kin[ée]|v[ée]t[ée]|labo|hopit|hôpit|docteur/i,
    angles: ['infographie pédagogique élégante', 'minimalisme éditorial premium', 'macro photographie ultra détaillée',
      'photographie lifestyle authentique', 'comparatif avant / après', 'coupe anatomique didactique',
      'rendu 3D doux (clay render)', 'chronologie / étapes numérotées visuelles', 'mythes vs réalités en deux colonnes',
      'illustration ligne continue minimaliste', 'naturel organique (bois, lin, végétal)', 'photo studio fond coloré uni',
      'croquis fait main authentique (anti-perfection numérique)', 'schéma technique stylisé'],
  },
  {
    match: /resto|caf[ée]|food|cuisine|p[âa]tiss|boulang|traiteur|pizz|burger|gastro|chef/i,
    angles: ['macro photographie ultra détaillée', 'golden hour chaleureuse', 'flat lay vu de dessus',
      'photographie lifestyle authentique', 'photo en lévitation (objets flottants)', 'collage magazine rétro',
      'croquis fait main authentique (anti-perfection numérique)', 'folk art (motifs artisanaux, fleurs, oiseaux)',
      'aquarelle douce', 'typographie géante en vedette', 'pop colorée énergique', 'naturel organique (bois, lin, végétal)'],
  },
  {
    match: /mode|v[êe]t|beaut|cosm[ée]t|coiff|esth[ée]t|bijou|parfum|luxe|spa/i,
    angles: ['luxe sobre et minimal', 'minimalisme éditorial premium', 'photo cinématographique clair-obscur',
      'noir et blanc dramatique avec une seule couleur accent', 'neon-noir (rouge/noir, néons, flou de mouvement)',
      'art nouveau moderne (lignes organiques + abstraction)', 'typographie géante en vedette',
      'acid fade (dégradés prismatiques saturés, fluide psychédélique)', 'golden hour chaleureuse',
      'typographie liquide (lettres fondues chromées)', 'photo studio fond coloré uni'],
  },
  {
    match: /tech|saas|logiciel|informat|digital|web|app|startup|ia\b|données|data/i,
    angles: ['3D glassmorphism translucide', 'glass block (blocs de verre 3D)', 'dégradés aurora pastel',
      'grille suisse éditoriale stricte', 'typographie géante en vedette', 'minimalisme éditorial premium',
      'grille technique avec timestamps et annotations', 'rendu 3D doux (clay render)', 'low-poly géométrique',
      'futurisme chrome et iridescent', 'duotone réactif haute énergie', 'metaball / formes organiques 3D'],
  },
  {
    match: /sport|fitness|gym|[ée]v[ée]nement|event|soir[ée]e|festival|club|concert|musique/i,
    angles: ['neon-noir (rouge/noir, néons, flou de mouvement)', 'maximalisme chromatique électrique',
      'affiche brutaliste contrastée', 'typographie géante en vedette', 'néon vibrant sur fond sombre',
      'acid fade (dégradés prismatiques saturés, fluide psychédélique)', 'photo cinématographique clair-obscur',
      'duotone réactif haute énergie', 'typographie cinétique en spirale', 'pop colorée énergique', 'collage magazine rétro'],
  },
  {
    match: /immobil|construction|btp|archi|r[ée]nov|d[ée]cor|meuble|maison/i,
    angles: ['minimalisme éditorial premium', 'photographie lifestyle authentique', 'grille suisse éditoriale stricte',
      'golden hour chaleureuse', 'luxe sobre et minimal', 'rendu 3D hyperréaliste produit',
      'schéma technique stylisé', 'comparatif avant / après', 'naturel organique (bois, lin, végétal)', 'art déco géométrique doré'],
  },
  {
    match: /[ée]duc|[ée]cole|formation|cours|coach|universit|cr[èe]che|enfant/i,
    angles: ['infographie pédagogique élégante', 'illustration flat moderne et colorée', 'chronologie / étapes numérotées visuelles',
      'croquis fait main authentique (anti-perfection numérique)', 'scrapbooking (papier, autocollants, notes manuscrites)',
      'style bande dessinée pop', 'pop colorée énergique', 'mythes vs réalités en deux colonnes',
      'typographie géante en vedette', 'papier découpé en relief (paper cut)'],
  },
  {
    match: /artisan|tradition|culture|tourisme|voyage|h[ôo]tel/i,
    angles: ['folk art (motifs artisanaux, fleurs, oiseaux)', 'aquarelle douce', 'gravure vintage / botanique',
      'photographie lifestyle authentique', 'golden hour chaleureuse', 'collage magazine rétro',
      'art nouveau moderne (lignes organiques + abstraction)', 'naturel organique (bois, lin, végétal)',
      'scrapbooking (papier, autocollants, notes manuscrites)', 'papier découpé en relief (paper cut)'],
  },
];
// Sélection sûre et moderne quand le secteur est inconnu.
const SAFE_ANGLES = ['minimalisme éditorial premium', 'photographie lifestyle authentique', 'infographie pédagogique élégante',
  'rendu 3D doux (clay render)', 'typographie géante en vedette', 'dégradés aurora pastel',
  'illustration flat moderne et colorée', 'macro photographie ultra détaillée', 'golden hour chaleureuse',
  'grille suisse éditoriale stricte', 'photo studio fond coloré uni', 'comparatif avant / après'];
function sectorAngles() {
  const c = activeCompany();
  const txt = ((c && c.category) || '') + ' ' + ((c && c.info) || '');
  for (const m of SECTOR_ANGLE_MAP) if (m.match.test(txt)) return m.angles;
  return SAFE_ANGLES;
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

// Remplit un champ du panneau guidé (headline / desc / subject).
function setGuidedField(key, value) {
  const f = document.querySelector(`#guidedQuestions .gq-field[data-key="${key}"]`);
  if (f) f.value = value;
}

// Génère une image d'EXEMPLE pour une idée visuelle (modèle éco, à la demande).
async function generateIdeaPreview(btn, chip, visual) {
  btn.disabled = true;
  btn.textContent = 'Génération…';
  try {
    const c = activeCompany();
    const cols = c && c.colors && c.colors.length ? ` Couleurs de marque : ${c.colors.join(', ')}.` : '';
    const prompt = `${visual}.${cols} Image d'arrière-plan d'affiche — INTERDICTION ABSOLUE de texte, lettres, chiffres ou logo dans l'image.`;
    // Seedream n'accepte que certains ratios -> on mappe vers le plus proche supporté.
    const SEEDREAM_AR = ['1:1', '3:4', '4:3', '16:9', '9:16', '21:9'];
    let ar = (guidedRecipe && guidedRecipe.params && guidedRecipe.params.aspect_ratio) || '4:5';
    if (!SEEDREAM_AR.includes(ar)) ar = { '4:5': '3:4', '5:4': '4:3', '2:3': '3:4', '3:2': '4:3' }[ar] || '1:1';
    const { taskId } = await window.api.generate({
      api: 'jobs',
      model: 'seedream/4.5-text-to-image',
      input: { prompt, aspect_ratio: ar, quality: 'basic' },
    });
    // Polling léger (sans toucher au statut global du panneau)
    let url = null;
    for (let t = 0; t < 50 && !url; t++) {
      await new Promise((s) => setTimeout(s, 2500));
      const r = await window.api.poll({ api: 'jobs', taskId });
      if (r.error) throw new Error(r.error);
      if (r.done) url = r.resultUrl;
    }
    if (!url) throw new Error('Délai dépassé — réessaie.');
    chip.querySelector('.chip-img').innerHTML =
      `<img class="chip-preview" src="${esc(url)}" alt="Aperçu du style" loading="lazy" />` +
      `<div class="hint">Aperçu indicatif (qualité éco) — la création finale sera en haute qualité.</div>`;
    btn.textContent = '✓ Aperçu généré';
    refreshBalance();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = 'Réessayer';
    chip.querySelector('.chip-img').innerHTML = `<div class="hint" style="color:var(--danger)">✗ ${esc(e.message)}</div>`;
  }
}

// ÉTAPE 1 : propositions de TEXTES (titre + contenu réel), sans design.
// Marqueur séparant le message choisi de la direction visuelle dans le champ sujet (recettes classiques).
const VISUAL_MARK = '— Direction visuelle : ';
function subjectTextPart() {
  const f = subjectField();
  return f ? f.value.split(VISUAL_MARK)[0].trim() : '';
}
function subjectVisualPart() {
  const f = subjectField();
  return f ? (f.value.split(VISUAL_MARK)[1] || '').trim() : '';
}
function renderTextSuggestions(list) {
  const el = document.getElementById('aiSuggestions');
  el.innerHTML = '';
  list.forEach(([head, body]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ai-chip';
    b.innerHTML = `<b>${esc(head)}</b><br><small>${esc(body)}</small>`;
    b.onclick = () => {
      if (guidedRecipe.proLayers) {
        setGuidedField('headline', head);
        setGuidedField('desc', body);
      } else {
        // Recette classique : le texte va dans le sujet (l'IA le dessinera sur l'image)
        const visual = subjectVisualPart();
        const f = subjectField();
        if (f) f.value = `« ${head} » — ${body}` + (visual ? `\n${VISUAL_MARK}${visual}` : '');
      }
      const statusEl = document.getElementById('aiStatus');
      statusEl.textContent = '✓ Texte appliqué — clique « 2 · Idées visuelles » pour le fond.';
      statusEl.className = 'ai-status';
    };
    el.appendChild(b);
  });
}
document.getElementById('aiTexts').onclick = async () => {
  if (!guidedRecipe || guidedRecipe.kind !== 'image') return;
  const statusEl = document.getElementById('aiStatus');
  // Recettes classiques : le texte sera dessiné sur l'image -> la langue est requise.
  if (!guidedLang() && !guidedRecipe.proLayers) {
    statusEl.textContent = "Choisissez d'abord la langue de l'affiche (au-dessus).";
    statusEl.className = 'ai-status error';
    return;
  }
  const btn = document.getElementById('aiTexts');
  btn.disabled = true;
  document.getElementById('aiSuggestions').innerHTML = '';
  statusEl.className = 'ai-status';
  statusEl.innerHTML = '<span class="spinner"></span>Rédaction des textes…';
  try {
    const c = activeCompany();
    const cat = c && c.category ? `, secteur : ${c.category}` : '';
    const inf = c && c.info ? `, infos : ${c.info}` : '';
    const subjectNow = guidedRecipe.proLayers
      ? ((subjectField() && subjectField().value.trim()) || '')
      : subjectTextPart(); // recette classique : on ignore la direction visuelle déjà ajoutée
    const SYS =
      "Tu es concepteur-rédacteur senior (copywriter). Tu écris les textes d'affiches : un TITRE court et percutant + le TEXTE réel de l'affiche. " +
      "RÈGLE D'OR : affiche éducative/informative => 3 à 4 points CONCRETS, utiles et exacts qui apprennent quelque chose (avantages, chiffres, conseils) ; " +
      "promotion => offre précise + appel à l'action ; événement => date/lieu/infos. Jamais de placeholder ni de blabla marketing creux. Aucune description visuelle.";
    const userText =
      `Marque : ${c ? '« ' + c.name + ' »' : '(non précisée)'}${cat}${inf}.` +
      (subjectNow ? `\nSujet de l'affiche (priorité absolue) : ${subjectNow}.` : '\nSujet : à déduire du secteur.') +
      `\nLangue : ${LANG_LABEL[guidedLang() || 'fr']}.` +
      (lastIdeaTitles.length ? `\nNe répète pas ces titres déjà proposés : ${lastIdeaTitles.join(' | ')}.` : '') +
      `\n\nDonne exactement 5 propositions de textes d'affiche TRÈS différentes (angles d'accroche variés : question, chiffre, bénéfice, urgence, émotion).` +
      `\nFormat STRICT — une ligne par proposition, 2 parties séparées par || :` +
      `\nTITRE court || TEXTE de l'affiche (éducatif : 3-4 points séparés par « • » ; promo : offre + CTA).` +
      `\nPas de numéro, pas de puce en début de ligne, pas d'introduction.`;
    const text = (await window.api.aiChat({ model: AI_MODEL, messages: [{ role: 'system', content: SYS }, { role: 'user', content: userText }] })).text;
    const parsed = text.split(/\r?\n/)
      .map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim())
      .filter((l) => l.includes('||'))
      .map((l) => l.split(/\s*\|\|\s*/).map((p) => p.replace(/^["“”']|["“”']$/g, '').trim()))
      .filter((p) => p.length >= 2 && p[0] && p[1])
      .slice(0, 6);
    if (!parsed.length) throw new Error('Aucun texte reçu — réessaie.');
    statusEl.textContent = 'Choisis un texte (il remplit le titre et le texte de l\'affiche) :';
    renderTextSuggestions(parsed);
    lastIdeaTitles = [...lastIdeaTitles, ...parsed.map((p) => p[0])].slice(-15);
  } catch (e) {
    statusEl.textContent = '✗ ' + e.message;
    statusEl.className = 'ai-status error';
  } finally {
    btn.disabled = false;
  }
};

document.getElementById('aiIdeas').onclick = async () => {
  if (!guidedRecipe) return;
  const statusEl = document.getElementById('aiStatus');

  // Mise en scène produit/vêtement : SnapFiche VOIT la photo importée et propose des
  // mises en scène COHÉRENTES (une robe est portée par une femme, etc.).
  if (guidedRecipe.needsImage) {
    if (!guidedRefs.length) {
      statusEl.textContent = "Importe d'abord la photo du produit / vêtement.";
      statusEl.className = 'ai-status error';
      return;
    }
    const ib = document.getElementById('aiIdeas');
    ib.disabled = true;
    document.getElementById('aiSuggestions').innerHTML = '';
    statusEl.className = 'ai-status';
    statusEl.innerHTML = '<span class="spinner"></span>SnapFiche regarde ton produit…';
    try {
      const c = activeCompany();
      const SYS =
        "Tu es directeur artistique mode & produit. On te MONTRE un produit ou un vêtement à mettre en valeur. " +
        "Tu proposes des mises en scène RÉALISTES et COHÉRENTES avec la nature de l'objet : un vêtement est PORTÉ par une personne adaptée (robe → femme, costume → homme, chaussures aux pieds…), " +
        "une boisson est tenue ou versée, un objet est utilisé dans son contexte naturel. JAMAIS l'objet seul qui flotte. " +
        "Tu décris à chaque fois : qui (mannequin/personne), l'action, le décor, la lumière, l'ambiance.";
      const wish = (subjectField() && subjectField().value.trim()) || '';
      const USR =
        `Identifie d'abord ce produit, puis propose 5 mises en scène différentes et crédibles pour le valoriser` +
        (c ? ` (marque « ${c.name} »${c.category ? ', ' + c.category : ''})` : '') + '. ' +
        (wish ? `CONSIGNE PRIORITAIRE du client à respecter ABSOLUMENT dans CHAQUE proposition : « ${wish} » (lieu, décor ou ambiance imposés). ` : '') +
        `Une proposition par ligne, concrète et imagée. Exemple : « Une femme élégante porte la robe, marchant sur la plage de Sidi Bou Saïd au coucher du soleil ». ` +
        `Pas de numéro, pas de puce, pas d'introduction.`;
      const text = (await window.api.aiChat({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYS },
          { role: 'user', content: [{ type: 'text', text: USR }, { type: 'image_url', image_url: { url: guidedRefs[0].dataUrl } }] },
        ],
      })).text;
      const ideas = text.split(/\r?\n/).map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim()).filter((l) => l.length > 3).slice(0, 6);
      if (!ideas.length) throw new Error('Aucune idée reçue — réessaie.');
      statusEl.textContent = 'Clique une mise en scène pour l\'utiliser :';
      renderSuggestions(ideas);
      lastIdeaTitles = [...lastIdeaTitles, ...ideas.map((l) => l.slice(0, 50))].slice(-15);
    } catch (e) {
      statusEl.textContent = '✗ ' + e.message;
      statusEl.className = 'ai-status error';
    } finally {
      ib.disabled = false;
    }
    return;
  }

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
  statusEl.innerHTML = '<span class="spinner"></span>SnapFiche réfléchit…';
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
    const isImage = guidedRecipe.kind === 'image';
    // Styles adaptés au secteur d'activité (plus de styles hors-sujet).
    const angles = pickAngles(5, sectorAngles());
    // Message déjà choisi (étape 1) : champs titre/texte en Pro, partie texte du sujet sinon.
    const headlineNow = isPro ? (document.querySelector('#guidedQuestions .gq-field[data-key="headline"]') || {}).value || '' : '';
    const descNow = isPro ? (document.querySelector('#guidedQuestions .gq-field[data-key="desc"]') || {}).value || '' : '';
    const messageCtx = isPro
      ? (headlineNow || descNow ? `Titre : « ${headlineNow} »${descNow ? ` ; Texte : « ${descNow} »` : ''}` : '')
      : subjectTextPart();
    const SYS = isImage
      ? "Tu es directeur artistique senior. Tu conçois des directions visuelles d'affiches au service d'un message donné. " +
        "Chaque concept décrit précisément : sujet/scène, cadrage et composition (zone dégagée en haut pour le titre), style, lumière, palette reprenant les couleurs de la marque, ambiance. " +
        "Tu ne rédiges JAMAIS de texte d'affiche — uniquement le visuel. Tu respectes la direction artistique imposée pour chaque concept et tu restes crédible pour le secteur d'activité."
      : "Tu es directeur de création senior. Tu produis des concepts de vidéos courtes : une vraie idée de scène + une direction artistique précise, crédible pour le secteur.";
    const userText =
      `Objectif : ${guidedRecipe.title}.` +
      `\nMarque : ${c ? '« ' + c.name + ' »' : '(non précisée)'}${cat}${cols}${inf}.` +
      (!isImage && subjectNow ? `\nDemande de l'utilisateur (à respecter en priorité) : ${subjectNow}.` : '') +
      (isImage && messageCtx ? `\nLe visuel doit SERVIR ce message déjà choisi — ${messageCtx}.` : '') +
      (logoDataUrl ? `\nLe logo est joint : tiens compte de son style et de ses couleurs.` : '') +
      `\nLangue du texte affiché : ${LANG_LABEL[guidedLang() || 'fr']}.` +
      `\n\nDonne exactement 5 concepts très différents, SPÉCIFIQUES à cette demande et ce secteur (jamais génériques).` +
      `\nDirections artistiques IMPOSÉES, une par concept et dans cet ordre : 1) ${angles[0]} ; 2) ${angles[1]} ; 3) ${angles[2]} ; 4) ${angles[3]} ; 5) ${angles[4]}.` +
      (lastIdeaTitles.length ? `\nINTERDIT de reproposer des concepts proches de ceux-ci (déjà montrés) : ${lastIdeaTitles.join(' | ')}.` : '') +
      (isImage
        ? `\nFormat STRICT — exactement une ligne par concept : la direction visuelle uniquement (sujet/scène précis, cadrage avec zone haute dégagée, style, lumière, palette de la marque, ambiance — 20 mots minimum). Aucun contenu textuel d'affiche.` +
          (isPro ? `\nCes visuels seront générés SANS texte (le texte est ajouté en calques) — ne mentionne jamais de texte, mots ou typographie.` : '')
        : `\nFormat STRICT — exactement une ligne par concept, ainsi :` +
          `\n"Idée de scène" — direction visuelle précise (mouvement de caméra + style + lumière + ambiance).`) +
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
    if (isImage) {
      // Concepts visuels (un par style imposé) : « Utiliser » remplit le champ visuel,
      // « Aperçu » génère une vraie image d'exemple (modèle éco) à la demande.
      const el = document.getElementById('aiSuggestions');
      el.innerHTML = '';
      ideas.slice(0, 5).forEach((visual, i) => {
        const d = document.createElement('div');
        d.className = 'ai-chip ai-chip-rich';
        d.innerHTML =
          `<b>${esc(angles[i] || 'Concept ' + (i + 1))}</b><br><small>${esc(visual)}</small>` +
          `<div class="chip-actions"><button type="button" class="mini chip-use">✓ Utiliser ce visuel</button>` +
          `<button type="button" class="mini chip-prev">Aperçu (~7 cr)</button></div>` +
          `<div class="chip-img"></div>`;
        d.querySelector('.chip-use').onclick = () => {
          if (isPro) {
            setGuidedField('subject', visual);
          } else {
            // Recette classique : le sujet garde le message choisi + reçoit la direction visuelle
            const txt = subjectTextPart();
            const f = subjectField();
            if (f) f.value = (txt ? txt + '\n' : '') + VISUAL_MARK + visual;
          }
          statusEl.textContent = '✓ Visuel appliqué — tu peux lancer la création.';
          statusEl.className = 'ai-status';
        };
        d.querySelector('.chip-prev').onclick = (e) => generateIdeaPreview(e.target, d, visual);
        el.appendChild(d);
      });
      statusEl.textContent = 'Choisis le style (adapté à ton secteur) — « Aperçu » pour voir un exemple réel :';
      lastIdeaTitles = [...lastIdeaTitles, ...ideas.map((l) => l.slice(0, 50))].slice(-15);
    } else {
      statusEl.textContent = 'Cliquez une idée pour l\'utiliser :';
      renderSuggestions(ideas);
      lastIdeaTitles = [...lastIdeaTitles, ...ideas.map((l) => l.slice(0, 60))].slice(-15);
    }
  } catch (e) {
    statusEl.textContent = '✗ ' + e.message;
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
    statusEl.textContent = '✓ Texte amélioré.';
  } catch (e) {
    statusEl.textContent = '✗ ' + e.message;
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
  showGenLoading(resultEl, (eff.params && eff.params.aspect_ratio) || '1:1', r.kind === 'video' ? 'Génération de la vidéo…' : 'Création en cours…');
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

    // 2) Style de référence : style gardé sélectionné OU dernière création
    if (eff.kind === 'image' && selectedStyleRef) {
      statusEl.innerHTML = '<span class="spinner"></span>Préparation du style gardé…';
      let styleUrl = selectedStyleRef.image_url;
      try {
        const up = await window.api.uploadFile({ remoteUrl: styleUrl, fileName: 'style-ref.png' });
        if (up && up.url) styleUrl = up.url; // ré-hébergé chez kie (URL fraîche)
      } catch (_) {}
      images.push(styleUrl);
      prompt += " Garde la même direction artistique que l'image de style fournie (même palette, même ambiance, même traitement graphique)."
        + (selectedStyleRef.directive ? ` Style de référence : ${selectedStyleRef.directive.slice(0, 400)}.` : '');
    } else if (eff.kind === 'image' && lastStyleUrl && document.getElementById('guidedKeepStyle').checked) {
      images.push(lastStyleUrl);
      prompt += " Garde la même direction artistique que l'image de style fournie (même palette, même ambiance, même traitement graphique).";
    }

    // 3) Logo : selon le mode choisi (placé par l'IA / incrusté exact / aucun)
    // Affiche Pro : calque dans l'éditeur. Cadre actif : le logo vient du cadre.
    const logoMode = document.getElementById('guidedLogoMode').value;
    const hasLogo = eff.kind === 'image' && c && c.logoFile && !r.proLayers
      && document.getElementById('guidedUseLogo').checked; // case « Intégrer le logo »
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

    // Batch : plusieurs propositions d'un coup (images uniquement), puis l'utilisateur choisit.
    const nVar = eff.kind === 'image' ? Math.min(3, Math.max(1, parseInt(document.getElementById('guidedVariants').value, 10) || 1)) : 1;
    if (eff.kind === 'image' && nVar > 1 && !r.proLayers) {
      statusEl.innerHTML = `<span class="spinner"></span>Génération de ${nVar} propositions…`;
      const urls = await Promise.all(Array.from({ length: nVar }, async () => {
        try {
          const g = await window.api.generate(descriptor);
          const rr = await pollUntilDone({ api: descriptor.api, taskId: g.taskId }, { textContent: '', innerHTML: '' }, '', guidedGenToken);
          return rr.resultUrl;
        } catch (_) { return null; }
      }));
      const ok = urls.filter(Boolean);
      refreshBalance();
      if (!ok.length) throw new Error('Aucune proposition générée — réessaie.');
      lastStyleUrl = ok[0];
      document.getElementById('guidedStyleHint').textContent = '✓ style mémorisé';
      statusEl.textContent = `✓ ${ok.length} propositions — clique celle que tu préfères.`;
      showImageGrid(resultEl, ok, prompt);
      ok.forEach((u) => addSessionCreation(u, prompt)); // strip de session
      return; // le bloc finally réactive le bouton
    }

    statusEl.innerHTML = '<span class="spinner"></span>Création en cours…' + (r.kind === 'video' ? ' (la vidéo peut prendre quelques minutes)' : '');
    const { taskId } = await window.api.generate(descriptor);
    const res = await pollUntilDone({ api: descriptor.api, taskId }, statusEl, r.kind === 'video' ? 'Génération de la vidéo' : "Génération de l'image", guidedGenToken);
    statusEl.textContent = res.credits != null ? `✓ Terminé. (−${res.credits} crédits)` : '✓ Terminé.';
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
          statusEl.textContent = '✓ Terminé (logo ajouté).';
        } catch (_) {
          statusEl.textContent = '✓ Terminé (logo non ajouté).';
        }
      }
      showImageResult(resultEl, finalUrl, prompt, [], undefined, taskId); // + taskId (signalement)
      addSessionCreation(finalUrl, prompt); // strip de session (une par une)
      // Affiche Pro : ouvre l'éditeur avec titre/description/logo/contacts en calques modifiables
      if (r.proLayers) {
        statusEl.innerHTML = '<span class="spinner"></span>Composition des calques (titre, contacts)…';
        try {
          await composeProPoster(finalUrl, answers);
          statusEl.textContent = '✓ Affiche composée — modifie les textes dans l\'éditeur, puis exporte.';
        } catch (_) {
          statusEl.textContent = '✓ Image générée (ouvre-la dans l\'éditeur pour ajouter tes textes).';
        }
      }
    } else {
      showVideoResult(resultEl, res.resultUrl, answers.subject);
    }
    refreshBalance();
  } catch (e) {
    statusEl.textContent = (e.message === 'Génération annulée.' ? '■ ' : '✗ ') + e.message;
    statusEl.className = 'status error';
  } finally {
    btn.disabled = false;
    document.getElementById('guidedCancel').classList.add('hidden');
  }
};

// (Le code d'accès de l'app de bureau est remplacé sur le web par la connexion Supabase — voir supabase.js)

// Démo de bienvenue après inscription (affichée une fois).
(function wireWelcome() {
  const m = document.getElementById('welcomeModal');
  const b = document.getElementById('welcomeStart');
  if (b) b.onclick = () => m.classList.add('hidden');
})();
function maybeShowWelcome() {
  if (sessionStorage.getItem('sf_just_signed_up') === '1') {
    sessionStorage.removeItem('sf_just_signed_up');
    const m = document.getElementById('welcomeModal');
    if (m) m.classList.remove('hidden');
  }
}

// ============ Initialisation ============
(async () => {
  try {
    const s = await window.api.configStatus();
    activeCompanyId = s.activeCompanyId || null;
  } catch (_) {}
  maybeShowWelcome();
  const justChose = await ensureAccountType(); // 1re connexion : choix Particulier / Entreprise
  renderGuidedCards();
  await loadCompanies();
  // Après le choix du type, on démarre directement le cycle de configuration de la marque
  // (assistant pas-à-pas pour Particulier, formulaire complet pour Entreprise).
  if (justChose && companies.length === 0) goToCompanySetup();
})();
