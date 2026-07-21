const {
    plan_debutant_10km_1s,
    plan_intermediaire_5km_2s,
    plan_intermediaire_10km_2s,
    plan_intermediaire_10km_3s,
    plan_intermediaire_semi_2s,
    plan_intermediaire_marathon_4s
} = require('runtrack-plans');


// ============================================================
// Dictionnaire des plans disponibles
// Clé : niveau_objectif_nbSeances
// ============================================================
const PLANS = {
    'debutant_10km_1s':          plan_debutant_10km_1s,
    'intermediaire_5km_2s':      plan_intermediaire_5km_2s,
    'intermediaire_10km_2s':     plan_intermediaire_10km_2s,
    'intermediaire_10km_3s':     plan_intermediaire_10km_3s,
    'intermediaire_semi_2s':     plan_intermediaire_semi_2s,
    'intermediaire_marathon_2s': plan_intermediaire_marathon_4s,
};

// ============================================================
// PROFILS (dashboard et labels)
// ============================================================
const PROFILS = {
    fast:     { label:"< 21'00\"",        objectif:'42–44 min', seuil: 1260 },
    good:     { label:"21'00\"–22'00\"",  objectif:'44–46 min', seuil: 1320 },
    base:     { label:"22'00\"–23'00\"",  objectif:'45–47 min', seuil: 1380 },
    moderate: { label:"23'00\"–24'00\"",  objectif:'48–50 min', seuil: 1440 },
    slow:     { label:"> 24'00\"",        objectif:'50–52 min', seuil: Infinity },
};

// ============================================================
// ALLURES FIXES DÉBUTANT (plan 1, S1-S7 avant premier test)
// ============================================================
const ALLURES_DEBUTANT = {
    easy:      540, // 9'00"/km
    aerobic:   480, // 8'00"/km
    threshold: 450, // 7'30"/km
    race:      420, // 7'00"/km
    vo2:       400, // 6'40"/km
};

// ============================================================
// DISTANCES DE RÉFÉRENCE (Riegel)
// ============================================================

// Distance de l'objectif en km
const DISTANCES_OBJECTIF = {
    '5km':      5,
    '10km':     10,
    'semi':     21.1,
    'marathon': 42.195,
};

// Distance minimale acceptée pour le test de référence, selon l'objectif
const DISTANCE_MIN_REFERENCE = {
    '5km':      3,
    '10km':     5,
    'semi':     10,
    'marathon': 10,
};

// ============================================================
// CALCUL DE L'ALLURE DE COURSE VIA LA FORMULE DE RIEGEL
// Convertit un temps sur une distance de référence vers l'allure
// cible sur la distance de l'objectif.
// ============================================================
function calculerAllureRiegel(temps_ref_sec, distance_ref_km, objectif) {
    const distance_objectif_km = DISTANCES_OBJECTIF[objectif] || 10;
    const temps_objectif_sec = temps_ref_sec * Math.pow(distance_objectif_km / distance_ref_km, 1.06);
    return Math.round(temps_objectif_sec / distance_objectif_km); // sec/km
}

// ============================================================
// CALCUL DES 5 ZONES DEPUIS UNE ALLURE DE COURSE DÉJÀ DÉTERMINÉE
// ============================================================
function calculerZonesDepuisAllureRace(allureRace) {
    return {
        race:      allureRace,
        threshold: Math.round(allureRace * 1.05),
        aerobic:   Math.round(allureRace * 1.20),
        easy:      Math.round(allureRace * 1.32),
        vo2:       Math.round(allureRace * 0.94),
    };
}

// ============================================================
// CALCUL DES ALLURES DEPUIS UN TEMPS 5KM (en secondes)
// Conservé pour rétrocompatibilité — équivaut à Riegel(distance_ref=5, objectif=10km)
// ============================================================
function calculerAllures(temps_reference_sec) {
    const allureRace = Math.round((temps_reference_sec / 5) * 1.06);
    return calculerZonesDepuisAllureRace(allureRace);
}

// ============================================================
// DÉTERMINER LE PROFIL DEPUIS UN TEMPS 5KM (en secondes)
// ============================================================
function determinerProfil(temps_reference_sec) {
    if (temps_reference_sec < 1260) return 'fast';
    if (temps_reference_sec < 1320) return 'good';
    if (temps_reference_sec < 1380) return 'base';
    if (temps_reference_sec < 1440) return 'moderate';
    return 'slow';
}

// ============================================================
// FORMATAGE SECONDES → MM'SS"/km
// ============================================================
function formatAllure(sec) {
    const min = Math.floor(sec / 60);
    const s   = sec % 60;
    return `${min}'${s.toString().padStart(2, '0')}"/km`;
}

// ============================================================
// GÉNÉRATION DU PLAN
// ============================================================
function genererPlan({ seances_semaine, temps_reference_sec, distance_reference_km, niveau, objectif }) {

    // 1. Construction de la clé et sélection du template
    const cle      = `${niveau}_${objectif}_${seances_semaine}s`;
    const template = PLANS[cle];

    if (!template) {
        throw new Error(
            `Aucun plan disponible pour : ${niveau} · ${objectif} · ${seances_semaine} séance(s)/semaine`
        );
    }

    const totalSemaines = Math.max(...template.map(s => s.s));

    // 2. Distance de référence — 5km par défaut (rétrocompatibilité plans 10km existants)
    const distanceRef = distance_reference_km || 5;

    // Validation de la distance minimale de référence pour cet objectif
    const distanceMin = DISTANCE_MIN_REFERENCE[objectif] || 5;
    if (temps_reference_sec && distanceRef < distanceMin) {
        throw new Error(
            `La distance de référence doit être d'au moins ${distanceMin}km pour un objectif ${objectif}`
        );
    }

    // 3. Calcul des allures personnalisées via Riegel (si test fourni)
    const alluresPersonnalisees = temps_reference_sec
        ? calculerZonesDepuisAllureRace(calculerAllureRiegel(temps_reference_sec, distanceRef, objectif))
        : null;

    // 4. Profil utilisateur (basé sur l'équivalent temps 5km pour rester cohérent avec les labels existants)
    // On convertit l'allure obtenue en un temps 5km équivalent pour déterminer le profil
    const temps5kmEquivalent_sec = alluresPersonnalisees
        ? Math.round((alluresPersonnalisees.race * 5) / 1.06)
        : null;

    const profil = temps5kmEquivalent_sec
        ? determinerProfil(temps5kmEquivalent_sec)
        : 'slow';

    // 5. Injection des allures + calcul durée/distance dans chaque séance
    const seances = template.map(seance => {

        // Plan débutant : S1-S7 gardent les allures fixes (pas encore de test)
        const estAvantPremierTest = seances_semaine === 1 && seance.s < 8;

        const allures = (estAvantPremierTest || !alluresPersonnalisees)
            ? ALLURES_DEBUTANT
            : alluresPersonnalisees;

        // Les séances test et race n'ont pas d'allure calculée
        const allureSec = (seance.type === 'test' || seance.type === 'race')
            ? null
            : allures[seance.allure] ?? null;

        // Calcul de la durée
        let duree_min = null;
        if (seance.type !== 'test' && seance.type !== 'race') {
            if (seance.dist && allureSec) {
                // Séance continue : distance × allure → durée
                duree_min = Math.round((seance.dist * allureSec) / 60);
            } else if (seance.duree_travail) {
                // Séance fractionnée : durée de travail fixe
                duree_min = seance.duree_travail;
            }
        }

        // Calcul de la distance pour les séances fractionnées
        let distance_km = seance.dist ?? null;
        if (!seance.dist && seance.duree_travail && allureSec) {
            // Distance = durée travail (en sec) / allure (sec/km)
            distance_km = Math.round((seance.duree_travail * 60 / allureSec) * 100) / 100;
        }

        return {
            ...seance,
            allure_label:     seance.allure,
            allure_sec:       allureSec,
            duree_min,
            distance_km,
            allure_affichage: allureSec
                ? formatAllure(allureSec)
                : 'Effort maximal',
        };
    });

    // 6. Retour du plan complet
    return {
        profil,
        objectif:       PROFILS[profil].objectif,
        label_profil:   PROFILS[profil].label,
        seances_semaine,
        total_semaines: totalSemaines,
        allures_reference: alluresPersonnalisees ? {
            easy:      formatAllure(alluresPersonnalisees.easy),
            aerobic:   formatAllure(alluresPersonnalisees.aerobic),
            threshold: formatAllure(alluresPersonnalisees.threshold),
            race:      formatAllure(alluresPersonnalisees.race),
            vo2:       formatAllure(alluresPersonnalisees.vo2),
        } : null,
        seances,
    };
}

// Métadonnées de tous les plans disponibles, dérivées automatiquement des templates
const PLANS_METADATA = Object.entries(PLANS).map(([cle, template]) => {
    const parties  = cle.split('_');
    const niveau   = parties[0];
    const seances  = parseInt(parties[parties.length - 1]);
    const objectif = parties.slice(1, -1).join('_');
    const semaines = Math.max(...template.map(s => s.s));
    return { cle, niveau, objectif, seances, semaines };
});

module.exports = {
    genererPlan,
    calculerAllures,
    calculerAllureRiegel,
    calculerZonesDepuisAllureRace,
    determinerProfil,
    formatAllure,
    PROFILS,
    DISTANCES_OBJECTIF,
    DISTANCE_MIN_REFERENCE,
    PLANS_METADATA,
};