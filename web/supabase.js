// ============================================================
// SnapFiche — Authentification (Supabase) + lancement de l'app.
// ============================================================
window.SB = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON);

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

  document.getElementById('signupBtn').onclick = async () => {
    setErr(''); busy(true);
    const { data, error } = await window.SB.auth.signUp({ email: emailEl.value.trim(), password: passEl.value });
    busy(false);
    if (error) return setErr('Inscription échouée : ' + error.message);
    if (data.session) refreshSession();
    else setErr('Compte créé ✅. Vérifie tes e-mails pour confirmer, puis connecte-toi.');
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
