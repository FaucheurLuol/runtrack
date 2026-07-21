# Base de données — RunTrack

## Schéma des relations

```
utilisateurs (1)
    │
    ├──< tests_performance (N)
    │
    ├──< plans_entrainement (N)
    │       │
    │       └──< seances (N)
    │               │
    │               └──< seances_realisees (N)
    │
    └── plan_selectionne_id → plans_entrainement (FK)
```

---

## Tables

### `utilisateurs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| username | VARCHAR(20) | NOT NULL UNIQUE | Nom d'utilisateur |
| email | VARCHAR(255) | NOT NULL UNIQUE | Adresse email |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt |
| nom | VARCHAR(50) | NOT NULL | Nom de famille |
| prenom | VARCHAR(50) | NOT NULL | Prénom |
| sexe | VARCHAR(10) | NOT NULL | homme/femme/autre |
| age | INTEGER | CHECK > 0 < 120 | Âge |
| photo_url | VARCHAR(500) | NULL | URL Cloudinary |
| raison | TEXT | NULL | Motivation (select) |
| objectif_perso | TEXT | NULL | Objectif libre |
| plan_selectionne_id | INTEGER | FK → plans | Plan affiché sur le dashboard |
| created_at | TIMESTAMP | DEFAULT NOW() | Date d'inscription |
| updated_at | TIMESTAMP | DEFAULT NOW() | Dernière modification |

---

### `tests_performance`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant |
| utilisateur_id | INTEGER | FK → utilisateurs CASCADE | Propriétaire |
| distance_km | NUMERIC(5,2) | NOT NULL | Distance du test |
| temps_minutes | NUMERIC(6,2) | NOT NULL | Temps en minutes |
| allure_sec_km | INTEGER | NULL | Allure calculée en sec/km |
| date_test | DATE | NOT NULL | Date du test |
| created_at | TIMESTAMP | DEFAULT NOW() | Création |

---

### `plans_entrainement`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant |
| utilisateur_id | INTEGER | FK → utilisateurs CASCADE | Propriétaire |
| test_id | INTEGER | FK → tests NULL | Test de référence |
| objectif | VARCHAR(20) | NOT NULL | ex: "10km" |
| niveau | VARCHAR(20) | NOT NULL | fast/good/base/moderate/slow |
| seances_semaine | INTEGER | CHECK 1-7 | Fréquence hebdomadaire |
| date_debut | DATE | NOT NULL | Début du plan |
| date_fin | DATE | NOT NULL | Fin du plan (début + 20 semaines) |
| actif | BOOLEAN | DEFAULT TRUE | Plan actif ou archivé |
| temps_reference_initial | INTEGER | NULL | Temps 5km en secondes à la création |
| created_at | TIMESTAMP | DEFAULT NOW() | Création |

---

### `seances`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant |
| plan_id | INTEGER | FK → plans CASCADE | Plan parent |
| semaine | INTEGER | NOT NULL | Numéro de semaine (1-20) |
| jour | INTEGER | NOT NULL | Numéro de séance dans la semaine |
| phase | VARCHAR(50) | NULL | Endurance/Développement/Test/etc. |
| type | VARCHAR(20) | NOT NULL | normal/test/race |
| titre | VARCHAR(100) | NULL | Titre de la séance |
| description | TEXT | NULL | Instructions détaillées |
| duree_min | INTEGER | NULL | Durée prévue en minutes |
| distance_km | NUMERIC(5,2) | NULL | Distance prévue en km |
| allure_label | VARCHAR(20) | NULL | Zone d'allure (easy/aerobic/etc.) |
| allure_sec_km | NUMERIC(5,2) | NULL | Allure cible en sec/km |
| jour_semaine | INTEGER | NULL | Jour de la semaine (1=Lundi) |
| created_at | TIMESTAMP | DEFAULT NOW() | Création |

---

### `seances_realisees`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Identifiant |
| seance_id | INTEGER | FK → seances CASCADE | Séance prévue associée |
| utilisateur_id | INTEGER | FK → utilisateurs CASCADE | Coureur |
| date_realisee | DATE | NOT NULL | Date réelle de la séance |
| duree_reelle | INTEGER | NULL | Durée réelle en **secondes** |
| distance_reelle | NUMERIC(5,2) | NULL | Distance réelle en km |
| ressenti | INTEGER | CHECK 1-5 | RPE (Rate of Perceived Exertion) |
| notes | TEXT | NULL | Notes libres |
| allure_reelle_sec | INTEGER | NULL | Allure réelle calculée en sec/km |
| created_at | TIMESTAMP | DEFAULT NOW() | Création |

---

## Conventions importantes

### Stockage des durées

- `seances.duree_min` — en **minutes** (durée prévue par l'algorithme)
- `seances_realisees.duree_reelle` — en **secondes** (saisie précise de l'utilisateur)

### Stockage des allures

Toutes les allures sont stockées en **secondes par kilomètre** (`INTEGER`).

Conversion pour l'affichage :
```javascript
const formatAllure = (sec) => {
    const min = Math.floor(sec / 60);
    const s   = sec % 60;
    return `${min}'${s.toString().padStart(2, '0')}"/km`;
};
// 286 sec → "4'46"/km"
```

### Clés étrangères et CASCADE

- `ON DELETE CASCADE` — supprimer un utilisateur supprime tout son historique
- `ON DELETE SET NULL` — supprimer un plan déselectionne le plan actif (pas de perte de données)