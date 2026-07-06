# RunTrack 🏃‍♂️

Plateforme SaaS de suivi et génération de plans d'entraînement 
pour coureurs. Disponible sur https://runtrack-virid.vercel.app

## Stack technique

- **Frontend** : React 19, Vite, React Router, Recharts
- **Backend** : Node.js, Express 5
- **Base de données** : PostgreSQL 18
- **Authentification** : JWT + bcrypt
- **Déploiement** : Vercel (frontend) + Railway (backend + BDD)
- **Stockage photos** : Cloudinary

## Fonctionnalités

- Génération de plans d'entraînement personnalisés (10km)
- Calcul dynamique des allures depuis un test 5km
- Recalibrage automatique des allures après chaque test
- Suivi des séances avec statistiques et graphiques
- Gestion multi-plans (actif, archivé)
- Profil utilisateur avec photo

## Déploiement

- Frontend : Vercel (root directory: frontend)
- Backend : Railway (root directory: backend)
- BDD : Railway PostgreSQL

## Auteur

Lucas Baretzki — Ingénieur cybersécurité 