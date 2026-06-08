# SnapFiche — SaaS (web app + PWA + Windows)

Produit **SnapFiche** (by WeCreate) : création d'affiches & vidéos par IA (kie.ai), en SaaS.

## Architecture
```
Frontend (snapfiche.com, Vercel)  ──►  Supabase (comptes + base + stockage)
        │
        └──►  Backend (api.snapfiche.com, Render) ──►  kie.ai (génération IA)
                   • détient la clé kie.ai
                   • vérifie l'utilisateur + débite les crédits
```

- **Étape 1 (ici)** : base de données Supabase + backend Node. ✅
- Étape 2 : frontend web (réutilise l'UI de l'app de bureau) + connexion.
- Étape 3 : crédits ajoutés par l'admin. Étape 4 : PWA. Étape 5 : paiement Flouci. Étape 6 : app Windows.

---

## 1. Base de données (Supabase)
1. Ouvre ton projet Supabase → **SQL Editor** → *New query*.
2. Colle tout le contenu de [`db/schema.sql`](db/schema.sql) → **Run**.
3. **Storage** → *New bucket* → nom **`media`** → coche **Public bucket** (pour afficher logos/médias). *Create.*

## 2. Backend (Render)
1. Mets le dossier `server/` sur un dépôt **GitHub** (ou tout le dossier `snapfiche/`).
2. Sur **Render** → *New +* → **Web Service** → connecte le dépôt.
   - **Root Directory** : `server`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
3. **Environment** → ajoute les variables (voir [`server/.env.example`](server/.env.example)) :
   | Variable | Valeur |
   |---|---|
   | `SUPABASE_URL` | `https://jljemjqlufbaqlpaziog.supabase.co` |
   | `SUPABASE_SERVICE_ROLE` | (clé **service_role** de Supabase — secrète) |
   | `KIE_API_KEY` | ta clé kie.ai |
   | `ALLOWED_ORIGIN` | `https://snapfiche.com` (et/ou ton URL de test) |
4. Déploie. Teste : `https://<ton-service>.onrender.com/health` doit répondre `{"ok":true}`.
5. **Domaine** : Render → *Settings → Custom Domain* → `api.snapfiche.com` (ajoute le CNAME indiqué chez ton registrar).

## 3. Donner des crédits à un utilisateur (admin)
Dans Supabase → SQL Editor :
```sql
select public.grant_credits('client@email.com', 500);
```

## API du backend (utilisée par le frontend)
Toutes les routes (sauf `/health`) exigent l'en-tête `Authorization: Bearer <jeton Supabase de l'utilisateur>`.

| Route | Rôle |
|---|---|
| `GET /api/credits` | solde de crédits de l'utilisateur |
| `POST /api/generate` | lance une génération (vérifie le solde) → `{ taskId }` |
| `POST /api/poll` | interroge la tâche ; débite à la fin → `{ done, resultUrl, ... }` |
| `POST /api/chat` | assistant texte (idées) |
| `POST /api/upload` | upload d'une image (référence/logo) |

> Les **entreprises** et la **galerie** se feront directement via Supabase (RLS) côté frontend — pas besoin du backend pour ça.

## Tester l'app web en local
Le backend sert **aussi** le frontend (`web/`) → un seul serveur, pas de souci de CORS.
```bash
cd server
npm install      # (déjà fait)
npm start
```
Puis ouvre **http://localhost:3000** dans ton navigateur.

- Connecte-toi avec le compte démo : **demo@snapfiche.com** / **Demo1234!** (300 crédits)
- Ou crée un compte (⚠️ si la confirmation e-mail est active dans Supabase, désactive-la pour tester :
  *Authentication → Providers → Email → décocher « Confirm email »*).

### Donner des crédits à un compte
SQL Editor Supabase :
```sql
update public.profiles set credits = credits + 500 where email = 'client@email.com';
```
