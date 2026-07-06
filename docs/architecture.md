# Architecture technique — RunTrack

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (CDN mondial)                     │
│              React SPA — runtrack-virid.vercel.app          │
│                                                             │
│  Pages : Dashboard · Saisie · Suivi · Mes plans             │
│          Nouveau plan · Profil · Accueil · 404              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  RAILWAY — Backend Express                  │
│                                                             │
│  Routes :  /auth      /plans     /seances                   │
│            /dashboard /suivi     /profil                    │
│            /utilisateurs         /tests                     │
└──────────┬───────────────────────────────────┬─────────────┘
           │ SQL (pg)                          │ HTTPS API
           ▼                                  ▼
┌─────────────────────┐           ┌───────────────────────────┐
│  RAILWAY PostgreSQL │           │       CLOUDINARY          │
│  Base de données    │           │   Stockage photos profil  │
│  5 tables           │           │   Dossier: runtrack/      │
│                     │           │   avatars/                │
└─────────────────────┘           └───────────────────────────┘
```

---

## Frontend — React SPA

### Architecture des composants

```
App.jsx
├── Layout.jsx (Sidebar + Outlet + Footer)
│   ├── Sidebar.jsx (navigation, avatar, déconnexion)
│   ├── RouteProtegee.jsx (garde d'authentification)
│   └── Footer.jsx
│
├── Pages publiques (sans authentification)
│   ├── Accueil.jsx
│   ├── Inscription.jsx
│   └── Connexion.jsx
│
└── Pages protégées (JWT requis)
    ├── Dashboard.jsx
    ├── Saisie.jsx
    ├── Suivi.jsx
    ├── MesPlans.jsx
    ├── PlanDetail.jsx
    ├── NouveauPlan.jsx
    ├── Profil.jsx
    └── NotFound.jsx
```

### Gestion de l'état

- **AuthContext** — état global d'authentification (token JWT + données utilisateur)
- **localStorage** — persistance du token et des données utilisateur entre sessions
- **useState local** — état propre à chaque page

### Appels API

Tous les appels HTTP sont centralisés dans `src/api/` :
- `config.js` — URL de base (`VITE_API_URL`)
- `auth.js` — inscription, connexion
- `dashboard.js` — données du tableau de bord
- `plans.js` — gestion des plans
- `seances.js` — saisie des séances
- `suivi.js` — statistiques
- `profil.js` — profil utilisateur

---

## Backend — Express

### Structure des routes

```
/auth
  POST /inscription     — Créer un compte
  POST /connexion       — Se connecter (retourne JWT)

/plans
  POST /generer         — Générer un plan d'entraînement
  GET  /mes-plans       — Lister ses plans
  GET  /:id/detail      — Détail d'un plan avec séances
  PUT  /:id/selectionner — Changer le plan principal
  PUT  /:id/archiver    — Archiver un plan
  PUT  /:id/reactiver   — Réactiver un plan archivé

/seances
  POST /realiser        — Enregistrer une séance réalisée
  GET  /plan/:id        — Séances d'un plan avec statut
  GET  /plan/:id/semaine/:s — Séances d'une semaine

/dashboard
  GET  /                — Données complètes du tableau de bord

/suivi
  GET  /                — Statistiques et historique

/profil
  GET  /                — Récupérer son profil
  PUT  /                — Modifier son profil
  PUT  /photo           — Uploader une photo
  PUT  /mot-de-passe    — Changer le mot de passe

/utilisateurs
  GET  /:id             — Profil d'un utilisateur (protégé)
  PUT  /:id             — Modifier un utilisateur
  DELETE /:id           — Supprimer un utilisateur

/tests
  GET  /utilisateur/:id — Tests d'un utilisateur
  POST /                — Enregistrer un test
  DELETE /:id           — Supprimer un test
```

### Middlewares

- **`authentifier`** — Vérifie le token JWT sur les routes protégées
- **`gestionnaireErreurs`** — Gestion centralisée des erreurs (codes PostgreSQL, 500)
- **`upload`** (multer) — Gestion des uploads de fichiers vers Cloudinary
- **CORS** — Autorise uniquement l'URL Vercel

---

## Sécurité

| Mesure | Implémentation |
|--------|---------------|
| Mots de passe | Hashés avec bcrypt (cost factor 10) |
| Authentification | JWT avec expiration 7 jours |
| Autorisation | Vérification `utilisateur_id` sur chaque ressource |
| Injections SQL | Requêtes paramétrées (`$1`, `$2`...) |
| CORS | Origine strictement limitée à Vercel |
| Secrets | Variables d'environnement, jamais dans le code |
| Photos | Validation du type MIME côté serveur |
| Taille uploads | Limité à 5MB |