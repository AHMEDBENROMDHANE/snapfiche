// ============================================================
// SnapFiche — Authentification (Supabase) + lancement de l'app.
// ============================================================
window.SB = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON);

// PWA : enregistre le service worker (rend l'app installable)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Masque le bouton « Créer un compte » si l'admin a fermé les inscriptions.
fetch((window.CONFIG.BACKEND_URL || '') + '/api/features')
  .then((r) => r.json())
  .then((j) => {
    if (j.features && j.features.signup === false) {
      const b = document.getElementById('signupBtn');
      if (b) b.style.display = 'none';
    }
  })
  .catch(() => {});

let appLoaded = false;
function loadApp() {
  if (appLoaded) return;
  appLoaded = true;
  const s = document.createElement('script');
  s.src = 'app.js';
  document.body.appendChild(s);
}

function showLogin(show) {
  document.getElementById('loginGate').classList.toggle('hidden', !show);
}

async function refreshSession() {
  const { data } = await window.SB.auth.getSession();
  if (data.session) {
    showLogin(false);
    loadApp();
  } else {
    showLogin(true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const emailEl = document.getElementById('loginEmail');
  const passEl = document.getElementById('loginPassword');
  const errEl = document.getElementById('loginError');
  const setErr = (m) => { errEl.textContent = m || ''; };
  const busy = (b) => { document.getElementById('loginBtn').disabled = b; document.getElementById('signupBtn').disabled = b; };

  document.getElementById('loginBtn').onclick = async () => {
    setErr(''); busy(true);
    const { error } = await window.SB.auth.signInWithPassword({ email: emailEl.value.trim(), password: passEl.value });
    busy(false);
    if (error) setErr('Connexion échouée : ' + error.message);
    else refreshSession();
  };

  // Empreinte d'appareil (anti multi-comptes) : signature stable du navigateur/matériel.
  // NB : l'adresse MAC n'est pas accessible depuis le web — cette empreinte joue le même rôle.
  function deviceFingerprint() {
    try {
      const n = navigator;
      const parts = [
        n.userAgent, n.language, (n.languages || []).join(','), n.platform,
        n.hardwareConcurrency, n.deviceMemory, n.maxTouchPoints,
        screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ].join('|');
      let h = 0;
      for (let i = 0; i < parts.length; i++) { h = (h * 31 + parts.charCodeAt(i)) | 0; }
      let stored = localStorage.getItem('sf_fp');
      if (!stored) { stored = (h >>> 0).toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem('sf_fp', stored); }
      return ((h >>> 0).toString(36) + '_' + stored).slice(0, 64);
    } catch (_) { return ''; }
  }

  // Inscription via le backend : compte confirmé immédiatement (pas d'e-mail de validation),
  // puis connexion automatique.
  document.getElementById('signupBtn').onclick = async () => {
    setErr(''); busy(true);
    try {
      const r = await fetch((window.CONFIG.BACKEND_URL || '') + '/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value, fp: deviceFingerprint() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Erreur HTTP ' + r.status);
      const { error } = await window.SB.auth.signInWithPassword({ email: emailEl.value.trim(), password: passEl.value });
      if (error) throw new Error(error.message);
      sessionStorage.setItem('sf_just_signed_up', '1'); // déclenche la démo de bienvenue
      refreshSession();
    } catch (e) {
      setErr('Inscription échouée : ' + e.message);
    }
    busy(false);
  };

  passEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });

  // Déconnexion (bouton dans la barre latérale, présent une fois l'app chargée)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'signOutBtn') {
      window.SB.auth.signOut().then(() => location.reload());
    }
  });

  refreshSession();
});
