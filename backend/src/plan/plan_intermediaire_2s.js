const plan_intermediaire_2s = [
    // PHASE ENDURANCE (S1-S3)
    { s:1,  n:1, phase:'Endurance',     type:'normal', title:'Footing découverte',          dist:3.5,  duree_travail:null, allure:'easy',      detail:"Très facile. Alterner 6' course / 2' marche si besoin. 4x80m foulées en fin.", dayOff:1 },
    { s:1,  n:2, phase:'Endurance',     type:'normal', title:'Footing + marche active',     dist:4.5,  duree_travail:null, allure:'easy',      detail:"Continu si possible. 4x80m de foulées en fin de séance.", dayOff:4 },
    { s:2,  n:1, phase:'Endurance',     type:'normal', title:'Footing continu',             dist:5,    duree_travail:null, allure:'easy',      detail:"Premier footing continu sans marche. Allure conversation.", dayOff:1 },
    { s:2,  n:2, phase:'Endurance',     type:'normal', title:'Footing + accélérations',     dist:null, duree_travail:3,    allure:'aerobic',   detail:"25' footing puis 5x100m foulées progressives, récup marche 90''.", dayOff:4 },
    { s:3,  n:1, phase:'Endurance',     type:'normal', title:'Footing soutenu',             dist:6,    duree_travail:null, allure:'aerobic',   detail:"Légèrement soutenu, respiration contrôlée.", dayOff:1 },
    { s:3,  n:2, phase:'Endurance',     type:'normal', title:'Longue sortie',               dist:7.5,  duree_travail:null, allure:'easy',      detail:"Première sortie longue, rester très facile toute la durée.", dayOff:5 },

    // PHASE RÉCUPÉRATION + TEST 1 (S4)
    { s:4,  n:1, phase:'Récupération',  type:'normal', title:'Footing facile',              dist:4,    duree_travail:null, allure:'easy',      detail:"Récupération, jambes fraîches pour le test.", dayOff:1 },
    { s:4,  n:2, phase:'Test',          type:'test',   title:'TEST 5 km n°1',               dist:5,    duree_travail:null, allure:'race',      detail:"ECha 10' + 2x100m vifs. Effort maximal. Retour calme 10'.", dayOff:5 },

    // PHASE DÉVELOPPEMENT 1 (S5-S7)
    { s:5,  n:1, phase:'Développement', type:'normal', title:'Footing soutenu',             dist:6.5,  duree_travail:null, allure:'aerobic',   detail:"Allure confortable mais engagée.", dayOff:1 },
    { s:5,  n:2, phase:'Développement', type:'normal', title:'Intervalles courts VO2max',   dist:null, duree_travail:18,   allure:'vo2',       detail:"ECha 12'. 6x3' à allure VO2max. Récup 2' footing lent. Retour calme 8'.", dayOff:4 },
    { s:6,  n:1, phase:'Développement', type:'normal', title:'Longue sortie',               dist:8.5,  duree_travail:null, allure:'easy',      detail:"Aérobie, rester en zone de confort.",                                                           dayOff:2 },
    { s:6,  n:2, phase:'Développement', type:'normal', title:'Seuil lactique court',        dist:null, duree_travail:24,   allure:'threshold', detail:"ECha 10'. 2x12' à allure seuil. Récup 4'. Retour calme 8'.", dayOff:5 },
    { s:7,  n:1, phase:'Développement', type:'normal', title:'Longue progressive',          dist:9.5,  duree_travail:null, allure:'easy',      detail:"Départ facile, accélérer les 20 dernières min.", dayOff:1 },
    { s:7,  n:2, phase:'Développement', type:'normal', title:'Intervalles médians',         dist:null, duree_travail:20,   allure:'vo2',       detail:"ECha 12'. 5x4' à allure VO2max. Récup 2'30''. Retour calme 8'.", dayOff:4 },

    // PHASE RÉCUPÉRATION + TEST 2 (S8)
    { s:8,  n:1, phase:'Récupération',  type:'normal', title:'Footing léger',               dist:5,    duree_travail:null, allure:'easy',      detail:"Très facile, préparer le test.", dayOff:1 },
    { s:8,  n:2, phase:'Test',          type:'test',   title:'TEST 5 km n°2',               dist:5,    duree_travail:null, allure:'race',      detail:"Même protocole test 1. Objectif : améliorer le chrono.", dayOff:5 },

    // PHASE DÉVELOPPEMENT 2 (S9-S11)
    { s:9,  n:1, phase:'Développement', type:'normal', title:'Seuil développé',             dist:null, duree_travail:39,   allure:'threshold', detail:"ECha 10'. 3x13' à allure seuil. Récup 4' footing. Retour calme 5'.", dayOff:2 },
    { s:9,  n:2, phase:'Développement', type:'normal', title:'Longue sortie',               dist:10.5, duree_travail:null, allure:'easy',      detail:"Rester en aérobie. Hydratation importante.", dayOff:5 },
    { s:10, n:1, phase:'Développement', type:'normal', title:'Intervalles longs',           dist:null, duree_travail:24,   allure:'vo2',       detail:"ECha 12'. 4x6' à allure VO2max. Récup 3' footing. Retour calme 8'.", dayOff:1 },
    { s:10, n:2, phase:'Développement', type:'normal', title:'Seuil continu',               dist:null, duree_travail:22,   allure:'threshold', detail:"ECha 8'. 22' continue à allure seuil. Retour calme 10'.", dayOff:4 },
    { s:11, n:1, phase:'Développement', type:'normal', title:'Longue progressive',          dist:11,   duree_travail:null, allure:'easy',      detail:"Départ facile, terminer les 25 dernières min à allure soutenue.", dayOff:2 },
    { s:11, n:2, phase:'Développement', type:'normal', title:'Fractionné court intense',    dist:null, duree_travail:16,   allure:'vo2',       detail:"ECha 10'. 8x2' à allure VO2max. Récup 2' footing. Retour calme 8'.", dayOff:5 },

    // PHASE RÉCUPÉRATION + TEST 3 (S12)
    { s:12, n:1, phase:'Récupération',  type:'normal', title:'Footing récupération',        dist:5,    duree_travail:null, allure:'easy',      detail:"Très facile.", dayOff:1 },
    { s:12, n:2, phase:'Test',          type:'test',   title:'TEST 5 km n°3',               dist:5,    duree_travail:null, allure:'race',      detail:"Test pivot avant phase spécifique. Objectif : passer sous 22'30\".", dayOff:5 },

    // PHASE SPÉCIFIQUE (S13-S15)
    { s:13, n:1, phase:'Spécifique',    type:'normal', title:'Seuil long',                  dist:null, duree_travail:27,   allure:'threshold', detail:"ECha 10'. 27' continue à allure seuil. Retour calme 12'.", dayOff:2 },
    { s:13, n:2, phase:'Spécifique',    type:'normal', title:'Longue sortie',               dist:11,   duree_travail:null, allure:'easy',      detail:"Dernière longue de phase 2, rythme facile.", dayOff:5 },
    { s:14, n:1, phase:'Spécifique',    type:'normal', title:'Allure 10km fractionné',      dist:7.5,  duree_travail:null, allure:'race',      detail:"ECha 12'. 3x2,5 km à allure course. Récup 3' footing. Retour calme 6'.", dayOff:1 },
    { s:14, n:2, phase:'Spécifique',    type:'normal', title:'Longue à allure négative',    dist:4.75, duree_travail:null, allure:'threshold', detail:"Première moitié facile, deuxième moitié en accélération progressive.", dayOff:4 },
    { s:15, n:1, phase:'Spécifique',    type:'normal', title:'Intervalles spécifiques',     dist:7.5,  duree_travail:null, allure:'race',      detail:"ECha 12'. 5x1,5 km à allure course. Récup 2'30''. Retour calme 6'.", dayOff:2 },
    { s:15, n:2, phase:'Spécifique',    type:'normal', title:'Footing récupération',        dist:5.5,  duree_travail:null, allure:'easy',      detail:"Récupération active.", dayOff:5 },

    // PHASE RÉCUPÉRATION + TEST 4 (S16)
    { s:16, n:1, phase:'Récupération',  type:'normal', title:'Footing facile',              dist:5,    duree_travail:null, allure:'easy',      detail:"Légère, préparation test.", dayOff:1 },
    { s:16, n:2, phase:'Test',          type:'test',   title:'TEST 5 km n°4',               dist:5,    duree_travail:null, allure:'race',      detail:"Dernier calibrage avant affûtage. Objectif : < 22'00\".", dayOff:5 },

    // PHASE AFFÛTAGE (S17-S19)
    { s:17, n:1, phase:'Affûtage',      type:'normal', title:'Simulation 8 km',             dist:8,    duree_travail:null, allure:'race',      detail:"ECha 10'. 8 km à allure cible de course. Retour calme 8'.", dayOff:1 },
    { s:17, n:2, phase:'Affûtage',      type:'normal', title:'Seuil court',                 dist:null, duree_travail:32,   allure:'threshold', detail:"ECha 10'. 2x16' à allure seuil. Récup 4'. Retour calme 6'.", dayOff:4 },
    { s:18, n:1, phase:'Affûtage',      type:'normal', title:'Sortie allure course',        dist:4.5,  duree_travail:null, allure:'race',      detail:"ECha 10'. 3x1,5 km à allure course. Récup 3'. Retour calme 8'.", dayOff:2 },
    { s:18, n:2, phase:'Affûtage',      type:'normal', title:'Longue facile',               dist:8.5,  duree_travail:null, allure:'easy',      detail:"Très facile, entretien du volume.", dayOff:5 },
    { s:19, n:1, phase:'Affûtage',      type:'normal', title:'Sortie allure course légère', dist:3,    duree_travail:null, allure:'race',      detail:"ECha 10'. 3x1 km à allure course. Récup 3'. Retour calme 10'.", dayOff:1 },
    { s:19, n:2, phase:'Affûtage',      type:'normal', title:'Footing léger',               dist:4,    duree_travail:null, allure:'easy',      detail:"Très légère, vivacité sans fatigue.", dayOff:4 },

    // COURSE (S20)
    { s:20, n:1, phase:'Affûtage',      type:'normal', title:'Activation pré-course',       dist:4,    duree_travail:null, allure:'race',      detail:"ECha 10'. 2x1 km à allure course. Récup 3'. 3 jours avant la course.", dayOff:1 },
    { s:20, n:2, phase:'Course',        type:'race',   title:'COURSE 10 km',                dist:10,   duree_travail:null, allure:'race',      detail:"Repos total la veille. ECha 15'. Partir à allure cible, ajuster au km 5.", dayOff:6 },
];

module.exports = plan_intermediaire_2s;