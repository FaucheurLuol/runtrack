# Plans d'entraînement — Logique métier

## Vue d'ensemble

RunTrack génère des plans d'entraînement personnalisés sur 20 semaines pour préparer un 10km.
Les allures sont calculées dynamiquement depuis un test 5km et recalibrées automatiquement
après chaque test intermédiaire intégré au plan.

---

## Calcul des allures

### Principe

Depuis un temps sur 5km (en secondes), on calcule une allure de course 10km de référence,
puis toutes les zones d'entraînement par coefficients multiplicateurs.

### Formule

```javascript
// 1. Allure de course 10km (sec/km)
// Le 10km se court ~6% plus lentement qu'un 5km
allureRace = Math.round((temps5km_sec / 5) * 1.06)

// 2. Zones d'entraînement
easy      = Math.round(allureRace * 1.32)  // Endurance facile
aerobic   = Math.round(allureRace * 1.20)  // Aérobie
threshold = Math.round(allureRace * 1.05)  // Seuil lactique
race      = allureRace                      // Allure course 10km
vo2       = Math.round(allureRace * 0.94)  // VO2max
```

### Exemple concret — 5km en 23'43" (1423 secondes)

```
allureRace = (1423 / 5) × 1.06 = 302 sec = 5'02"/km

easy       = 302 × 1.32 = 399 sec = 6'39"/km
aerobic    = 302 × 1.20 = 362 sec = 6'02"/km
threshold  = 302 × 1.05 = 317 sec = 5'17"/km
race       = 302         = 302 sec = 5'02"/km
vo2        = 302 × 0.94 = 284 sec = 4'44"/km

Temps cible 10km = 302 × 10 = 3020 sec = 50'20"
```

---

## Profils

Les profils servent à afficher un label et un objectif estimé à l'utilisateur.

| Profil | Temps 5km | Objectif 10km |
|--------|-----------|---------------|
| fast | < 21'00" | 42–44 min |
| good | 21'00"–22'00" | 44–46 min |
| base | 22'00"–23'00" | 45–47 min |
| moderate | 23'00"–24'00" | 48–50 min |
| slow | > 24'00" | 50–52 min |

---

## Plans disponibles

### Plan 1 — Débutant — 1 séance/semaine

- **Durée** : 20 semaines
- **Public** : Coureurs débutants, reprise après arrêt
- **Jour conseillé** : Jeudi (dayOff: 4)
- **Tests intégrés** : Semaines 8 et 14
- **Allures S1-S7** : Fixes (allures débutant), avant le premier test
- **Allures S8+** : Calculées dynamiquement depuis le test

**Phases :**
```
S1-S7   → Endurance (allures fixes débutant)
S8      → Test 5km n°1 (recalibrage)
S9-S11  → Développement 1
S12-S13 → Développement 2
S14     → Test 5km n°2 (recalibrage)
S15-S16 → Spécifique
S17-S19 → Affûtage
S20     → Course 10km
```

**Allures fixes débutant (avant premier test) :**
```javascript
easy:      540 sec  // 9'00"/km
aerobic:   480 sec  // 8'00"/km
threshold: 450 sec  // 7'30"/km
race:      420 sec  // 7'00"/km
vo2:       400 sec  // 6'40"/km
```

---

### Plan 2 — Intermédiaire — 2 séances/semaine

- **Durée** : 20 semaines
- **Public** : Coureurs ayant une base aérobie
- **Jours conseillés** : Lundi (n°1) + Jeudi ou Vendredi (n°2)
- **Tests intégrés** : Semaines 4, 8, 12, 16
- **Allures** : Calculées dès la création si test 5km fourni

**Phases :**
```
S1-S3   → Endurance
S4      → Récupération + TEST 5km n°1
S5-S7   → Développement 1
S8      → Récupération + TEST 5km n°2
S9-S11  → Développement 2
S12     → Récupération + TEST 5km n°3
S13-S15 → Spécifique
S16     → Récupération + TEST 5km n°4
S17-S19 → Affûtage
S20     → Course 10km
```

---

## Types de séances

| Type | Description | Comportement |
|------|-------------|--------------|
| `normal` | Séance d'entraînement standard | Allure calculée, durée/distance prévue |
| `test` | Test 5km chronométré | Déclenche le recalibrage des allures |
| `race` | Course officielle 10km | Pas d'allure calculée |

---

## Recalibrage automatique

Quand une séance de type `test` est enregistrée :

1. Le système calcule les nouvelles allures depuis le temps réel du test
2. Toutes les séances **futures** du plan (semaines supérieures) sont mises à jour
3. Les séances passées conservent leurs allures d'origine

```sql
UPDATE seances
SET allure_sec_km = CASE allure_label
    WHEN 'easy'      THEN $1
    WHEN 'aerobic'   THEN $2
    WHEN 'threshold' THEN $3
    WHEN 'race'      THEN $4
    WHEN 'vo2'       THEN $5
    ELSE allure_sec_km
END
WHERE plan_id = $6
AND semaine > $7
AND type = 'normal';
```

---

## Calcul de la durée des séances

### Séances continues (footing, longue sortie)

```
duree_min = Math.round((distance_km × allure_sec_km) / 60)
```

### Séances fractionnées (intervalles, seuil)

La `duree_travail` est fixe dans le template (durée de la partie travail uniquement,
sans échauffement ni retour au calme). La distance est calculée :

```
distance_km = Math.round((duree_travail × 60 / allure_sec_km) × 100) / 100
```

---

## Charge d'entraînement

Score hebdomadaire combinant durée et intensité :

```
charge = Σ (duree_reelle_min × facteur_intensite)
```

| Zone | Facteur |
|------|---------|
| easy | 1.0 |
| aerobic | 1.5 |
| threshold | 2.0 |
| race | 2.5 |
| vo2 | 3.0 |

Ce score est comparable au concept de TSS (Training Stress Score) de TrainingPeaks,
et sera enrichi par les données Garmin/Strava lors d'une intégration future.