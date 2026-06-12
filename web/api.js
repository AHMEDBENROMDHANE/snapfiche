// ============================================================
// SnapFiche — couche window.api pour le web.
// Reproduit l'API de l'app de bureau, mais via :
//   • le BACKEND (proxy kie.ai + crédits)        -> generate/poll/chat/upload/credits
//   • Supabase directement (RLS)                 -> entreprises, galerie, stockage
// window.SB (client Supabase) est défini dans supabase.js.
// ============================================================
(function () {
  const BASE = window.CONFIG.BACKEND_URL;

  async function token() {
    const { data } = await window.SB.auth.getSession();
    return data.session ? data.session.access_token : null;
  }
  async function backend(path, opts = {}) {
    const t = await token();
    const res = await fetch(BASE + path, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Erreur (HTTP ${res.status})`);
    return json;
  }
  async function uid() {
    const { data } = await window.SB.auth.getUser();
    return data.user ? data.user.id : null;
  }
  function dataUrlToBlob(dataUrl) {
    const [head, b64] = dataUrl.split(',');
    const mime = (head.match(/data:(.*?);/) || [])[1] || 'image/png';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function rid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  async function uploadToStorage(dataUrl, folder) {
    const u = await uid();
    const blob = dataUrlToBlob(dataUrl);
    const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const path = `${u}/${folder}/${rid()}.${ext}`;
    const { error } = await window.SB.storage.from('media').upload(path, blob, { contentType: blob.type, upsert: true });
    if (error) throw new Error(error.message);
    return window.SB.storage.from('media').getPublicUrl(path).data.publicUrl;
  }
  function mapCompany(c) {
    return {
      id: c.id, name: c.name, category: c.category || '', colors: c.colors || [], website: c.website || '', info: c.info || '',
      email: c.email || '', phone: c.phone || '', whatsapp: c.whatsapp || '', facebook: c.facebook || '', instagram: c.instagram || '',
      logoFile: c.logo_url || null, frame: c.frame || null, createdAt: c.created_at,
    };
  }
  function triggerDownload(href, name) {
    const a = document.createElement('a');
    a.href = href; a.download = name || 'snapfiche'; a.target = '_blank';
    document.body.appendChild(a); a.click(); a.remove();
  }

  window.api = {
    // ---- Auth / config ----
    configStatus: async () => ({ hasKey: true, fromEnv: true, activeCompanyId: localStorage.getItem('activeCompanyId') || null }),
    setApiKey: async () => ({ ok: true }), // la clé est côté serveur
    setActiveCompany: async (id) => { if (id) localStorage.setItem('activeCompanyId', id); else localStorage.removeItem('activeCompanyId'); return { ok: true }; },

    // ---- Solde ----
    getCredits: async () => { const j = await backend('/api/credits'); return { credits: j.credits, unlimited: !!j.unlimited, usd: +(j.credits * 0.005).toFixed(2) }; },

    // ---- Compte (type particulier / entreprise) ----
    getMe: async () => backend('/api/me'),
    setAccountType: async (type) => backend('/api/account-type', { method: 'POST', body: { type } }),

    // ---- Packs (offres) ----
    getPacks: async () => backend('/api/packs'),

    // ---- Administration ----
    adminOverview: async () => backend('/api/admin/overview'),
    adminUsers: async (search) => backend('/api/admin/users' + (search ? '?search=' + encodeURIComponent(search) : '')),
    adminUpdateUser: async (id, fields) => backend('/api/admin/user/' + id, { method: 'POST', body: fields }),
    adminPacks: async () => backend('/api/admin/packs'),
    adminPackCreate: async (fields) => backend('/api/admin/packs', { method: 'POST', body: fields }),
    adminPackUpdate: async (id, fields) => backend('/api/admin/packs/' + id, { method: 'POST', body: fields }),
    adminPackDelete: async (id) => backend('/api/admin/packs/' + id, { method: 'DELETE' }),
    adminDaily: async () => backend('/api/admin/daily'),
    adminSettings: async () => backend('/api/admin/settings'),
    adminSetSettings: async (fields) => backend('/api/admin/settings', { method: 'POST', body: fields }),

    // ---- Génération (via backend) ----
    generate: (descriptor) => backend('/api/generate', { method: 'POST', body: descriptor }),
    poll: (descriptor) => backend('/api/poll', { method: 'POST', body: descriptor }),
    aiChat: (payload) => backend('/api/chat', { method: 'POST', body: payload }),
    uploadFile: (payload) => backend('/api/upload', { method: 'POST', body: payload }),

    // ---- Entreprises (Supabase + stockage) ----
    companyList: async () => {
      const { data, error } = await window.SB.from('companies').select('*').order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []).map(mapCompany);
    },
    companySave: async (company) => {
      const u = await uid();
      const row = {
        user_id: u,
        name: company.name || 'Sans nom',
        category: company.category || '',
        colors: company.colors || [],
        website: company.website || '',
        info: company.info || '',
        email: company.email || '',
        phone: company.phone || '',
        whatsapp: company.whatsapp || '',
        facebook: company.facebook || '',
        instagram: company.instagram || '',
      };
      if (company.logoDataUrl) row.logo_url = await uploadToStorage(company.logoDataUrl, 'logos');
      else if (company.logoUrl) row.logo_url = company.logoUrl; // logo récupéré depuis le site
      else if (company.removeLogo) row.logo_url = null;
      let res;
      if (company.id) res = await window.SB.from('companies').update(row).eq('id', company.id).select().single();
      else res = await window.SB.from('companies').insert(row).select().single();
      if (res.error) throw new Error(res.error.message);
      return mapCompany(res.data);
    },
    // Récupère les infos d'un site web (via le backend)
    fetchSite: (url) => backend('/api/fetch-site', { method: 'POST', body: { url } }),
    // Incruste le VRAI logo (exact) sur une image générée -> renvoie l'URL de l'image finale
    overlayLogo: (payload) => backend('/api/overlay-logo', { method: 'POST', body: payload }),
    companyDelete: async (id) => { const { error } = await window.SB.from('companies').delete().eq('id', id); if (error) throw new Error(error.message); return { ok: true }; },
    // Cadre de marque (logo + réseaux en calques relatifs) attaché à l'entreprise.
    frameSave: async (companyId, frame) => {
      const { error } = await window.SB.from('companies').update({ frame }).eq('id', companyId);
      if (error) throw new Error(error.message);
      return { ok: true };
    },

    // ---- Galerie (Supabase) ----
    galleryAdd: async (item) => {
      const u = await uid();
      const row = { user_id: u, type: item.type, prompt: item.prompt || '', url: item.url, company_id: item.companyId || null, history: item.history || [] };
      const { data, error } = await window.SB.from('gallery').insert(row).select().single();
      if (error) throw new Error(error.message);
      return { id: data.id, type: data.type, prompt: data.prompt, companyId: data.company_id, file: data.url, url: data.url, history: data.history || [], createdAt: data.created_at };
    },
    // Met à jour une création (après une modification IA : nouvelle url + historique + prompt versionné).
    galleryUpdate: async (id, fields) => {
      const row = {};
      if (fields.url) row.url = fields.url;
      if (fields.history) row.history = fields.history;
      if (fields.prompt != null) row.prompt = fields.prompt;
      const { error } = await window.SB.from('gallery').update(row).eq('id', id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    galleryList: async () => {
      const { data, error } = await window.SB.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map((g) => ({ id: g.id, type: g.type, prompt: g.prompt || '', companyId: g.company_id, file: g.url, url: g.url, history: g.history || [], createdAt: g.created_at }));
    },
    galleryDelete: async (id) => { const { error } = await window.SB.from('gallery').delete().eq('id', id); if (error) throw new Error(error.message); return { ok: true }; },

    // ---- Affiches composées (fond IA + calques rééditables) ----
    designSave: async (d) => {
      const u = await uid();
      let bg = d.bgUrl;
      if (bg && bg.startsWith('data:')) bg = await uploadToStorage(bg, 'designs'); // fond importé -> hébergé
      let preview = null;
      if (d.previewDataUrl) { try { preview = await uploadToStorage(d.previewDataUrl, 'designs'); } catch (_) {} }
      const row = {
        user_id: u, name: d.name || 'Affiche', bg_url: bg,
        layers: d.layers || [], company_id: d.companyId || null,
        updated_at: new Date().toISOString(),
      };
      if (preview) row.preview_url = preview;
      let res;
      if (d.id) res = await window.SB.from('designs').update(row).eq('id', d.id).select().single();
      else res = await window.SB.from('designs').insert(row).select().single();
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    designList: async () => {
      const { data, error } = await window.SB.from('designs').select('*').order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    designDelete: async (id) => {
      const { error } = await window.SB.from('designs').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },

    // ---- Médias ----
    // Sur le web, les "fichiers" sont déjà des URLs publiques -> on les renvoie telles quelles.
    mediaDataUrl: async (x) => x,
    fetchDataUrl: async (url) => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        return await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
      } catch (_) {
        return url; // repli : utilisable comme src d'image
      }
    },

    // ---- Export (téléchargement navigateur) ----
    exportSave: async ({ dataUrl, defaultName }) => { triggerDownload(dataUrl, defaultName); return { canceled: false, filePath: defaultName }; },
    exportSaveFile: async ({ srcPath, defaultName }) => { triggerDownload(srcPath, defaultName); return { canceled: false, filePath: defaultName }; },
    openInFolder: async () => ({ ok: true }),

    // ---- Import / Export entreprises ----
    dataExport: async () => {
      const companies = await window.api.companyList();
      const out = { app: 'snapfiche', version: 1, companies: companies.map((c) => ({ name: c.name, colors: c.colors, website: c.website, info: c.info, logo_url: c.logoFile })) };
      triggerDownload('data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(out, null, 2)), 'snapfiche-entreprises.json');
      return { canceled: false, count: companies.length };
    },
    dataImport: async (data) => {
      if (!data || !Array.isArray(data.companies)) throw new Error('Fichier invalide.');
      let added = 0;
      for (const c of data.companies) {
        await window.api.companySave({ name: c.name, colors: c.colors, website: c.website, info: c.info });
        added++;
      }
      return { added };
    },
  };
})();
