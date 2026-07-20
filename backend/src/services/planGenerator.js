const {
    plan_debutant_10km_1s,
    plan_intermediaire_10km_2s,
    plan_intermediaire_10km_3s,
} = require('runtrack-plans');


// ============================================================
// Dictionnaire des plans disponibles
// Clé : niveau_objectif_nbSeances
// ============================================================
const PLANS = {
    'debutant_10km_1s':      plan_debutant_10km_1s,
    'intermediaire_10km_2s': plan_intermediaire_10km_2s,
    'intermediaire_10km_3s': plan_intermediaire_10km_3s,
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
// CALCUL DES ALLURES DEPUIS UN TEMPS 5KM (en secondes)
// ============================================================
function calculerAllures(temps5km_sec) {
    const allureRace = Math.round((temps5km_sec / 5) * 1.06);
    return {
        race:      allureRace,
        threshold: Math.round(allureRace * 1.05),
        aerobic:   Math.round(allureRace * 1.20),
        easy:      Math.round(allureRace * 1.32),
        vo2:       Math.round(allureRace * 0.94),
    };
}

// ============================================================
// DÉTERMINER LE PROFIL DEPUIS UN TEMPS 5KM (en secondes)
// ============================================================
function determinerProfil(temps5km_sec) {
    if (temps5km_sec < 1260) return 'fast';
    if (temps5km_sec < 1320) return 'good';
    if (temps5km_sec < 1380) return 'base';
    if (temps5km_sec < 1440) return 'moderate';
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
function genererPlan({ seances_semaine, temps5km_sec, niveau }) {

     // 1. Construction de la clé et sélection du template
    const cle      = `${niveau}_${objectif}_${seances_semaine}s`;
    const template = PLANS[cle];

    if (!template) {
        throw new Error(
            `Aucun plan disponible pour : ${niveau} · ${objectif} · ${seances_semaine} séance(s)/semaine`
        );
    }

    // 2. Calcul des allures personnalisées (si test fourni)
    const alluresPersonnalisees = temps5km_sec
        ? calculerAllures(temps5km_sec)
        : null;

    // 3. Profil utilisateur
    const profil = temps5km_sec
        ? determinerProfil(temps5km_sec)
        : 'slow';

    // 4. Injection des allures + calcul durée/distance dans chaque séance
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

    // 5. Retour du plan complet
    return {
        profil,
        objectif:       PROFILS[profil].objectif,
        label_profil:   PROFILS[profil].label,
        seances_semaine,
        total_semaines: 20,
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

module.exports = { genererPlan, calculerAllures, determinerProfil, formatAllure, PROFILS };