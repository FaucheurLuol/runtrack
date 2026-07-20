# RunTrack 🏃‍♂️

Plateforme SaaS de suivi et génération de plans d'entraînement personnalisés pour coureurs.

🌐 **Production** : [https://runtrack-virid.vercel.app](https://runtrack-virid.vercel.app)

---

## Aperçu

RunTrack permet à chaque coureur de générer un plan d'entraînement personnalisé basé sur ses performances réelles, de suivre ses séances et d'analyser sa progression sur 20 semaines.

![RunTrack Screenshot](frontend/public/img/logo_1020x978.png)

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, Vite, React Router 7, Recharts, Lucide React |
| Backend | Node.js, Express 5 |
| Base de données | PostgreSQL 18 |
| Authentification | JWT (jsonwebtoken) + bcrypt |
| Upload photos | Cloudinary |
| Déploiement | Vercel (frontend) + Railway (backend + BDD) |

---

## Fonctionnalités

### Disponibles aujourd'hui

- **Génération de plans personnalisés** — Plans 10km sur 20 semaines (1, 2 ou 3 séances/semaine)
- **Calcul dynamique des allures** — 5 zones calculées depuis un test 5km (easy, aérobie, seuil, race, VO2max)
- **Recalibrage automatique** — Les allures se mettent à jour après chaque test intermédiaire
- **Saisie des séances** — Durée (min + sec), distance, ressenti (RPE 1-5), notes
- **Tableau de bord** — Vue synthétique avec KPI, prochaine séance, allures de référence
- **Suivi et statistiques** — Graphiques de progression, volume hebdomadaire, charge d'entraînement
- **Gestion multi-plans** — Plusieurs plans actifs, archivage, sélection du plan principal
- **Profil utilisateur** — Photo via Cloudinary, motivations, objectif personnel
- **Sécurité** — Authentification JWT, mots de passe hashés bcrypt, routes protégées

### Plans disponibles

| Niveau | Objectif | Séances/semaine | Semaines |
|--------|----------|-----------------|----------|
| Débutant | 10km | 1 | 20 |
| Intermédiaire | 10km | 2 | 20 |
| Intermédiaire | 10km | 3 | 20 |

---

## Roadmap

### Prochaines fonctionnalités

- [ ] **Nouveaux plans** — 5km, semi-marathon, marathon (différents niveaux et fréquences)
- [ ] **Intégration Garmin** — Import automatique des activités via API Garmin Connect
- [ ] **Intégration Strava** — Synchronisation des courses et segments
- [ ] **Génération par IA** — Plans générés automatiquement selon objectif, délai et niveau
- [ ] **Application mobile** — React Native iOS/Android
- [ ] **Mode hors-ligne** — PWA avec synchronisation différée
- [ ] **Tableau de bord avancé** — Charge d'entraînement TSS, HRV, récupération
- [ ] **Communauté** — Partage de plans, classements, défis entre coureurs

### Améliorations techniques prévues

- [ ] Tests unitaires et d'intégration (Jest, Supertest)
- [ ] Documentation API interactive (Swagger)
- [ ] Monitoring et alertes (Sentry)
- [ ] Cache Redis pour les données fréquentes
- [ ] Export des données (CSV, PDF)
- [ ] Conformité RGPD complète (export, suppression, politique de confidentialité)

---

## Installation locale

### Prérequis

- Node.js v18+
- PostgreSQL 16+
- Compte Cloudinary (gratuit sur [cloudinary.com](https://cloudinary.com))

### 1. Cloner le repo

```bash
git clone https://github.com/FaucheurLuol/runtrack.git
cd runtrack
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Remplir VITE_API_URL=http://localhost:3000
npm run dev
```

### 4. Base de données

La migration s'exécute automatiquement au démarrage du backend — les tables sont créées si elles n'existent pas.

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
PORT=3000
DATABASE_URL=                    # URL complète Railway en production
DB_HOST=localhost                # En local uniquement
DB_PORT=5432
DB_NAME=runtrack
DB_USER=runtrack_user
DB_PASSWORD=
JWT_SECRET=                      # Générer : node -e "require('crypto').randomBytes(64).toString('hex')"
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## Déploiement

| Service | Plateforme | Configuration |
|---------|-----------|---------------|
| Frontend | Vercel | Root directory: `frontend` · Framework: Vite |
| Backend | Railway | Root directory: `backend` · Start: `npm start` |
| Base de données | Railway PostgreSQL | Connexion via `DATABASE_URL` |
| Photos | Cloudinary | Dossier: `runtrack/avatars/` |

### Vercel

Ajouter la variable d'environnement :
```
VITE_API_URL=https://ton-backend.up.railway.app
```

Ajouter `vercel.json` à la racine de `frontend/` :
```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Railway

Variables d'environnement à configurer :
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=${{ secret() }}
FRONTEND_URL=https://ton-app.vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Structure du projet

```
runtrack/
├── backend/
│   └── src/
│       ├── config/
│       │   └── cloudinary.js       ← Config upload photos
│       ├── middleware/
│       │   ├── auth.js             ← Vérification JWT
│       │   └── erreurs.js          ← Gestion centralisée erreurs
│       ├── plan/
│       │   ├── plan_[niveau]_[distance]_[n]s.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── dashboard.js
│       │   ├── plans.js
│       │   ├── profil.js
│       │   ├── seances.js
│       │   ├── suivi.js
│       │   ├── tests.js
│       │   └── utilisateurs.js
│       ├── services/
│       │   └── planGenerator.js    ← Algorithme de génération
│       ├── app.js
│       ├── db.js
│       ├── index.js
│       ├── migrate.js
│       └── migration.sql
├── frontend/
│   └── src/
│       ├── api/                    ← Appels HTTP centralisés
│       ├── components/             ← Sidebar, Layout, RouteProtegee
│       ├── context/                ← AuthContext
│       ├── pages/                  ← Dashboard, Saisie, Suivi, etc.
│       └── style/                  ← CSS
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── base-de-donnees.md
│   ├── plans-entrainement.md
│   └── journal.md
└── README.md
```

---

## Architecture

```
Vercel (React SPA)
       │ HTTPS + JWT
       ▼
Railway (Express API)
       │ SQL
       ▼
Railway (PostgreSQL) + Cloudinary (photos)
```

---

## Algorithme des allures

Depuis un temps 5km en secondes :

```javascript
allureRace = Math.round((temps5km_sec / 5) * 1.06)

easy      = allureRace × 1.32   // Endurance facile
aerobic   = allureRace × 1.20   // Aérobie
threshold = allureRace × 1.05   // Seuil lactique
race      = allureRace × 1.00   // Allure course 10km
vo2       = allureRace × 0.94   // VO2max
```

---

## Contribuer

Ce projet est personnel et pédagogique. Les suggestions et retours sont les bienvenus via les Issues GitHub.

Pour ajouter un nouveau plan d'entraînement :
1. Créer `backend/src/plan/plan_[niveau]_[distance]_[n]s.js`
2. Ajouter l'entrée dans `PLANS` dans `planGenerator.js`
3. Ajouter la combinaison dans `PLANS_DISPONIBLES` dans `NouveauPlan.jsx`

---

## Auteur

**Lucas Baretzki** — Ingénieur en cybersécurité.

Projet construit de A à Z pour apprendre React, Node.js, PostgreSQL et le déploiement cloud par la pratique.

[![GitHub](https://img.shields.io/badge/GitHub-FaucheurLuol-orange)](https://github.com/FaucheurLuol)

---

## Licence

Projet personnel — tous droits réservés © 2026 Lucas Baretzki.
