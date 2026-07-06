# Documentation API — RunTrack

Toutes les routes protégées nécessitent le header :
```
Authorization: Bearer <token_jwt>
```

---

## Authentification

### POST /auth/inscription

Créer un nouveau compte.

**Body :**
```json
{
  "username": "string (3-20 chars)",
  "email": "string",
  "password": "string (14+ chars, majuscule, chiffre, spécial)",
  "nom": "string",
  "prenom": "string",
  "sexe": "homme | femme | autre",
  "age": 25
}
```

**Réponse 201 :**
```json
{
  "message": "Inscription réussie",
  "token": "eyJ...",
  "utilisateur": {
    "id": 1,
    "username": "username",
    "email": "email@runtrack.fr",
    "nom": "Nom",
    "prenom": "Prenom",
    "photo_url": null
  }
}
```

**Erreurs :** 400 (champs manquants), 409 (email ou username déjà utilisé)

---

### POST /auth/connexion

Se connecter.

**Body :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Réponse 200 :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJ...",
  "utilisateur": {
    "id": 1,
    "username": "username",
    "email": "email@runtrack.fr",
    "photo_url": "https://res.cloudinary.com/..."
  }
}
```

**Erreurs :** 400 (champs manquants), 401 (identifiants incorrects)

---

## Plans

### POST /plans/generer 🔒

Générer un nouveau plan d'entraînement.

**Body :**
```json
{
  "seances_semaine": 2,
  "temps5km_sec": 1423,
  "date_debut": "2026-09-01"
}
```

- `seances_semaine` : 1 ou 2
- `temps5km_sec` : temps 5km en secondes (optionnel — null pour débutant)

**Réponse 201 :**
```json
{
  "message": "Plan généré et sauvegardé",
  "plan_id": 1,
  "profil": "moderate",
  "objectif": "48–50 min",
  "allures_reference": {
    "easy": "6'39\"/km",
    "aerobic": "6'02\"/km",
    "threshold": "5'17\"/km",
    "race": "5'02\"/km",
    "vo2": "4'44\"/km"
  },
  "total_seances": 40
}
```

---

### GET /plans/mes-plans 🔒

Lister tous ses plans.

**Réponse 200 :** Array de plans avec `est_selectionne`, `total_seances`, `seances_realisees`.

---

### GET /plans/:id/detail 🔒

Détail d'un plan avec toutes les séances.

**Réponse 200 :**
```json
{
  "plan": { ... },
  "semaines": {
    "1": [ { séance1 }, { séance2 } ],
    "2": [ ... ]
  },
  "total": 40,
  "realisees": 3
}
```

---

### PUT /plans/:id/selectionner 🔒

Changer le plan affiché sur le dashboard.

**Réponse 200 :** `{ "message": "Plan sélectionné", "plan_id": 1 }`

---

### PUT /plans/:id/archiver 🔒

Archiver un plan (ne peut pas archiver le plan sélectionné).

**Réponse 200 :** `{ "message": "Plan archivé", "plan_id": 1 }`

---

### PUT /plans/:id/reactiver 🔒

Réactiver un plan archivé.

**Réponse 200 :** `{ "message": "Plan réactivé", "plan_id": 1 }`

---

## Séances

### POST /seances/realiser 🔒

Enregistrer une séance réalisée. Si la séance est de type `test`,
déclenche automatiquement le recalibrage des allures futures.

**Body :**
```json
{
  "plan_id": 1,
  "semaine": 1,
  "numero_seance": 1,
  "duree_reelle": 1288,
  "distance_reelle": 3.5,
  "ressenti": 3,
  "notes": "Bien passé",
  "date_realisee": "2026-07-04"
}
```

- `duree_reelle` : en **secondes**
- `ressenti` : 1 (très difficile) à 5 (excellent)

**Réponse 201 :**
```json
{
  "message": "Séance enregistrée",
  "semaine": 1,
  "numero_seance": 1,
  "seance_prevue": { ... },
  "seance_realisee": {
    "duree_reelle": 1288,
    "distance_reelle": 3.5,
    "allure_reelle": "6'08\"/km",
    "ressenti": 3,
    "notes": "Bien passé"
  },
  "recalibrage": { ... }  // Présent uniquement si séance de type test
}
```

**Erreurs :** 400 (champs manquants), 404 (séance introuvable), 409 (déjà enregistrée)

---

### GET /seances/plan/:planId 🔒

Toutes les séances d'un plan avec statut réalisé/à faire.

**Réponse 200 :**
```json
{
  "plan_id": 1,
  "semaines": { "1": [...], "2": [...] },
  "total": 40,
  "realisees": 3
}
```

---

### GET /seances/plan/:planId/semaine/:semaine 🔒

Séances d'une semaine précise.

---

## Dashboard

### GET /dashboard 🔒

Données complètes du tableau de bord en un seul appel.

**Réponse 200 :**
```json
{
  "plan_actif": {
    "id": 1,
    "objectif": "10km",
    "niveau": "moderate",
    "niveau_label": "23'00\"–24'00\"",
    "seances_semaine": 2,
    "semaines_restantes": 20,
    "allure_course": "5'02\"/km",
    "temps_cible_10km": "50'20\"",
    "dernier_5km": { "duree_min": 1423, "date": "..." },
    "progression": {
      "realisees": 1,
      "total": 40,
      "pourcentage": 3,
      "km_totaux": "3.5",
      "ressenti_moyen": "3.0",
      "total_heures": 0.4
    }
  },
  "prochaine_seance": { ... },
  "deux_semaines": {
    "semaine_precedente": [...],
    "semaine_courante": [...]
  },
  "allures_reference": {
    "easy": "6'39\"/km",
    "aerobic": "6'02\"/km",
    "threshold": "5'17\"/km",
    "race": "5'02\"/km",
    "vo2": "4'44\"/km"
  },
  "journal": [...],
  "kpi": {
    "consistency_score": 3,
    "streak": 1,
    "meilleure_allure_5km": { ... }
  }
}
```

---

## Suivi

### GET /suivi 🔒

Statistiques complètes pour la page Suivi.

**Réponse 200 :**
```json
{
  "plan_id": 1,
  "stats_globales": {
    "total_km": 3.5,
    "total_heures": 0.4,
    "total_seances_realisees": 1,
    "total_seances_prevues": 40,
    "consistency_score": 3,
    "ressenti_moyen": "3.0",
    "streak": 1,
    "record_distance": 3.5,
    "meilleure_allure_5km": null
  },
  "par_semaine": [...],
  "progression_tests": [...],
  "historique": [...]
}
```

---

## Profil

### GET /profil 🔒

Récupérer son profil complet.

### PUT /profil 🔒

Modifier nom, prénom, âge, sexe, raison, objectif_perso.

### PUT /profil/photo 🔒

Upload une photo de profil (multipart/form-data, champ `photo`, max 5MB).

**Réponse 200 :** `{ "message": "Photo mise à jour", "photo_url": "https://res.cloudinary.com/..." }`

### PUT /profil/mot-de-passe 🔒

**Body :** `{ "ancien_mdp": "...", "nouveau_mdp": "..." }`

---

## Codes d'erreur

| Code | Signification |
|------|--------------|
| 400 | Données invalides ou manquantes |
| 401 | Non authentifié (token absent ou expiré) |
| 403 | Accès refusé (ressource appartenant à un autre utilisateur) |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon email, séance déjà saisie, etc.) |
| 500 | Erreur serveur interne |